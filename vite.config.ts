
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
     viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." },
        { src: "background.js", dest: "." },
        { src: "popup.html", dest: "." },
        { src: "popup.js", dest: "." },
        { src: "popup.css", dest: "." },
        { src: "settings.html", dest: "." },
        { src: "settings.js", dest: "." },
        { src: "settings.css", dest: "." },
        { src: "icons/**/*", dest: "icons" },  // This will copy everything inside "icons/"
      ],
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add support for importing .tf files as raw text
  assetsInclude: ['**/*.tf'],
}));
