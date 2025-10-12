import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
  },
  define: {
    "import.meta.env.TEST": JSON.stringify(process.env.NODE_ENV === "test"),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // フォントを別チャンクに分離
          fonts: ["@fontsource/noto-sans-jp"],
          // Reactライブラリを分離
          react: ["react", "react-dom"],
          // Chakra UIを分離
          chakra: ["@chakra-ui/react", "@emotion/react"],
          // TanStack関連を分離
          tanstack: ["@tanstack/react-query", "@tanstack/react-router"],
        },
      },
    },
  },
});
