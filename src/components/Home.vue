<script setup lang="ts">
import {onMounted} from "vue";
import {useRouter} from "vue-router";
import GameRepository from "../repositories/GameRepository";

import {usePostStore} from '../stores/postStore';
import {useUserStore} from '../stores/user';
import {useGamesStore} from "../stores/games";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const games = useGamesStore();

const repository = new GameRepository();

function selectGame(id: number, title: string) {
  postStore.selectGame(id, title);
}

function logout() {
  user.logout();
  router.push("/login")
}

async function refreshGames() {
  try {
    games.setLastPlayedGames(null);
    games.setLastPlayedGames(await repository.fetchLastPlayedGames());
  } catch (error) {
    console.error('Error fetching last played games:', error);
  }
}

const apiUrl = import.meta.env.VITE_API_URL;

onMounted(async () => {
  if (!user.isSet()) {
    await router.push("/login")
    return;
  }

  if (games.lastPlayedGames === null) {
    await refreshGames();
  }
});
</script>

<template>
  <div class="retro-container">
    <button class="logout-button" @click="logout"><i class="fa fa-sign-out"></i> Logout</button>
    <button class="refresh-button" @click="refreshGames"><i class="fa fa-refresh"></i></button>
    <h1 class="retro-title">Welcome {{ user.username }}</h1>
    <div v-if="games.lastPlayedGames">
      <ul v-if="games.lastPlayedGames.length" class="game-list">
        <li v-for="game in games.lastPlayedGames" :key="game.GameID" class="game-item">
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

.logout-button, .refresh-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
}

.logout-button:hover, .refresh-button:hover {
  background-color: #d48821; /* Slightly darker orange on hover */
}

.refresh-button {
  float: right;
}

.retro-title {
  font-size: 24px;
  color: #f5a623;
  text-align: center;
  padding: 10px 0;
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
  background-color: rgba(34, 34, 59, 0.5); /* Darker overlay with transparency */
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
  border-radius: 10px; /* Rounded corners */
  z-index: 1; /* Ensure button is above overlay */
}

.game-button:hover {
  background-color: #d48821; /* Darker orange on hover */
}

.loading-text {
  text-align: center; /* Center loading text */
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

