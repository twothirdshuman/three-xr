import { defineConfig } from "vite";

export default defineConfig({
    server: {
        proxy: {
            "/ws": {
                target: "http://localhost:8000/",
                ws: true
            }
        }
    }
});