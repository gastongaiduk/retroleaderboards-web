<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import GameRepository from "../repositories/GameRepository";

import {usePostStore} from '../stores/postStore';
import {useUserStore} from '../stores/user';
import {useGamesStore} from "../stores/games";
import {GameList, Game} from "../models/RecentlyPlayedGames.ts";
import ConfirmLogoutModal from "./ConfirmLogoutModal.vue";
import {useFriendsState} from "../stores/friends.ts";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const friends = useFriendsState();
const games = useGamesStore();

const repository = new GameRepository();

function selectGameLeaderboards(game: Game) {
  postStore.selectGameLeaderboards(game);
}

const isLogoutModalVisible = ref(false);

function showLogoutModal() {
  isLogoutModalVisible.value = true;
}

function hideLogoutModal() {
  isLogoutModalVisible.value = false;
}

function logout() {
  localStorage.clear();
  user.$reset();
  games.$reset();
  friends.$reset();
  postStore.$reset();

  hideLogoutModal();

  router.push("/login")
}

async function refreshGames() {
  try {
    lastPlayedGames.value = null;
    games.setLastPlayedGames(await repository.fetchLastPlayedGames());
    lastPlayedGames.value = games.lastPlayedGames;
  } catch (error) {
    console.error('Error fetching last played games:', error);
  }
}

const apiUrl = import.meta.env.VITE_API_URL;
const lastPlayedGames = ref<GameList | null>(null);

onMounted(async () => {
  if (!user.isSet()) {
    await router.push("/login")
    return;
  }

  if (games.lastPlayedGames === null) {
    await refreshGames();
    return;
  }

  lastPlayedGames.value = games.lastPlayedGames;
});
</script>

<template>
  <div class="retro-container">
    <button class="logout-button" @click="showLogoutModal"><i class="fa fa-sign-out"></i> Logout</button>
    <ConfirmLogoutModal :isVisible="isLogoutModalVisible" @confirm="logout" @nope="hideLogoutModal"/>
    <button class="refresh-button" @click="refreshGames"><i class="fa fa-refresh"></i></button>
    <h1 class="retro-title">Welcome {{ user.username }}</h1>
    <div v-if="games.lastPlayedGames">
      <ul v-if="games.lastPlayedGames.length" class="game-list">
        <li v-for="game in games.lastPlayedGames" :key="game.GameID" class="game-item">
          <div class="game-container" :style="{ backgroundImage: 'url(' + apiUrl + '\\' + game.ImageIngame + ')' }">
            <div class="background-overlay"></div>
            <img :src="apiUrl + '\\' + game.ImageIcon" :alt="game.Title" class="game-icon">
            <button @click="selectGameLeaderboards(game)" class="game-button">
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
  background-color: #d48821;
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
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background-position-y: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(34, 34, 59, 0.5);
}

.game-icon {
  width: 70px;
  height: auto;
  margin-right: 15px;
  z-index: 1;
}

.game-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 15px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
  z-index: 1;
}

.game-button:hover {
  background-color: #d48821;
}

.loading-text {
  text-align: center;
}

@media (min-width: 768px) {
  .game-container {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
  }
}
</style>

