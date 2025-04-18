<template>
  <el-container
    class="main-layout"
    :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
  >
    <!-- 侧边栏 -->
    <el-aside :width="isSidebarCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo-container">
        <el-icon class="logo-icon"><Lock /></el-icon>
        <span v-show="!isSidebarCollapsed" class="logo-text">FastPermit</span>
      </div>
      <el-scrollbar>
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical"
          background-color="transparent"
          text-color="#bfcbd9"
          active-text-color="#ffffff"
          :collapse="isSidebarCollapsed"
          :collapse-transition="false"
          router
          unique-opened
        >
          <!-- 动态渲染菜单 -->
          <template v-for="menu in accessibleMenus" :key="menu.path">
            <!-- 情况1: 顶级菜单项，没有子菜单 -->
            <el-menu-item
              v-if="!menu.children"
              :index="menu.path"
              class="menu-item"
            >
              <el-icon v-if="menu.meta.icon" class="menu-icon">
                <component :is="menu.meta.icon" />
              </el-icon>
              <template #title>
                <span class="menu-title">{{ menu.meta.title }}</span>
              </template>
            </el-menu-item>

            <!-- 情况2: 顶级菜单项，有子菜单 (渲染 el-sub-menu) -->
            <el-sub-menu v-else :index="menu.path + '-sub'" class="sub-menu">
              <template #title>
                <el-icon v-if="menu.meta.icon" class="menu-icon">
                  <component :is="menu.meta.icon" />
                </el-icon>
                <span class="menu-title">{{ menu.meta.title }}</span>
              </template>
              <!-- 遍历这一级的子菜单项 -->
              <template v-for="child in menu.children" :key="child.path">
                <!-- 子菜单项仍然有子菜单 -->
                <el-sub-menu
                  v-if="child.children && child.children.length > 0"
                  :index="child.path + '-sub'"
                  class="sub-menu"
                >
                  <template #title>
                    <el-icon v-if="child.meta.icon" class="menu-icon">
                      <component :is="child.meta.icon" />
                    </el-icon>
                    <span class="menu-title">{{ child.meta.title }}</span>
                  </template>
                  <!-- 渲染二级子菜单的叶子节点 -->
                  <el-menu-item
                    v-for="grandchild in child.children"
                    :key="grandchild.path"
                    :index="grandchild.path"
                    class="menu-item"
                  >
                    <el-icon v-if="grandchild.meta.icon" class="menu-icon">
                      <component :is="grandchild.meta.icon" />
                    </el-icon>
                    <template #title>
                      <span class="menu-title">{{
                        grandchild.meta.title
                      }}</span>
                    </template>
                  </el-menu-item>
                </el-sub-menu>
                <!-- 子菜单项是叶子节点 -->
                <el-menu-item v-else :index="child.path" class="menu-item">
                  <el-icon v-if="child.meta.icon" class="menu-icon">
                    <component :is="child.meta.icon" />
                  </el-icon>
                  <template #title>
                    <span class="menu-title">{{ child.meta.title }}</span>
                  </template>
                </el-menu-item>
              </template>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <!-- 折叠按钮 -->
          <div class="sidebar-toggler" @click="toggleSidebar">
            <el-icon :size="20">
              <component :is="isSidebarCollapsed ? Expand : Fold" />
            </el-icon>
          </div>
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/" class="breadcrumb-container">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbs"
              :key="item.path"
              :to="
                index < breadcrumbs.length - 1 ? { path: item.path } : undefined
              "
            >
              {{ item.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <!-- 用户信息下拉菜单 -->
        <div class="user-info">
          <el-dropdown trigger="click">
            <div class="user-dropdown-link">
              <el-avatar :size="32" class="user-avatar">
                {{
                  userStore.userInfo?.username?.charAt(0).toUpperCase() || "U"
                }}
              </el-avatar>
              <span class="username">
                {{ userStore.userInfo?.username || "用户" }}
              </span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openProfileDrawer">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区域 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 个人中心抽屉 -->
    <el-drawer
      v-model="isProfileDrawerVisible"
      title="个人中心"
      direction="rtl"
      size="500px"
      :with-header="true"
      :append-to-body="true"
      custom-class="profile-drawer"
    >
      <div class="profile-drawer-content">
        <UserProfile />
      </div>
    </el-drawer>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useRouter, useRoute, type RouteLocationMatched } from "vue-router";
import { useUserStore } from "@/store/modules/user";
// 引入所需图标
import {
  HomeFilled,
  Setting,
  User,
  Lock,
  Files,
  Grid,
  Operation,
  Document,
  Fold,
  Expand,
  ArrowDown,
  SwitchButton,
} from "@element-plus/icons-vue";
import UserProfile from "@/views/profile/UserProfile.vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// ---- 面包屑导航 Start ----
const breadcrumbs = ref<RouteLocationMatched[]>([]);

const getBreadcrumbs = () => {
  // 获取所有匹配的路由记录 (包含父级)
  let matched = route.matched.filter((item) => item.meta && item.meta.title);

  // 如果第一个不是首页，并且当前路由不是首页，则手动添加首页
  const first = matched[0];
  if (!first || first.path !== "/dashboard") {
    // 查找 dashboard 路由配置（如果存在）
    const dashboardRoute = router
      .getRoutes()
      .find((r) => r.path === "/dashboard" || r.name === "Dashboard");
    if (dashboardRoute && dashboardRoute.meta && dashboardRoute.meta.title) {
      // 手动构造一个匹配项
      const dashboardMatched = {
        ...dashboardRoute,
        path: dashboardRoute.path,
        meta: dashboardRoute.meta,
      } as RouteLocationMatched;
      matched = [dashboardMatched].concat(matched);
    }
  }
  breadcrumbs.value = matched.filter((item) => item.meta && item.meta.title);
};

// 监听路由变化
watch(
  () => route.path,
  () => {
    getBreadcrumbs();
  }
);

// 组件挂载时生成一次
onMounted(() => {
  getBreadcrumbs();
});
// ---- 面包屑导航 End ----

// ---- 侧边栏折叠 Start ----
const isSidebarCollapsed = ref(false);
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
// ---- 侧边栏折叠 End ----

// ---- 个人中心抽屉 Start ----
const isProfileDrawerVisible = ref(false);
const openProfileDrawer = () => {
  isProfileDrawerVisible.value = true;
};
// ---- 个人中心抽屉 End ----

// ---- 菜单配置和过滤逻辑 ----
interface MenuItem {
  path: string;
  meta: {
    title: string;
    icon?: any;
    permission?: string | string[];
  };
  children?: MenuItem[];
}

const allMenus: MenuItem[] = [
  {
    path: "/dashboard",
    meta: { title: "首页", icon: HomeFilled },
  },
  {
    path: "/system",
    meta: { title: "系统管理", icon: Setting },
    children: [
      {
        path: "/system/users",
        meta: { title: "用户管理", icon: User, permission: "user:list" },
      },
      {
        path: "/system/roles",
        meta: { title: "角色管理", icon: Lock, permission: "role:list" },
      },
      {
        path: "/system/permissions/list",
        meta: {
          title: "权限管理",
          icon: Document,
          permission: "permission:list",
        },
      },
      {
        path: "/system/permissions/resources",
        meta: {
          title: "资源类型管理",
          icon: Grid,
          permission: "resource_type:list",
        },
      },
      {
        path: "/system/permissions/actions",
        meta: {
          title: "操作类型管理",
          icon: Operation,
          permission: "action_type:list",
        },
      },
    ],
  },
];

// 优化后的过滤菜单递归函数
const filterMenu = (menus: MenuItem[]): MenuItem[] => {
  const result: MenuItem[] = [];
  for (const menu of menus) {
    // 1. 递归过滤子菜单
    let accessibleChildren: MenuItem[] | undefined = undefined;
    if (menu.children && menu.children.length > 0) {
      accessibleChildren = filterMenu(menu.children);
    }

    // 2. 判断当前菜单项是否应该显示
    let shouldShow = false;
    // 检查自身权限（如果是叶子节点或父节点都需要考虑）
    const hasRequiredPermission =
      !menu.meta.permission || userStore.hasPermission(menu.meta.permission);

    if (accessibleChildren && accessibleChildren.length > 0) {
      // 条件1：如果它有可访问的子菜单，则显示父菜单
      shouldShow = true;
    } else if (!menu.children && hasRequiredPermission) {
      // 条件2：如果它是叶子节点，且用户有权限访问它
      shouldShow = true;
    }

    // 3. 如果应该显示，则构造并添加到结果列表
    if (shouldShow) {
      const currentMenu: MenuItem = { ...menu };
      // 只附加实际可访问的子菜单
      currentMenu.children =
        accessibleChildren && accessibleChildren.length > 0
          ? accessibleChildren
          : undefined;
      result.push(currentMenu);
    }
  }
  return result;
};

const accessibleMenus = computed(() => {
  const filtered = filterMenu(allMenus);
  return filtered;
});
// ---- 菜单配置和过滤逻辑 End ----

// 处理退出登录
const handleLogout = async () => {
  try {
    await userStore.logout();
    ElMessage.success("退出登录成功");
    router.push("/login");
  } catch (error) {
    console.error("退出登录失败:", error);
    ElMessage.error("退出登录失败");
  }
};
</script>

<style lang="scss" scoped>
@use "sass:color";

// 定义颜色变量
$primary-color: #1890ff;
$primary-hover: #40a9ff;
$primary-active: #096dd9;
$sidebar-bg: #001529;
$sidebar-text: #bfcbd9;
$sidebar-active-bg: #1890ff;
$sidebar-hover-bg: #263445;
$header-bg: #ffffff;
$header-height: 60px;
$content-bg: #f0f2f5;
$transition-duration: 0.3s;

// 页面过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.main-layout {
  height: 100vh;
  transition: all $transition-duration;
}

