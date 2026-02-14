<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user.ts";
import { usePostStore } from "../stores/postStore.ts";
import { useGameLeaderboardsStore } from "../stores/gameLeaderboards.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";
import ConfirmModal from "../components/ConfirmModal.vue";
import { useSubscriptionList } from "../composables/useSubscriptionList.ts";
import { supabase } from "../utils/supabaseClient.ts";
import { Subscription } from "../models/Subscription.ts";

const router = useRouter();
const user = useUserStore();
const postStore = usePostStore();
const gameLeaderboards = useGameLeaderboardsStore();

const { subscriptions, fetchSubscriptions } = useSubscriptionList();

const apiUrl = import.meta.env.VITE_API_URL;
const unsubscribeModalVisible = ref(false);
const subscriptionToUnsubscribe = ref<Subscription | null>(null);
const loadingUnsubscribe = ref(false);

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

function onGameClick(sub: Subscription) {
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
  const { error } = await supabase
    .from("game_subscriptions")
    .delete()
    .eq("user_id", user.getId())
    .eq("game_id", subscriptionToUnsubscribe.value.game_id);

  if (error) {
    console.error("Error removing subscription:", error);
  } else {
    await fetchSubscriptions();
  }
  hideUnsubscribeModal();
  loadingUnsubscribe.value = false;
}

onMounted(async () => {
  if (!user.isLoggedIn() || !user.isSet()) {
    await router.push("/login");
    return;
  }
  await fetchSubscriptions();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">Games I Follow</h1>
    <div v-if="subscriptions">
      <ul v-if="subscriptions.length" class="game-list">
        <li
          v-for="sub in subscriptions"
          :key="sub.game_id"
          class="game-item"
        >
          <div class="game-container">
            <img
              :src="apiUrl + '\\' + sub.games?.image_icon"
              :alt="sub.games?.name"
              class="game-icon clickable"
              @click="onGameClick(sub)"
            />
            <div class="clickable game-info" @click="onGameClick(sub)">
              <span class="game-name">{{ sub.games?.name }}</span>
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
      <div v-else class="empty-message">
        You are not following any game. Follow a game from its page to
        receive updates when a friend beats your scores.
      </div>
    </div>
    <div v-else class="loading-text">Loading...</div>

    <ConfirmModal
      :isVisible="unsubscribeModalVisible"
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
  font-size: 15px;
  font-weight: 600;
  color: #cba34e;
  text-align: center;
  padding: 8px 0;
  margin: 0 0 12px;
  letter-spacing: -0.01em;
}

.game-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.game-item {
  margin-bottom: 8px;
}

.game-container {
  position: relative;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  background-color: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.06);
  transition: all 0.15s ease;
}

.game-container:hover {
  background-color: rgba(30, 41, 59, 0.8);
}

.game-icon {
  width: 44px;
  height: 44px;
  margin-right: 12px;
  z-index: 1;
  border-radius: 8px;
  flex-shrink: 0;
}

.game-info {
  flex: 1;
}

.clickable:hover {
  cursor: pointer;
}

.game-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  line-height: 1.4;
  word-break: break-word;
}

.unsubscribe-button {
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

.unsubscribe-button:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.unsubscribe-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-text,
.empty-message {
  text-align: center;
  font-size: 13px;
  color: #64748b;
}

.empty-message {
  line-height: 1.7;
  padding: 20px;
}
</style>
