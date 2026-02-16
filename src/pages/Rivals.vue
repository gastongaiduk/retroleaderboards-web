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

    <p class="info-hint">
      Only followed games where you and a friend have scores in the same leaderboards will appear here.
    </p>

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
                {{ game.rivals.length }} rival{{ game.rivals.length !== 1 ? 's' : '' }} · {{ game.totalLeaderboards }} leaderboards
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
              class="rival-item"
            >
              <div
                class="rival-header"
                @click="toggleRival(game.gameId, rival.username)"
              >
                <div class="rival-info">
                  <span class="rival-username">{{ rival.username }}</span>
                  <span
                    class="rival-status"
                    :class="getRivalryLabel(rival.wins.length, rival.losses.length)"
                  >
                    {{ rival.wins.length }}W - {{ rival.losses.length }}L
                  </span>
                </div>
                <i
                  class="fa"
                  :class="isRivalExpanded(game.gameId, rival.username) ? 'fa-minus' : 'fa-plus'"
                />
              </div>

              <div
                v-if="isRivalExpanded(game.gameId, rival.username)"
                class="rival-battles"
              >
                <div v-if="rival.losses.length > 0" class="battle-section">
                  <h4 class="section-title losing">They are beating you</h4>
                  <div
                    v-for="battle in rival.losses"
                    :key="battle.leaderboardId"
                    class="battle-item"
                    @click="navigateToBattle(game, battle)"
                  >
                    <span class="battle-name">{{ battle.leaderboardTitle }}</span>
                    <div class="battle-stats">
                      <div class="stat left">
                        <span class="stat-rank">#{{ battle.myRank }}</span>
                        <span class="stat-value">{{ battle.myScore }}</span>
                      </div>
                      <div class="stat-divider">vs</div>
                      <div class="stat right">
                        <span class="stat-value winner">{{ battle.friendScore }}</span>
                        <span class="stat-rank winner">#{{ battle.friendRank }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="rival.wins.length > 0" class="battle-section">
                  <h4 class="section-title winning">You are winning</h4>
                  <div
                    v-for="battle in rival.wins"
                    :key="battle.leaderboardId"
                    class="battle-item"
                    @click="navigateToBattle(game, battle)"
                  >
                    <span class="battle-name">{{ battle.leaderboardTitle }}</span>
                    <div class="battle-stats">
                      <div class="stat left">
                        <span class="stat-rank winner">#{{ battle.myRank }}</span>
                        <span class="stat-value winner">{{ battle.myScore }}</span>
                      </div>
                      <div class="stat-divider">vs</div>
                      <div class="stat right">
                        <span class="stat-value">{{ battle.friendScore }}</span>
                        <span class="stat-rank">#{{ battle.friendRank }}</span>
                      </div>
                    </div>
                  </div>
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
      No active rivalries found with your friends.
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

.rival-item {
  padding: 4px 0;
}

.rival-item + .rival-item {
  border-top: 1px solid rgba(148, 163, 184, 0.04);
}

.rival-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 10px 0;
  transition: opacity 0.2s ease;
}

.rival-header:active {
  opacity: 0.7;
}

.rival-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rival-username {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

.rival-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.02em;
}

.rival-status.winning {
  background-color: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

.rival-status.losing {
  background-color: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.rival-header .fa {
  font-size: 10px;
  color: #64748b;
}

.rival-battles {
  padding: 4px 0 10px 0;
}

.battle-section {
  margin-bottom: 12px;
}

.battle-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  padding-left: 2px;
  opacity: 0.8;
}

.section-title.winning {
  color: #4ade80;
}

.section-title.losing {
  color: #f87171;
}

.battle-item {
  background-color: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.battle-item:hover {
  background-color: rgba(30, 41, 59, 0.6);
  border-color: rgba(203, 163, 78, 0.3);
}

.battle-name {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.battle-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.stat.left {
  flex: 1;
}

.stat.right {
  flex: 1;
  justify-content: flex-end;
}

.stat-rank {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
  min-width: 24px;
}

.stat-rank.winner {
  color: #cba34e;
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.stat-value.winner {
  color: #e2e8f0;
}

.stat-divider {
  font-size: 9px;
  font-weight: 800;
  color: #334155;
  text-transform: uppercase;
}

.view-game-button {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 11px;
  background-color: rgba(203, 163, 78, 0.1);
  border: 1px solid rgba(203, 163, 78, 0.2);
  border-radius: 10px;
  color: #cba34e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-game-button:hover {
  background-color: rgba(203, 163, 78, 0.15);
  border-color: rgba(203, 163, 78, 0.3);
}

.loading-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: rgba(203, 163, 78, 0.06);
  border: 1px solid rgba(203, 163, 78, 0.1);
  border-radius: 12px;
}

.loading-spinner {
  color: #cba34e;
  font-size: 13px;
}

.loading-text {
  font-size: 13px;
  color: #cba34e;
}

.info-hint {
  text-align: center;
  font-size: 11px;
  color: #64748b;
  margin: 0 0 16px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  line-height: 1.5;
}

.empty-text {
  text-align: center;
  padding: 60px 24px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.8;
}
</style>
