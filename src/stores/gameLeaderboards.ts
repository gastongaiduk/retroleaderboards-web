import { defineStore } from "pinia";
import { Leaderboard } from "../models/GameLeaderboards.ts";

interface GameLeaderboardsState {
  leaderboards: Leaderboard[];
  scrollPosition: number;
  hasMoreToLoad: boolean;
  offset: number;
}

export const useGameLeaderboardsStore = defineStore("gameLeaderboards", {
  state: (): GameLeaderboardsState => ({
    leaderboards: [],
    scrollPosition: 0,
    hasMoreToLoad: true,
    offset: 0,
  }),
  actions: {
    addItems(newLeaderboards: Leaderboard[]) {
      this.leaderboards.push(...newLeaderboards);
    },
    setScrollPosition(position: number) {
      this.scrollPosition = position;
    },
    resetScrollPosition() {
      this.scrollPosition = 0;
    },
    setHasMoreToLoad(value: boolean) {
      this.hasMoreToLoad = value;
    },
    restoreOffset() {
      this.offset = this.leaderboards.length;
    },
    increaseOffsetIn(value: number) {
      this.offset = this.offset + value;
    },
    resetOffset() {
      this.offset = 0;
    },
  },
});
