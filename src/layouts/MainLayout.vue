<template>
  <el-container
    class="main-layout"
    :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
  >
    <!-- 侧边栏 (添加 :width 和 :class) -->
    <el-aside :width="isSidebarCollapsed ? '64px' : '200px'" class="sidebar">
      <div class="logo-container">
        <!-- 折叠时可以只显示图标或隐藏文字 -->
        <span v-show="!isSidebarCollapsed">FastPermit</span>
        <!-- <img src="/logo.png" v-show="isSidebarCollapsed" alt="Logo"> -->
      </div>
      <el-scrollbar>
        <!-- 控制菜单折叠 -->
        <!-- 关闭默认折叠动画，我们用 CSS 控制 -->
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          background-color="transparent"
          text-color="#bfcbd9"
          active-text-color="#ffffff"
          :collapse="isSidebarCollapsed"
          :collapse-transition="false"
          router
        >
          <!-- 动态渲染菜单 -->
          <template v-for="menu in accessibleMenus" :key="menu.path">
            <!-- ... v-if / v-else 渲染逻辑 ... -->
            <!-- 情况1: 顶级菜单项，没有子菜单 -->
            <el-menu-item v-if="!menu.children" :index="menu.path">
              <el-icon v-if="menu.meta.icon"
                ><component :is="menu.meta.icon"
              /></el-icon>
              <template #title
                ><span>{{ menu.meta.title }}</span></template
              >
            </el-menu-item>

            <!-- 情况2: 顶级菜单项，有子菜单 (渲染 el-sub-menu) -->
            <el-sub-menu v-else :index="menu.path + '-sub'">
              <template #title>
                <el-icon v-if="menu.meta.icon"
                  ><component :is="menu.meta.icon"
                /></el-icon>
                <span v-show="!isSidebarCollapsed">{{ menu.meta.title }}</span>
              </template>
              <!-- 遍历这一级的子菜单项 -->
              <template v-for="child in menu.children" :key="child.path">
                <!-- 子菜单项仍然有子菜单 -->
                <el-sub-menu
                  v-if="child.children && child.children.length > 0"
                  :index="child.path + '-sub'"
                >
                  <template #title>
                    <el-icon v-if="child.meta.icon"
                      ><component :is="child.meta.icon"
                    /></el-icon>
                    <span v-show="!isSidebarCollapsed">{{
                      child.meta.title
                    }}</span>
                  </template>
                  <!-- 渲染二级子菜单的叶子节点 -->
                  <el-menu-item
                    v-for="grandchild in child.children"
                    :key="grandchild.path"
                    :index="grandchild.path"
                  >
                    <el-icon v-if="grandchild.meta.icon"
                      ><component :is="grandchild.meta.icon"
                    /></el-icon>
                    <template #title
                      ><span>{{ grandchild.meta.title }}</span></template
                    >
                  </el-menu-item>
                </el-sub-menu>
                <!-- 子菜单项是叶子节点 -->
                <el-menu-item v-else :index="child.path">
                  <el-icon v-if="child.meta.icon"
                    ><component :is="child.meta.icon"
                  /></el-icon>
                  <template #title
                    ><span>{{ child.meta.title }}</span></template
                  >
                </el-menu-item>
              </template>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <!-- 顶部导航栏 (修改内部结构) -->
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
        <!-- 用户信息下拉菜单 (修改 el-dropdown-item) -->
        <div class="user-info">
          <el-dropdown>
            <span class="el-dropdown-link">
              <!-- 显示用户名，优先用 nickname 或 username -->
              {{ userStore.userInfo?.username || "用户" }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <!-- 修改这里：添加 @click 事件 -->
                <el-dropdown-item @click="openProfileDrawer"
                  >个人中心</el-dropdown-item
                >
                <el-dropdown-item divided @click="handleLogout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区域 (不变) -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

    <!-- 新增：个人中心抽屉 -->
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
import { computed, ref, watch, onMounted } from "vue"; // 引入 ref, watch, onMounted
import { useRouter, useRoute, type RouteLocationMatched } from "vue-router"; // 引入 useRoute 和类型
import { useUserStore } from "@/store/modules/user";
// 引入所需图标 (根据你的菜单配置)
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
  ArrowDown, // 确保 ArrowDown 已导入
} from "@element-plus/icons-vue"; // 引入 Fold, Expand 图标
import UserProfile from "@/views/profile/UserProfile.vue"; // 导入个人中心组件

