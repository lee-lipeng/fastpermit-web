import request from "@/utils/request";
import type {
  Permission,
  PaginatedResponse,
  ResourceType,
  ActionType,
  PermissionCreateRequest,
  PermissionUpdateRequest,
  ResourceTypeCreateRequest,
  ResourceTypeUpdateRequest,
  ActionTypeCreateRequest,
  ActionTypeUpdateRequest,
} from "@/types/api";

// 定义分页权限的 Params 类型
export interface PermissionListRequestParams {
  resource_type_id?: number;
  action_type_id?: number;
  page?: number;
  limit?: number;
}

/**
 * 获取 *所有* 权限列表 (用于分配权限对话框)
 * Fetches all permissions by requesting page 1 with a large limit.
 * @returns Promise<Permission[]>
 */
export async function getAllPermissions(): Promise<Permission[]> {
  const largeLimit = 9999;
  const params = { skip: 0, limit: largeLimit };
  try {
    const response: PaginatedResponse<Permission> = await request({
      url: "/permissions",
      method: "get",
      params: params,
    });
    if (response && Array.isArray(response.items)) {
      return response.items;
    } else {
      console.error("getAllPermissions 的响应结构无效：", response);
      return [];
    }
  } catch (error) {
    console.error("Error fetching all permissions:", error);
    return []; // 出错时返回空数组
  }
}

/**
 * 获取 *分页* 的权限列表 (用于权限管理页面)
 * @param params 查询参数 (包含 page, limit, filters)
 * @returns Promise<PaginatedResponse<Permission>>
 */
export function getPaginatedPermissions(
  params: PermissionListRequestParams
): Promise<PaginatedResponse<Permission>> {
  // 将页面/限制转换为后端的跳过/限制
  const backendParams: { [key: string]: any } = {};
  if (params.resource_type_id !== undefined)
    backendParams.resource_type_id = params.resource_type_id;
  if (params.action_type_id !== undefined)
    backendParams.action_type_id = params.action_type_id;
  if (params.page && params.limit) {
    backendParams.skip = (params.page - 1) * params.limit;
    backendParams.limit = params.limit;
  } else {
    backendParams.skip = 0;
    backendParams.limit = params.limit ?? 10; // 分页视图的默认限制
  }

  return request({
    url: "/permissions",
    method: "get",
    params: backendParams,
  });
}

/**
 * 创建权限
 * @param data 权限创建数据
 * @returns Promise<Permission> 返回创建后的权限信息 (需要确认后端返回类型)
 */
export function createPermission(
  data: PermissionCreateRequest
): Promise<Permission> {
  return request({
    url: "/permissions",
    method: "post",
    data,
  });
}

/**
 * 更新权限
 * @param permissionId 权限 ID
 * @param data 权限更新数据
 * @returns Promise<Permission> 返回更新后的权限信息
 */
export function updatePermission(
  permissionId: number,
  data: PermissionUpdateRequest
): Promise<Permission> {
  return request({
    url: `/permissions/${permissionId}`,
    method: "put",
    data,
  });
}

/**
 * 删除权限
 * @param permissionId 权限 ID
 * @returns Promise<any> 后端返回 {"message": "权限已删除"}
 */
export function deletePermission(permissionId: number): Promise<any> {
  return request({
    url: `/permissions/${permissionId}`,
    method: "delete",
  });
}

/**
 * 获取单个权限详情
 * @param permissionId 权限 ID
 * @returns Promise<Permission>
 */
export function readPermission(permissionId: number): Promise<Permission> {
  return request({
    url: `/permissions/${permissionId}`,
    method: "get",
  });
}

// --- 资源类型 API ---

/**
 * 获取所有资源类型列表
 * @param params 包含 code, name, is_system 的过滤参数 (可选)
 * @returns Promise<ResourceType[]>
 */
export function getResourceTypes(params?: {
  code?: string;
  name?: string;
  is_system?: boolean;
}): Promise<ResourceType[]> {
  return request({
    url: "/resource-types",
    method: "get",
    params, // 将过滤参数传递给后端
  });
}

/**
 * 创建资源类型
 * @param data 资源类型创建数据
 * @returns Promise<ResourceType>
 */
export function createResourceType(
  data: ResourceTypeCreateRequest
): Promise<ResourceType> {
  return request({
    url: "/resource-types",
    method: "post",
    data,
  });
}

/**
 * 更新资源类型
 * @param resourceTypeId 资源类型 ID
 * @param data 资源类型更新数据
 * @returns Promise<ResourceType>
 */
export function updateResourceType(
  resourceTypeId: number,
  data: ResourceTypeUpdateRequest
): Promise<ResourceType> {
  return request({
    url: `/resource-types/${resourceTypeId}`,
    method: "put",
    data,
  });
}

/**
 * 删除资源类型
 * @param resourceTypeId 资源类型 ID
 * @returns Promise<any>
 */
export function deleteResourceType(resourceTypeId: number): Promise<any> {
  return request({
    url: `/resource-types/${resourceTypeId}`,
    method: "delete",
  });
}

// --- 操作类型 API ---

/**
 * 获取所有操作类型列表
 * @param params 包含 code, name, is_system 的过滤参数 (可选)
 * @returns Promise<ActionType[]>
 */
export function getActionTypes(params?: {
  code?: string;
  name?: string;
  is_system?: boolean;
}): Promise<ActionType[]> {
  return request({
    url: "/action-types",
    method: "get",
    params,
  });
}

/**
 * 创建操作类型
 * @param data 操作类型创建数据
 * @returns Promise<ActionType>
 */
export function createActionType(
  data: ActionTypeCreateRequest
): Promise<ActionType> {
  return request({
    url: "/action-types",
    method: "post",
    data,
  });
}

/**
 * 更新操作类型
 * @param actionTypeId 操作类型 ID
 * @param data 操作类型更新数据
 * @returns Promise<ActionType>
 */
export function updateActionType(
  actionTypeId: number,
  data: ActionTypeUpdateRequest
): Promise<ActionType> {
  return request({
    url: `/action-types/${actionTypeId}`,
    method: "put",
    data,
  });
}

/**
 * 删除操作类型
 * @param actionTypeId 操作类型 ID
 * @returns Promise<any>
 */
export function deleteActionType(actionTypeId: number): Promise<any> {
  return request({
    url: `/action-types/${actionTypeId}`,
    method: "delete",
  });
}
