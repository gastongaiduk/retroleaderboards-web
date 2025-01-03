<script setup lang="ts">

import {onMounted, ref} from "vue";
import {useRouter} from 'vue-router';
import {GameLeaderboards, Leaderboard} from "../models/GameLeaderboards";
import GameRepository from "../repositories/GameRepository";

import {usePostStore} from '../stores/postStore';
import {useUserStore} from '../stores/user';
import {useGamesStore} from "../stores/games";
import {Game} from "../models/RecentlyPlayedGames.ts";
import {supabase} from "../utils/supabaseClient.ts";
import Tooltip from "./Tooltip.vue";
import ConfirmModal from "./ConfirmModal.vue";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const games = useGamesStore();

const repository = new GameRepository();

const isSubscribeModalVisible = ref(false);

function showSubscribeModal() {
  isSubscribeModalVisible.value = true;
}

function hideSubscribeModal() {
  isSubscribeModalVisible.value = false;
}

const isUnsubscribeModalVisible = ref(false);

function showUnsubscribeModal() {
  isUnsubscribeModalVisible.value = true;
}

function hideUnsubscribeModal() {
  isUnsubscribeModalVisible.value = false;
}

function goBack() {
  router.back();
}

function selectLeaderboard(leaderboard: Leaderboard) {
  postStore.selectLeaderboard(leaderboard);
}

async function refreshSubscriptionToGame() {
  if (leaderboards.value && leaderboards.value.Total === 0) {
    return
  }

  let {data, error} = await supabase
      .from('game_subscriptions')
      .select()
      .eq('game_id', props.id)
  if (error) {
    console.log('Error while fetching subscription status: ', error)
    return
  }

  if (data) {
    subscribedToGame.value = data.length > 0
  }
}

async function subscribe() {
  let {error} = await supabase
      .from('game_subscriptions')
      .insert({game_id: props.id, user_id: user.user_id})
  if (error) {
    console.log('Error while updating notification status to read: ', error)
  }

  await refreshSubscriptionToGame()
  hideSubscribeModal()
}

async function unsubscribe() {
  let {error} = await supabase
      .from('game_subscriptions')
      .delete()
      .eq('user_id', user.user_id)
      .eq('game_id', props.id)
  if (error) {
    console.log('Error while updating notification status to read: ', error)
  }

  await refreshSubscriptionToGame()
  hideUnsubscribeModal()
}

async function refreshLeaderboards() {
  try {
    leaderboards.value = null;
    games.setGameLeaderboards(Number(props.id), await repository.fetchLeaderboards(props.id));
    leaderboards.value = games.getGameLeaderboards(Number(props.id));
  } catch (error) {
    console.error('Error fetching last played games:', error);
  }
}

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const selectedGame = ref<Game | null>(null);
const leaderboards = ref<GameLeaderboards | null>(null);
const subscribedToGame = ref<boolean | null>(null);

onMounted(async () => {
  if (!user.isSet()) {
    await router.push("/login")
    return;
  }

  selectedGame.value = postStore.getSelectedGameLeaderboards();

  if (games.hasGameLeaderboard(Number(props.id))) {
    leaderboards.value = games.getGameLeaderboards(Number(props.id));
    await refreshSubscriptionToGame()
    return;
  }

  await refreshLeaderboards();
  await refreshSubscriptionToGame()
});
</script>

<template>
  <div class="leaderboard-container">
    <button class="back-button" @click="goBack"><i class="fa fa-arrow-left" aria-hidden="true"></i> Back</button>
    <Tooltip text="Refresh content" position="left" style="float: right">
      <button class="refresh-button" @click="refreshLeaderboards"><i class="fa fa-refresh"></i></button>
    </Tooltip>
    <h1 class="leaderboard-title">{{ selectedGame?.Title }}</h1>
    <div v-if="leaderboards && leaderboards.Results.length" style="text-align: center">
      <button v-if="!subscribedToGame" class="subscribe-button" @click="showSubscribeModal">Subscribe</button>
      <ConfirmModal :isVisible="isSubscribeModalVisible" @confirm="subscribe" @nope="hideSubscribeModal"
                    :title="'Subscribe to ' + selectedGame?.Title + '?'"
                    :text="'Receive updates when a friend beats any of your scores in ' + selectedGame?.Title + '? (no emails or push notifications are sent)'"
      />

      <button v-if="subscribedToGame" class="unsubscribe-button" @click="showUnsubscribeModal">Unsubscribe</button>
      <ConfirmModal :isVisible="isUnsubscribeModalVisible" @confirm="unsubscribe" @nope="hideUnsubscribeModal"
                    :title="'Unsubscribe from ' + selectedGame?.Title + '?'"
                    :text="'Don\'t receive updates for this game when a friend beats any of your scores in ' + selectedGame?.Title + '?'"
      />
    </div>
    <div v-if="leaderboards">
      <ul class="leaderboard-list" v-if="leaderboards.Results.length">
        <li
            v-for="leaderboard in leaderboards.Results"
            :key="leaderboard.ID"
            class="leaderboard-item-container"
            @click="selectLeaderboard(leaderboard)">
          <span class="leaderboard-item">
            {{ leaderboard.Title }}
            <span v-if="leaderboard.Title.length < 2" class="leaderboard-item-description">
              {{ leaderboard.Description }}
            </span>
          </span>
          <span class="top-entry">{{ leaderboard.TopEntry.User }} ({{ leaderboard.TopEntry.FormattedScore }})</span>
        </li>
      </ul>
      <span v-else>No leaderboards found for this game.</span>
    </div>
    <div v-else class="loading-text">Loading...</div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.leaderboard-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', cursive;
}

.leaderboard-title {
  font-size: 24px;
  color: #f5a623;
  text-align: center;
}

.back-button, .refresh-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 10px;
}

.subscribe-button, .unsubscribe-button {
  background-color: #f5a623;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 10px;
}

.unsubscribe-button {
  background-color: #22223b;
  color: #e0e1dd;
}

.back-button:hover, .refresh-button:hover, .subscribe-button:hover {
  background-color: #d48821;
}

.unsubscribe-button:hover {
  background-color: #d9534f;
}

.refresh-button {
  float: right;
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
}
</style>
