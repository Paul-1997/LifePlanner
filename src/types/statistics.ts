/**
 * 統計相關型別定義
 */

import type { RoutineFrequency } from './routine';

/**
 * 時間範圍
 */
export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'custom';

/**
 * 自訂時間範圍
 */
export interface CustomTimeRange {
  start: Date;
  end: Date;
}

/**
 * 專注時間統計
 */
export interface FocusTimeStats {
  totalSeconds: number; // 總秒數
  totalHours: number; // 總小時數（格式化）
  sessionCount: number; // 專注次數
  averageMinutes: number; // 平均每次專注時長（分鐘）
  comparedToLastPeriod: {
    // 與上一週期比較
    change: number; // 變化量（秒）
    percentage: number; // 變化百分比
  };
}

/**
 * 任務完成統計
 */
export interface TaskCompletionStats {
  totalTasks: number; // 總任務數
  completedTasks: number; // 完成任務數
  completionRate: number; // 完成率（百分比）
  inProgressTasks: number; // 進行中任務數
  todoTasks: number; // 待辦任務數
}

/**
 * 習慣達標統計
 */
export interface RoutineAchievementStats {
  taskId: string;
  taskTitle: string;
  frequency: RoutineFrequency;
  targetCount: number;
  actualCount: number; // 實際打卡次數
  achievementRate: number; // 達標率（百分比）
  isAchieved: boolean; // 本週期是否達標
  streak: number; // 連續達標週期數
  longestStreak: number; // 最長連續達標紀錄
}

/**
 * 日曆熱力圖資料
 */
export interface HeatmapData {
  date: string; // YYYY-MM-DD 格式
  value: number; // 當天的活躍值（可以是專注時間或打卡次數）
  level: 0 | 1 | 2 | 3 | 4; // 熱力等級（0-4，用於顏色深淺）
}

/**
 * 儀表板統計資料（首頁顯示）
 */
export interface DashboardStats {
  // 本週數據
  thisWeek: {
    focusTime: FocusTimeStats;
    taskCompletion: TaskCompletionStats;
    routineAchievement: RoutineAchievementStats[];
  };

  // 連續紀錄
  streaks: {
    currentStreak: number; // 目前連續天數
    longestStreak: number; // 最長連續紀錄
  };

  // 分類統計（時間分配）
  categoryDistribution: {
    category: string;
    hours: number;
    percentage: number;
  }[];
}

/**
 * 折線圖資料點
 */
export interface LineChartDataPoint {
  date: string; // 日期標籤
  value: number; // 數值
}

/**
 * 折線圖資料集
 */
export interface LineChartData {
  label: string; // 資料集名稱
  data: LineChartDataPoint[];
  color?: string; // 線條顏色
}

/**
 * 條形圖資料
 */
export interface BarChartData {
  label: string; // 標籤
  value: number; // 數值
  target?: number; // 目標值（可選）
  color?: string; // 顏色
}
