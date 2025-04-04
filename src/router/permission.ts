import router from "./index";
import { useUserStore } from "@/store/modules/user";
import { ElMessage } from "element-plus";
import NProgress from "nprogress"; // 引入 nprogress 进度条插件
import "nprogress/nprogress.css"; // 引入 nprogress 样式

NProgress.configure({ showSpinner: false }); // NProgress 配置：不显示右上角旋转图标

const whiteList = ["/login"]; // 无需重定向的白名单

router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start();

  // 获取 user store
  // 注意：Pinia store 实例必须在导航守卫内部获取，不能在外部定义，否则可能导致问题
  const userStore = useUserStore();

  // 获取 token
  const hasToken = userStore.token;

  if (hasToken) {
    if (to.path === "/login") {
      // 如果已登录，重定向到主页
      next({ path: "/" });
      NProgress.done(); // 结束进度条
    } else {
      // 检查是否已有用户信息
      const hasUserInfo = userStore.userInfo;
      if (hasUserInfo) {
        next(); // 已有用户信息，直接放行
      } else {
        try {
          // 没有用户信息，尝试获取
          console.log("路由守卫：无用户信息，尝试获取...");
          await userStore.fetchUserInfoAndPermissions();
          console.log("路由守卫：用户信息和权限获取成功");
          // 获取用户信息后再次检查权限或动态添加路由（如果需要）
          // ...
          next({ ...to, replace: true }); // 使用 replace: true，这样导航就不会留下历史记录
        } catch (error: any) {
          // 获取用户信息失败（例如 token 失效）
          console.error("路由守卫：获取用户信息或权限失败", error);
          // 清除 token 并重定向到登录页
          await userStore.logout();
          ElMessage.error(error.message || "获取用户信息失败，请重新登录");
          next(`/login?redirect=${to.path}`); // 跳转到登录页，并携带目标路径
          NProgress.done();
        }
      }
    }
  } else {
    // 没有 token
    if (whiteList.includes(to.path)) {
      // 在免登录白名单，直接进入
      next();
    } else {
      // 其他没有访问权限的页面将重定向到登录页面。
      console.log(`路由守卫：未登录，访问 ${to.path}，重定向到登录页`);
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  // 完成进度条
  NProgress.done();
});
