import request from "@/utils/request";
import type { ResourceType, ActionType } from "@/types/api"; // 引入类型

/**
 * 获取所有资源类型
 * @returns Promise<ResourceType[]>
 */
export function getAllResourceTypes(): Promise<ResourceType[]> {
  return request({
    url: "/permissions/resources",
    method: "get",
  });
}

/**
 * 获取所有操作类型
 * @returns Promise<ActionType[]>
 */
export function getAllActionTypes(): Promise<ActionType[]> {
  return request({
    url: "/permissions/actions",
    method: "get",
  });
}

// TODO: 添加获取权限列表、创建/更新/删除权限等 API 函数
// export function getPermissions(params) { ... }
// export function createPermission(data) { ... }
// ...