const router = useRouter();
const route = useRoute(); // 获取当前路由信息
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
      // 手动构造一个匹配项，注意 meta 需要包含 title
      const dashboardMatched = {
        ...dashboardRoute, // 复制基础路由信息
        path: dashboardRoute.path, // 确保 path 正确
        meta: dashboardRoute.meta,
      } as RouteLocationMatched; // 类型断言
      matched = [dashboardMatched].concat(matched);
    }
  }
  // 过滤掉没有 title 的或者重复的（理论上 matched 不会重复）
  breadcrumbs.value = matched.filter((item) => item.meta && item.meta.title);
  console.log("Breadcrumbs generated:", breadcrumbs.value);
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
  // 你可能需要调整 logo 和菜单项在折叠时的显示，例如通过添加/移除 class
};
// ---- 侧边栏折叠 End ----

// ---- 个人中心抽屉 Start ----
const isProfileDrawerVisible = ref(false);
const openProfileDrawer = () => {
  isProfileDrawerVisible.value = true;
};
// ---- 个人中心抽屉 End ----

// ---- 菜单配置和过滤逻辑 (不变) ----
interface MenuItem {
  path: string;
  meta: {
    title: string;
    icon?: any; // 图标组件改为可选
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
    path: "/system", // 父菜单路径，仅用于分组
    meta: { title: "系统管理", icon: Setting },
    children: [
      // 直接列出所有系统管理下的顶级菜单项
      {
        path: "/system/users",
        meta: { title: "用户管理", icon: User, permission: "user:list" },
      },
      {
        path: "/system/roles",
        meta: { title: "角色管理", icon: Lock, permission: "role:list" },
      },
      // --- 将权限相关菜单提升到这里 ---
      {
        path: "/system/permissions/list", // 使用原来的路径
        meta: {
          title: "权限列表",
          icon: Document,
          permission: "permission:list",
        },
      },
      {
        path: "/system/permissions/resources", // 使用原来的路径
        meta: {
          title: "资源类型管理",
          icon: Grid,
          permission: "resource_type:list",
        },
      },
      {
        path: "/system/permissions/actions", // 使用原来的路径
        meta: {
          title: "操作类型管理",
          icon: Operation,
          permission: "action_type:list",
        },
      },
      // --- 权限相关菜单结束 ---
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
    // 注意：按照这个逻辑，没有可访问子菜单的父菜单项（即使父菜单自身有权限）将不会被显示。
    // 这符合大多数后台菜单设计，父菜单主要用于分组。

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
  console.log("计算可访问菜单, 当前权限:", userStore.permissions);
  // if (userStore.isSuperAdmin) return allMenus; // 可以在这里加，但依赖后端权限数据更准确
  const filtered = filterMenu(allMenus);
  console.log("过滤后的菜单:", JSON.stringify(filtered, null, 2)); // 打印过滤结果方便调试
  return filtered;
});
// ---- 菜单配置和过滤逻辑 End ----

// 处理退出登录 (更新)
const handleLogout = async () => {
  // 改为 async
  console.log("处理退出登录逻辑");
  try {
    await userStore.logout(); // 调用 store 的 logout action
    // 退出登录后跳转到登录页
    router.push("/login");
  } catch (error) {
    console.error("退出登录失败:", error);
    // 可以选择性地显示错误提示
    // ElMessage.error('退出登录失败');
  }
};
</script>

<style lang="scss" scoped>
@use "sass:color"; // <--- 添加这一行

// 定义颜色和尺寸变量 (方便维护和统一风格)
$sidebar-bg: #2c3e50; // 深蓝灰色
$sidebar-text-color: #bdc3c7; // 较柔和的文字颜色
$sidebar-active-text-color: #ffffff; // 激活项文字用白色，更突出
$sidebar-active-bg: #3498db; // Element Plus 主题蓝作为激活背景
$sidebar-hover-bg: #34495e; // 悬浮背景色
$sidebar-sub-menu-bg: #23303e; // 子菜单背景稍暗

$header-height: 60px;
$header-bg: #ffffff;
$header-shadow: 0 1px 4px rgba(0, 21, 41, 0.08); // 顶部阴影

$content-bg: #f0f4f8; // 更明亮的浅灰背景
$content-padding: 24px; // 内容区域内边距

.main-layout {
  height: 100vh;
  &.sidebar-collapsed {
    .sidebar {
      width: 64px !important; // 强制折叠宽度
    }
  }
}

.sidebar {
  background-color: $sidebar-bg;
  color: $sidebar-text-color;
  overflow: hidden; // 隐藏 Y 轴滚动条，菜单内部自己滚动
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1); // 侧边栏右侧阴影
  position: relative;
  z-index: 1001; // 确保在 header 之上（如果需要层叠）
  width: 200px; // 明确初始宽度
  transition: width 0.28s; // 确保宽度变化有过渡动画

