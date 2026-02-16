<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useFriendsState } from "../stores/friends";
import { useRivalsStore } from "../stores/rivals";
import UserRepository from "../repositories/UserRepository";
import GameRepository from "../repositories/GameRepository";
import FriendDetailsModal from "../components/FriendDetailsModal.vue";
import { UserSummary } from "../models/UserSummary";
import { GameList } from "../models/RecentlyPlayedGames";

const router = useRouter();
const user = useUserStore();
const friendsStore = useFriendsState();
const rivalsStore = useRivalsStore();
const userRepo = new UserRepository();
const gameRepo = new GameRepository();

const isModalVisible = ref(false);
const isModalLoading = ref(false);
const selectedUserSummary = ref<UserSummary | null>(null);
const selectedUserRecentGames = ref<GameList | null>(null);

interface RankingMember {
    username: string;
    wins: number;
    isMe: boolean;
}

const globalRanking = computed(() => {
    if (!rivalsStore.rivalryGames.length) return [];

    const rankingMap = new Map<string, number>();
    let myTotalWins = 0;

    rivalsStore.rivalryGames.forEach(game => {
        game.rivals.forEach(rival => {
            // My wins against this rival
            myTotalWins += rival.wins.length;
            
            // This rival's wins against me
            const currentFriendWins = rankingMap.get(rival.username) || 0;
            rankingMap.set(rival.username, currentFriendWins + rival.losses.length);
        });
    });

    const members: RankingMember[] = [];
    
    // Add me
    members.push({
        username: user.username || "Me",
        wins: myTotalWins,
        isMe: true
    });

    // Add friends
    rankingMap.forEach((wins, username) => {
        members.push({
            username,
            wins,
            isMe: false
        });
    });

    return members.sort((a, b) => b.wins - a.wins);
});

const friendsList = computed(() => {
    return friendsStore.friends?.Results || [];
});

onMounted(async () => {
    if (!user.isLoggedIn()) {
        await router.push("/login");
        return;
    }

    if (!user.isSet()) {
        await router.push("/ra-credentials");
        return;
    }

    await friendsStore.load();
    if (!rivalsStore.hasCache()) {
        await rivalsStore.loadRivalries();
    }
});

function getAvatarUrl(username: string) {
    return `https://retroachievements.org/UserPic/${username}.png`;
}

async function openFriendDetails(username: string) {
    isModalVisible.value = true;
    isModalLoading.value = true;
    selectedUserSummary.value = null;
    selectedUserRecentGames.value = null;

    try {
        const [summary, recent] = await Promise.all([
            userRepo.fetchUserSummary(username),
            gameRepo.fetchLastPlayedGames(5, 0, username)
        ]);
        selectedUserSummary.value = summary;
        selectedUserRecentGames.value = recent;
    } catch (error) {
        console.error("Error loading friend details:", error);
    } finally {
        isModalLoading.value = false;
    }
}
</script>

<template>
    <div class="page-container">
        <header class="page-header">
            <h1 class="page-title">Friends</h1>
        </header>

        <section v-if="globalRanking.length" class="ranking-section">
            <h2 class="section-subtitle">Global Rivalry Ranking</h2>
            <p class="ranking-info">Total leaderboards where you are ahead of each other.</p>
            
            <div class="ranking-podium" v-if="globalRanking.length >= 1">
                <!-- Second Place -->
                <div v-if="globalRanking[1]" class="podium-item second" @click="openFriendDetails(globalRanking[1].username)">
                    <div class="avatar-container">
                        <img :src="getAvatarUrl(globalRanking[1].username)" class="podium-avatar" />
                        <div class="rank-badge">2</div>
                    </div>
                    <span class="member-name">{{ globalRanking[1].username }}</span>
                    <span class="member-wins">{{ globalRanking[1].wins }} wins</span>
                </div>

                <!-- First Place -->
                <div v-if="globalRanking[0]" class="podium-item first" @click="openFriendDetails(globalRanking[0].username)">
                    <div class="avatar-container">
                        <div class="crown"><i class="fa fa-trophy"></i></div>
                        <img :src="getAvatarUrl(globalRanking[0].username)" class="podium-avatar" />
                        <div class="rank-badge">1</div>
                    </div>
                    <span class="member-name">{{ globalRanking[0].username }}</span>
                    <span class="member-wins">{{ globalRanking[0].wins }} wins</span>
                </div>

                <!-- Third Place -->
                <div v-if="globalRanking[2]" class="podium-item third" @click="openFriendDetails(globalRanking[2].username)">
                    <div class="avatar-container">
                        <img :src="getAvatarUrl(globalRanking[2].username)" class="podium-avatar" />
                        <div class="rank-badge">3</div>
                    </div>
                    <span class="member-name">{{ globalRanking[2].username }}</span>
                    <span class="member-wins">{{ globalRanking[2].wins }} wins</span>
                </div>
            </div>

            <div v-if="globalRanking.length > 3" class="ranking-list">
                <div 
                    v-for="(member, index) in globalRanking.slice(3)" 
                    :key="member.username"
                    class="ranking-item"
                    :class="{ 'is-me': member.isMe }"
                    @click="openFriendDetails(member.username)"
                >
                    <span class="rank-number">#{{ index + 4 }}</span>
                    <img :src="getAvatarUrl(member.username)" class="item-avatar" />
                    <span class="item-name">{{ member.username }}</span>
                    <span class="item-wins">{{ member.wins }} wins</span>
                </div>
            </div>
        </section>

        <section class="list-section">
            <h2 class="section-subtitle">All Friends</h2>
            <div v-if="friendsList.length" class="friends-grid">
                <div v-for="friend in friendsList" :key="friend.User" class="friend-card" @click="openFriendDetails(friend.User)">
                    <img :src="getAvatarUrl(friend.User)" class="friend-avatar" />
                    <div class="friend-info">
                        <span class="friend-name">{{ friend.User }}</span>
                        <span class="friend-points">{{ friend.Points }} pts</span>
                    </div>
                </div>
            </div>
            <div v-else-if="friendsStore.friends === null" class="loading-state">
                <i class="fa fa-refresh fa-spin"></i> Loading friends...
            </div>
            <div v-else class="empty-state">
                You are not following anyone on RetroAchievements.
            </div>
        </section>

        <FriendDetailsModal 
            :is-visible="isModalVisible"
            :loading="isModalLoading"
            :summary="selectedUserSummary"
            :recent-games="selectedUserRecentGames"
            @close="isModalVisible = false"
        />
    </div>
