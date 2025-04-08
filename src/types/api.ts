// src/types/api.ts

// /api/v1/users/me 接口响应类型
export interface UserInfo {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string; // 或者 Date 类型，取决于是否需要转换
  updated_at: string; // 或者 Date 类型
  last_login: string | null; // 或者 Date 类型
}

// 角色信息类型 (用于权限接口)
export interface RoleInfo {
  id: number;
  name: string;
  description?: string | null;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

// /api/v1/auth/my-permissions 接口响应类型
export interface MyPermissionsResponse {
  user_id: number;
  username: string;
  is_superadmin: boolean;
  roles: RoleInfo[];
  direct_permissions: string[];
  all_permissions: string[];
  permissions_count: number;
}

// 登录接口请求类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录接口响应类型
export interface LoginResponse {
  code: number; // 后端返回的业务代码
  access_token: string;
  token_type: string;
  message?: string; // 可选的错误信息
}

// 资源类型接口响应 (/api/v1/permissions/resources)
export interface ResourceType {
  id: number;
  code: string;
  name: string;
  is_system: boolean;
  created_at: string; // 添加创建时间
  updated_at: string; // 添加更新时间
}

// 操作类型接口响应 (/api/v1/permissions/actions)
export interface ActionType {
  id: number;
  code: string;
  name: string;
  is_system: boolean;
  created_at: string; // 添加创建时间
  updated_at: string; // 添加更新时间
}

// 权限信息类型 (GET /permissions 返回)
export interface Permission {
  id: number;
  name: string; // name 字段保留用于显示，但编辑/创建时不传入
  description?: string | null;
  resource_type?: ResourceType;
  action_type?: ActionType;
  resource_type_id: number;
  action_type_id: number;
  created_at: string; // 添加创建时间
  updated_at: string; // 添加更新时间
}

// 权限创建请求体 (POST /permissions) - 移除 name
export interface PermissionCreateRequest {
  // name: string; // name 由后端根据 resource 和 action 生成，无需传入
  description?: string | null;
  resource_type_id: number;
  action_type_id: number;
}

// 权限更新请求体 (PUT /permissions/{permission_id}) - 移除 name
export interface PermissionUpdateRequest {
  // name?: string; // name 通常不允许修改，或由后端同步
  description?: string | null;
  resource_type_id?: number;
  action_type_id?: number;
}

// 获取权限列表请求参数类型
export interface PermissionListRequestParams {
  resource_type_id?: number;
  action_type_id?: number;
  page?: number;
  limit?: number;
}

// 资源类型创建请求体 (POST /resource-types)
export interface ResourceTypeCreateRequest {
  code: string;
  name: string;
  // is_system 后端默认为 false，前端无需传递或可选
}

// 资源类型更新请求体 (PUT /resource-types/{resource_type_id})
export interface ResourceTypeUpdateRequest {
  code?: string;
  name?: string;
  is_system?: boolean; // is_system 通常不允许直接修改，但保留以防万一
}

// 操作类型创建请求体 (POST /action-types)
export interface ActionTypeCreateRequest {
  code: string;
  name: string;
  // is_system 后端默认为 false
}

// 操作类型更新请求体 (PUT /action-types/{action_type_id})
export interface ActionTypeUpdateRequest {
  code?: string;
  name?: string;
  is_system?: boolean; // is_system 通常不允许直接修改
}

// PUT /api/v1/users/me 请求体类型
export interface UserInfoUpdateRequest {
  username?: string; // 允许部分更新，设为可选
  email?: string | null;
  phone?: string | null;
  // is_active?: boolean; // 通常不由用户自己改
  // role_ids?: number[]; // 通常不由用户自己改
}

// 通用分页响应结构 (确认与后端返回匹配或调整)
export interface PaginatedResponse<T> {
  items: T[]; // 确认后端返回的是 'items'
  total: number; // 确认后端返回的是 'total'
}

// 获取用户列表请求参数类型 (保持 page 和 limit)
export interface UserListRequestParams {
  username?: string;
  phone?: string;
  page?: number; // 前端使用 page
  limit?: number; // 前端使用 limit
}

// 创建用户请求体类型 (对应后端 UserCreate)
export interface UserCreateRequest {
  username: string;
  password?: string; // 注意：后端 schema 密码是必填的，但这里前端可能先不要求，由后端校验
  email?: string | null;
  phone?: string | null;
  is_active?: boolean;
  role_ids?: number[];
}

// 更新用户信息请求体类型 (对应后端 UserUpdate，用于管理员更新用户)
// 注意区别于 UserInfoUpdateRequest (用于用户更新自己)
export interface UserUpdateRequest {
  username?: string;
  password?: string; // 允许管理员重置密码
  email?: string | null;
  phone?: string | null;
  is_active?: boolean;
  role_ids?: number[] | null; // 允许清空角色
}

// 角色创建请求体
export interface RoleCreateRequest {
  name: string;
  description?: string | null;
  is_default?: boolean;
  permission_ids?: number[];
}

// 角色更新请求体
export interface RoleUpdateRequest {
  name?: string;
  description?: string | null;
  is_default?: boolean;
  // 注意：更新角色权限通常使用单独的接口，而不是在更新角色信息时一起处理
}