// 侧边栏样式
.sidebar {
  background-color: $sidebar-bg;
  color: $sidebar-text;
  transition: width $transition-duration;
  overflow: hidden;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 1001;

  .logo-container {
    height: $header-height;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    overflow: hidden;
    background-color: color.adjust($sidebar-bg, $lightness: -3%);
    transition: all $transition-duration;

    .logo-icon {
      font-size: 24px;
      color: $primary-color;
      margin-right: 12px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      opacity: 1;
      transition: opacity $transition-duration;
    }
  }

  .el-scrollbar {
    height: calc(100vh - #{$header-height});

    .el-menu-vertical {
      border-right: none;

      .menu-item {
        height: 56px;
        line-height: 56px;

        &:hover {
          background-color: $sidebar-hover-bg;
        }

        &.is-active {
          background-color: $sidebar-active-bg;

          &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 3px;
            height: 100%;
            background-color: white;
          }
        }
      }

      .sub-menu {
        .el-sub-menu__title {
          &:hover {
            background-color: $sidebar-hover-bg;
          }
        }

        &.is-active > .el-sub-menu__title {
          color: white;
        }
      }

      .menu-icon {
        font-size: 18px;
        margin-right: 10px;
        vertical-align: middle;
      }

      .menu-title {
        vertical-align: middle;
        transition: opacity $transition-duration;
      }

      // 折叠样式优化
      &.el-menu--collapse {
        .menu-title {
          display: none;
        }
      }
    }
  }
}

