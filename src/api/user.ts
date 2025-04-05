import request from "@/utils/request";
import type {
  UserInfo,
  UserInfoUpdateRequest,
  PaginatedResponse,
  UserListRequestParams,
  UserCreateRequest,
  UserUpdateRequest,
} from "@/types/api";

/**
 * 更新当前用户信息
 * @param data 用户信息更新请求体
 * @returns Promise<UserInfo> 返回更新后的用户信息
 */
export function updateCurrentUser(
  data: UserInfoUpdateRequest
): Promise<UserInfo> {
  return request({
    url: "/users/me",
    method: "put",
    data, // PUT 请求体
  });
}

/**
 * 获取用户列表 (带筛选和分页参数)
 * @param params 查询参数 (包含 page 和 limit)
 * @returns Promise<PaginatedResponse<UserInfo>> 返回分页的用户列表数据
 */
export function getUsers(
  params?: UserListRequestParams
): Promise<PaginatedResponse<UserInfo>> {
  // 将前端的 page, limit 转换为后端的 skip, limit
  const backendParams: { [key: string]: any } = {};
  if (params?.username) backendParams.username = params.username;
  if (params?.phone) backendParams.phone = params.phone;
  if (params?.page && params?.limit) {
    backendParams.skip = (params.page - 1) * params.limit;
    backendParams.limit = params.limit;
  } else {
    // 默认分页或不分页处理 (根据需要，这里假设默认第一页，每页10条)
    backendParams.skip = 0;
    backendParams.limit = params?.limit ?? 10;
  }

  return request({
    url: "/users",
    method: "get",
    params: backendParams, // 使用转换后的参数
  });
}

/**
 * 获取指定用户信息
 * @param userId 用户 ID
 * @returns Promise<UserInfo>
 */
export function getUser(userId: number): Promise<UserInfo> {
  return request({
    url: `/users/${userId}`,
    method: "get",
  });
}

/**
 * 创建新用户
 * @param data 用户创建数据
 * @returns Promise<UserInfo> 返回创建后的用户信息
 */
export function createUser(data: UserCreateRequest): Promise<UserInfo> {
  return request({
    url: "/users",
    method: "post",
    data,
  });
}

/**
 * 更新指定用户信息 (管理员操作)
 * @param userId 用户 ID
 * @param data 用户更新数据
 * @returns Promise<UserInfo> 返回更新后的用户信息
 */
export function updateUser(
  userId: number,
  data: UserUpdateRequest
): Promise<UserInfo> {
  return request({
    url: `/users/${userId}`,
    method: "put",
    data,
  });
}

/**
 * 删除指定用户
 * @param userId 用户 ID
 * @returns Promise<any> 后端返回 {"message": "用户已删除"}
 */
export function deleteUser(userId: number): Promise<any> {
  return request({
    url: `/users/${userId}`,
    method: "delete",
  });
}

/**
 * 获取指定用户的角色 ID 列表
 * @param userId 用户 ID
 * @returns Promise<number[]>
 */
export function getUserRoles(userId: number): Promise<number[]> {
  return request({
    url: `/users/${userId}/roles`,
    method: "get",
  });
}

/**
 * 更新指定用户的角色
 * @param userId 用户 ID
 * @param roleIds 角色 ID 列表
 * @returns Promise<any> 后端返回 {"message": "用户角色已更新"}
 */
export function updateUserRoles(
  userId: number,
  roleIds: number[]
): Promise<any> {
  return request({
    url: `/users/${userId}/roles`,
    method: "post",
    data: roleIds, // 直接发送 ID 列表作为请求体
  });
}

/**
 * 获取指定用户的直接权限 ID 列表
 * @param userId 用户 ID
 * @returns Promise<number[]>
 */
export function getUserPermissions(userId: number): Promise<number[]> {
  return request({
    url: `/users/${userId}/permissions`,
    method: "get",
  });
}

/**
 * 更新指定用户的直接权限
 * @param userId 用户 ID
 * @param permissionIds 权限 ID 列表
 * @returns Promise<any> 后端返回 {"message": "用户权限已更新"}
 */
export function updateUserPermissions(
  userId: number,
  permissionIds: number[]
): Promise<any> {
  return request({
    url: `/users/${userId}/permissions`,
    method: "post",
    data: permissionIds, // 直接发送 ID 列表作为请求体
  });
}

// TODO: 添加获取用户列表、创建、更新、删除用户等 API 函数
// export function getUsers(params) { ... }
// ...
