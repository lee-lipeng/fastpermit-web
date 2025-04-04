import {fileURLToPath, URL} from "node:url";

import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)), // 设置 '@' 指向 'src' 目录
        },
    },
    server: {
        proxy: {
            // 代理 /api/v1 请求到后端服务
            "/api/v1": {
                target: "http://localhost:8000", // 后端 FastAPI 服务地址
                changeOrigin: true, // 需要虚拟主机站点
                // 注意：如果后端 API 没有 /api/v1 前缀，可能需要 rewrite
                // rewrite: (path) => path.replace(/^\/api\/v1/, '')
            },
        },
    },
});
