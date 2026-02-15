<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useRivalsStore } from "../stores/rivals";
import { useUserStore } from "../stores/user";
import { usePostStore } from "../stores/postStore";
import { useGameLeaderboardsStore } from "../stores/gameLeaderboards";
import { useLeaderboardEntries } from "../stores/leaderboardEntries";
import { RivalryBattle, RivalryGame } from "../models/Rivalry";
import { Game } from "../models/RecentlyPlayedGames";
import { Leaderboard } from "../models/GameLeaderboards";
import RefreshButton from "../components/RefreshButton.vue";

const router = useRouter();
const user = useUserStore();
const rivalsStore = useRivalsStore();
const postStore = usePostStore();
const gameLeaderboards = useGameLeaderboardsStore();
const leaderboardEntries = useLeaderboardEntries();

const apiUrl = import.meta.env.VITE_API_URL;
const expandedGameId = ref<number | null>(null);
const expandedRivalKey = ref<string | null>(null);

function toggleGame(gameId: number) {
  if (expandedGameId.value === gameId) {
    expandedGameId.value = null;
  } else {
    expandedGameId.value = gameId;
    expandedRivalKey.value = null;
  }
}

function toggleRival(gameId: number, username: string) {
  const key = `${gameId}::${username}`;
  if (expandedRivalKey.value === key) {
    expandedRivalKey.value = null;
  } else {
    expandedRivalKey.value = key;
  }
}

function isRivalExpanded(gameId: number, username: string): boolean {
  return expandedRivalKey.value === `${gameId}::${username}`;
}