  .logo-container {
    height: $header-height;
    line-height: $header-height;
    text-align: center;
    background-color: color.adjust($sidebar-bg, $lightness: -3%);
    overflow: hidden;
    white-space: nowrap; // 防止文字换行

    span {
      // 添加过渡效果
      transition: opacity 0.3s cubic-bezier(0.55, 0, 0.1, 1);
    }
  }

  .el-scrollbar {
    height: calc(100vh - #{$header-height});
    // 隐藏原生滚动条 (如果需要美化)
    // &::-webkit-scrollbar { display: none; }
    .el-menu {
      height: 100%; // 菜单填满滚动区域
    }
  }

  .el-menu {
    border-right: none;
    background-color: $sidebar-bg;
    width: 100% !important; // 确保菜单宽度正确
    // 折叠时的样式调整
    &:not(.el-menu--collapse) {
      // 展开状态
      width: 100%;
    }
    // &.el-menu--collapse { // 折叠状态
    //    width: 100%; // 确保宽度
    // }

    .el-menu-item,
    ::v-deep(.el-sub-menu__title) {
      // 使用 ::v-deep 注意作用域和未来可能的变化
      color: $sidebar-text-color;
      height: 56px; // 增加菜单项高度
      line-height: 56px;
      transition: background-color 0.2s ease-out, color 0.2s ease-out; // 平滑过渡

      .el-icon {
        margin-right: 10px; // 图标与文字间距
        vertical-align: middle;
        width: 18px; // 统一图标宽度
        text-align: center;
        font-size: 18px; // 统一图标大小
      }
      span {
        vertical-align: middle;
      }

      &:hover {
        background-color: $sidebar-hover-bg !important;
        color: #fff !important;
      }
    }

    .el-menu-item.is-active {
      color: $sidebar-active-text-color !important;
      background-color: $sidebar-active-bg !important;
    }

    // 子菜单样式 - 提高选择器特异性
    .el-sub-menu {
      .el-menu--inline {
        // Element Plus 应用于弹出子菜单的 class
        background-color: $sidebar-sub-menu-bg !important; // 确保容器背景色应用

        .el-menu-item {
          background-color: $sidebar-sub-menu-bg !important; // 子菜单项背景
          padding-left: 48px !important; // 维持缩进

          &:hover {
            background-color: $sidebar-hover-bg !important; // 悬浮背景
            color: #fff !important;
          }

          &.is-active {
            color: $sidebar-active-text-color !important;
            background-color: $sidebar-active-bg !important; // 激活项背景
            // 可选：为激活的子菜单项添加一个左边框或其他视觉提示
            // border-left: 3px solid $sidebar-active-bg;
          }
        }
      }
    }

    // 激活父菜单标题样式
    ::v-deep(.el-sub-menu.is-active > .el-sub-menu__title) {
      color: $sidebar-active-text-color !important; // 激活的父菜单标题也高亮
    }
  }
  // 隐藏菜单标题和子菜单箭头当折叠时
  // Element Plus 默认会处理部分，但可以加强控制
  &.el-aside {
    // 提高特定性
    ::v-deep(.el-menu--collapse) {
      .el-sub-menu__title span,
      .el-sub-menu__icon-arrow {
        display: none;
      }
      .el-menu-item span {
        // 如果模板中没用 #title 包裹，也需要隐藏
        display: none;
      }
    }
    // 折叠时 tooltip 的偏移，避免遮挡图标 (如果需要)
    // ::v-deep(.el-tooltip__popper) {
    //    margin-left: 16px;
    // }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: $header-bg;
  height: $header-height;
  padding: 0 $content-padding; // 使用统一内边距
  box-shadow: $header-shadow;
  position: relative;
  z-index: 1000;

  .header-left {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .sidebar-toggler {
    display: flex; // 使用 flex 垂直居中图标
    align-items: center;
    height: 100%;
    padding: 0 15px; // 点击区域
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }
    .el-icon {
      color: #5a5e66;
    }
  }

  .breadcrumb-container {
    margin-left: 10px; // 与折叠按钮的间距
    // 面包屑样式调整
    ::v-deep(.el-breadcrumb__inner),
    ::v-deep(.el-breadcrumb__separator) {
      color: #606266;
      font-weight: normal; // 确保非粗体
    }
    ::v-deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: #97a8be; // 最后一个项目颜色变浅 (用一个更柔和的灰色)
      cursor: text; // 最后一个不可点击
    }
    // 移除了对 .el-link__inner 的特定样式，因为 :to 属性会自动渲染为 a 标签或 span
    // a 标签的样式可以通过全局 a:hover 控制，或针对性添加
    ::v-deep(.el-breadcrumb__item:not(:last-child) .el-breadcrumb__inner) {
      cursor: pointer;
      &:hover {
        color: $sidebar-active-bg; // 使用主题色
      }
    }
  }

  .user-info {
    cursor: pointer;
    display: flex;
    align-items: center;

    .el-dropdown {
      height: 100%; // 让下拉菜单触发区域撑满
    }

    .el-dropdown-link {
      display: flex;
      align-items: center;
      padding: 0 10px;
      height: 100%;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.025);
      }

      span {
        // 用户名样式
        font-size: 14px;
        color: #333;
        margin-right: 8px;
      }

      .el-icon--right {
        color: #909399;
      }
    }
    // 将来可以放头像
    // .el-avatar { margin-right: 10px; }
  }
}

