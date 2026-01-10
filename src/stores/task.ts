import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from 'src/types/task';
import type { RoutineCheckIn, CreateCheckInInput } from 'src/types/routine';
import type { FocusSession, CreateFocusSessionInput } from 'src/types/focus';
import { generateUUID } from 'src/utils/id';
import { formatDate } from 'src/utils/date';

const useTaskStore = defineStore('task', () => {
  // ===== State =====
  const tasks = ref<Task[]>([]);
  const routineCheckIns = ref<RoutineCheckIn[]>([]);
  const focusSessions = ref<FocusSession[]>([]);

  // ===== Getters（多個頁面使用，格式一致）=====

  /**
   * 所有未完成任務（HomePage, TasksPage 都會用）
   */
  const activeTasks = computed(() => {
    return tasks.value.filter((task) => task.status !== 'done');
  });

  /**
   * 所有已完成任務（TasksPage Tab 3, 統計頁會用）
   */
  const completedTasks = computed(() => {
    return tasks.value.filter((task) => task.status === 'done');
  });

  /**
   * 一般任務（非週期性）（HomePage, TasksPage Tab 1 都會用）
   */
  const generalTasks = computed(() => {
    return activeTasks.value.filter((task) => !task.routine);
  });

  /**
   * 週期性任務（習慣）（HomePage, TasksPage Tab 2 都會用）
   */
  const routineTasks = computed(() => {
    return tasks.value.filter((task) => task.routine !== undefined);
  });

  /**
   * 當前聚焦任務（order 最小的未完成一般任務）（HomePage 會用）
   */
  const currentTask = computed(() => {
    return generalTasks.value.sort((a, b) => a.order - b.order)[0] || null;
  });

  /**
   * 今天到期的一般任務（HomePage 會用）
   */
  const todayTasks = computed(() => {
    const today = formatDate(new Date());
    return generalTasks.value.filter((task) => task.dueDate && formatDate(task.dueDate) === today);
  });

  /**
   * 今日專注記錄（HomePage, FocusDrawer 都會用）
   */
  const todayFocusSessions = computed(() => {
    const today = formatDate(new Date());
    return focusSessions.value.filter((session) => formatDate(session.startAt) === today);
  });

  // ===== Methods（查詢方法）=====

  /**
   * 根據 ID 獲取任務
   */
  const getTaskById = (id: string): Task | undefined => {
    return tasks.value.find((task) => task.id === id);
  };

  /**
   * 獲取任務的打卡記錄（TasksPage Tab 2 習慣詳情會用）
   */
  const getCheckInsByTaskId = (taskId: string): RoutineCheckIn[] => {
    return routineCheckIns.value.filter((checkIn) => checkIn.taskId === taskId);
  };

  // ===== Actions（任務 CRUD）=====

  /**
   * 新增任務
   */
  const addTask = (input: CreateTaskInput): string => {
    const { now, id } = generateDateAndUUID();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { subtasks, ...restInput } = input;

    const newTask: Task = {
      ...restInput,
      id,
      createdAt: now,
      updatedAt: now,
      changeLog: [
        {
          timestamp: now,
          changeType: 'created',
          details: '任務建立',
        },
      ],
    };

    tasks.value.push(newTask);
    return id;
  };

  /**
   * 更新任務
   */
  const updateTask = (id: string, updates: UpdateTaskInput): void => {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return;

    const { now } = generateDateAndUUID();
    Object.assign(task, updates, {
      updatedAt: now,
      changeLog: [
        ...task.changeLog,
        {
          timestamp: now,
          changeType: 'updated',
          details: '任務更新',
        },
      ],
    });
  };

  /**
   * 刪除任務
   */
  const deleteTask = (id: string): void => {
    tasks.value = tasks.value.filter((task) => task.id !== id);
    // 同時刪除相關的打卡記錄
    routineCheckIns.value = routineCheckIns.value.filter((c) => c.taskId !== id);
    // 同時刪除相關的專注記錄
    focusSessions.value = focusSessions.value.filter((s) => s.taskId !== id);
  };

  /**
   * 切換任務狀態（todo → in-progress → done → todo）
   */
  const toggleTaskStatus = (id: string): void => {
    const task = tasks.value.find((t) => t.id === id);
    if (!task || task.routine) return; // 週期性任務不能切換狀態

    const now = new Date();
    const statusMap: Record<TaskStatus, TaskStatus> = {
      todo: 'in-progress',
      'in-progress': 'done',
      done: 'todo',
    };

    task.status = statusMap[task.status];
    task.updatedAt = now;

    // 設置完成時間
    if (task.status === 'done') {
      task.completedAt = now;
    } else if (task.completedAt !== undefined) {
      delete task.completedAt;
    }

    task.changeLog.push({
      timestamp: now,
      changeType: 'status-changed',
      details: `狀態變更為 ${task.status}`,
    });
  };

  // ===== Actions（週期性任務）=====

  /**
   * 打卡（週期性任務）
   */
  const checkInRoutine = (input: Omit<CreateCheckInInput, 'periodStart' | 'periodEnd'>): string => {
    const task = tasks.value.find((t) => t.id === input.taskId);
    if (!task || !task.routine) {
      throw new Error('任務不存在或不是週期性任務');
    }

    const { now, id } = generateDateAndUUID();

    const checkIn: RoutineCheckIn = {
      ...input,
      id,
      checkedAt: now,
      periodStart: task.routine.currentPeriodStart,
      periodEnd: task.routine.nextResetAt,
    };

    routineCheckIns.value.push(checkIn);

    // 更新任務的當前完成次數
    task.routine.currentCount++;
    task.updatedAt = now;

    return id;
  };

  // ===== Actions（專注記錄）=====

  /**
   * 開始專注
   */
  const startFocusSession = (input: CreateFocusSessionInput): string => {
    const { now, id } = generateDateAndUUID();

    const session: FocusSession = {
      ...input,
      id,
      startAt: now,
      duration: 0,
    };

    focusSessions.value.push(session);
    return id;
  };

  /**
   * 結束專注
   */
  const endFocusSession = (id: string, interrupted: boolean = false): void => {
    const session = focusSessions.value.find((s) => s.id === id);
    if (!session) return;

    const { now } = generateDateAndUUID();
    session.endAt = now;
    session.duration = Math.floor((now.getTime() - session.startAt.getTime()) / 1000);
    session.interrupted = interrupted;
  };

  // ===== Return =====
  return {
    // State
    tasks,
    routineCheckIns,
    focusSessions,

    // Getters（多頁面使用）
    activeTasks,
    completedTasks,
    generalTasks,
    routineTasks,
    currentTask,
    todayTasks,
    todayFocusSessions,

    // Methods（查詢）
    getTaskById,
    getCheckInsByTaskId,

    // Actions（CRUD）
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,

    // Actions（週期性任務）
    checkInRoutine,

    // Actions（專注記錄）
    startFocusSession,
    endFocusSession,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot));
}

export default useTaskStore;
// 生成當前時間和唯一 ID
function generateDateAndUUID(): { now: Date; id: string } {
  const now = new Date();
  const id = generateUUID();
  return { now, id };
}
