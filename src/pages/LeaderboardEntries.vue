<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import GameRepository from "../repositories/GameRepository.ts";

import { usePostStore } from "../stores/postStore.ts";
import { useUserStore } from "../stores/user.ts";
import { useFriendsState } from "../stores/friends.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";
import { Leaderboard } from "../models/GameLeaderboards.ts";
import { useLeaderboardEntries } from "../stores/leaderboardEntries.ts";
import RefreshButton from "../components/RefreshButton.vue";
import BackButton from "../components/BackButton.vue";
import { Entry } from "../models/LeaderboardEntries.ts";
import { useInfiniteScroll } from "@vueuse/core";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const friends = useFriendsState();
const leaderboardEntries = useLeaderboardEntries();

const repository = new GameRepository();

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const selectedGame = ref<Game | null>(null);
const selectedLeaderboard = ref<Leaderboard | null>(null);
const loadingRefresh = ref<boolean>(false);
const itemsToLoad = 200;
const leaderboardEntriesElement = ref<HTMLElement | null>(null);
const loadingInfiniteScroll = ref<boolean>(false);
const loadingPriorityEntries = ref<boolean>(false);
const priorityEntries = ref<Entry[]>([]);

async function refreshScores() {
  loadingRefresh.value = true;
  leaderboardEntries.setHasMoreToLoad(true);
  leaderboardEntries.resetOffset();
  priorityEntries.value = [];

  try {
    leaderboardEntries.entries = (
      await repository.fetchLeaderboardEntries(
        props.id,
        itemsToLoad,
        leaderboardEntries.offset,
      )
    ).Results;

    await fetchPriorityEntries();
  } catch (error) {
    console.error("Error fetching last played games:", error);
  }
  leaderboardEntries.increaseOffsetIn(itemsToLoad);
  reset();
  loadingRefresh.value = false;
}

async function fetchPriorityEntries() {
  if (!selectedGame.value || !selectedLeaderboard.value) {
    return;
  }
  if (selectedGame.value.GameID == null) {
    return;
  }
  if (!user.username) {
    return;
  }

  loadingPriorityEntries.value = true;

  const usernames: string[] = [user.username];
  if (friends.friends?.Results?.length) {
    usernames.push(...friends.friends.Results.map((f) => f.User));
  }

  const loadedUsernames = new Set(
    leaderboardEntries.entries.map((entry) => entry.User),
  );
  const uniqueUsernames = Array.from(new Set(usernames)).filter(
    (u) => !loadedUsernames.has(u),
  );

  try {
    const results: Entry[] = [];
    for (const username of uniqueUsernames) {
      // Add a delay before each request to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        const response = await repository.fetchUserGameLeaderboards(
          selectedGame.value!.GameID,
          username,
        );
        const leaderboard = response.Results.find(
          (lb) => lb.ID === selectedLeaderboard.value!.ID,
        );

        if (leaderboard && leaderboard.UserEntry) {
          results.push({
            User: leaderboard.UserEntry.User,
            Rank: Number(leaderboard.UserEntry.Rank),
            FormattedScore: leaderboard.UserEntry.FormattedScore,
            Score: leaderboard.UserEntry.Score,
            DateSubmitted: leaderboard.UserEntry.DateUpdated,
          });
        }
      } catch (error) {
        console.warn(`Error fetching priority entry for ${username}:`, error);
      }
    }

    priorityEntries.value = results.sort((a, b) => {
      // Ensure we are working with numbers
      const rankA = parseInt(String(a.Rank), 10);
      const rankB = parseInt(String(b.Rank), 10);

      const valA = isNaN(rankA) ? Infinity : rankA;
      const valB = isNaN(rankB) ? Infinity : rankB;

      return valA - valB;
    });
  } catch (error) {
    console.error("Error fetching priority entries:", error);
  } finally {
    loadingPriorityEntries.value = false;
  }
}

const { reset } = useInfiniteScroll(
  leaderboardEntriesElement,
  async () => {
    if (loadingInfiniteScroll.value) return;
    loadingInfiniteScroll.value = true;

    const fetchedResults = await repository.fetchLeaderboardEntries(
      props.id,
      itemsToLoad,
      leaderboardEntries.offset,
    );
    if (fetchedResults.Count !== itemsToLoad) {
      leaderboardEntries.setHasMoreToLoad(false);
    }
    leaderboardEntries.addItems(fetchedResults.Results);
    leaderboardEntries.increaseOffsetIn(itemsToLoad);

    loadingInfiniteScroll.value = false;
  },
  {
    distance: itemsToLoad,
    canLoadMore: () => {
      return leaderboardEntries.hasMoreToLoad;
    },
  },
);

onMounted(async () => {
  if (!user.isLoggedIn()) {
    await router.push("/login");
    return;
  }

  if (!user.isSet()) {
    await router.push("/ra-credentials");
    return;
  }

  await friends.load();

  if (leaderboardEntries.leaderboardId !== props.id) {
    leaderboardEntries.reset();
    leaderboardEntries.setLeaderboardId(props.id);
  }

  selectedGame.value = postStore.getSelectedGameLeaderboards();
  selectedLeaderboard.value = postStore.getSelectedLeaderboard();

  await fetchPriorityEntries();

  if (leaderboardEntries.entries.length !== 0) {
    leaderboardEntries.restoreOffset();
  }
});

