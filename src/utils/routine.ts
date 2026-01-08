/**
 * 週期性任務相關工具函數
 */

import type { RoutineConfig, RoutineFrequency, RoutineConfigChange } from 'src/types/routine';
import type { Task } from 'src/types/task';

/**
 * 根據頻率計算下次重置時間
 */
export function calculateNextResetDate(
  frequency: RoutineFrequency,
  currentPeriodStart: Date = new Date(),
): Date {
  const next = new Date(currentPeriodStart);

  switch (frequency) {
    case 'daily':
      // 隔天 00:00
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      break;

    case 'weekly': {
      // 下週一 00:00
      // getDay(): 0(日), 1(一), ..., 6(六)
      const daysToNextMonday = (1 - next.getDay() + 7) % 7 || 7;
      next.setDate(next.getDate() + daysToNextMonday);
      next.setHours(0, 0, 0, 0);
      break;
    }

    case 'monthly':
      // 下個月 1 號 00:00
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
      break;
  }

  return next;
}

/**
 * 檢查是否需要重置週期
 */
export function shouldResetRoutine(routine: RoutineConfig): boolean {
  return new Date() >= new Date(routine.nextResetAt);
}

/**
 * 重置週期（返回新的配置）
 */
export function resetRoutinePeriod(routine: RoutineConfig): RoutineConfig {
  const now = new Date();

  return {
    ...routine,
    currentCount: 0,
    currentPeriodStart: now,
    nextResetAt: calculateNextResetDate(routine.frequency, now),
  };
}

/**
 * 更新週期性任務的頻率
 * 會立即重新計算重置時間並重置計數
 */
export function updateRoutineFrequency(
  routine: RoutineConfig,
  newFrequency: RoutineFrequency,
  newTargetCount?: number,
): RoutineConfig {
  const now = new Date();

  const configChange: RoutineConfigChange = {
    changedAt: now,
    oldFrequency: routine.frequency,
    newFrequency,
    oldTargetCount: routine.targetCount,
    newTargetCount: newTargetCount ?? routine.targetCount,
  };

  return {
    ...routine,
    frequency: newFrequency,
    targetCount: newTargetCount ?? routine.targetCount,
    currentPeriodStart: now,
    nextResetAt: calculateNextResetDate(newFrequency, now),
    currentCount: 0, // 重置計數避免邏輯混亂
    configHistory: [...routine.configHistory, configChange],
  };
}

/**
 * 將一般任務轉換為週期性任務
 */
export function convertToRoutine(
  task: Task,
  frequency: RoutineFrequency,
  targetCount: number,
): Task {
  const now = new Date();

  // 重置子任務狀態（移除可選屬性而非設為 undefined）
  const resetSubtasks = task.subtasks?.map((sub) => {
    const { completedAt, ...rest } = sub;
    return {
      ...rest,
      status: 'todo' as const,
    };
  });

  // 移除 completedAt（而非設為 undefined）
  const { completedAt, ...taskWithoutCompletedAt } = task;

  const result: Task = {
    ...taskWithoutCompletedAt,
    status: 'todo',
    routine: {
      enabled: true,
      frequency,
      targetCount,
      currentCount: 0,
      currentPeriodStart: now,
      nextResetAt: calculateNextResetDate(frequency, now),
      configHistory: [
        {
          changedAt: now,
          newFrequency: frequency,
          newTargetCount: targetCount,
        },
      ],
    },
    changeLog: [
      ...task.changeLog,
      {
        timestamp: now,
        changeType: 'converted-to-routine',
        details: `轉換為週期性任務：${frequency}，目標 ${targetCount} 次`,
      },
    ],
    updatedAt: now,
  };

  // 只在有子任務時才設置 subtasks
  if (resetSubtasks) {
    result.subtasks = resetSubtasks;
  }

  return result;
}

/**
 * 將週期性任務轉換為一般任務
 * 歷史記錄會保留在 Store 中
 */
export function convertFromRoutine(task: Task, checkInCount = 0): Task {
  const now = new Date();

  // 移除 routine 屬性（而非設為 undefined）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { routine, ...taskWithoutRoutine } = task;

  return {
    ...taskWithoutRoutine,
    changeLog: [
      ...task.changeLog,
      {
        timestamp: now,
        changeType: 'converted-from-routine',
        details: `轉換為一般任務（歷史記錄已保留：${checkInCount} 筆打卡）`,
      },
    ],
    updatedAt: now,
  };
}

/**
 * 計算週期性任務的進度百分比
 */
export function calculateRoutineProgress(routine: RoutineConfig): number {
  return Math.min((routine.currentCount / routine.targetCount) * 100, 100);
}

/**
 * 判斷週期性任務是否達標
 */
export function isRoutineAchieved(routine: RoutineConfig): boolean {
  return routine.currentCount >= routine.targetCount;
}

/**
 * 格式化週期頻率為中文
 */
export function formatFrequency(frequency: RoutineFrequency): string {
  const map: Record<RoutineFrequency, string> = {
    daily: '每日',
    weekly: '每週',
    monthly: '每月',
  };
  return map[frequency];
}
