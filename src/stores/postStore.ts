import { defineStore } from "pinia";
import { Router } from "vue-router";
import { Game } from "../models/RecentlyPlayedGames.ts";
import { Leaderboard } from "../models/GameLeaderboards.ts";

interface PostState {
  selectedGameLeaderboards: Game | null;
  selectedLeaderboard: Leaderboard | null;
}

export const usePostStore = defineStore("post", {
  state: (): PostState => ({
    selectedGameLeaderboards: null,
    selectedLeaderboard: null,
  }),
  actions: {
    selectGameLeaderboards(game: Game, navigate = true): void {
      this.selectedGameLeaderboards = game;
      localStorage.setItem("selectedGameLeaderboards", JSON.stringify(game));
      if (navigate) {
        this.router.push({
          name: "GameLeaderboards",
          params: { id: game.GameID },
        });
      }
    },
    getSelectedGameLeaderboards() {
      if (this.selectedGameLeaderboards === null) {
        this.selectedGameLeaderboards = JSON.parse(
          <string>localStorage.getItem("selectedGameLeaderboards"),
        ) as Game;
      }
      return this.selectedGameLeaderboards;
    },
    selectLeaderboard(leaderboard: Leaderboard): void {
      this.selectedLeaderboard = leaderboard;
      localStorage.setItem("selectedLeaderboard", JSON.stringify(leaderboard));
      this.router.push({ name: "Leaderboard", params: { id: leaderboard.ID } });
    },
    getSelectedLeaderboard() {
      if (this.selectedLeaderboard === null) {
        this.selectedLeaderboard = JSON.parse(
          <string>localStorage.getItem("selectedLeaderboard"),
        ) as Leaderboard;
      }
      return this.selectedLeaderboard;
    },
  },
});

declare module "pinia" {
  export interface PiniaCustomProperties {
    router: Router;
  }
}
