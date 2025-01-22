import { defineStore } from "pinia";
import { LeaderboardEntries } from "../models/LeaderboardEntries.ts";

interface GamesState {
  leaderboardEntries: Map<number, LeaderboardEntries> | null;
}

export const useGamesStore = defineStore("games", {
  state: (): GamesState => ({
    leaderboardEntries: null,
  }),
  actions: {
    setLeaderboardEntries(leaderboardId: number, list: LeaderboardEntries) {
      if (this.leaderboardEntries === null) {
        this.leaderboardEntries = new Map();
      }

      this.leaderboardEntries.set(leaderboardId, list);
    },
    hasLeaderboardEntries(leaderboardId: number): boolean {
      if (this.leaderboardEntries === null) {
        this.leaderboardEntries = new Map();
      }

      return this.leaderboardEntries.has(leaderboardId);
    },
    getLeaderboardEntries(leaderboardId: number) {
      if (this.leaderboardEntries === null) {
        this.leaderboardEntries = new Map();
      }

      return this.leaderboardEntries.get(
        leaderboardId,
      ) as LeaderboardEntries | null;
    },
  },
});
