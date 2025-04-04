const TOKEN_KEY = "fastpermit_token"; // 定义存储 Token 的 key

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
