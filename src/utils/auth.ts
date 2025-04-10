const TOKEN_KEY = "fastpermit_token"; // 定义存储 Token 的 key
const REMEMBER_ME_KEY = "fastpermit_remember_me"; // 定义存储记住我状态的 key

/**
 * 获取 Token
 * @returns {string | null} Token 或 null
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 设置 Token
 * @param {string} token 要存储的 Token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 保存记住我状态
 * @param {boolean} status 记住我状态
 */
export function setRememberMe(status: boolean): void {
  localStorage.setItem(REMEMBER_ME_KEY, String(status));
}

/**
 * 获取记住我状态
 * @returns {boolean} 记住我状态
 */
export function getRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

/**
 * 移除记住我状态
 */
export function removeRememberMe(): void {
  localStorage.removeItem(REMEMBER_ME_KEY);
}