</template>

<style scoped>
.page-container {
    background-color: #0f172a;
    color: #e2e8f0;
    padding: 16px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.page-header {
    margin-bottom: 24px;
}

.page-title {
    font-size: 17px;
    font-weight: 600;
    color: #cba34e;
    text-align: center;
    margin: 0;
    letter-spacing: -0.01em;
}

.section-subtitle {
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0 0 4px;
    text-align: center;
}

.ranking-info {
    font-size: 11px;
    color: #64748b;
    text-align: center;
    margin-bottom: 20px;
}

.ranking-section {
    margin-bottom: 32px;
}

/* Podium Styles */
.ranking-podium {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-top: 20px;
}

.podium-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    max-width: 100px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.podium-item:active {
    transform: scale(0.95);
}

.avatar-container {
    position: relative;
    margin-bottom: 8px;
}

.podium-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid #1e293b;
    background-color: #1e293b;
    object-fit: cover;
}

.first .podium-avatar {
    width: 80px;
    height: 80px;
    border-color: #cba34e;
    box-shadow: 0 0 20px rgba(203, 163, 78, 0.2);
}

.second .podium-avatar {
    border-color: #94a3b8;
}

.third .podium-avatar {
    border-color: #92400e;
}

.rank-badge {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1e293b;
    color: #e2e8f0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    border: 1px solid rgba(148, 163, 184, 0.2);
}

.first .rank-badge { background-color: #cba34e; color: #0f172a; }
.second .rank-badge { background-color: #94a3b8; color: #0f172a; }
.third .rank-badge { background-color: #92400e; color: #ffffff; }

.crown {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%) rotate(-10deg);
    color: #cba34e;
    font-size: 18px;
    z-index: 1;
}

.member-name {
    font-size: 12px;
    font-weight: 600;
    color: #e2e8f0;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.member-wins {
    font-size: 10px;
    color: #64748b;
}

/* Ranking List */
.ranking-list {
    background-color: rgba(30, 41, 59, 0.4);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.06);
}

.ranking-item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.04);
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.ranking-item:active {
    background-color: rgba(30, 41, 59, 0.8);
}

.ranking-item:last-child {
    border-bottom: none;
}

.ranking-item.is-me {
    background-color: rgba(203, 163, 78, 0.05);
}

.rank-number {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    width: 24px;
}

.item-avatar {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    margin-right: 12px;
    background-color: #1e293b;
}

.item-name {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
}

.item-wins {
    font-size: 11px;
    font-weight: 600;
    color: #cba34e;
}

/* Friends Grid */
.friends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
}

.friend-card {
    background-color: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(148, 163, 184, 0.04);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.friend-card:active {
    background-color: rgba(30, 41, 59, 0.8);
    transform: scale(0.98);
}

.friend-avatar {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background-color: #1e293b;
}

.friend-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.friend-name {
    font-size: 12px;
    font-weight: 500;
    color: #e2e8f0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.friend-points {
    font-size: 10px;
    color: #64748b;
}

.loading-state, .empty-state {
    text-align: center;
    padding: 40px 20px;
    font-size: 13px;
    color: #64748b;
}
</style>
