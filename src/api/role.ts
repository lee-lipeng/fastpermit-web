import request from "@/utils/request";
import type { RoleInfo } from "@/types/api"; // 确认 RoleInfo 包含 id 和 name

/**
 * 获取所有角色列表
 * @returns Promise<RoleInfo[]>
 */
export function getAllRoles(): Promise<RoleInfo[]> {
  return request({
    url: "/roles", // 假设后端接口路径为 /roles
    method: "get",
  });
}

// TODO: 添加创建、更新、删除角色、分配权限等 API 函数