// 顶部导航栏样式
.header {
  background-color: $header-bg;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  padding: 0;
  z-index: 1000;

  .header-left {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .sidebar-toggler {
    width: 64px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color $transition-duration;

    &:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }

    .el-icon {
      color: #5a5e66;
      transition: transform $transition-duration;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .breadcrumb-container {
    margin-left: 16px;

    :deep(.el-breadcrumb__inner) {
      color: #606266;
      transition: color $transition-duration;

      &:hover {
        color: $primary-color;
      }
    }

    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: #97a8be;
    }
  }

  .user-info {
    margin-right: 20px;

    .user-dropdown-link {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0 12px;
      height: 100%;
      transition: background-color $transition-duration;

      &:hover {
        background-color: rgba(0, 0, 0, 0.025);
      }

      .user-avatar {
        background-color: $primary-color;
        color: white;
        margin-right: 8px;
        font-size: 14px;
        font-weight: bold;
      }

      .username {
        font-size: 14px;
        color: #606266;
        margin-right: 4px;
      }

      .el-icon--right {
        font-size: 12px;
        color: #909399;
      }
    }

    :deep(.el-dropdown-menu) {
      padding: 5px 0;

      .el-dropdown-menu__item {
        padding: 10px 20px;
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: 10px;
          font-size: 16px;
        }

        &:hover {
          background-color: #ecf5ff;
          color: $primary-color;
        }
      }
    }
  }
}

// 主内容区域样式
.main-content {
  background-color: $content-bg;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - #{$header-height});

  :deep(#nprogress .bar) {
    background: $primary-color;
    height: 3px;
  }

  :deep(#nprogress .peg) {
    box-shadow: 0 0 10px $primary-color, 0 0 5px $primary-color;
  }
}

// 抽屉样式
:deep(.profile-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 24px 30px;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 600;
    font-size: 20px;
    color: #303133;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  }

  .el-drawer__body {
    padding: 0;
    overflow: auto;
  }

  .el-drawer__close-btn {
    font-size: 20px;
    color: #909399;
    transition: all 0.3s;

    &:hover {
      transform: rotate(90deg);
      color: #1890ff;
    }
  }
}

.profile-drawer-content {
  height: 100%;
  overflow-y: hidden;
}
</style>
