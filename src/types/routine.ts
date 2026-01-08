/**
 * 週期性任務相關型別定義
 */

/**
 * 週期頻率
 */
export type RoutineFrequency = 'daily' | 'weekly' | 'monthly';

/**
 * 週期性任務配置
 */
export interface RoutineConfig {
  enabled: boolean;
  frequency: RoutineFrequency;
  targetCount: number; // 目標次數（如每週 2 次）
  currentCount: number; // 本週期已打卡次數
  currentPeriodStart: Date; // 本週期開始時間
  nextResetAt: Date; // 下次重置時間

  // 配置變更歷史
  configHistory: RoutineConfigChange[];
}

/**
 * 週期性任務配置變更記錄
 */
export interface RoutineConfigChange {
  changedAt: Date;
  oldFrequency?: RoutineFrequency;
  newFrequency: RoutineFrequency;
  oldTargetCount?: number;
  newTargetCount: number;
  reason?: string; // 變更原因（可選）
}

/**
 * 週期性任務打卡記錄（獨立存儲）
 */
export interface RoutineCheckIn {
  id: string;
  taskId: string; // 所屬任務 ID
  checkedAt: Date; // 打卡時間

  // 🔑 記錄打卡當時的配置（用於跨頻率統計）
  frequencyAtCheckIn: RoutineFrequency;
  targetCountAtCheckIn: number;
  periodStart: Date; // 所屬週期開始時間
  periodEnd: Date; // 所屬週期結束時間

  // 打卡詳情
  completedSubtasks: string[]; // 完成的子任務 ID 列表
  note?: string; // 打卡備註

  // Firebase 用
  userId?: string;
}

/**
 * 建立打卡記錄的參數
 */
export type CreateCheckInInput = Omit<RoutineCheckIn, 'id' | 'checkedAt'>;

