import { defineStore } from "pinia";
import { Game } from "../models/RecentlyPlayedGames.ts";

interface GamesState {
  games: Game[];
  scrollPosition: number;
  hasMoreToLoad: boolean;
  offset: number;
  shouldScrollToTop: boolean;
}

export const useRecentGamesStore = defineStore("recentGames", {
  state: (): GamesState => ({
    games: [],
    scrollPosition: 0,
    hasMoreToLoad: true,
    offset: 0,
    shouldScrollToTop: false,
  }),
  actions: {
    addItems(newGames: Game[]) {
      this.games.push(...newGames);
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
      this.offset = this.games.length;
    },
    increaseOffsetIn(value: number) {
      this.offset = this.offset + value;
    },
    resetOffset() {
      this.offset = 0;
    },
    useScrollToTop() {
      this.shouldScrollToTop = true;
    },
    consumeScrollToTop() {
      this.shouldScrollToTop = false;
    },
  },
});
