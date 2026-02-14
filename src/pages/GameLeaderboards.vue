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
  <div class="leaderboard-container" ref="gameLeaderboardsElement">
    <BackButton></BackButton>
    <RefreshButton
      :loading-state="loadingRefresh"
      @click="refreshLeaderboards"
    ></RefreshButton>
    <h1 class="leaderboard-title">{{ selectedGame?.Title }}</h1>
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
      <span v-else>No leaderboards found for this game.</span>
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.leaderboard-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 16px;
  font-family: "Press Start 2P", cursive;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  min-height: 0;
}

.leaderboard-title {
  font-size: 24px;
  color: #f5a623;
  text-align: center;
}

.subscribe-button,
.unsubscribe-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 10px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.unsubscribe-button {
  background-color: #22223b;
  color: #e0e1dd;
}

.subscribe-button:hover {
  background-color: #d48821;
}

.unsubscribe-button:hover {
  background-color: #d9534f;
}

.leaderboard-list {
  list-style-type: none;
  padding: 0;
}

.leaderboard-item-container {
  background-color: #22223b;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.leaderboard-item-container:hover {
  background-color: #3a3c58;
}

.leaderboard-item {
  color: #f5a623;
  flex-grow: 1;
}

.leaderboard-item-description {
  font-size: 0.7rem;
}

.top-entry {
  color: #e0e1dd;
  font-size: 12px;
  opacity: 0.7;
  align-self: flex-end;
  padding-top: 1rem;
}

.loading-text {
  text-align: center;
  padding-bottom: 20px;
}
</style>
