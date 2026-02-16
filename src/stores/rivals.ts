import { defineStore } from "pinia";
import { ref } from "vue";
import { RivalryGame, RivalryFriend, RivalryBattle } from "../models/Rivalry";
import { useSubscriptionList } from "../composables/useSubscriptionList";
import { useFriendsState } from "./friends";
import { useUserStore } from "./user";
import GameRepository from "../repositories/GameRepository";
import { UserGameLeaderboard } from "../models/UserGameLeaderboards";

const STORAGE_KEY = "rivals_cache";
const REQUEST_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadFromCache(): RivalryGame[] {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return [];
    try {
        return JSON.parse(cached) as RivalryGame[];
    } catch {
        return [];
    }
}

function saveToCache(data: RivalryGame[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearCache(): void {
    localStorage.removeItem(STORAGE_KEY);
}

function buildRivalryFriend(
    username: string,
    myLeaderboards: UserGameLeaderboard[],
    friendLeaderboards: UserGameLeaderboard[],
): RivalryFriend | null {
    const wins: RivalryBattle[] = [];
    const losses: RivalryBattle[] = [];

    const friendMap = new Map(
        friendLeaderboards
            .filter((lb) => lb.UserEntry)
            .map((lb) => [lb.ID, lb]),
    );

    for (const myLb of myLeaderboards) {
        if (!myLb.UserEntry) continue;

        const friendLb = friendMap.get(myLb.ID);
        if (!friendLb?.UserEntry) continue;

        const myRank = myLb.UserEntry.Rank;
        const friendRank = friendLb.UserEntry.Rank;

        if (myRank === friendRank) continue;

        const battle: RivalryBattle = {
            leaderboardId: myLb.ID,
            leaderboardTitle: myLb.Title,
            myRank,
            friendRank,
            myScore: myLb.UserEntry.FormattedScore,
            friendScore: friendLb.UserEntry.FormattedScore,
        };

        const iAmBetter = myRank < friendRank;

        if (iAmBetter) {
            wins.push(battle);
        } else {
            losses.push(battle);
        }
    }

    if (wins.length === 0 && losses.length === 0) return null;

    return { username, wins, losses };
}

export const useRivalsStore = defineStore("rivals", () => {
    const rivalryGames = ref<RivalryGame[]>(loadFromCache());
    const loading = ref(false);
    const loadingGameName = ref<string | null>(null);

    const hasCache = (): boolean => rivalryGames.value.length > 0;

    const loadRivalries = async (): Promise<void> => {
        const user = useUserStore();
        const friendsStore = useFriendsState();
        const { subscriptions, fetchSubscriptions } = useSubscriptionList();
        const repository = new GameRepository();

        loading.value = true;
        rivalryGames.value = [];
        clearCache();

        await friendsStore.load();
        await fetchSubscriptions();

        const friends = friendsStore.friends?.Results ?? [];
        const subs = subscriptions.value ?? [];

        if (friends.length === 0 || subs.length === 0) {
            loading.value = false;
            return;
        }

        for (const sub of subs) {
            loadingGameName.value = sub.games?.name ?? String(sub.game_id);

            let myLeaderboards: UserGameLeaderboard[];
            try {
                const response = await repository.fetchUserGameLeaderboards(
                    sub.game_id,
                    user.username!,
                );
                myLeaderboards = response.Results;
            } catch {
                continue;
            }

            if (myLeaderboards.length === 0) continue;

            const rivals: RivalryFriend[] = [];

            for (const friend of friends) {
                await delay(REQUEST_DELAY_MS);

                try {
                    const friendResponse = await repository.fetchUserGameLeaderboards(
                        sub.game_id,
                        friend.User,
                    );

                    const rivalry = buildRivalryFriend(
                        friend.User,
                        myLeaderboards,
                        friendResponse.Results,
                    );

                    if (rivalry) {
                        rivals.push(rivalry);
                    }
                } catch {
                    continue;
                }
            }

            if (rivals.length > 0) {
                const rivalryGame: RivalryGame = {
                    gameId: sub.game_id,
                    gameName: sub.games?.name ?? String(sub.game_id),
                    imageIcon: sub.games?.image_icon ?? "",
                    rivals,
                    totalLeaderboards: myLeaderboards.length,
                };

                rivalryGames.value = [...rivalryGames.value, rivalryGame];
            }
        }

        rivalryGames.value.sort((a, b) => {
            const totalA = a.rivals.reduce((sum, r) => sum + r.wins.length + r.losses.length, 0);
            const totalB = b.rivals.reduce((sum, r) => sum + r.wins.length + r.losses.length, 0);
            return totalB - totalA;
        });

        saveToCache(rivalryGames.value);
        loadingGameName.value = null;
        loading.value = false;
    };

    return {
        rivalryGames,
        loading,
        loadingGameName,
        hasCache,
        loadRivalries,
    };
});