const sortedEntries = computed(() => {
  const allEntries = [...leaderboardEntries.entries];
  const entriesUsernames = new Set(allEntries.map((e) => e.User));

  priorityEntries.value.forEach((pe) => {
    if (!entriesUsernames.has(pe.User)) {
      allEntries.push(pe);
    }
  });

  if (allEntries.length === 0) {
    return [];
  }

  return allEntries.sort((a, b) => {
    const isAMe = isMe(a.User);
    const isBMe = isMe(b.User);
    const isAFriend = isFriend(a.User);
    const isBFriend = isFriend(b.User);

    const rankA = Number(a.Rank);
    const rankB = Number(b.Rank);
    const byRank = (isNaN(rankA) ? Infinity : rankA) - (isNaN(rankB) ? Infinity : rankB);

    if (isAMe && isBFriend) {
      return byRank;
    }
    if (isBMe && isAFriend) {
      return byRank;
    }

    if (isAMe || isBMe) {
      return isAMe ? -1 : 1;
    }

    if (isAFriend && !isBFriend) {
      return -1;
    }
    if (!isAFriend && isBFriend) {
      return 1;
    }

    return byRank;
  });
});

function isMe(userToCompare: string) {
  return userToCompare === user.username;
}

function isFriend(user: string) {
  if (friends.friends === null) {
    return false;
  }
  return friends.friends.Results.some((friend) => friend.User === user);
}

function shouldShowDivider(index: number) {
  const currentEntry = sortedEntries.value[index];
  const nextEntry = sortedEntries.value[index + 1];

  if (!currentEntry || !nextEntry) {
    return false;
  }

  const isCurrentMeOrFriend =
    isMe(currentEntry.User) || isFriend(currentEntry.User);
  const isNextMeOrFriend = isMe(nextEntry.User) || isFriend(nextEntry.User);

  return isCurrentMeOrFriend && !isNextMeOrFriend;
}


</script>

<template>
  <div class="page-container" ref="leaderboardEntriesElement">
    <BackButton></BackButton>
    <RefreshButton
      :loading-state="loadingRefresh"
      @click="refreshScores"
    ></RefreshButton>
    <h1 class="entries-title">{{ selectedLeaderboard?.Title }}</h1>
    <h2 class="entries-subtitle">
      {{ selectedGame?.Title }}
    </h2>

    <div v-if="loadingPriorityEntries" class="priority-loading">
      Loading your position...
    </div>

    <div v-if="sortedEntries.length">
      <ul class="entries-list">
        <template v-for="(entry, index) in sortedEntries" :key="entry.User">
          <li
            class="entry-item"
            :class="{ isFriend: isFriend(entry.User), isMe: isMe(entry.User) }"
          >
            <span class="entry-rank">#{{ entry.Rank }}</span>
            <div class="entry-user-score">{{ entry.FormattedScore }}</div>
            <div class="entry-username">{{ entry.User }}</div>
          </li>
          <li v-if="shouldShowDivider(index)" class="friends-divider">
            <span class="divider-line"></span>
          </li>
        </template>
        <div v-if="loadingInfiniteScroll" class="loading-text">Loading...</div>
      </ul>
    </div>
    <div v-else-if="!loadingRefresh && !loadingPriorityEntries" class="loading-text">
        No entries found for this leaderboard.
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
.page-container {
  background-color: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  min-height: 0;
}

h1.entries-title {
  font-size: 17px;
  font-weight: 600;
  color: #cba34e;
  text-align: center;
  margin: 12px 0 4px;
  letter-spacing: -0.01em;
}

h2.entries-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  text-align: center;
  margin: 0 0 16px;
}

.entries-list {
  list-style-type: none;
  padding: 0;
}

.priority-loading {
  font-size: 12px;
  color: #cba34e;
  padding: 8px 0;
  text-align: center;
}

.friends-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 12px 0;
  list-style-type: none;
}

.divider-line {
  flex-grow: 1;
  border-bottom: 1px dashed rgba(203, 163, 78, 0.3);
  margin: 0 10px;
}

.entry-item {
  background-color: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.06);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 6px;
  transition: background-color 0.15s ease;
}

.entry-item:hover {
  background-color: rgba(30, 41, 59, 0.8);
}

.entry-rank {
  color: #cba34e;
  font-size: 16px;
  font-weight: 700;
}

.entry-username {
  color: #94a3b8;
  margin-top: 2px;
  font-size: 12px;
}

.entry-user-score {
  color: #e2e8f0;
  float: right;
  font-size: 13px;
  font-weight: 500;
}

.isFriend {
  background-color: rgba(203, 163, 78, 0.08);
  border-color: rgba(203, 163, 78, 0.12);
}

.isMe {
  border: 2px solid rgba(203, 163, 78, 0.4);
  background-color: rgba(203, 163, 78, 0.06);
}

.loading-text {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  padding: 16px 0;
}
</style>
