import { date } from 'quasar';

/**
 * 格式化日期為 YYYY-MM-DD
 */
export function formatDate(dateValue: Date | string | number): string {
  return date.formatDate(dateValue, 'YYYY-MM-DD');
}

/**
 * 格式化日期時間為 YYYY-MM-DD HH:mm
 */
export function formatDateTime(dateValue: Date | string | number): string {
  return date.formatDate(dateValue, 'YYYY-MM-DD HH:mm');
}

/**
 * 格式化相對時間（如：剛才、5 分鐘前、昨天）
 */
export function formatRelativeTime(dateValue: Date | string | number): string {
  const d = new Date(dateValue);
  const now = new Date();
  const diffSeconds = date.getDateDiff(now, d, 'seconds');
  const diffMinutes = date.getDateDiff(now, d, 'minutes');
  const diffHours = date.getDateDiff(now, d, 'hours');
  const diffDays = date.getDateDiff(now, d, 'days');

  if (diffSeconds < 60) return '剛才';
  if (diffMinutes < 60) return `${diffMinutes} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;

  return formatDate(d);
}

/**
 * 格式化持續時間（秒 → 時:分:秒）
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * 格式化持續時間為人類可讀格式（如：2 小時 30 分鐘）
 */
export function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} 小時 ${minutes} 分鐘`;
  }
  if (hours > 0) {
    return `${hours} 小時`;
  }
  if (minutes > 0) {
    return `${minutes} 分鐘`;
  }
  return `${seconds} 秒`;
}

/**
 * 獲取本週的開始日期（週一 00:00）
 */
export function getWeekStart(dateValue: Date | string | number = new Date()): Date {
  const d = new Date(dateValue);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 調整到週一
  const monday = date.addToDate(d, { days: diff });
  return date.startOfDate(monday, 'day');
}

/**
 * 獲取本週的結束日期（週日 23:59:59）
 */
export function getWeekEnd(dateValue: Date | string | number = new Date()): Date {
  const weekStart = getWeekStart(dateValue);
  const sunday = date.addToDate(weekStart, { days: 6 });
  return date.endOfDate(sunday, 'day');
}

/**
 * 獲取本月的開始日期（1 號 00:00）
 */
export function getMonthStart(dateValue: Date | string | number = new Date()): Date {
  return date.startOfDate(dateValue, 'month');
}

/**
 * 獲取本月的結束日期（最後一天 23:59:59）
 */
export function getMonthEnd(dateValue: Date | string | number = new Date()): Date {
  return date.endOfDate(dateValue, 'month');
}

/**
 * 獲取今天的開始時間（00:00:00）
 */
export function getTodayStart(): Date {
  return date.startOfDate(new Date(), 'day');
}

/**
 * 獲取今天的結束時間（23:59:59）
 */
export function getTodayEnd(): Date {
  return date.endOfDate(new Date(), 'day');
}

/**
 * 判斷是否為今天
 */
export function isToday(dateValue: Date | string | number): boolean {
  const d = new Date(dateValue);
  const today = new Date();
  return date.isSameDate(d, today, 'day');
}

/**
 * 判斷是否為本週
 */
export function isThisWeek(dateValue: Date | string | number): boolean {
  const d = new Date(dateValue);
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  return date.isBetweenDates(d, weekStart, weekEnd, {
    inclusiveFrom: true,
    inclusiveTo: true,
    onlyDate: true,
  });
}

/**
 * 判斷是否為本月
 */
export function isThisMonth(dateValue: Date | string | number): boolean {
  const d = new Date(dateValue);
  const today = new Date();
  return date.isSameDate(d, today, 'month');
}

/**
 * 增加天數
 */
export function addDays(dateValue: Date | string | number, days: number): Date {
  return date.addToDate(dateValue, { days });
}

/**
 * 增加週數
 */
export function addWeeks(dateValue: Date | string | number, weeks: number): Date {
  return date.addToDate(dateValue, { days: weeks * 7 });
}

/**
 * 增加月數
 */
export function addMonths(dateValue: Date | string | number, months: number): Date {
  return date.addToDate(dateValue, { months });
}

/**
 * 減去天數
 */
export function subtractDays(dateValue: Date | string | number, days: number): Date {
  return date.subtractFromDate(dateValue, { days });
}

/**
 * 計算兩個日期之間的天數差
 */
export function getDaysDiff(date1: Date | string | number, date2: Date | string | number): number {
  return date.getDateDiff(date1, date2, 'days');
}
