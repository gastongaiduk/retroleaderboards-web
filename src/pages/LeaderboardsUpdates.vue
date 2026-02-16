<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user.ts";
import { usePostStore } from "../stores/postStore.ts";
import { Leaderboard } from "../models/GameLeaderboards.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";

import { useUpdatesStore } from "../stores/updates.ts";
import { useSubscriptionList } from "../composables/useSubscriptionList";
import { supabase } from "../utils/supabaseClient";
import { Subscription } from "../models/Subscription";
import ConfirmModal from "../components/ConfirmModal.vue";
import { useGameLeaderboardsStore } from "../stores/gameLeaderboards";

const router = useRouter();
const route = useRoute();
const postStore = usePostStore();
const user = useUserStore();
const gameLeaderboards = useGameLeaderboardsStore();

const { subscriptions, fetchSubscriptions } = useSubscriptionList();
const unsubscribeModalVisible = ref(false);
const subscriptionToUnsubscribe = ref<Subscription | null>(null);
const loadingUnsubscribe = ref(false);

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

const groupedUpdates = computed(() => {
  if (!filteredUpdates.value) return [];
  
  const groups = filteredUpdates.value.reduce((acc, update) => {
    const gameId = update.leaderboards.game_id;
    if (!acc[gameId]) {
      acc[gameId] = {
        gameId,
        gameName: update.leaderboards.games.name,
        gameIcon: update.leaderboards.games.image_icon,
        updates: []
      };
    }
    acc[gameId].updates.push(update);
    return acc;
  }, {} as Record<number, any>);

  return Object.values(groups).sort((a, b) => a.gameName.localeCompare(b.gameName));
});

