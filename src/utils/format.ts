/**
 * 格式化 ISO 日期时间字符串
 * @param isoString ISO 格式的日期时间字符串，可能为 null
 * @returns 格式化后的字符串 (YYYY-MM-DD HH:mm:ss) 或 '-'
 */
export function formatDateTime(isoString: string | null | undefined): string {
  console.log("Formatting date input:", isoString);
  if (!isoString) {
    return "-";
  }
  try {
    const date = new Date(isoString);
    console.log("Parsed Date object:", date);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn("Invalid Date detected for input:", isoString);
      return "-";
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    console.log("Formatted date output:", formatted);
    return formatted;
  } catch (e) {
    console.error("Error formatting date:", isoString, e);
    return "-"; // 出错时返回占位符
  }
}
