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

function goToGameLeaderboards() {
  if (selectedGame.value?.GameID) {
    router.push({
      name: "GameLeaderboards",
      params: { id: selectedGame.value.GameID },
    });
  }
}
</script>

<template>
  <div class="entries-container" ref="leaderboardEntriesElement">
    <BackButton></BackButton>
    <RefreshButton
      :loading-state="loadingRefresh"
      @click="refreshScores"
    ></RefreshButton>
    <h1 class="entries-title">{{ selectedLeaderboard?.Title }}</h1>
    <h2 class="entries-title clickable" @click="goToGameLeaderboards">
      {{ selectedGame?.Title }}
    </h2>

    <div v-if="loadingPriorityEntries" class="priority-loading loading-text">
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
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.entries-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  font-family: "Press Start 2P", cursive;
  overflow-y: scroll;
  height: 100vh;
  margin: 0;
}

h1.entries-title {
  font-size: 24px;
  color: #f5a623;
  text-align: center;
}

h2.entries-title {
  font-size: 12px;
  color: #f5a623;
  text-align: center;
}

.entries-list {
  list-style-type: none;
  padding: 0;
}

.priority-entries {
  margin-bottom: 20px;
  min-height: 20px; /* Prevent layout shift/collapse artifacts */
}

.priority-entries-list {
  list-style-type: none;
  padding: 0;
}

.priority-loading {
  font-size: 0.8em;
  color: #f5a623;
  padding: 10px 0;
}

.priority-entry {
  background-color: #22223b;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}

.friends-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  list-style-type: none;
}

.divider-line {
  flex-grow: 1;
  border-bottom: 2px dashed #f5a623;
  opacity: 0.5;
  margin: 0 10px;
}

.entry-item {
  background-color: #22223b;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}

.entry-item:hover {
  background-color: #3a3c58;
}

.entry-rank {
  color: #f5a623;
  font-size: 1.5rem;
}

.entry-username {
  color: #e0e1dd;
  margin-top: 5px;
}

.entry-user-score {
  color: #e0e1dd;
  float: right;
}

.isFriend {
  background-color: rgba(245, 166, 35, 0.2);
}

.isMe {
  border: thick solid #f5a623;
}

.loading-text {
  text-align: center;
}

.clickable:hover {
  cursor: pointer;
  color: #d48821;
}
</style>
