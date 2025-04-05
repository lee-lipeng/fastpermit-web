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
  // description?: string; // 可选字段
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

// 可选：通用的 API 响应结构 (如果后端所有接口都遵循此结构)
// export interface ApiResponse<T = any> {
//   code: number;
//   message: string | null;
//   details: any; // 或者更具体的类型
//   data: T; // 假设成功时数据在 data 字段
// }

// 资源类型接口响应 (/api/v1/permissions/resources)
export interface ResourceType {
  id: number;
  code: string;
  name: string;
}

// 操作类型接口响应 (/api/v1/permissions/actions)
export interface ActionType {
  id: number;
  code: string;
  name: string;
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
  // 可以移除 page 和 limit，因为它们是请求参数，不是响应的一部分
  // page: number;
  // limit: number;
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
