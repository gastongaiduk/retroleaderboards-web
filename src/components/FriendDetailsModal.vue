<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { UserSummary } from "../models/UserSummary";
import { GameList, Game } from "../models/RecentlyPlayedGames";
import { UserGameLeaderboard } from "../models/UserGameLeaderboards";
import { usePostStore } from "../stores/postStore";
import { Leaderboard } from "../models/GameLeaderboards";
import GameRepository from "../repositories/GameRepository";

const props = defineProps<{
    isVisible: boolean;
    loading: boolean;
    summary: UserSummary | null;
}>();

const emit = defineEmits(["close"]);

const postStore = usePostStore();
const gameRepo = new GameRepository();
const apiUrl = import.meta.env.VITE_API_URL;

const games = ref<GameList>([]);
const offset = ref(0);
const pageSize = 5;
const hasMore = ref(true);
const loadingMore = ref(false);

const expandedGameId = ref<number | null>(null);
const leaderboardsCache = ref<Record<number, UserGameLeaderboard[]>>({});
const loadingLeaderboards = ref<number | null>(null);

const isOnline = computed(() => {
    if (!props.summary) return false;
    
    const status = props.summary.Status.toLowerCase();
    // Trust explicit active statuses from API
    if (status === 'online' || status === 'in-game') return true;

    // Check if Rich Presence was updated in the last 10 minutes
    if (props.summary.RichPresenceMsg && props.summary.RichPresenceMsgDate) {
        const lastUpdate = new Date(props.summary.RichPresenceMsgDate + " UTC").getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - lastUpdate) / (1000 * 60);
        
        if (diffMinutes >= 0 && diffMinutes <= 10) return true;
    }

    return false;
});

const displayStatus = computed(() => {
    if (!props.summary) return '';
    
    // If Rich Presence is fresh, show as 'Playing'
    if (props.summary.RichPresenceMsg && props.summary.RichPresenceMsgDate) {
        const lastUpdate = new Date(props.summary.RichPresenceMsgDate + " UTC").getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - lastUpdate) / (1000 * 60);
        
        if (diffMinutes >= 0 && diffMinutes <= 10) return 'Playing';
    }
    
    const status = props.summary.Status;
    if (status.toLowerCase() === 'in-game') return 'Playing';
    return status;
});

watch([() => props.isVisible, () => props.summary], async ([visible, summary]) => {
    if (visible && summary && games.value.length === 0) {
        await fetchGames();
    } else if (!visible) {
        resetGames();
    }
});

function resetGames() {
    games.value = [];
    offset.value = 0;
    hasMore.value = true;
    expandedGameId.value = null;
    leaderboardsCache.value = {};
}

async function fetchGames() {
    if (!props.summary || loadingMore.value) return;

    loadingMore.value = true;
    try {
        const result = await gameRepo.fetchLastPlayedGames(pageSize, offset.value, props.summary.User);
        if (result.length < pageSize) {
            hasMore.value = false;
        }
        games.value.push(...result);
        offset.value += pageSize;
    } catch (error) {
        console.error("Error fetching games:", error);
    } finally {
        loadingMore.value = false;
    }
}

async function toggleGame(game: Game) {
    if (expandedGameId.value === game.GameID) {
        expandedGameId.value = null;
        return;
    }

    expandedGameId.value = game.GameID;

    if (!leaderboardsCache.value[game.GameID]) {
        loadingLeaderboards.value = game.GameID;
        try {
            const response = await gameRepo.fetchUserGameLeaderboards(game.GameID, props.summary!.User);
            // Filter only results that have a user entry (friend's score)
            leaderboardsCache.value[game.GameID] = response.Results.filter(lb => lb.UserEntry !== null);
        } catch (error) {
            console.error("Error fetching leaderboards:", error);
        } finally {
            loadingLeaderboards.value = null;
        }
    }
}

