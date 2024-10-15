import { defineConfig } from "vite"
import path from "path"

export default defineConfig({
  plugins: [],
  resolve: {
    alias: [
      {
        find: "~",
        replacement: path.resolve(__dirname, "./src")
      }
    ]
  },
  server: {
    port: 3000
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "GraphDrawer",
      fileName: (format) => `GraphDrawer.${format}.js`,
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  }
})
