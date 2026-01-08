import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  isToday,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  addDays,
  subtractDays,
} from 'src/utils/date';

describe('date.ts - 日期時間工具', () => {
  describe('formatDate()', () => {
    it('應該格式化日期為 YYYY-MM-DD', () => {
      const date = new Date('2026-01-08T12:00:00');
      expect(formatDate(date)).toBe('2026-01-08');
    });

    it('應該接受字串類型的日期', () => {
      expect(formatDate('2026-01-08')).toBe('2026-01-08');
    });

    it('應該接受時間戳', () => {
      const timestamp = new Date('2026-01-08').getTime();
      expect(formatDate(timestamp)).toBe('2026-01-08');
    });
  });

  describe('formatDateTime()', () => {
    it('應該格式化日期時間為 YYYY-MM-DD HH:mm', () => {
      const date = new Date('2026-01-08T14:30:00');
      expect(formatDateTime(date)).toBe('2026-01-08 14:30');
    });
  });

  describe('formatRelativeTime()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-08T12:00:00'));
    });

    it('應該顯示「剛才」當時間小於 1 分鐘', () => {
      const date = new Date('2026-01-08T11:59:30');
      expect(formatRelativeTime(date)).toBe('剛才');
    });

    it('應該顯示分鐘數當時間在 1-59 分鐘之間', () => {
      const date = new Date('2026-01-08T11:45:00');
      expect(formatRelativeTime(date)).toContain('分鐘前');
    });

    it('應該顯示小時數當時間在 1-23 小時之間', () => {
      const date = new Date('2026-01-08T10:00:00');
      expect(formatRelativeTime(date)).toContain('小時前');
    });

    it('應該顯示「昨天」當日期是昨天', () => {
      const date = new Date('2026-01-07T12:00:00');
      expect(formatRelativeTime(date)).toBe('昨天');
    });
  });

  describe('formatDuration()', () => {
    it('應該格式化秒數為 MM:SS', () => {
      expect(formatDuration(90)).toBe('1:30');
    });

    it('應該格式化秒數為 HH:MM:SS', () => {
      expect(formatDuration(3665)).toBe('1:01:05');
    });

    it('應該正確處理 0 秒', () => {
      expect(formatDuration(0)).toBe('0:00');
    });

    it('應該正確補零', () => {
      expect(formatDuration(125)).toBe('2:05');
    });
  });

  describe('isToday()', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2026-01-08T12:00:00'));
    });

    it('應該正確判斷今天的日期', () => {
      expect(isToday('2026-01-08')).toBe(true);
      expect(isToday('2026-01-07')).toBe(false);
      expect(isToday('2026-01-09')).toBe(false);
    });
  });

  describe('addDays()', () => {
    it('應該正確加上天數', () => {
      const result = addDays('2026-01-08', 5);

      expect(result).toStrictEqual(new Date('2026-01-13'));
    });

    it('應該正確處理跨月份', () => {
      const result = addDays('2026-01-28', 5);
      expect(result).toStrictEqual(new Date('2026-02-02'));
    });
  });

  describe('subtractDays()', () => {
    it('應該正確減去天數', () => {
      const result = subtractDays('2026-01-08', 3);
      expect(result).toStrictEqual(new Date('2026-01-05'));
    });

    it('應該正確處理跨月份', () => {
      const result = subtractDays('2026-01-02', 3);
      expect(result).toStrictEqual(new Date('2025-12-30'));
    });
  });

  describe('getWeekStart() 和 getWeekEnd()', () => {
    it('應該獲取週的開始和結束日期', () => {
      // 2026-01-08 是星期四
      const start = getWeekStart('2026-01-08');
      const end = getWeekEnd('2026-01-08');

      expect(formatDate(start)).toBe('2026-01-05'); // 星期一（週開始）
      expect(formatDate(end)).toBe('2026-01-11'); // 星期日（週結束）
    });
  });

  describe('getMonthStart() 和 getMonthEnd()', () => {
    it('應該獲取月份的開始和結束日期', () => {
      const start = getMonthStart('2026-01-15');
      const end = getMonthEnd('2026-01-15');

      expect(formatDate(start)).toBe('2026-01-01');
      expect(formatDate(end)).toBe('2026-01-31');
    });

    it('應該正確處理二月', () => {
      const end = getMonthEnd('2026-02-15');
      expect(formatDate(end)).toBe('2026-02-28');
    });
  });
});
