<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user.ts";
import { usePostStore } from "../stores/postStore.ts";
import { Leaderboard } from "../models/GameLeaderboards.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";

import { useUpdatesStore } from "../stores/updates.ts";

const router = useRouter();
const route = useRoute();
const postStore = usePostStore();
const user = useUserStore();

const selectedGameId = ref<string | null>(null);

async function selectUpdateLeaderboard(
  id: number,
  gameId: number,
  gameName: string,
  name: string,
  description: string,
  friend: string,
) {
  await updatesStore.markUpdateAsRead(id, user.getId(), friend);

  const game = { GameID: gameId, Title: gameName } as Game;
  const leaderboard = {
    ID: id,
    Title: name,
    Description: description,
  } as Leaderboard;
  postStore.selectGameLeaderboards(game, false);
  postStore.selectLeaderboard(leaderboard);
}

const updatesStore = useUpdatesStore();

const apiUrl = import.meta.env.VITE_API_URL;

const uniqueGamesFromUpdates = computed(() => {
  if (!updatesStore.updates?.length) return [];
  const seen = new Map<number, { game_id: number; name: string }>();
  for (const u of updatesStore.updates) {
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
  if (!updatesStore.updates) return null;
  if (!selectedGameId.value) return updatesStore.updates;
  const id = Number(selectedGameId.value);
  return updatesStore.updates.filter((u) => u.leaderboards?.game_id === id);
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

  // await updatesStore.fetchUpdates(); // Handled by MainLayout
  if (route.query.gameId != null) {
    selectedGameId.value = String(route.query.gameId);
  }
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">Updates</h1>
    <div v-if="updatesStore.updates" class="filter-row">
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
    <div v-if="updatesStore.updates">
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
                  update.leaderboards.game_id,
                  update.leaderboards.games.name,
                  update.leaderboards.name,
                  update.leaderboards.description,
                  update.friend_name,
                )
              "
            />
            <div
              class="clickable update-content"
              @click="
                selectUpdateLeaderboard(
                  update.leaderboard_id,
                  update.leaderboards.game_id,
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
                updatesStore.deleteUpdate(
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
      <div v-else class="empty-text">No updates</div>
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
.page-container {
  background-color: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #cba34e;
  margin: 0 0 16px;
  text-align: center;
  letter-spacing: -0.01em;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
}

.filter-select {
  background-color: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  border: 1px solid rgba(203, 163, 78, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  min-width: 160px;
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: rgba(203, 163, 78, 0.5);
}

.game-list {
  list-style-type: none;
  padding: 0;
}

.game-item {
  margin-bottom: 8px;
}

.game-container {
  position: relative;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  background-color: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.06);
  transition: all 0.15s ease;
}

.game-container:hover {
  background-color: rgba(30, 41, 59, 0.7);
}

.game-container.unread {
  background-color: rgba(203, 163, 78, 0.1);
  border-color: rgba(203, 163, 78, 0.2);
}

.game-icon {
  width: 48px;
  height: auto;
  margin-right: 12px;
  z-index: 1;
  border-radius: 8px;
  flex-shrink: 0;
}

.update-content {
  flex: 1;
  min-width: 0;
}

.game-container span {
  display: block;
}

.clickable:hover {
  cursor: pointer;
}

.game-name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.update-text {
  padding-top: 4px;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}

.leaderboard-description {
  padding-top: 4px;
  font-size: 11px;
  color: #64748b;
  font-style: italic;
}

.delete-button {
  background: rgba(148, 163, 184, 0.08);
  color: #64748b;
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 8px 10px;
  cursor: pointer;
  font-size: 12px;
  border-radius: 8px;
  margin-left: auto;
  z-index: 2;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.loading-text,
.empty-text {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  padding: 20px 0;
}

@media (min-width: 768px) {
  .game-container {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
  }
}
</style>
