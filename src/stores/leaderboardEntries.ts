import { defineStore } from "pinia";
import { Entry } from "../models/LeaderboardEntries.ts";

interface LeaderboardEntriesState {
  entries: Entry[];
  scrollPosition: number;
  hasMoreToLoad: boolean;
  offset: number;
  leaderboardId: string | null;
  totalEntries: number;
}

export const useLeaderboardEntries = defineStore("leaderboardEntries", {
  state: (): LeaderboardEntriesState => ({
    entries: [],
    scrollPosition: 0,
    hasMoreToLoad: true,
    offset: 0,
    leaderboardId: null,
    totalEntries: 0,
  }),
  actions: {
    setTotalEntries(total: number) {
      this.totalEntries = total;
    },
    addItems(newEntries: Entry[]) {
      this.entries.push(...newEntries);
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
      this.offset = this.entries.length;
    },
    increaseOffsetIn(value: number) {
      this.offset = this.offset + value;
    },
    resetOffset() {
      this.offset = 0;
    },
    setLeaderboardId(id: string) {
      this.leaderboardId = id;
    },
    reset() {
      this.entries = [];
      this.scrollPosition = 0;
      this.hasMoreToLoad = true;
      this.offset = 0;
      this.leaderboardId = null;
    },
  },
});
