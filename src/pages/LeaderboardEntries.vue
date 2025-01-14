<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import GameRepository from "../repositories/GameRepository.ts";
import { LeaderboardEntries } from "../models/LeaderboardEntries.ts";

import { usePostStore } from "../stores/postStore.ts";
import { useUserStore } from "../stores/user.ts";
import { useFriendsState } from "../stores/friends.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";
import { Leaderboard } from "../models/GameLeaderboards.ts";
import { useGamesStore } from "../stores/games.ts";
import RefreshButton from "../components/RefreshButton.vue";
import BackButton from "../components/BackButton.vue";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const friends = useFriendsState();
const games = useGamesStore();

const repository = new GameRepository();

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const selectedGame = ref<Game | null>(null);
const selectedLeaderboard = ref<Leaderboard | null>(null);
const entries = ref<LeaderboardEntries | null>(null);
const loadingRefresh = ref<boolean>(false);

async function refreshScores() {
  loadingRefresh.value = true;
  try {
    entries.value = null;
    games.setLeaderboardEntries(
      Number(props.id),
      await repository.fetchLeaderboardEntries(props.id),
    );
    entries.value = games.getLeaderboardEntries(Number(props.id));
  } catch (error) {
    console.error("Error fetching last played games:", error);
  }
  loadingRefresh.value = false;
}

onMounted(async () => {
  if (!user.isSet()) {
    await router.push("/login");
    return;
  }

  await friends.load();

  selectedGame.value = postStore.getSelectedGameLeaderboards();
  selectedLeaderboard.value = postStore.getSelectedLeaderboard();

  if (games.hasLeaderboardEntries(Number(props.id))) {
    entries.value = games.getLeaderboardEntries(Number(props.id));
    return;
  }

  await refreshScores();
});

const sortedEntries = computed(() => {
  if (entries.value === null) {
    return [];
  }

  if (friends.friends === null) {
    return entries.value.Results;
  }

  return entries.value.Results.sort((a, b) => {
    const isAMe = isMe(a.User);
    const isBMe = isMe(b.User);
    const isAFriend = isFriend(a.User);
    const isBFriend = isFriend(b.User);

    const byRank = a.Rank < b.Rank ? -1 : 1;

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
</script>

<template>
  <div class="entries-container">
    <BackButton></BackButton>
    <RefreshButton
      :loading-state="loadingRefresh"
      @click="refreshScores"
    ></RefreshButton>
    <h1 class="entries-title">{{ selectedLeaderboard?.Title }}</h1>
    <h2 class="entries-title">{{ selectedGame?.Title }}</h2>
    <div v-if="entries">
      <ul class="entries-list" v-if="entries.Results.length">
        <li
          v-for="entry in sortedEntries"
          :key="entry.User"
          class="entry-item"
          :class="{ isFriend: isFriend(entry.User), isMe: isMe(entry.User) }"
        >
          <span class="entry-rank">#{{ entry.Rank }}</span>
          <div class="entry-user-score">{{ entry.FormattedScore }}</div>
          <div class="entry-username">{{ entry.User }}</div>
        </li>
      </ul>
      <span v-else>No entries found for this leaderboard.</span>
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
</style>