function buildGameShell(rivalryGame: RivalryGame): Game {
  return {
    GameID: rivalryGame.gameId,
    ConsoleID: 0,
    ConsoleName: "",
    Title: rivalryGame.gameName,
    ImageIcon: rivalryGame.imageIcon,
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

function navigateToGame(rivalryGame: RivalryGame) {
  gameLeaderboards.$reset();
  postStore.selectGameLeaderboards(buildGameShell(rivalryGame));
}

function navigateToBattle(rivalryGame: RivalryGame, battle: RivalryBattle) {
  const leaderboard: Leaderboard = {
    ID: battle.leaderboardId,
    RankAsc: false,
    Title: battle.leaderboardTitle,
    Description: "",
    Format: "",
    TopEntry: null,
  };
  leaderboardEntries.$reset();
  postStore.selectGameLeaderboards(buildGameShell(rivalryGame), false);
  postStore.selectLeaderboard(leaderboard);
}

function getRivalryLabel(wins: number, losses: number): string {
  if (wins > losses) return "winning";
  if (losses > wins) return "losing";
  return "tied";
}

onMounted(async () => {
  if (!user.isLoggedIn()) {
    await router.push("/login");
    return;
  }

  if (!user.isSet()) {
    await router.push("/ra-credentials");
    return;
  }

  if (!rivalsStore.hasCache()) {
    await rivalsStore.loadRivalries();
  }
});
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1 class="page-title">Rivals</h1>
      <RefreshButton
        :loading-state="rivalsStore.loading"
        @click="rivalsStore.loadRivalries()"
      />
    </header>

    <div v-if="rivalsStore.loading" class="loading-banner">
      <i class="fa fa-refresh fa-spin loading-spinner" />
      <span class="loading-text">
        Loading {{ rivalsStore.loadingGameName ?? "..." }}
      </span>
    </div>

    <div v-if="rivalsStore.rivalryGames.length">
      <ul class="game-list">
        <li
          v-for="game in rivalsStore.rivalryGames"
          :key="game.gameId"
          class="game-card"
        >
          <div class="game-header" @click="toggleGame(game.gameId)">
            <img
              :src="apiUrl + '\\' + game.imageIcon"
              :alt="game.gameName"
              class="game-icon"
            />
            <div class="game-info">
              <span class="game-name">{{ game.gameName }}</span>
              <span class="game-meta">
                {{ game.totalLeaderboards }} leaderboards · {{ game.rivals.length }} rival{{ game.rivals.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <i
              class="fa chevron-icon"
              :class="expandedGameId === game.gameId ? 'fa-chevron-up' : 'fa-chevron-down'"
            />
          </div>

          <div v-if="expandedGameId === game.gameId" class="game-details">
            <div
              v-for="rival in game.rivals"
              :key="rival.username"
              class="rival-row"
            >
              <div
                class="rival-summary"
                @click="toggleRival(game.gameId, rival.username)"
              >
                <div class="rival-left">
                  <i
                    class="fa rival-chevron"
                    :class="isRivalExpanded(game.gameId, rival.username) ? 'fa-chevron-up' : 'fa-chevron-down'"
                  />
                  <span class="rival-name">{{ rival.username }}</span>
                </div>
                <div class="rival-score">
                  <span class="score-label" :class="getRivalryLabel(rival.wins.length, rival.losses.length)">
                    {{ rival.wins.length }}W · {{ rival.losses.length }}L
                  </span>
                </div>
              </div>

              <div v-if="isRivalExpanded(game.gameId, rival.username)" class="rival-details">
                <div v-if="rival.wins.length" class="battle-section">
                  <span class="section-title winning">Your wins</span>
                  <ul class="battle-list">
                    <li
                      v-for="battle in rival.wins"
                      :key="battle.leaderboardId"
                      class="battle-item"
                      @click="navigateToBattle(game, battle)"
                    >
                      <span class="battle-title">{{ battle.leaderboardTitle }}</span>
                      <div class="battle-ranks">
                        <span class="rank-you">You #{{ battle.myRank }} · {{ battle.myScore }}</span>
                        <span class="vs">vs</span>
                        <span class="rank-friend">#{{ battle.friendRank }} · {{ battle.friendScore }}</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div v-if="rival.losses.length" class="battle-section">
                  <span class="section-title losing">Your losses</span>
                  <ul class="battle-list">
                    <li
                      v-for="battle in rival.losses"
                      :key="battle.leaderboardId"
                      class="battle-item"
                      @click="navigateToBattle(game, battle)"
                    >
                      <span class="battle-title">{{ battle.leaderboardTitle }}</span>
                      <div class="battle-ranks">
                        <span class="rank-you">You #{{ battle.myRank }} · {{ battle.myScore }}</span>
                        <span class="vs">vs</span>
                        <span class="rank-friend">#{{ battle.friendRank }} · {{ battle.friendScore }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <button class="view-game-button" @click="navigateToGame(game)">
              View all leaderboards
            </button>
          </div>
        </li>
      </ul>
    </div>

    <div v-else-if="!rivalsStore.loading" class="empty-text">
      No rivalry data yet. Follow some games and press refresh to see how you
      compare with your friends.
    </div>
  </div>
</template>

<style scoped>
.page-container {
  background-color: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
  flex: 1;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: #cba34e;
  text-align: center;
  letter-spacing: -0.01em;
}

.game-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.game-card {
  background-color: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.06);
  border-radius: 12px;
  margin-bottom: 10px;
  overflow: hidden;
}

.game-header {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.game-header:active {
  background-color: rgba(30, 41, 59, 0.9);
}

@media (hover: hover) {
  .game-header:hover {
    background-color: rgba(30, 41, 59, 0.9);
  }
}

.game-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  margin-right: 12px;
  flex-shrink: 0;
}

.game-info {
  flex: 1;
  min-width: 0;
}

.game-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  line-height: 1.4;
  word-break: break-word;
}

.game-meta {
  display: block;
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.chevron-icon {
  color: #64748b;
  font-size: 12px;
  flex-shrink: 0;
  margin-left: 8px;
}

.game-details {
  padding: 0 14px 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.06);
}

.rival-row {
  padding: 10px 0;
}

.rival-row + .rival-row {
  border-top: 1px solid rgba(148, 163, 184, 0.04);
}

.rival-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 4px 0;
}

.rival-summary:active {
  opacity: 0.7;
}

.rival-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rival-chevron {
  font-size: 10px;
  color: #64748b;
  width: 12px;
  text-align: center;
}

.rival-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

.rival-score {
  display: flex;
  gap: 6px;
}

.score-label {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.score-label.winning {
  background-color: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

.score-label.losing {
  background-color: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.score-label.tied {
  background-color: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.rival-details {
  padding: 6px 0 2px 20px;
}

.battle-section {
  margin-bottom: 10px;
}

.section-title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.section-title.winning {
  color: #4ade80;
}

.section-title.losing {
  color: #f87171;
}

.battle-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.battle-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  margin-bottom: 4px;
  background-color: rgba(203, 163, 78, 0.05);
  border: 1px solid rgba(203, 163, 78, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.battle-item:active {
  transform: scale(0.98);
}

@media (hover: hover) {
  .battle-item:hover {
    background-color: rgba(203, 163, 78, 0.1);
    border-color: rgba(203, 163, 78, 0.2);
  }
}

.battle-title {
  font-size: 12px;
  font-weight: 500;
  color: #cba34e;
}

.battle-ranks {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
}

.rank-you {
  color: #94a3b8;
}

.rank-friend {
  color: #94a3b8;
}

.vs {
  color: #64748b;
  padding: 0 3px;
}

.view-game-button {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 9px;
  background-color: rgba(203, 163, 78, 0.1);
  border: 1px solid rgba(203, 163, 78, 0.2);
  border-radius: 8px;
  color: #cba34e;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-game-button:hover {
  background-color: rgba(203, 163, 78, 0.15);
}

.loading-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
  background-color: rgba(203, 163, 78, 0.06);
  border: 1px solid rgba(203, 163, 78, 0.1);
  border-radius: 10px;
}

.loading-spinner {
  color: #cba34e;
  font-size: 13px;
}

.loading-text {
  font-size: 13px;
  color: #cba34e;
}

.empty-text {
  text-align: center;
  padding: 40px 20px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.7;
}
</style>
