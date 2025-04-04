import axios from "axios";
import {ElMessage} from "element-plus"; // 用于显示错误提示
import {useUserStore} from "@/store/modules/user"; // 引入 user store
// import { useUserStore } from '@/store/modules/user' // 可选：用于获取 token 或处理 401 等

// 创建 Axios 实例
const service = axios.create({
    baseURL: "/api/v1", // Vite 代理已配置，这里直接写 API 前缀
    timeout: 10000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 在发送请求之前携带 Token
        const userStore = useUserStore(); // 在拦截器内部获取 store
        if (userStore.token && config.headers) {
            // 确保 headers 存在
            config.headers["Authorization"] = `Bearer ${userStore.token}`;
        }
        return config;
    },
    (error) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        // 直接使用 HTTP 状态码判断
        if (response.status === 200) {
            // 状态码 200，返回整个响应数据
            return response.data;
        } else {
            // 其他状态码视为错误
            const message =
                response.data?.message || `请求失败(${response.status})`;
            ElMessage({
                message: message,
                type: "error",
                duration: 5 * 1000,
            });
            return Promise.reject(new Error(message));
        }
    },
    (error) => {
        console.error("Response Error:", error);
        let message = error.message;

        // 优先使用后端返回的 message
        if (error.response?.data?.message) {
            message = error.response.data.message;
        }
        // 根据 HTTP 状态码设置错误信息
        else if (error.response?.status) {
            switch (error.response.status) {
                case 400:
                    message = "请求错误(400)";
                    break;
                case 401:
                    message = "认证失败(401)";
                    // 可选：处理 401 强制登出
                    // const userStore = useUserStore();
                    // userStore.logout().then(() => location.reload());
                    break;
                case 403:
                    message = "拒绝访问(403)";
                    break;
                case 404:
                    message = "请求未找到(404)";
                    break;
                case 500:
                    message = "服务器错误(500)";
                    break;
                default:
                    message = `连接出错(${error.response.status})!`;
            }
        } else if (message.includes("timeout")) {
            message = "服务器响应超时，请刷新当前页";
        }

        ElMessage({
            message: message,
            type: "error",
            duration: 5 * 1000,
        });
        return Promise.reject(error);
    }
);

export default service;
