import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    
    env: {
      baseUrl: "http://localhost:5173",
      serverUrl: "http://127.0.0.1:8090",
      viewportWidth: 1920,   // Set the width to 1200px
      viewportHeight: 1080,   // Set the height to 800px
    },
    chromeWebSecurity: false,
  },
});
