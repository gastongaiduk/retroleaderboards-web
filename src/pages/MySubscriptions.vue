<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user.ts";
import { usePostStore } from "../stores/postStore.ts";
import { useGameLeaderboardsStore } from "../stores/gameLeaderboards.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";
import BurgerMenu from "../components/BurgerMenu.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import { useSubscriptionList } from "../composables/useSubscriptionList.ts";
import { useSubscriptionUpdates } from "../composables/useSubscriptionUpdates.ts";
import { supabase } from "../utils/supabaseClient.ts";
import { Subscription } from "../models/Subscription.ts";

const router = useRouter();
const user = useUserStore();
const postStore = usePostStore();
const gameLeaderboards = useGameLeaderboardsStore();

const { subscriptions, fetchSubscriptions } = useSubscriptionList();
const { updates, updatesNumber, fetchUpdates } = useSubscriptionUpdates();

const apiUrl = import.meta.env.VITE_API_URL;
const unsubscribeModalVisible = ref(false);
const subscriptionToUnsubscribe = ref<Subscription | null>(null);
const loadingUnsubscribe = ref(false);

const gameIdsWithUnread = computed(() => {
  if (!updates.value?.length) return new Set<number>();
  return new Set(
    updates.value
      .filter((u) => !u.read_at && u.leaderboards?.game_id != null)
      .map((u) => Number(u.leaderboards.game_id)),
  );
});

const gameIdsWithUpdates = computed(() => {
  if (!updates.value?.length) return new Set<number>();
  return new Set(
    updates.value
      .filter((u) => u.leaderboards?.game_id != null)
      .map((u) => Number(u.leaderboards.game_id)),
  );
});

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
  const gameId = Number(sub.game_id);
  if (gameIdsWithUpdates.value.has(gameId)) {
    router.push({
      path: "/leaderboards-updates",
      query: { gameId: String(sub.game_id) },
    });
  } else {
    gameLeaderboards.$reset();
    postStore.selectGameLeaderboards(subscriptionToGame(sub));
  }
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
  await fetchUpdates();
});
</script>

<template>
  <div class="retro-container">
    <BurgerMenu :updates-number="updatesNumber" />
    <h1 class="retro-title">Games I Follow</h1>
    <div v-if="subscriptions">
      <ul v-if="subscriptions.length" class="game-list">
        <li
          v-for="sub in subscriptions"
          :key="sub.game_id"
          class="game-item"
        >
          <div
            class="game-container"
            :class="{ unread: gameIdsWithUnread.has(Number(sub.game_id)) }"
          >
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
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.retro-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: "Press Start 2P", cursive;
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
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  background-color: rgba(34, 34, 59, 0.5);
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

.game-info {
  flex: 1;
}

.clickable:hover {
  cursor: pointer;
}

.game-name {
  font-variant: all-petite-caps;
  font-size: 1.5rem;
}

.unsubscribe-button {
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

.unsubscribe-button:hover:not(:disabled) {
  background-color: #d9534f;
}

.unsubscribe-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-text,
.empty-message {
  text-align: center;
}

.empty-message {
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 20px;
}
</style>
