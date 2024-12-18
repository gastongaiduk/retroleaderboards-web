import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/retroleaderboards',
    defaultCommandTimeout: 10000,
  },
});
