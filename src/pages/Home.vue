<script setup lang="ts">
import { onActivated, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import GameRepository from "../repositories/GameRepository.ts";
import { usePostStore } from "../stores/postStore.ts";
import { useUserStore } from "../stores/user.ts";
import { useRecentGamesStore } from "../stores/recentGames.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";
import RefreshButton from "../components/RefreshButton.vue";
import { useScrollTracker } from "../composables/useScrollTracker.ts";
import { useInfiniteScroll } from "@vueuse/core";
import { useGameLeaderboardsStore } from "../stores/gameLeaderboards.ts";
import { captureEvent } from "../utils/posthog";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const recentGames = useRecentGamesStore();
const gameLeaderboards = useGameLeaderboardsStore();
const repository = new GameRepository();

function selectGameLeaderboards(game: Game) {
  captureEvent("game_opened", {
    game_id: game.GameID,
    game_name: game.Title,
    source: "home",
  });
  saveScrollPosition();
  gameLeaderboards.$reset();
  postStore.selectGameLeaderboards(game);
}

const apiUrl = import.meta.env.VITE_API_URL;

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

  if (recentGames.games.length !== 0) {
    recentGames.restoreOffset();
  }
});

watch(
  () => recentGames.shouldScrollToTop,
  (shouldScroll) => {
    if (shouldScroll) {
      if (recentGamesElement.value) {
        recentGamesElement.value.scrollTo({ top: 0, behavior: "smooth" });
      }
      recentGames.consumeScrollToTop();
    }
  },
);
</script>

<template>
  <div class="page-container" ref="recentGamesElement">
    <header class="page-header">
      <img src="/logo.svg" alt="Retro Leaderboards" class="header-logo" />
      <h1 class="page-title">Welcome {{ user.username }}</h1>
      <RefreshButton
        :loading-state="loadingRefresh"
        @click="refreshGames"
      ></RefreshButton>
    </header>

    <h2 class="section-subtitle">Recently Played Games</h2>

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
            @click="selectGameLeaderboards(game)"
          >
            <div class="background-overlay"></div>
            <img
              :src="apiUrl + '\\' + game.ImageIcon"
              :alt="game.Title"
              class="game-icon"
            />
            <span class="game-name">{{ game.Title }}</span>
          </div>
        </li>
        <span v-if="loadingInfiniteScroll" class="loading-text"
          >Loading...</span
        >
      </ul>
      <div v-else class="empty-text">No games played yet</div>
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
.page-container {
  background-color: var(--bg-body);
  color: var(--text-primary);
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
  flex: 1;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.header-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.page-header .page-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 0;
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--accent-primary);
  letter-spacing: -0.01em;
}

.section-subtitle {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 16px;
  text-align: center;
  opacity: 0.9;
}

.game-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.game-item {
  margin-bottom: 10px;
}

.game-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: var(--radius-lg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  cursor: pointer;
  min-height: 54px;
}

@media (hover: hover) {
  .game-container:hover {
    box-shadow: 0 4px 20px rgba(203, 163, 78, 0.1);
  }
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--bg-body), var(--bg-body));
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
}

.game-icon {
  width: 44px;
  height: 44px;
  margin-right: 12px;
  z-index: 1;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.game-name {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  z-index: 1;
  line-height: 1.4;
  word-break: break-word;
}

.loading-text {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: var(--text-muted);
}

.empty-text {
  text-align: center;
  padding: 40px 0;
  font-size: 13px;
  color: var(--text-muted);
}

@media (min-width: 768px) {
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6);
  }
  .page-header {
    margin-bottom: var(--space-6);
  }
  .header-logo {
    width: 40px;
    height: 40px;
  }
  .page-title {
    font-size: var(--text-xl);
  }
  .section-subtitle {
    font-size: var(--text-lg);
    margin-bottom: var(--space-6);
  }
  .game-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
  .game-item {
    margin-bottom: 0;
  }
  .game-container {
    padding: var(--space-4);
    min-height: 64px;
    overflow: hidden;
  }
  .game-icon {
    width: 52px;
    height: 52px;
  }
  .game-name {
    font-size: var(--text-base);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (min-width: 1280px) {
  .game-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
