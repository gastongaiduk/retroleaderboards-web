import { defineStore } from "pinia";
import { Entry } from "../models/LeaderboardEntries.ts";

interface LeaderboardEntriesState {
  entries: Entry[];
  scrollPosition: number;
  hasMoreToLoad: boolean;
  offset: number;
}

export const useLeaderboardEntries = defineStore("leaderboardEntries", {
  state: (): LeaderboardEntriesState => ({
    entries: [],
    scrollPosition: 0,
    hasMoreToLoad: true,
    offset: 0,
  }),
  actions: {
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
  },
});