function navigateToLeaderboard(game: Game, lb: UserGameLeaderboard) {
    // Construct a Leaderboard model from UserGameLeaderboard
    const leaderboardModel: Leaderboard = {
        ID: lb.ID,
        Title: lb.Title,
        Description: lb.Description,
        Format: lb.Format,
        RankAsc: lb.RankAsc,
        TopEntry: null // We don't have this info here, but the entries page will fetch its own data
    };
    
    postStore.selectGameLeaderboards(game, false);
    postStore.selectLeaderboard(leaderboardModel);
    close();
}

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
                        <div class="user-status" :class="{ online: isOnline }">
                            <span class="status-dot"></span>
                            {{ displayStatus }}
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

                <div class="recent-games">
                    <h3 class="section-title">Recently Played</h3>
                    <div class="games-list">
                        <div v-for="game in games" :key="game.GameID" class="game-container">
                            <div class="game-item" @click="toggleGame(game)" :class="{ active: expandedGameId === game.GameID }">
                                <img :src="getFullImageUrl(game.ImageIcon)" class="game-icon" />
                                <div class="game-info">
                                    <span class="game-title">{{ game.Title }}</span>
                                    <span class="game-console">{{ game.ConsoleName }}</span>
                                </div>
                                <i class="fa" :class="expandedGameId === game.GameID ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                            </div>

                            <div v-if="expandedGameId === game.GameID" class="leaderboards-section">
                                <div v-if="loadingLeaderboards === game.GameID" class="lb-loading">
                                    <i class="fa fa-refresh fa-spin"></i> Loading scores...
                                </div>
                                <div v-else-if="leaderboardsCache[game.GameID]?.length" class="lb-list">
                                    <div v-for="lb in leaderboardsCache[game.GameID]" :key="lb.ID" class="lb-item" @click="navigateToLeaderboard(game, lb)">
                                        <div class="lb-info">
                                            <span class="lb-title">{{ lb.Title }}</span>
                                            <span class="lb-rank">Rank: #{{ lb.UserEntry?.Rank }}</span>
                                        </div>
                                        <div class="lb-score">{{ lb.UserEntry?.FormattedScore }}</div>
                                    </div>
                                </div>
                                <div v-else class="lb-empty">
                                    No leaderboard entries found for this friend.
                                </div>
                            </div>
                        </div>

                        <button v-if="hasMore" class="load-more-button" @click="fetchGames" :disabled="loadingMore">
                            <span v-if="loadingMore"><i class="fa fa-refresh fa-spin"></i> Loading...</span>
                            <span v-else>Load More</span>
                        </button>
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

.user-status.online .status-dot {
    background-color: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.user-status.online { color: #22c55e; }

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

.game-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.game-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: rgba(30, 41, 59, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.game-item:hover {
    background-color: rgba(30, 41, 59, 0.5);
    border-color: rgba(203, 163, 78, 0.1);
}

.game-item.active {
    background-color: rgba(30, 41, 59, 0.6);
    border-color: rgba(203, 163, 78, 0.2);
}

.game-icon {
    width: 36px;
    height: 36px;
    border-radius: 6px;
}

.game-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}

.game-title {
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.game-console {
    font-size: 11px;
    color: #64748b;
}

.fa-chevron-up, .fa-chevron-down {
    font-size: 12px;
    color: #475569;
}

.leaderboards-section {
    background-color: rgba(15, 23, 42, 0.3);
    border-radius: 0 0 8px 8px;
    padding: 8px 12px 12px;
    margin-top: -4px;
    border: 1px solid rgba(203, 163, 78, 0.1);
    border-top: none;
}

.lb-loading, .lb-empty {
    padding: 12px;
    text-align: center;
    font-size: 12px;
    color: #64748b;
}

.lb-loading i {
    color: #cba34e;
    margin-right: 6px;
}

.lb-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.lb-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background-color: rgba(30, 41, 59, 0.4);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.lb-item:hover {
    background-color: rgba(30, 41, 59, 0.8);
    transform: translateX(4px);
    border-color: rgba(203, 163, 78, 0.3);
}

.lb-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.lb-title {
    font-size: 11px;
    font-weight: 600;
    color: #cba34e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.lb-rank {
    font-size: 10px;
    color: #94a3b8;
}

.lb-score {
    font-size: 12px;
    font-weight: 700;
    color: #e2e8f0;
    margin-left: 12px;
}

.load-more-button {
    margin-top: 8px;
    padding: 10px;
    background-color: transparent;
    border: 1px dashed rgba(148, 163, 184, 0.2);
    color: #94a3b8;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.load-more-button:hover:not(:disabled) {
    background-color: rgba(148, 163, 184, 0.05);
    border-color: rgba(148, 163, 184, 0.4);
    color: #e2e8f0;
}

.load-more-button:disabled {
    opacity: 0.5;
    cursor: wait;
}
</style>
