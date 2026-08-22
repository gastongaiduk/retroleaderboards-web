<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useFriendsState } from "../stores/friends";
import { useRivalsStore } from "../stores/rivals";
import UserRepository from "../repositories/UserRepository";

import FriendDetailsModal from "../components/FriendDetailsModal.vue";
import { UserSummary } from "../models/UserSummary";
import { captureEvent } from "../utils/posthog";

const router = useRouter();
const user = useUserStore();
const friendsStore = useFriendsState();
const rivalsStore = useRivalsStore();
const userRepo = new UserRepository();

const isModalVisible = ref(false);
const isModalLoading = ref(false);
const selectedUserSummary = ref<UserSummary | null>(null);

interface RankingMember {
  username: string;
  wins: number;
  isMe: boolean;
}

const globalRanking = computed(() => {
  if (!rivalsStore.rivalryGames.length) return [];

  const rankingMap = new Map<string, number>();
  let myTotalWins = 0;

  rivalsStore.rivalryGames.forEach((game) => {
    game.rivals.forEach((rival) => {
      // My wins against this rival
      myTotalWins += rival.wins.length;

      // This rival's wins against me
      const currentFriendWins = rankingMap.get(rival.username) || 0;
      rankingMap.set(rival.username, currentFriendWins + rival.losses.length);
    });
  });

  const members: RankingMember[] = [];

  // Add me
  members.push({
    username: user.username || "Me",
    wins: myTotalWins,
    isMe: true,
  });

  // Add friends
  rankingMap.forEach((wins, username) => {
    members.push({
      username,
      wins,
      isMe: false,
    });
  });

  return members.sort((a, b) => b.wins - a.wins);
});

const friendsList = computed(() => {
  return friendsStore.friends?.Results || [];
});

onMounted(async () => {
  if (!user.isLoggedIn()) {
    await router.push("/login");
    return;
  }

  if (!user.isSet()) {
    await router.push("/ra-credentials");
    return;
  }

  await friendsStore.load();
  if (!rivalsStore.hasCache()) {
    await rivalsStore.loadRivalries();
  }
});

function getAvatarUrl(username: string) {
  return `https://retroachievements.org/UserPic/${username}.png`;
}

async function openFriendDetails(username: string) {
  captureEvent("friend_details_opened");
  isModalVisible.value = true;
  isModalLoading.value = true;
  selectedUserSummary.value = null;

  try {
    const summary = await userRepo.fetchUserSummary(username);
    selectedUserSummary.value = summary;
  } catch (error) {
    console.error("Error loading friend details:", error);
  } finally {
    isModalLoading.value = false;
  }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1 class="page-title">Friends</h1>
    </header>

    <section v-if="globalRanking.length" class="ranking-section">
      <h2 class="section-subtitle">Global Rivalry Ranking</h2>
      <p class="ranking-info">
        Total leaderboards where you are ahead of each other.
      </p>

      <div class="ranking-podium" v-if="globalRanking.length >= 1">
        <!-- Second Place -->
        <div
          v-if="globalRanking[1]"
          class="podium-item second"
          @click="openFriendDetails(globalRanking[1].username)"
        >
          <div class="avatar-container">
            <img
              :src="getAvatarUrl(globalRanking[1].username)"
              class="podium-avatar"
            />
            <div class="rank-badge">2</div>
          </div>
          <span class="member-name">{{ globalRanking[1].username }}</span>
          <span class="member-wins">{{ globalRanking[1].wins }} wins</span>
        </div>

        <!-- First Place -->
        <div
          v-if="globalRanking[0]"
          class="podium-item first"
          @click="openFriendDetails(globalRanking[0].username)"
        >
          <div class="avatar-container">
            <div class="crown"><i class="fa fa-trophy"></i></div>
            <img
              :src="getAvatarUrl(globalRanking[0].username)"
              class="podium-avatar"
            />
            <div class="rank-badge">1</div>
          </div>
          <span class="member-name">{{ globalRanking[0].username }}</span>
          <span class="member-wins">{{ globalRanking[0].wins }} wins</span>
        </div>

        <!-- Third Place -->
        <div
          v-if="globalRanking[2]"
          class="podium-item third"
          @click="openFriendDetails(globalRanking[2].username)"
        >
          <div class="avatar-container">
            <img
              :src="getAvatarUrl(globalRanking[2].username)"
              class="podium-avatar"
            />
            <div class="rank-badge">3</div>
          </div>
          <span class="member-name">{{ globalRanking[2].username }}</span>
          <span class="member-wins">{{ globalRanking[2].wins }} wins</span>
        </div>
      </div>

      <div v-if="globalRanking.length > 3" class="ranking-list">
        <div
          v-for="(member, index) in globalRanking.slice(3)"
          :key="member.username"
          class="ranking-item"
          :class="{ 'is-me': member.isMe }"
          @click="openFriendDetails(member.username)"
        >
          <span class="rank-number">#{{ index + 4 }}</span>
          <img :src="getAvatarUrl(member.username)" class="item-avatar" />
          <span class="item-name">{{ member.username }}</span>
          <span class="item-wins">{{ member.wins }} wins</span>
        </div>
      </div>
    </section>

    <section class="list-section">
      <h2 class="section-subtitle">All Friends</h2>
      <div v-if="friendsList.length" class="friends-grid">
        <div
          v-for="friend in friendsList"
          :key="friend.User"
          class="friend-card"
          @click="openFriendDetails(friend.User)"
        >
          <img :src="getAvatarUrl(friend.User)" class="friend-avatar" />
          <div class="friend-info">
            <span class="friend-name">{{ friend.User }}</span>
            <span class="friend-points">{{ friend.Points }} pts</span>
          </div>
        </div>
      </div>
      <div v-else-if="friendsStore.friends === null" class="loading-state">
        <i class="fa fa-refresh fa-spin"></i> Loading friends...
      </div>
      <div v-else class="empty-state">
        You are not following anyone on RetroAchievements.
      </div>
    </section>

    <FriendDetailsModal
      :is-visible="isModalVisible"
      :loading="isModalLoading"
      :summary="selectedUserSummary"
      @close="isModalVisible = false"
    />
  </div>
</template>

<style scoped>
.page-container {
  background-color: var(--bg-body);
  color: var(--text-primary);
  padding: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--accent-primary);
  text-align: center;
  margin: 0;
  letter-spacing: -0.01em;
}

