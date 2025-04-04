import { defineStore } from "pinia";
import { ref } from "vue";
// import { login as loginApi, getUserInfo as getUserInfoApi } from '@/api/user' // 稍后创建 API 调用函数
// import type { LoginRequest } from '@/types/api' // 稍后创建类型定义
import { setToken, getToken, removeToken } from "@/utils/auth"; // 稍后创建 Token 工具函数
import {
  login as loginApi,
  getUserInfo as getUserInfoApi,
  getMyPermissions,
} from "@/api/auth"; // 导入真实的 login API 函数
import type { LoginRequest, UserInfo, RoleInfo } from "@/types/api";

// 定义 User Store
export const useUserStore = defineStore("user", () => {
  // 状态 (State)
  const token = ref<string | null>(getToken()); // 从 localStorage 或 cookie 读取初始 Token
  const userInfo = ref<UserInfo | null>(null); // 用户信息，稍后定义更具体的类型
  const roles = ref<RoleInfo[]>([]); // 新增：存储角色信息
  const permissions = ref<string[]>([]); // 用户权限列表 ('resource:action')
  const isSuperAdmin = ref<boolean>(false); // 新增：标识是否为超级管理员

  // 计算属性 (Getters) - Pinia v2 中不再有单独的 getters，直接用 ref 或 computed

  // 方法 (Actions)
  /**
   * 用户登录
   * @param loginData 登录信息
   */
  async function login(loginData: LoginRequest) {
    console.log("Store: 调用登录 Action", loginData);
    try {
      const response = await loginApi(loginData); // 调用 API, 拦截器会处理非200status

      // 如果能执行到这里，说明 status 必然是 200
      if (response && response.access_token) {
        const receivedToken = response.access_token;
        setToken(receivedToken);
        token.value = receivedToken;
        console.log("Store: 登录成功，Token 已设置");
        // 登录成功后立即获取用户信息和权限
        await fetchUserInfoAndPermissions();
      } else {
        // 虽然 status 是 200，但缺少 access_token，也视为错误
        console.error("Store: 登录成功但响应格式无效", response);
        throw new Error("登录失败：服务器响应格式错误");
      }
    } catch (error) {
      // 错误已由拦截器处理并显示，这里只需确保清理状态
      console.error("Store: 登录 Action 失败", error);
      removeToken();
      token.value = null;
      // 重新抛出，让 UI 层知道失败了
      throw error;
    }
  }

  // 新增：合并获取用户信息和权限的 Action
  async function fetchUserInfoAndPermissions() {
    if (!token.value) {
      throw new Error("获取用户信息失败：Token 不存在");
    }
    console.log("Store: 开始获取用户信息和权限");
    try {
      // 并行请求用户信息和权限信息
      const [userInfoRes, permissionsRes] = await Promise.all([
        getUserInfoApi(),
        getMyPermissions(),
      ]);

      // 处理用户信息
      if (userInfoRes) {
        userInfo.value = userInfoRes;
        console.log("Store: 用户信息获取成功", userInfo.value);
      } else {
        throw new Error("获取用户信息失败：无效的响应");
      }

      // 处理权限信息
      if (permissionsRes) {
        roles.value = permissionsRes.roles || [];
        permissions.value = permissionsRes.all_permissions || [];
        isSuperAdmin.value = permissionsRes.is_superadmin || false;
        console.log("Store: 权限信息获取成功", {
          roles: roles.value,
          permissions: permissions.value,
          isSuperAdmin: isSuperAdmin.value,
        });
      } else {
        throw new Error("获取权限信息失败：无效的响应");
      }
    } catch (error) {
      console.error("Store: 获取用户信息或权限失败", error);
      // 获取失败时也应该清除状态并抛出错误，让路由守卫处理
      await logout(); // 调用 logout 清理状态
      throw error;
    }
  }

  /**
   * 获取用户信息
   */
  // getUserInfo 函数现在被 fetchUserInfoAndPermissions 替代，可以注释或移除
  /*
  async function getUserInfo() {
    if (!token.value) {
      throw new Error("获取用户信息失败：Token 不存在");
    }
    console.log("Store: 调用获取用户信息 Action");
    // TODO: 调用获取用户信息 API
    // const response = await getUserInfoApi()
    // 模拟 API 返回用户信息和权限
    const fakeUserInfo = {
      id: 1,
      username: "admin",
      nickname: "超级管理员",
      avatar: null, // 头像 URL
      roles: [{ id: 1, name: "SuperAdmin", description: "超级管理员" }], // 角色信息
    };
    const fakePermissions = [
      "user:list",
      "user:create",
      "user:update",
      "user:delete",
      "role:list",
      "role:create",
    ]; // 模拟权限
    userInfo.value = fakeUserInfo;
    permissions.value = fakePermissions;
    console.log("Store: 获取用户信息成功", userInfo.value, permissions.value);
  }
  */

  /**
   * 用户退出登录
   */
  async function logout() {
    console.log("Store: 调用退出登录 Action");
    // TODO: 调用后端退出登录接口（如果需要）
    removeToken(); // 移除 Token
    token.value = null;
    userInfo.value = null;
    roles.value = []; // 清空角色
    permissions.value = []; // 清空权限
    isSuperAdmin.value = false; // 重置超级管理员状态
    console.log("Store: 退出登录成功，状态已重置");
  }

  /**
   * 检查用户是否拥有指定权限
   * @param requiredPermissions 需要的权限，可以是单个字符串或字符串数组
   * @param checkAll 是否需要满足所有权限 (逻辑与)，默认为 true
   */
  function hasPermission(
    requiredPermissions: string | string[],
    checkAll = true
  ): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // 如果不需要权限，则认为有权限
    }
    // 超级管理员拥有所有权限 (如果后端已经处理，这里可以不加，双重保险)
    if (isSuperAdmin.value) return true;

    if (!permissions.value || permissions.value.length === 0) {
      return false; // 如果用户没有任何权限，则认为无权限
    }

    const permissionList = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    if (checkAll) {
      // 需要满足所有权限
      return permissionList.every((p) => permissions.value.includes(p));
    } else {
      // 满足任意一个权限即可
      return permissionList.some((p) => permissions.value.includes(p));
    }
  }

  // 返回状态和方法
  return {
    token,
    userInfo,
    roles, // 导出角色信息
    permissions,
    isSuperAdmin, // 导出超级管理员状态
    login,
    // getUserInfo, // 不再需要单独导出旧的 getUserInfo
    fetchUserInfoAndPermissions, // 导出新的合并方法
    logout,
    hasPermission,
  };
});
