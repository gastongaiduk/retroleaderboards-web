<script setup lang="ts">
import { onActivated, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import GameRepository from "../repositories/GameRepository.ts";
import { usePostStore } from "../stores/postStore.ts";
import { useUserStore } from "../stores/user.ts";
import { useRecentGamesStore } from "../stores/recentGames.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";
import BurgerMenu from "../components/BurgerMenu.vue";
import { supabase } from "../utils/supabaseClient.ts";
import RefreshButton from "../components/RefreshButton.vue";
import { useScrollTracker } from "../composables/useScrollTracker.ts";
import { useInfiniteScroll } from "@vueuse/core";
import { useGameLeaderboardsStore } from "../stores/gameLeaderboards.ts";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const recentGames = useRecentGamesStore();
const gameLeaderboards = useGameLeaderboardsStore();
const repository = new GameRepository();

function selectGameLeaderboards(game: Game) {
  saveScrollPosition();
  gameLeaderboards.$reset();
  postStore.selectGameLeaderboards(game);
}

const apiUrl = import.meta.env.VITE_API_URL;
const updatesNumber = ref<number | null>(null);
async function updatesCount() {
  updatesNumber.value = null;
  let { data, error } = await supabase
    .from("leaderboards_updates")
    .select(
      `
        leaderboard_id,
        friend_name,
        user_score,
        friend_score,
        created_at,
        read_at,
        leaderboards (name, description, games (name, image_icon))
      `,
    )
    .is("read_at", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching updates:", error);
    return;
  }

  if (data) {
    updatesNumber.value = data?.length;
  }
}

const loadingRefresh = ref<boolean>(false);
const loadingInfiniteScroll = ref<boolean>(false);
const itemsToLoad = 20;
const recentGamesElement = ref<HTMLElement | null>(null);
const { saveScrollPosition, restoreScrollPosition } = useScrollTracker(
  recentGamesElement,
  recentGames,
);
onActivated(() => restoreScrollPosition());

async function refreshGames() {
  loadingRefresh.value = true;
  recentGames.setHasMoreToLoad(true);
  recentGames.resetOffset();
  recentGames.resetScrollPosition();
  if (recentGamesElement.value) {
    recentGamesElement.value.scrollTop = 0;
  }
  try {
    recentGames.games = await repository.fetchLastPlayedGames(
      itemsToLoad,
      recentGames.offset,
    );
  } catch (error) {
    console.error("Error fetching last played games:", error);
  }
  recentGames.increaseOffsetIn(itemsToLoad);
  reset();
  loadingRefresh.value = false;
}

const { reset } = useInfiniteScroll(
  recentGamesElement,
  async () => {
    if (loadingInfiniteScroll.value) return;
    loadingInfiniteScroll.value = true;

    const fetchedResults = await repository.fetchLastPlayedGames(
      itemsToLoad,
      recentGames.offset,
    );
    if (fetchedResults.length !== itemsToLoad) {
      recentGames.setHasMoreToLoad(false);
    }
    recentGames.addItems(fetchedResults);
    recentGames.increaseOffsetIn(itemsToLoad);
    loadingInfiniteScroll.value = false;
  },
  {
    distance: itemsToLoad,
    canLoadMore: () => {
      return recentGames.hasMoreToLoad;
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

  await updatesCount();

  if (recentGames.games.length !== 0) {
    recentGames.restoreOffset();
  }
});
</script>

<template>
  <div class="retro-container" ref="recentGamesElement">
    <BurgerMenu
      :updates-number="updatesNumber ? updatesNumber : 0"
    ></BurgerMenu>
    <RefreshButton
      :loading-state="loadingRefresh"
      @click="refreshGames"
    ></RefreshButton>
    <h1 class="retro-title">Welcome {{ user.username }}</h1>
    <div v-if="recentGames">
      <ul v-if="recentGames.games.length" class="game-list">
        <li
          v-for="game in recentGames.games"
          :key="game.GameID"
          class="game-item"
        >
          <div
            class="game-container"
            :style="{
              backgroundImage: 'url(' + apiUrl + '\\' + game.ImageIngame + ')',
            }"
          >
            <div class="background-overlay"></div>
            <img
              :src="apiUrl + '\\' + game.ImageIcon"
              :alt="game.Title"
              class="game-icon"
            />
            <button @click="selectGameLeaderboards(game)" class="game-button">
              {{ game.Title }}
            </button>
          </div>
        </li>
        <span v-if="loadingInfiniteScroll" class="loading-text"
          >Loading...</span
        >
      </ul>
      <div v-else>No games played yet</div>
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.retro-container {
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

.retro-title {
  font-size: 18px;
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
  padding-bottom: 20px;
}

@media (min-width: 768px) {
  .game-container {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
  }
}
</style>
