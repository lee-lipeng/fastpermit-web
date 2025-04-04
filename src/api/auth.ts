import request from "@/utils/request";
import type {
  LoginRequest,
  LoginResponse,
  UserInfo,
  MyPermissionsResponse,
} from "@/types/api"; // 引入类型

/**
 * 登录接口
 * @param data 登录请求体，包含 username 和 password
 * @returns Promise<LoginResponse> 返回包含 access_token 的响应
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  // FastAPI 的 OAuth2PasswordRequestForm 需要 x-www-form-urlencoded 格式
  const formData = new URLSearchParams();
  formData.append("username", data.username);
  formData.append("password", data.password);

  return request({
    url: "/auth/login",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * 获取当前登录用户信息接口
 * @returns Promise<UserInfo> 注意：后端返回的是纯 UserInfo 对象，没有 code/message
 */
export function getUserInfo(): Promise<UserInfo> {
  return request({
    url: "/users/me", //
    method: "get",
    // 请求头中的 Authorization 会由拦截器自动添加
  });
}

/**
 * 获取当前登录用户的权限信息接口
 * @returns Promise<MyPermissionsResponse> 注意：后端返回的是纯 MyPermissionsResponse 对象
 */
export function getMyPermissions(): Promise<MyPermissionsResponse> {
  return request({
    url: "/auth/my-permissions",
    method: "get",
  });
}

/**
 * 重置当前用户密码
 * @param old_password 旧密码
 * @param new_password 新密码
 * @returns Promise<any> 后端没定义明确的成功响应体，用 any
 */
export function resetPassword(
  old_password: string,
  new_password: string
): Promise<any> {
  return request({
    url: "/auth/reset-password",
    method: "post",
    // 将密码放在 query 参数中
    params: {
      old_password,
      new_password,
    },
    // POST 请求通常不需要 Content-Type，除非后端特别要求
  });
}

// TODO: 添加获取用户信息、退出登录等其他认证相关 API 函数
// export function getUserInfo() { ... }
// export function logout() { ... }
