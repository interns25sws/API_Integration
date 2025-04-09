import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Allow access from external devices
    port: 5173, // Ensure this matches your Vite port
    strictPort: true,
    allowedHosts: [
     "8242-103-251-217-109.ngrok-free.app" // Replace with your Ngrok URL
    ]
  }
});