.main-content {
  background-color: $content-bg;
  padding: $content-padding;
  overflow-y: auto; // 内容超出时允许滚动
  height: calc(100vh - #{$header-height}); // 计算内容区域高度
  position: relative;

  // NProgress 进度条样式 (使其更融入主题)
  :deep(#nprogress .bar) {
    // 使用 :deep() 穿透 scoped
    background: $sidebar-active-bg !important; // 使用主题色
    height: 3px !important;
    z-index: 2000 !important; // 确保在最上层
  }
  :deep(#nprogress .peg) {
    box-shadow: 0 0 10px $sidebar-active-bg, 0 0 5px $sidebar-active-bg !important;
  }
}

// 新增：为折叠时弹出的菜单设置样式
// 注意：这些选择器可能依赖 Element Plus 的具体实现，未来版本可能变化
:deep(.el-menu--popup) {
  background-color: $sidebar-sub-menu-bg !important; // 设置弹出菜单背景色
  border: none; // 移除可能存在的边框

  .el-menu-item {
    background-color: $sidebar-sub-menu-bg !important;
    color: $sidebar-text-color !important; // 确保文字颜色正确
    height: 50px; // 可以调整弹出项的高度
    line-height: 50px;

    &:hover {
      background-color: $sidebar-hover-bg !important; // 悬浮背景
      color: #fff !important;
    }

    &.is-active {
      // 理论上弹出菜单项不会是 active 状态，但以防万一
      color: $sidebar-active-text-color !important;
      background-color: $sidebar-active-bg !important;
    }

    .el-icon {
      // 确保图标颜色也对
      color: $sidebar-text-color;
      margin-right: 10px;
    }
  }
  // 如果还有嵌套子菜单弹出 (理论上我们的结构不会有)
  .el-sub-menu__title {
    color: $sidebar-text-color !important;
    &:hover {
      background-color: $sidebar-hover-bg !important;
      color: #fff !important;
    }
    .el-icon {
      color: $sidebar-text-color;
    }
  }
}

// ---- 抽屉样式 Start ----
// 可能需要 ::v-deep 或 :deep() 来穿透 Drawer 的样式
:deep(.profile-drawer) {
  .el-drawer__header {
    margin-bottom: 20px; // 增加标题和内容间距
    padding-bottom: 20px; // 增加标题底部内边距
    border-bottom: 1px solid #ebeef5; // 添加分隔线
  }
  .el-drawer__body {
    padding: 0; // 移除 body 的内边距，让内部内容控制
  }
}
.profile-drawer-content {
  padding: 20px; // 为抽屉内容添加内边距
  height: 100%;
  overflow-y: auto; // 如果内容超长，允许滚动
}
// ---- 抽屉样式 End ----
</style>
