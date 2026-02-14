<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user.ts";
import { usePostStore } from "../stores/postStore.ts";
import { Leaderboard } from "../models/GameLeaderboards.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";
import BurgerMenu from "../components/BurgerMenu.vue";
import BackButton from "../components/BackButton.vue";
import { useSubscriptionUpdates } from "../composables/useSubscriptionUpdates.ts";

const router = useRouter();
const route = useRoute();
const postStore = usePostStore();
const user = useUserStore();

const selectedGameId = ref<string | null>(null);

async function selectUpdateLeaderboard(
  id: number,
  gameName: string,
  name: string,
  description: string,
  friend: string,
) {
  await markUpdateAsRead(id, user.getId(), friend);

  const gameId = Number(selectedGameId.value);
  const game = { GameID: gameId, Title: gameName } as Game;
  const leaderboard = {
    ID: id,
    Title: name,
    Description: description,
  } as Leaderboard;
  postStore.selectGameLeaderboards(game, false);
  postStore.selectLeaderboard(leaderboard);
}

const { updates, updatesNumber, fetchUpdates, markUpdateAsRead, deleteUpdate } =
  useSubscriptionUpdates();

const apiUrl = import.meta.env.VITE_API_URL;

const uniqueGamesFromUpdates = computed(() => {
  if (!updates.value?.length) return [];
  const seen = new Map<number, { game_id: number; name: string }>();
  for (const u of updates.value) {
    const lb = u.leaderboards;
    if (lb?.game_id != null && !seen.has(lb.game_id)) {
      seen.set(lb.game_id, {
        game_id: lb.game_id,
        name: lb.games?.name ?? String(lb.game_id),
      });
    }
  }
  return Array.from(seen.values());
});

const filteredUpdates = computed(() => {
  if (!updates.value) return null;
  if (!selectedGameId.value) return updates.value;
  const id = Number(selectedGameId.value);
  return updates.value.filter((u) => u.leaderboards?.game_id === id);
});

function onFilterChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const value = target.value || null;
  selectedGameId.value = value;
  router.replace({
    path: route.path,
    query: value ? { gameId: value } : {},
  });
}

watch(
  () => route.query.gameId,
  (gameId) => {
    if (gameId != null) selectedGameId.value = String(gameId);
  },
  { immediate: true },
);

onMounted(async () => {
  if (!user.isLoggedIn() || !user.isSet()) {
    await router.push("/login");
    return;
  }

  await fetchUpdates();
  if (route.query.gameId != null) {
    selectedGameId.value = String(route.query.gameId);
  }
});
</script>

<template>
  <div class="retro-container">
    <header class="page-header">
      <BackButton to="/my-subscriptions" />
      <h1 class="retro-title">Updates</h1>
      <BurgerMenu :updates-number="updatesNumber"></BurgerMenu>
    </header>
    <div v-if="updates" class="filter-row">
      <label for="game-filter" class="filter-label">Filter by game</label>
      <select
        id="game-filter"
        class="filter-select"
        :value="selectedGameId ?? ''"
        @change="onFilterChange"
      >
        <option value="">All games</option>
        <option
          v-for="g in uniqueGamesFromUpdates"
          :key="g.game_id"
          :value="String(g.game_id)"
        >
          {{ g.name }}
        </option>
      </select>
    </div>
    <div v-if="updates">
      <ul v-if="filteredUpdates?.length" class="game-list">
        <li
          v-for="update in filteredUpdates"
          :key="update.leaderboard_id"
          class="game-item"
        >
          <div class="game-container" :class="{ unread: !update.read_at }">
            <img
              :src="apiUrl + '\\' + update.leaderboards.games.image_icon"
              :alt="update.leaderboards.games.name"
              class="game-icon clickable"
              @click="
                selectUpdateLeaderboard(
                  update.leaderboard_id,
                  update.leaderboards.games.name,
                  update.leaderboards.name,
                  update.leaderboards.description,
                  update.friend_name,
                )
              "
            />
            <div
              class="clickable"
              @click="
                selectUpdateLeaderboard(
                  update.leaderboard_id,
                  update.leaderboards.games.name,
                  update.leaderboards.name,
                  update.leaderboards.description,
                  update.friend_name,
                )
              "
            >
              <span class="game-name">{{
                update.leaderboards.games.name
              }}</span>
              <span class="update-text"
                >{{ update.friend_name }} has beaten you on
                {{ update.leaderboards.name }}</span
              >
              <span class="leaderboard-description">{{
                update.leaderboards.description
              }}</span>
            </div>
            <button
              @click="
                deleteUpdate(
                  update.leaderboard_id,
                  user.getId(),
                  update.friend_name,
                )
              "
              class="delete-button"
            >
              <i class="fa fa-remove" aria-hidden="true"></i>
            </button>
          </div>
        </li>
      </ul>
      <div v-else>No updates</div>
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
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: "Press Start 2P", cursive;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 10px;
  flex-shrink: 0;
  margin-bottom: 15px;
}

.page-header .retro-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 10px 0;
}

.retro-title {
  font-size: 24px;
  color: #f5a623;
  padding: 10px 0;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.8rem;
}

.filter-select {
  background-color: #16213e;
  color: #e0e1dd;
  border: 1px solid #f5a623;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: "Press Start 2P", cursive;
  font-size: 0.7rem;
  min-width: 180px;
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
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
}

.game-container.unread {
  color: #1a1a2e;
  background-color: #d48821;
}

.game-icon {
  width: 70px;
  height: auto;
  margin-right: 15px;
  z-index: 1;
}

.game-container span {
  display: block;
}

.clickable:hover {
  cursor: pointer;
}

.game-name {
  font-variant: all-petite-caps;
  font-size: 1.5rem;
}

.update-text {
  padding-top: 10px;
  font-size: 1rem;
}

.leaderboard-description {
  padding-top: 10px;
  font-size: 0.7rem;
  font-style: oblique;
}

.delete-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 15px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
  margin-left: auto;
  z-index: 2;
}

.delete-button:hover {
  background-color: #d9534f;
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
