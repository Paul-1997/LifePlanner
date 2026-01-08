/**
 * 專注模式相關型別定義
 */

/**
 * 專注類型
 */
export type FocusType =
  | 'pomodoro-25' // 標準番茄鐘 25 分鐘
  | 'pomodoro-45' // 長番茄鐘 45 分鐘
  | 'custom'; // 自訂時長

/**
 * 專注記錄（獨立存儲）
 */
export interface FocusSession {
  id: string;
  taskId: string | null; // 可以綁定任務，也可以不綁定（純專注）
  startAt: Date; // 開始時間
  endAt?: Date; // 結束時間（可能還在進行中）
  duration: number; // 持續時間（秒）
  type: FocusType;
  interrupted: boolean; // 是否被中斷
  note?: string; // 備註

  // Firebase 用
  userId?: string;
}

/**
 * 建立專注記錄的參數
 */
export type CreateFocusSessionInput = Omit<FocusSession, 'id' | 'startAt' | 'duration'>;

/**
 * 專注狀態（用於 UI 顯示當前計時器）
 */
export interface FocusState {
  isActive: boolean; // 是否正在專注
  currentSession: FocusSession | null;
  remainingSeconds: number; // 剩餘秒數
  isPaused: boolean; // 是否暫停
}
