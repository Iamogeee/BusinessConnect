import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        "/Users/ogenna/Desktop/BusinessConnect",
        "/Users/ogenna/Desktop/BusinessConnect/node_modules/@fortawesome/fontawesome-free/webfonts",
      ],
    },
  },
});
