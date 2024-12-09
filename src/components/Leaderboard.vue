<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {useRouter} from 'vue-router';
import GameRepository from "../repositories/GameRepository";
import {LeaderboardEntries} from "../models/LeaderboardEntries";
import {Friends} from "../models/Friends";
import UserRepository from "../repositories/UserRepository";

import {usePostStore} from '../stores/postStore';
import {useUserStore} from '../stores/user';

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();

const repository = new GameRepository();
const userRepository = new UserRepository();

function goBack() {
  router.back(); // Navigates back to the previous route
}

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})

const entries = ref<LeaderboardEntries | null>(null);
const friends = ref<Friends | null>(null);

onMounted(async () => {
  if (!user.isSet()) {
    await router.push("/login")
    return;
  }

  try {
    entries.value = await repository.fetchLeaderboardEntries(props.id);
    friends.value = await userRepository.fetchFriends();
  } catch (error) {
    console.error('Error fetching last played games:', error);
  }
});

const sortedEntries = computed(() => {
  if (entries.value === null) {
    return [];
  }

  if (friends.value === null) {
    return entries.value.Results;
  }

  return entries.value.Results.sort((a, b) => {
    const isAMe = isMe(a.User);
    const isBMe = isMe(b.User);
    const isAFriend = isFriend(a.User);
    const isBFriend = isFriend(b.User);

    const byRank = a.Rank < b.Rank ? -1 : 1;

    if (isAMe && isBFriend) {
      return byRank
    }
    if (isBMe && isAFriend) {
      return byRank
    }

    if (isAMe || isBMe) {
      return isAMe ? -1 : 1
    }

    if (isAFriend && !isBFriend) {
      return -1
    }
    if (!isAFriend && isBFriend) {
      return 1
    }

    return byRank;
  });
})

function isMe(userToCompare: string) {
  return userToCompare === user.username;
}

function isFriend(user: string) {
  if (friends.value === null) {
    return false;
  }
  return friends.value.Results.some((friend) => friend.User === user)
}

</script>

<template>
  <div class="entries-container">
    <button class="back-button" @click="goBack">Back</button>
    <h1 class="entries-title">{{ postStore.selectedLeaderboardName }}</h1>
    <h2 class="entries-title">{{ postStore.selectedGameName }}</h2>
    <div v-if="entries">
      <ul class="entries-list" v-if="entries.Results.length">
        <li
            v-for="entry in sortedEntries"
            :key="entry.User"
            class="entry-item"
            :class="{ isFriend: isFriend(entry.User), isMe: isMe(entry.User) }">
          <span class="entry-rank">#{{ entry.Rank }}</span>
          <div class="entry-username">{{ entry.User }}</div>
          <div class="entry-user-score">{{ entry.FormattedScore }}</div>
        </li>
      </ul>
      <span v-else>No entries found for this leaderboard.</span>
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.entries-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', cursive;
}

h1.entries-title {
  font-size: 24px; /* Larger font for title */
  color: #f5a623;
  text-align: center;
}

h2.entries-title {
  font-size: 12px; /* Larger font for title */
  color: #f5a623;
  text-align: center;
}

.back-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
}

.back-button:hover {
  background-color: #d48821; /* Slightly darker orange on hover */
}

.entries-list {
  list-style-type: none;
  padding: 0;
}

.entry-item {
  background-color: #22223b; /* Darker background for each entry */
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}

.entry-item:hover {
  background-color: #3a3c58; /* Change background on hover */
}

.entry-rank {
  color: #f5a623; /* Color for rank */
  font-size: 28px; /* Larger font size for rank */
}

.entry-username {
  color: #e0e1dd; /* Color for username */
  margin-top: 5px; /* Spacing above username */
}

.entry-user-score {
  color: #e0e1dd; /* Color for user score details */
  margin-top: -10px; /* Spacing above score */
  float: right;
}

/* Distinction styles for friends and current user */
.isFriend {
  background-color: rgba(245,166,35,0.2); /* Light orange background for friends */
}

.isMe {
  border: solid #f5a623; /* Border for current user */
  border-width: thick; /* Thicker border for emphasis */
}

.loading-text {
  text-align: center;
}
</style>
