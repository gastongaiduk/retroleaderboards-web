<script setup lang="ts">
import {usePostStore} from '../stores/postStore.js';
import {onMounted, ref} from "vue";
import {fetchLastPlayedGames} from "../repositories/GameRepository";
import type {GameList} from "../models/RecentlyPlayedGames";

const postStore = usePostStore();

function selectGame(id, title) {
  postStore.selectGame(id, title);
}

const lastPlayedGames = ref<GameList | null>(null);
const username = import.meta.env.VITE_API_USERNAME;
const apiUrl = import.meta.env.VITE_API_URL;

onMounted(async () => {
  try {
    lastPlayedGames.value = await fetchLastPlayedGames(username);
  } catch (error) {
    console.error('Error fetching last played games:', error);
  }
});
</script>

<template>
  <div class="retro-container">
    <h1 class="retro-title">Welcome {{ username }}</h1>

    <div v-if="lastPlayedGames">
      <ul v-if="lastPlayedGames.length" class="game-list">
        <li v-for="game in lastPlayedGames" :key="game.GameID" class="game-item">
          <div class="game-container" :style="{ backgroundImage: 'url(' + apiUrl + '\\' + game.ImageIngame + ')' }">
            <div class="background-overlay"></div>
            <img :src="apiUrl + '\\' + game.ImageIcon" :alt="game.Title" class="game-icon">
            <button @click="selectGame(game.GameID, game.Title)" class="game-button">
              {{ game.Title }}
            </button>
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.retro-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', cursive;
}

.retro-title {
  font-size: 24px;
  color: #f5a623;
  text-align: center;
}

.game-list {
  list-style-type: none;
  padding: 0;
}

.game-item {
  margin-bottom: 15px;
}

.game-container {
  position: relative; /* Position relative for overlay */
  display: flex; /* Use flexbox for layout */
  align-items: center; /* Center items vertically */
  padding: 10px; /* Padding around the container */
  border-radius: 10px; /* Rounded corners */
}

.background-overlay {
  position: absolute; /* Overlay positioned absolutely */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(34,34,59,0.5); /* Darker overlay with transparency */
}

.game-icon {
  width: 70px; /* Set width for game icon */
  height: auto; /* Maintain aspect ratio */
  margin-right: 15px; /* Space between icon and title */

  /* Ensure icon is above overlay */
  z-index: 1;
}

.game-button {
  background-color: #f5a623; /* Button color */
  color: #1a1a2e; /* Text color */
  border: none; /* No border */
  padding: 15px; /* Button padding */
  cursor: pointer; /* Pointer cursor on hover */
  font-size: 16px; /* Button font size */
  border-radius:10px; /* Rounded corners */
  z-index: 1; /* Ensure button is above overlay */
}

.game-button:hover {
  background-color:#d48821; /* Darker orange on hover */
}

.loading-text {
  text-align:center; /* Center loading text */
}

/* Media query for desktop screens */
@media (min-width: 768px) {
  .game-container {
    background-repeat: no-repeat; /* Prevent background from repeating */
    background-size: cover; /* Cover the entire container with the image */
    background-position: center center; /* Center the image in the container */
  }
}
</style>

