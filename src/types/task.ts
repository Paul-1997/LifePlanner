/**
 * 任務相關型別定義
 */

import type { RoutineConfig } from './routine';

/**
 * 任務狀態
 */
export type TaskStatus = 'todo' | 'in-progress' | 'done';

/**
 * 艾森豪矩陣（重要/緊急四象限）
 */
export type EisenhowerQuadrant =
  | 'do-first' // Q1: 重要且緊急 - 立即處理
  | 'schedule' // Q2: 重要不緊急 - 排入日程（最容易拖延）
  | 'delegate' // Q3: 緊急不重要 - 委派他人
  | 'eliminate'; // Q4: 不重要不緊急 - 考慮刪除

/**
 * 任務變更類型
 */
export type TaskChangeType =
  | 'created'
  | 'converted-to-routine'
  | 'converted-from-routine'
  | 'frequency-changed'
  | 'status-changed'
  | 'updated';

/**
 * 任務變更日誌
 */
export interface TaskChangeLog {
  timestamp: Date;
  changeType: TaskChangeType;
  details: string;
}

export interface Subtask {
  id: string;
  title: string;
  status: 'todo' | 'done';
  completed: boolean;
  completedAt?: Date | undefined;
}

/**
 * 任務（核心資料模型）
 */
export interface Task {
  id: string;
  title: string;
  note?: string | undefined;
  status: TaskStatus;
  completed: boolean;
  quadrant?: EisenhowerQuadrant | undefined;
  category?: string | undefined; // 例如：工作、學習、運動、生活
  tags?: string[] | undefined;

  // === 時間 ===
  dueDate?: Date | undefined; // 截止日期
  reminderAt?: Date | undefined; // 提醒時間
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | undefined;

  // === 週期性任務配置 ===
  routine?: RoutineConfig | undefined;

  // === 階層結構 ===
  subtasks?: Subtask[] | undefined;
  order?: number | undefined;

  // === 變更日誌 ===
  changeLog: TaskChangeLog[];

  // === 整合（未來擴展）===
  googleCalendarEventId?: string | undefined; // Google Calendar 事件 ID

  // === Firebase 用（雲端同步時需要）===
  userId?: string | undefined; // 所屬用戶 ID
}

/**
 * 建立任務的參數（省略自動生成的欄位）
 */
export type CreateTaskInput = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'changeLog' | 'subtasks'
> & {
  subtasks?: { title: string; status?: 'todo' | 'done' }[];
};

/**
 * 更新任務的參數（所有欄位可選）
 */
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>;
