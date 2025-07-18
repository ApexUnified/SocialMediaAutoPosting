// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   css: {
//     postcss: "./postcss.config.js",
//   },
//   server: {
//     port: 3000,
//     host: "192.168.18.18",
//     proxy: {
//       "/api": {
//         target: "http://72.255.1.100:5000",
//         changeOrigin: true,
//       },
//     },
//   },
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
   
  },
});
