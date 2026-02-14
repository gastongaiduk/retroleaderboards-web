<script setup lang="ts">
import { onActivated, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import GameRepository from "../repositories/GameRepository.ts";

import { usePostStore } from "../stores/postStore.ts";
import { useUserStore } from "../stores/user.ts";
import { Game } from "../models/RecentlyPlayedGames.ts";
import { supabase } from "../utils/supabaseClient.ts";
import ConfirmModal from "../components/ConfirmModal.vue";
import RefreshButton from "../components/RefreshButton.vue";
import BackButton from "../components/BackButton.vue";

import { useScrollTracker } from "../composables/useScrollTracker.ts";
import { useInfiniteScroll } from "@vueuse/core";
import { useGameLeaderboardsStore } from "../stores/gameLeaderboards.ts";
import { Leaderboard } from "../models/GameLeaderboards.ts";
import { useLeaderboardEntries } from "../stores/leaderboardEntries.ts";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const gameLeaderboards = useGameLeaderboardsStore();
const leaderboardEntries = useLeaderboardEntries();

const repository = new GameRepository();

function showSubscribeModal() {
  isSubscribeModalVisible.value = true;
}

function hideSubscribeModal() {
  isSubscribeModalVisible.value = false;
}

function showUnsubscribeModal() {
  isUnsubscribeModalVisible.value = true;
}

function hideUnsubscribeModal() {
  isUnsubscribeModalVisible.value = false;
}

function selectLeaderboard(leaderboard: Leaderboard) {
  saveScrollPosition();
  leaderboardEntries.$reset();
  postStore.selectLeaderboard(leaderboard);
}

const isUnsubscribeModalVisible = ref(false);
const selectedGame = ref<Game | null>(null);
const subscribedToGame = ref<boolean | null>(null);
const loadingSubscription = ref<boolean>(false);
const isSubscribeModalVisible = ref(false);
const loadingRefresh = ref<boolean>(false);
const loadingInfiniteScroll = ref<boolean>(false);
const itemsToLoad = 20;
const gameLeaderboardsElement = ref<HTMLElement | null>(null);
const { saveScrollPosition, restoreScrollPosition } = useScrollTracker(
  gameLeaderboardsElement,
  gameLeaderboards,
);
onActivated(async () => restoreScrollPosition());

async function refreshSubscriptionToGame() {
  let { data, error } = await supabase
    .from("game_subscriptions")
    .select()
    .eq("game_id", props.id);
  if (error) {
    console.log("Error while fetching subscription status: ", error);
    return;
  }

  if (data) {
    subscribedToGame.value = data.length > 0;
  }
}

async function subscribe() {
  loadingSubscription.value = true;
  let { error } = await supabase
    .from("game_subscriptions")
    .insert({ game_id: props.id, user_id: user.user_id });
  if (error) {
    console.log("Error while updating notification status to read: ", error);
  }

  await refreshSubscriptionToGame();
  hideSubscribeModal();
  loadingSubscription.value = false;
}

async function unsubscribe() {
  loadingSubscription.value = true;
  let { error } = await supabase
    .from("game_subscriptions")
    .delete()
    .eq("user_id", user.user_id)
    .eq("game_id", props.id);
  if (error) {
    console.log("Error while updating notification status to read: ", error);
  }

  await refreshSubscriptionToGame();
  hideUnsubscribeModal();
  loadingSubscription.value = false;
}

async function refreshLeaderboards() {
  loadingRefresh.value = true;
  gameLeaderboards.setHasMoreToLoad(true);
  gameLeaderboards.resetOffset();
  gameLeaderboards.resetScrollPosition();
  if (gameLeaderboardsElement.value) {
    gameLeaderboardsElement.value.scrollTop = 0;
  }

  try {
    gameLeaderboards.leaderboards = (
      await repository.fetchLeaderboards(
        props.id,
        itemsToLoad,
        gameLeaderboards.offset,
      )
    ).Results;
  } catch (error) {
    console.error("Error fetching last played games:", error);
  }
  gameLeaderboards.increaseOffsetIn(itemsToLoad);
  reset();
  loadingRefresh.value = false;
}

const { reset } = useInfiniteScroll(
  gameLeaderboardsElement,
  async () => {
    if (loadingInfiniteScroll.value) return;
    loadingInfiniteScroll.value = true;

    const fetchedResults = await repository.fetchLeaderboards(
      props.id,
      itemsToLoad,
      gameLeaderboards.offset,
    );
    if (fetchedResults.Count !== itemsToLoad) {
      gameLeaderboards.setHasMoreToLoad(false);
    }
    gameLeaderboards.addItems(fetchedResults.Results);
    gameLeaderboards.increaseOffsetIn(itemsToLoad);
    loadingInfiniteScroll.value = false;
  },
  {
    distance: itemsToLoad,
    canLoadMore: () => {
      return gameLeaderboards.hasMoreToLoad;
    },
  },
);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

onMounted(async () => {
  if (!user.isSet()) {
    await router.push("/login");
    return;
  }

  loadingSubscription.value = true;
  selectedGame.value = postStore.getSelectedGameLeaderboards();

  if (gameLeaderboards.leaderboards.length !== 0) {
    gameLeaderboards.restoreOffset();
  }

  await refreshSubscriptionToGame();
  loadingSubscription.value = false;
});
</script>

<template>
  <div class="page-container" ref="gameLeaderboardsElement">
    <BackButton></BackButton>
    <RefreshButton
      :loading-state="loadingRefresh"
      @click="refreshLeaderboards"
    ></RefreshButton>
    <h1 class="page-title">{{ selectedGame?.Title }}</h1>
    <div
      v-if="
        gameLeaderboards.leaderboards &&
        gameLeaderboards.leaderboards.length &&
        subscribedToGame !== null
      "
      style="text-align: center"
    >
      <button
        v-if="!subscribedToGame"
        class="subscribe-button"
        @click="showSubscribeModal"
        :disabled="loadingSubscription"
      >
        <i v-if="loadingSubscription" class="fa fa-spinner fa-spin"></i>
        <span v-else> Follow </span>
      </button>
      <ConfirmModal
        :isVisible="isSubscribeModalVisible"
        @confirm="subscribe"
        @nope="hideSubscribeModal"
        :title="'Follow ' + selectedGame?.Title + '?'"
        :text="
          'Stay competitive! Get notified when friends beat your scores in ' +
          selectedGame?.Title +
          '. Never miss a challenge - reclaim your top spot! (in-app notifications only)'
        "
      />

      <button
        v-if="subscribedToGame"
        class="unsubscribe-button"
        @click="showUnsubscribeModal"
        :disabled="loadingSubscription"
      >
        <i v-if="loadingSubscription" class="fa fa-spinner fa-spin"></i>
        <span v-else> Unfollow </span>
      </button>
      <ConfirmModal
        :isVisible="isUnsubscribeModalVisible"
        @confirm="unsubscribe"
        @nope="hideUnsubscribeModal"
        :title="'Unfollow ' + selectedGame?.Title + '?'"
        :text="
          'Are you sure you want to stop receiving notifications for ' +
          selectedGame?.Title +
          '? You might miss when friends beat your high scores!'
        "
      />
    </div>
    <div v-if="gameLeaderboards.leaderboards">
      <ul class="leaderboard-list" v-if="gameLeaderboards.leaderboards.length">
        <li
          v-for="leaderboard in gameLeaderboards.leaderboards"
          :key="leaderboard.ID"
          class="leaderboard-item-container"
          @click="selectLeaderboard(leaderboard)"
        >
          <span class="leaderboard-item">
            {{ leaderboard.Title }}
            <span
              v-if="leaderboard.Title.length < 2"
              class="leaderboard-item-description"
            >
              {{ leaderboard.Description }}
            </span>
          </span>
          <span class="top-entry" v-if="leaderboard.TopEntry">
            {{ leaderboard.TopEntry.User }} ({{
              leaderboard.TopEntry.FormattedScore
            }})
          </span>
        </li>
        <span v-if="loadingInfiniteScroll" class="loading-text"
          >Loading...</span
        >
      </ul>
      <span v-else class="empty-text">No leaderboards found for this game.</span>
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
.page-container {
  background-color: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  min-height: 0;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #cba34e;
  text-align: center;
  letter-spacing: -0.01em;
}

.subscribe-button,
.unsubscribe-button {
  border: none;
  padding: 9px 20px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.subscribe-button {
  background-color: #cba34e;
  color: #0f172a;
}

.subscribe-button:hover:not(:disabled) {
  background-color: #b8923f;
}

.unsubscribe-button {
  background-color: rgba(30, 41, 59, 0.6);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.unsubscribe-button:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.leaderboard-list {
  list-style-type: none;
  padding: 0;
}

.leaderboard-item-container {
  background-color: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.06);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.15s ease;
}

.leaderboard-item-container:hover {
  background-color: rgba(30, 41, 59, 0.9);
  border-color: rgba(203, 163, 78, 0.1);
}

.leaderboard-item {
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
}

.leaderboard-item-description {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 400;
}

.top-entry {
  color: #64748b;
  font-size: 11px;
  align-self: flex-end;
  padding-top: 6px;
}

.loading-text {
  text-align: center;
  padding-bottom: 20px;
  font-size: 13px;
  color: #64748b;
}

.empty-text {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  padding: 20px 0;
}
</style>
