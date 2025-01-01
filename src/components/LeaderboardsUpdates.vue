<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useUserStore} from '../stores/user';
import {supabase} from "../utils/supabaseClient.ts";
import {usePostStore} from "../stores/postStore.ts";
import {Leaderboard} from "../models/GameLeaderboards.ts";
import {Game} from "../models/RecentlyPlayedGames.ts";
import BurgerMenu from "./BurgerMenu.vue";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();

async function selectUpdateLeaderboard(id: number, gameName: string, name: string, description: string, friend: string) {
  let {error} = await supabase
      .from('leaderboards_updates')
      .update({read_at: new Date()})
      .eq('leaderboard_id', id)
      .eq('user_id', user.user_id)
      .eq('friend_name', friend)
      .select()
  if (error) {
    console.log('Error while changing update status to read: ', error)
    return
  }

  const game = {Title: gameName} as Game;
  const leaderboard = {ID: id, Title: name, Description: description} as Leaderboard;
  postStore.selectGameLeaderboards(game, false)
  postStore.selectLeaderboard(leaderboard);
}

async function deleteUpdate(id: number, friend: string) {
  let {error} = await supabase
      .from('leaderboards_updates')
      .update({deleted_at: new Date()})
      .eq('leaderboard_id', id)
      .eq('user_id', user.user_id)
      .eq('friend_name', friend)
      .select()
  if (error) {
    console.log('Error while changing update status to deleted: ', error)
    return
  }

  await refreshUpdates()
}

async function refreshUpdates() {
  updates.value = null
  let {data, error} = await supabase
      .from('leaderboards_updates')
      .select(`
        leaderboard_id,
        friend_name,
        user_score,
        friend_score,
        created_at,
        read_at,
        leaderboards (name, description, games (name, image_icon))
      `)
      .is('deleted_at', null)
      .order('created_at', {ascending: false})

  if (error) {
    console.error('Error fetching updates:', error);
    return;
  }

  updates.value = data
}

const apiUrl = import.meta.env.VITE_API_URL;
const updates = ref<Object[] | null>(null);

onMounted(async () => {
  if (!user.isLoggedIn() || !user.isSet()) {
    await router.push("/login")
    return;
  }

  await refreshUpdates();
});
</script>

<template>
  <div class="retro-container">
    <BurgerMenu :updates-number="0"></BurgerMenu>
    <h1 class="retro-title">Updates</h1>
    <div v-if="updates">
      <ul v-if="updates.length" class="game-list">
        <li v-for="update in updates" :key="update.leaderboardId" class="game-item">
          <div class="game-container" :class="{ unread: !update.read_at }">
            <img :src="apiUrl + '\\' + update.leaderboards.games.image_icon"
                 :alt="update.leaderboards.games.name" class="game-icon clickable"
                 @click="selectUpdateLeaderboard(
                     update.leaderboard_id,
                     update.leaderboards.games.name,
                     update.leaderboards.name,
                     update.leaderboards.description,
                     update.friend_name
                   )"
            >
            <div class="clickable" @click="selectUpdateLeaderboard(
                     update.leaderboard_id,
                     update.leaderboards.games.name,
                     update.leaderboards.name,
                     update.leaderboards.description,
                     update.friend_name
                   )"
            >
              <span class="game-name">{{ update.leaderboards.games.name }}</span>
              <span class="update-text">{{ update.friend_name }} has beaten you on {{ update.leaderboards.name }}</span>
              <span class="leaderboard-description">{{ update.leaderboards.description }}</span>
            </div>
            <button
                @click="deleteUpdate(update.leaderboard_id, update.friend_name)"
                class="delete-button">
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
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.retro-container {
  background-color: #1a1a2e;
  color: #e0e1dd;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', cursive;
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

