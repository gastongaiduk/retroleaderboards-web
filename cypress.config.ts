import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173/retroleaderboards',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
