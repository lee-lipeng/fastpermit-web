import request from "@/utils/request";
import type { UserInfo, UserInfoUpdateRequest } from "@/types/api";

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

// TODO: 添加获取用户列表、创建、更新、删除用户等 API 函数
// export function getUsers(params) { ... }
// ...