.section-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
  text-align: center;
}

.ranking-info {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 20px;
}

.ranking-section {
  margin-bottom: 32px;
}

/* Podium Styles */
.ranking-podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-top: 20px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 100px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-container {
  position: relative;
  margin-bottom: 8px;
}

.podium-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--bg-surface);
  background-color: var(--bg-surface);
  object-fit: cover;
}

.first .podium-avatar {
  width: 80px;
  height: 80px;
  border-color: var(--accent-gold);
  box-shadow: 0 0 20px rgba(203, 163, 78, 0.2);
}

.second .podium-avatar {
  border-color: var(--text-secondary);
}

.third .podium-avatar {
  border-color: var(--accent-gold);
}

.rank-badge {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-surface);
  color: var(--text-primary);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid var(--border-default);
}

.first .rank-badge {
  background-color: var(--accent-gold);
  color: var(--bg-body);
}
.second .rank-badge {
  background-color: var(--text-secondary);
  color: var(--bg-body);
}
.third .rank-badge {
  background-color: var(--accent-gold);
  color: #ffffff;
}

.crown {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%) rotate(-10deg);
  color: var(--accent-gold);
  font-size: 18px;
  z-index: 1;
}

.member-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-wins {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Ranking List */
.ranking-list {
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-default);
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-default);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.ranking-item:active {
  background-color: var(--bg-surface-active);
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-item.is-me {
  background-color: rgba(203, 163, 78, 0.05);
}

.rank-number {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-muted);
  width: 32px;
}

.item-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  margin-right: 12px;
  background-color: var(--bg-surface);
}

.item-name {
  flex: 1;
  font-size: var(--text-base);
  font-weight: 500;
}

.item-wins {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--accent-gold);
}

/* Friends Grid */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.friend-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.friend-card:active {
  background-color: var(--bg-surface-active);
}

.friend-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background-color: var(--bg-surface);
}

.friend-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.friend-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-points {
  font-size: 10px;
  color: var(--text-muted);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  font-size: 13px;
  color: var(--text-muted);
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
  .ranking-podium {
    gap: var(--space-6);
    padding-top: var(--space-8);
  }

  .podium-avatar {
    width: 80px;
    height: 80px;
  }
  .first .podium-avatar {
    width: 110px;
    height: 110px;
  }
  .friends-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-3);
  }
  .friend-card {
    padding: var(--space-5);
  }
  .friend-avatar {
    width: 52px;
    height: 52px;
  }
  .friend-name {
    font-size: var(--text-base);
  }
}

@media (min-width: 1280px) {
  .friends-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  .podium-avatar {
    width: 96px;
    height: 96px;
  }
  .first .podium-avatar {
    width: 128px;
    height: 128px;
  }
  .friend-card {
    padding: var(--space-6);
  }
}
</style>
