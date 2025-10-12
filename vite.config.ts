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
          // Reactライブラリを分離
          react: ["react", "react-dom"],
          // Chakra UIを分離
          chakra: ["@chakra-ui/react", "@emotion/react"],
          // TanStack関連を分離
          tanstack: ["@tanstack/react-query", "@tanstack/react-router"],
        },
        // フォントファイルを別ディレクトリに出力
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.names?.[0] || '';
          if (fileName.endsWith('.woff2') || fileName.endsWith('.woff')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    chunkSizeWarningLimit: 600, // より厳密な閾値
  },
});
