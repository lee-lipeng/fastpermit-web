import { createApp } from "vue";
import ElementPlus from "element-plus"; // 引入 Element Plus
import "element-plus/dist/index.css"; // 引入 Element Plus 样式
import * as ElementPlusIconsVue from "@element-plus/icons-vue"; // 引入图标
// import './style.css'; // 不再需要这个
import App from "./App.vue";
import "@/styles/index.scss"; // 引入全局样式入口文件
import router from "@/router"; // 导入 router 实例
import pinia from "@/store"; // 导入 Pinia 实例
import "./router/permission"; // 导入路由守卫逻辑

const app = createApp(App);

// 全局注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus); // 使用 Element Plus 插件
app.use(router); // 注册 router
app.use(pinia); // 注册 Pinia
app.mount("#app");
