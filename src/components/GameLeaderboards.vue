<script setup lang="ts">

import {onMounted, ref} from "vue";
import {usePostStore} from '../stores/postStore.js';
import {useRouter} from 'vue-router';
import {GameLeaderboards} from "../models/GameLeaderboards.js";
import {fetchLeaderboards} from "../repositories/GameRepository.js";

const router = useRouter();

function goBack() {
  router.back(); // Navigates back to the previous route
}

const postStore = usePostStore();

function selectLeaderboard(id, title) {
  postStore.selectLeaderboard(id, title);
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

const leaderboards = ref<GameLeaderboards | null>(null);

onMounted(async () => {
  try {
    leaderboards.value = await fetchLeaderboards(props.id);
  } catch (error) {
    console.error('Error fetching last played games:', error);
  }
});

</script>

<template>
  <div class="leaderboard-container">
    <button class="back-button" @click="goBack">Back</button>
    <h1 class="leaderboard-title">{{ title }}</h1>
    <div v-if="leaderboards">
      <ul class="leaderboard-list" v-if="leaderboards.Results.length">
        <li
            v-for="leaderboard in leaderboards.Results"
            :key="leaderboard.ID"
            class="leaderboard-item-container"
            @click="selectLeaderboard(leaderboard.ID, leaderboard.Title)">
          <span class="leaderboard-item">{{ leaderboard.Title }}</span>
          <span class="top-entry">{{ leaderboard.TopEntry.User }} ({{ leaderboard.TopEntry.FormattedScore }})</span>
        </li>
      </ul>
      <span v-else>No leaderboards found for this game.</span>
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.leaderboard-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', cursive;
}

.leaderboard-title {
  font-size: 24px; /* Larger font for title */
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

.leaderboard-list {
  list-style-type: none;
  padding: 0;
}

.leaderboard-item-container {
  background-color: #22223b; /* Darker background for each entry */
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex; /* Flexbox for layout */
  flex-direction: column; /* Stack children vertically */
}

.leaderboard-item-container:hover {
  background-color: #3a3c58; /* Change background on hover */
}

.leaderboard-item {
  color: #f5a623; /* Color for the leaderboard title */
  flex-grow: 1; /* Allow title to take up most space */
}

.top-entry {
  color: #e0e1dd; /* Color for the top entry details */
  font-size: 12px; /* Smaller font size for top entry */
  opacity: 0.7; /* Slightly faded to indicate less importance */
  align-self: flex-end; /* Align to the bottom right */
  padding-top: 1rem;
}

.loading-text {
  text-align: center;
}
</style>
