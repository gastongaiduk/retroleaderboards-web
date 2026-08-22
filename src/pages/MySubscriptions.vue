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
import { captureEvent } from "../utils/posthog";

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
  captureEvent("game_opened", {
    game_id: sub.game_id,
    game_name: sub.games?.name ?? "",
    source: "subscriptions",
  });
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
      captureEvent("game_unsubscribed", {
        game_id: Number(subscriptionToUnsubscribe.value.game_id),
        source: "subscriptions_list",
        success: false,
      });
    } else {
      captureEvent("game_unsubscribed", {
        game_id: Number(subscriptionToUnsubscribe.value.game_id),
        source: "subscriptions_list",
        success: true,
      });
      await fetchSubscriptions();
    }
  } catch (error) {
    console.error("Error removing subscription:", error);
    captureEvent("game_unsubscribed", {
      game_id: Number(subscriptionToUnsubscribe.value.game_id),
      source: "subscriptions_list",
      success: false,
    });
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
        <li v-for="sub in subscriptions" :key="sub.game_id" class="game-item">
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
                v-if="
                  loadingUnsubscribe &&
                  subscriptionToUnsubscribe?.game_id === sub.game_id
                "
                class="fa fa-spinner fa-spin"
                aria-hidden="true"
              />
              <i v-else class="fa fa-remove" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>
      <div v-else class="empty-message">
        You are not following any game. Follow a game from its page to receive
        updates when a friend beats your scores.
      </div>
    </div>
    <div v-else class="loading-text">Loading...</div>

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
  color: var(--text-primary);
  padding: var(--space-4);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--accent-primary);
  text-align: center;
  padding: var(--space-2) 0;
  margin: 0 0 var(--space-3);
  letter-spacing: -0.01em;
}

.game-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.game-item {
  margin-bottom: var(--space-2);
}

.game-container {
  position: relative;
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-default);
  transition: all var(--transition-fast);
}

.game-container:hover {
  background-color: var(--bg-surface-hover);
}

.game-icon {
  width: 44px;
  height: 44px;
  margin-right: var(--space-3);
  z-index: 1;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.game-info {
  flex: 1;
}

.clickable:hover {
  cursor: pointer;
}

.game-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-word;
}

.unsubscribe-button {
  background: var(--bg-body);
  color: var(--text-muted);
  border: 1px solid var(--border-default);
  padding: 8px 10px;
  cursor: pointer;
  font-size: var(--text-sm);
  border-radius: var(--radius-md);
  margin-left: auto;
  z-index: 2;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.unsubscribe-button:hover:not(:disabled) {
  background-color: var(--accent-red-bg);
  border-color: var(--accent-red);
  color: var(--accent-red);
}

.unsubscribe-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-text,
.empty-message {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.empty-message {
  line-height: 1.7;
  padding: var(--space-5);
}

@media (min-width: 768px) {
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6);
  }
  .page-title {
    font-size: var(--text-2xl);
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
  }
  .game-icon {
    width: 52px;
    height: 52px;
  }
  .game-name {
    font-size: var(--text-base);
  }
}

@media (min-width: 1280px) {
  .game-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