function formatValue(value: number, format: string): string {
  if (!value && value !== 0) return "";
  
  const fmt = format?.toUpperCase() || "SCORE";
  
  if (fmt === "SCORE" || fmt === "POINTS" || fmt === "VALUE") {
    return value.toLocaleString();
  }
  
  if (fmt === "TIME" || fmt === "FRAMES") {
    // RA TIME is usually frames (60 fps)
    const hours = Math.floor(value / 216000);
    const minutes = Math.floor((value % 216000) / 3600);
    const seconds = Math.floor((value % 3600) / 60);
    const centiseconds = Math.floor(((value % 60) / 60) * 100);
    
    let res = "";
    if (hours > 0) res += `${hours}:`;
    res += `${String(minutes).padStart(2, "0")}:`;
    res += `${String(seconds).padStart(2, "0")}.`;
    res += String(centiseconds).padStart(2, "0");
    return res;
  }
  
  if (fmt === "MILLISECS") {
    const seconds = Math.floor(value / 1000);
    const ms = value % 1000;
    const minutes = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${minutes}:${String(s).padStart(2, "0")}.${String(Math.floor(ms/10)).padStart(2, "0")}`;
  }
  
  return value.toLocaleString();
}

function getFormattedDifference(update: any) {
  const diff = Math.abs(update.friend_score - update.user_score);
  return formatValue(diff, update.leaderboards.format);
}

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

function subscriptionToGame(sub: Subscription): Game {
  return {
    GameID: sub.game_id,
    ConsoleID: 0,
    ConsoleName: "",
    Title: sub.games?.name ?? "",
    ImageIcon: sub.games?.image_icon ?? "",
    ImageTitle: "",
    ImageIngame: "",
    ImageBoxArt: "",
    LastPlayed: "",
    AchievementsTotal: 0,
    NumPossibleAchievements: 0,
    PossibleScore: 0,
    NumAchieved: 0,
    ScoreAchieved: 0,
    NumAchievedHardcore: 0,
    ScoreAchievedHardcore: 0,
  };
}

function onFollowedGameClick(sub: Subscription) {
  gameLeaderboards.$reset();
  postStore.selectGameLeaderboards(subscriptionToGame(sub));
}

function showUnsubscribeModal(sub: Subscription) {
  subscriptionToUnsubscribe.value = sub;
  unsubscribeModalVisible.value = true;
}

function hideUnsubscribeModal() {
  subscriptionToUnsubscribe.value = null;
  unsubscribeModalVisible.value = false;
}

async function unsubscribe() {
  if (!subscriptionToUnsubscribe.value) return;
  loadingUnsubscribe.value = true;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      console.log("No active session found");
      loadingUnsubscribe.value = false;
      return;
    }

    const response = await fetch(
      import.meta.env.VITE_SUPABASE_URL + "/functions/v1/unsubscribe-game",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id: Number(subscriptionToUnsubscribe.value.game_id),
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error removing subscription:", errorData.error);
    } else {
      await fetchSubscriptions();
    }
  } catch (error) {
    console.error("Error removing subscription:", error);
  }

  hideUnsubscribeModal();
  loadingUnsubscribe.value = false;
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
  await fetchSubscriptions();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">Updates</h1>
    <p class="info-hint">
      <i class="fa fa-info-circle" aria-hidden="true"></i>
      Updates are refreshed every hour.
    </p>
    <div v-if="updatesStore.updates && uniqueGamesFromUpdates.length > 1" class="filter-row">
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
      <div v-if="groupedUpdates.length" class="grouped-updates">
        <div v-for="group in groupedUpdates" :key="group.gameId" class="game-group">
          <div class="game-group-header">
            <img
              :src="apiUrl + '\\' + group.gameIcon"
              :alt="group.gameName"
              class="game-group-icon"
            />
            <h2 class="game-group-title">{{ group.gameName }}</h2>
          </div>
          <ul class="game-list">
            <li
              v-for="update in group.updates"
              :key="update.leaderboard_id + update.friend_name"
              class="game-item"
            >
              <div class="game-container" :class="{ unread: !update.read_at }">
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
                  <span class="update-text">
                    <strong>{{ update.friend_name }}</strong> beat you on
                    <span class="leaderboard-name">{{ update.leaderboards.name }}</span>
                  </span>
                  <span class="difference-text">
                    By {{ getFormattedDifference(update) }}
                    <span class="format-label" v-if="update.leaderboards.format">({{ update.leaderboards.format.toLowerCase() }})</span>
                  </span>
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
                  title="Remove notification"
                >
                  <i class="fa fa-remove" aria-hidden="true"></i>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div v-else class="empty-text">No updates</div>
    </div>
    <div v-else class="loading-text">Loading...</div>

    <!-- Games I Follow Section -->
    <div class="followed-games-section">
      <div class="section-divider">
        <span class="divider-line"></span>
        <h2 class="section-subtitle">Games I Follow</h2>
        <span class="divider-line"></span>
      </div>
      
      <p class="section-info">Receive alerts when friends beat your scores in these games.</p>

      <div v-if="subscriptions">
        <ul v-if="subscriptions.length" class="followed-game-list">
          <li
            v-for="sub in subscriptions"
            :key="sub.game_id"
            class="followed-game-item"
          >
            <div class="followed-game-container">
              <img
                :src="apiUrl + '\\' + sub.games?.image_icon"
                :alt="sub.games?.name"
                class="followed-game-icon clickable"
                @click="onFollowedGameClick(sub)"
              />
              <div class="clickable followed-game-info" @click="onFollowedGameClick(sub)">
                <span class="followed-game-name">{{ sub.games?.name }}</span>
              </div>
              <button
                type="button"
                class="unsubscribe-button"
                :disabled="loadingUnsubscribe"
                @click="showUnsubscribeModal(sub)"
                title="Unfollow Game"
              >
                <i
                  v-if="loadingUnsubscribe && subscriptionToUnsubscribe?.game_id === sub.game_id"
                  class="fa fa-spinner fa-spin"
                  aria-hidden="true"
                />
                <i v-else class="fa fa-remove" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>
        <div v-else class="empty-text small">
          You are not following any game yet.
        </div>
      </div>
      <div v-else class="loading-text">Loading followed games...</div>
    </div>

    <ConfirmModal
      :isVisible="unsubscribeModalVisible"
      :loading="loadingUnsubscribe"
      :title="
        subscriptionToUnsubscribe
          ? 'Unfollow ' + subscriptionToUnsubscribe.games?.name + '?'
          : 'Unfollow Game'
      "
      text="You will no longer receive updates for this game when a friend beats your scores."
      @confirm="unsubscribe"
      @nope="hideUnsubscribeModal"
    />
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
  margin: 0 0 6px;
  text-align: center;
  letter-spacing: -0.01em;
}

.info-hint {
  text-align: center;
  font-size: 11px;
  color: #64748b;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.info-hint .fa {
  color: #94a3b8;
  font-size: 12px;
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

/* Grouped Updates Styles */
.game-group {
  margin-bottom: 24px;
}

.game-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.game-group-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: contain;
}

.game-group-title {
  font-size: 15px;
  font-weight: 600;
  color: #cba34e;
  margin: 0;
}

.leaderboard-name {
  color: #e2e8f0;
  font-weight: 500;
}

.difference-text {
  display: block;
  font-size: 12px;
  color: #f87171;
  margin-top: 4px;
  font-weight: 600;
}

.format-label {
  font-size: 10px;
  color: #64748b;
  font-weight: 400;
  margin-left: 4px;
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

/* Followed Games Styles */
.followed-games-section {
  margin-top: 40px;
  padding-bottom: 20px;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.section-divider .divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(203, 163, 78, 0.2), transparent);
}

.section-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #cba34e;
  white-space: nowrap;
}

.section-info {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin-bottom: 16px;
}

.followed-game-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.followed-game-item {
  margin-bottom: 8px;
}

.followed-game-container {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.04);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.followed-game-container:hover {
  background-color: rgba(30, 41, 59, 0.6);
  border-color: rgba(203, 163, 78, 0.1);
}

.followed-game-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  margin-right: 12px;
  flex-shrink: 0;
}

.followed-game-info {
  flex: 1;
  min-width: 0;
}

.followed-game-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unsubscribe-button {
  background: rgba(148, 163, 184, 0.08);
  color: #64748b;
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 8px 10px;
  cursor: pointer;
  font-size: 12px;
  border-radius: 8px;
  margin-left: 10px;
  transition: all 0.2s ease;
}

.unsubscribe-button:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.unsubscribe-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-text.small {
  padding: 20px;
}
</style>
