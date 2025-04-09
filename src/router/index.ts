import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

// 定义路由规则
const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"), // 登录页路由
  },
  {
    path: "/",
    name: "Layout",
    component: () => import("@/layouts/MainLayout.vue"), // 主布局路由
    redirect: "/dashboard", // 默认重定向到主页
    children: [
      // 子路由
      {
        path: "dashboard", // 注意：子路由路径不以 / 开头
        name: "Dashboard",
        // 暂时创建一个简单的主页组件
        component: () => import("@/views/Dashboard.vue"),
        meta: { title: "首页" }, // 添加 meta title
      },
      // --- 个人中心 ---
      {
        path: "profile/:id",
        name: "Profile",
        component: () => import("@/views/profile/UserProfile.vue"),
        meta: {
          title: "个人中心",
          requiresAuth: true,
        },
      },
      // --- 系统管理 ---
      {
        path: "system/users",
        name: "UserManagement",
        component: () => import("@/views/system/UserManagement.vue"),
        meta: {
          title: "用户管理",
          requiresAuth: true,
          permission: "user:list",
        },
      },
      {
        path: "system/roles",
        name: "RoleManagement",
        component: () => import("@/views/system/RoleManagement.vue"), // 需要创建组件
        meta: {
          title: "角色管理",
          requiresAuth: true,
          permission: "role:list",
        },
      },
      // --- 权限管理 ---
      {
        path: "system/permissions/list",
        name: "PermissionList",
        component: () => import("@/views/system/PermissionList.vue"), // 需要创建组件
        meta: {
          title: "权限列表",
          requiresAuth: true,
          permission: "permission:list",
        },
      },
      {
        path: "system/permissions/resources",
        name: "ResourceTypeManagement",
        component: () => import("@/views/system/ResourceTypeManagement.vue"), // 需要创建组件
        meta: {
          title: "资源类型管理",
          requiresAuth: true,
          permission: "resource_type:list",
        },
      },
      {
        path: "system/permissions/actions",
        name: "ActionTypeManagement",
        component: () => import("@/views/system/ActionTypeManagement.vue"), // 需要创建组件
        meta: {
          title: "操作类型管理",
          requiresAuth: true,
          permission: "action_type:list",
        },
      },
      // --- 其他系统管理路由 ---
    ],
  },
  // 添加 404 页面路由
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: {
      title: "404 - 页面未找到",
    },
  },
];

// 创建 router 实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 使用 History 模式，这比 Hash 模式更美观（URL 中没有 #）
  routes,
});

// 导出 router 实例
export default router;
