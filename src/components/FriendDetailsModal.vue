<script setup lang="ts">
import { UserSummary } from "../models/UserSummary";
import { GameList } from "../models/RecentlyPlayedGames";

const props = defineProps<{
    isVisible: boolean;
    loading: boolean;
    summary: UserSummary | null;
    recentGames: GameList | null;
}>();

const emit = defineEmits(["close"]);

const apiUrl = import.meta.env.VITE_API_URL;

function close() {
    emit("close");
}

function getFullImageUrl(path: string) {
    if (!path) return "";
    return apiUrl + '/' + path.replace(/\\/g, '/');
}
</script>

<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="close">
        <div class="modal-content">
            <button class="close-button" @click="close">
                <i class="fa fa-times"></i>
            </button>

            <div v-if="loading" class="loading-state">
                <i class="fa fa-refresh fa-spin"></i>
                <p>Fetching user details...</p>
            </div>

            <div v-else-if="summary" class="user-details">
                <div class="user-header">
                    <img :src="'https://retroachievements.org' + summary.UserPic" class="user-avatar" />
                    <div class="user-main-info">
                        <h2 class="user-name">{{ summary.User }}</h2>
                        <div class="user-status" :class="summary.Status.toLowerCase()">
                            <span class="status-dot"></span>
                            {{ summary.Status }}
                        </div>
                    </div>
                </div>

                <div v-if="summary.RichPresenceMsg" class="rich-presence">
                    <div class="rp-label">Currently:</div>
                    <p class="rp-message">{{ summary.RichPresenceMsg }}</p>
                </div>

                <div class="stats-grid">
                    <div class="stat-box">
                        <span class="stat-label">Rank</span>
                        <span class="stat-value">#{{ summary.Rank }}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Points</span>
                        <span class="stat-value">{{ summary.TotalPoints }}</span>
                    </div>
                </div>

                <div v-if="recentGames && recentGames.length" class="recent-games">
                    <h3 class="section-title">Last 5 Games</h3>
                    <div class="games-list">
                        <div v-for="game in recentGames" :key="game.GameID" class="game-item">
                            <img :src="getFullImageUrl(game.ImageIcon)" class="game-icon" />
                            <div class="game-info">
                                <span class="game-title">{{ game.Title }}</span>
                                <span class="game-console">{{ game.ConsoleName }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="error-state">
                <p>Could not load user details.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(2, 6, 23, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
}

.modal-content {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 24px;
    border-radius: 16px;
    border: 1px solid rgba(203, 163, 78, 0.15);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    position: relative;
    max-width: 400px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

.close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(148, 163, 184, 0.1);
    border: none;
    color: #94a3b8;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.close-button:hover {
    background: rgba(148, 163, 184, 0.2);
    color: #e2e8f0;
}

.loading-state, .error-state {
    padding: 40px 0;
    text-align: center;
    color: #64748b;
}

.loading-state i {
    font-size: 24px;
    color: #cba34e;
    margin-bottom: 12px;
}

.user-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.user-avatar {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    border: 2px solid rgba(203, 163, 78, 0.2);
}

.user-name {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #e2e8f0;
}

.user-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #64748b;
}

.online .status-dot {
    background-color: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.online { color: #22c55e; }

.rich-presence {
    background-color: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.06);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 20px;
}

.rp-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-bottom: 4px;
}

.rp-message {
    font-size: 13px;
    line-height: 1.5;
    color: #cba34e;
    margin: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
}

.stat-box {
    background-color: rgba(30, 41, 59, 0.4);
    padding: 12px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-label {
    font-size: 11px;
    color: #64748b;
    margin-bottom: 2px;
}

.stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #e2e8f0;
}

.section-title {
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
    margin: 0 0 12px;
}

.games-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.game-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    background-color: rgba(30, 41, 59, 0.3);
    border-radius: 8px;
}

.game-icon {
    width: 32px;
    height: 32px;
    border-radius: 4px;
}

.game-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.game-title {
    font-size: 12px;
    font-weight: 500;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.game-console {
    font-size: 10px;
    color: #64748b;
}
</style>
