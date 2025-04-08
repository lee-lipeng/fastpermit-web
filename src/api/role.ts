import request from "@/utils/request";
import type {
  RoleInfo,
  RoleCreateRequest,
  RoleUpdateRequest,
} from "@/types/api"; // 导入或创建所需类型

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

/**
 * 创建新角色
 * @param data 角色创建数据 (name, description, is_default, permission_ids)
 * @returns Promise<RoleInfo> 返回创建后的角色信息 (需要确认后端返回类型)
 */
export function createRole(data: RoleCreateRequest): Promise<RoleInfo> {
  return request({
    url: "/roles",
    method: "post",
    data,
  });
}

/**
 * 获取指定角色详情
 * @param roleId 角色 ID
 * @returns Promise<RoleInfo> (需要确认 RoleInfo 包含 description, is_default)
 */
export function getRole(roleId: number): Promise<RoleInfo> {
  return request({
    url: `/roles/${roleId}`,
    method: "get",
  });
}

/**
 * 更新指定角色信息
 * @param roleId 角色 ID
 * @param data 角色更新数据 (name, description, is_default)
 * @returns Promise<RoleInfo> 返回更新后的角色信息
 */
export function updateRole(
  roleId: number,
  data: RoleUpdateRequest
): Promise<RoleInfo> {
  return request({
    url: `/roles/${roleId}`,
    method: "put",
    data,
  });
}

/**
 * 删除指定角色
 * @param roleId 角色 ID
 * @returns Promise<any> 后端返回 {"message": "角色已删除"}
 */
export function deleteRole(roleId: number): Promise<any> {
  return request({
    url: `/roles/${roleId}`,
    method: "delete",
  });
}

/**
 * 获取指定角色的权限 ID 列表
 * @param roleId 角色 ID
 * @returns Promise<number[]>
 */
export function getRolePermissions(roleId: number): Promise<number[]> {
  return request({
    url: `/roles/${roleId}/permissions`,
    method: "get",
  });
}

/**
 * 更新指定角色的权限
 * @param roleId 角色 ID
 * @param permissionIds 权限 ID 列表
 * @returns Promise<any> 后端返回 {"message": "角色权限已更新"}
 */
export function updateRolePermissions(
  roleId: number,
  permissionIds: number[]
): Promise<any> {
  return request({
    url: `/roles/${roleId}/permissions`,
    method: "post",
    data: permissionIds, // 直接发送 ID 列表
  });
}
