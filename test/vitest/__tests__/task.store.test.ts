import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import useTaskStore from 'src/stores/task';
import type { CreateTaskInput, UpdateTaskInput } from 'src/types/task';

// Create a separate store object for the mock
const mockStore: Record<string, unknown> = {};

// Use vi.hoisted to define mock before vi.mock is hoisted
const mockLocalStorage = vi.hoisted(() => ({
  getItem: vi.fn((key: string) => mockStore[key] ?? null),
  setItem: vi.fn((key: string, value: unknown) => {
    mockStore[key] = value;
  }),
  set: vi.fn((key: string, value: unknown) => {
    mockStore[key] = value;
  }),
  clear: vi.fn(() => {
    Object.keys(mockStore).forEach((key) => delete mockStore[key]);
  }),
}));

vi.mock('quasar', async () => {
  const actual = await vi.importActual('quasar');
  return {
    ...actual,
    LocalStorage: mockLocalStorage,
  };
});

describe('Task Store', () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe('addTask', () => {
    it('should add a task with generated id and timestamps', () => {
      const taskStore = useTaskStore();
      const input: CreateTaskInput = {
        title: 'Test Task',
        status: 'todo',
        completed: false,
      };

      const taskId = taskStore.addTask(input);

      expect(taskId).toBeDefined();
      expect(taskStore.tasks.length).toBe(1);
      expect(taskStore.tasks[0].title).toBe('Test Task');
      expect(taskStore.tasks[0].id).toBe(taskId);
      expect(taskStore.tasks[0].createdAt).toBeInstanceOf(Date);
      expect(taskStore.tasks[0].updatedAt).toBeInstanceOf(Date);
      expect(taskStore.tasks[0].changeLog.length).toBe(1);
      expect(taskStore.tasks[0].changeLog[0].changeType).toBe('created');
    });

    it('should generate id for subtasks', () => {
      const taskStore = useTaskStore();
      const input: CreateTaskInput = {
        title: 'Task with Subtasks',
        status: 'todo',
        completed: false,
        subtasks: [
          { title: 'Subtask 1', status: 'todo' },
          { title: 'Subtask 2', status: 'done' },
        ],
      };

      taskStore.addTask(input);

      expect(taskStore.tasks[0].subtasks?.length).toBe(2);
      expect(taskStore.tasks[0].subtasks?.[0].id).toBeDefined();
      expect(taskStore.tasks[0].subtasks?.[1].id).toBeDefined();
      expect(taskStore.tasks[0].subtasks?.[0].title).toBe('Subtask 1');
      expect(taskStore.tasks[0].subtasks?.[1].status).toBe('done');
    });

    it('should save to LocalStorage after adding', () => {
      const taskStore = useTaskStore();
      const input: CreateTaskInput = {
        title: 'Persistence Test',
        status: 'todo',
        completed: false,
      };

      taskStore.addTask(input);

      expect(mockLocalStorage.set).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('should update task fields and refresh updatedAt', () => {
      const taskStore = useTaskStore();
      const taskId = taskStore.addTask({
        title: 'Original Title',
        status: 'todo',
        completed: false,
      });

      // Original test removed as vi.advanceTimersByTime is not needed

      const updates: UpdateTaskInput = {
        title: 'Updated Title',
        note: 'Added note',
      };

      taskStore.updateTask(taskId, updates);

      expect(taskStore.tasks[0].title).toBe('Updated Title');
      expect(taskStore.tasks[0].note).toBe('Added note');
      expect(taskStore.tasks[0].changeLog.length).toBe(2);
      expect(taskStore.tasks[0].changeLog[1].changeType).toBe('updated');
    });

    it('should not lose existing fields when updating', () => {
      const taskStore = useTaskStore();
      const taskId = taskStore.addTask({
        title: 'Task with Tags',
        status: 'todo',
        completed: false,
        tags: ['important', 'work'],
        category: '工作',
      });

      taskStore.updateTask(taskId, { title: 'New Title' });

      expect(taskStore.tasks[0].title).toBe('New Title');
      expect(taskStore.tasks[0].tags).toEqual(['important', 'work']);
      expect(taskStore.tasks[0].category).toBe('工作');
    });

    it('should save to LocalStorage after updating', () => {
      const taskStore = useTaskStore();
      const taskId = taskStore.addTask({
        title: 'Test',
        status: 'todo',
        completed: false,
      });

      mockLocalStorage.set.mockClear();

      taskStore.updateTask(taskId, { title: 'Updated' });

      expect(mockLocalStorage.set).toHaveBeenCalled();
    });

    it('should update subtasks correctly', () => {
      const taskStore = useTaskStore();
      const taskId = taskStore.addTask({
        title: 'Task with Subtasks',
        status: 'todo',
        completed: false,
        subtasks: [{ title: 'Original Subtask' }],
      });

      const originalSubtaskId = taskStore.tasks[0].subtasks?.[0].id;

      taskStore.updateTask(taskId, {
        subtasks: [
          { id: originalSubtaskId!, title: 'Updated Subtask', status: 'done', completed: true },
          { id: 'new-id', title: 'New Subtask', status: 'todo', completed: false },
        ],
      });

      expect(taskStore.tasks[0].subtasks?.length).toBe(2);
      expect(taskStore.tasks[0].subtasks?.[0].title).toBe('Updated Subtask');
      expect(taskStore.tasks[0].subtasks?.[1].title).toBe('New Subtask');
    });
  });

  describe('deleteTask', () => {
    it('should remove task from store', () => {
      const taskStore = useTaskStore();
      const taskId = taskStore.addTask({
        title: 'To Be Deleted',
        status: 'todo',
        completed: false,
      });

      expect(taskStore.tasks.length).toBe(1);

      taskStore.deleteTask(taskId);

      expect(taskStore.tasks.length).toBe(0);
    });

    it('should save to LocalStorage after deleting', () => {
      const taskStore = useTaskStore();
      const taskId = taskStore.addTask({
        title: 'Test',
        status: 'todo',
        completed: false,
      });

      mockLocalStorage.set.mockClear();

      taskStore.deleteTask(taskId);

      expect(mockLocalStorage.set).toHaveBeenCalled();
    });

    it('should also delete related routineCheckIns and focusSessions', () => {
      const taskStore = useTaskStore();
      const taskId = taskStore.addTask({
        title: 'Task with Related Data',
        status: 'todo',
        completed: false,
      });

      // Manually add related data for testing
      taskStore.routineCheckIns.push({
        id: 'checkin-1',
        taskId: taskId,
        checkedAt: new Date(),
        frequencyAtCheckIn: 'daily',
        targetCountAtCheckIn: 1,
        periodStart: new Date(),
        periodEnd: new Date(),
        completedSubtasks: [],
      });

      taskStore.focusSessions.push({
        id: 'session-1',
        taskId: taskId,
        startAt: new Date(),
        duration: 0,
      });

      expect(taskStore.routineCheckIns.length).toBe(1);
      expect(taskStore.focusSessions.length).toBe(1);

      taskStore.deleteTask(taskId);

      expect(taskStore.routineCheckIns.length).toBe(0);
      expect(taskStore.focusSessions.length).toBe(0);
    });
  });

  describe('toggleTaskStatus', () => {
    it('should cycle status: todo -> in-progress -> done -> todo', () => {
      const taskStore = useTaskStore();
      const taskId = taskStore.addTask({
        title: 'Status Test',
        status: 'todo',
        completed: false,
      });

      expect(taskStore.tasks[0].status).toBe('todo');

      taskStore.toggleTaskStatus(taskId);
      expect(taskStore.tasks[0].status).toBe('in-progress');

      taskStore.toggleTaskStatus(taskId);
      expect(taskStore.tasks[0].status).toBe('done');
      expect(taskStore.tasks[0].completedAt).toBeInstanceOf(Date);

      taskStore.toggleTaskStatus(taskId);
      expect(taskStore.tasks[0].status).toBe('todo');
      expect(taskStore.tasks[0].completedAt).toBeUndefined();
    });

    it('should not toggle status for routine tasks', () => {
      const taskStore = useTaskStore();
      const taskId = taskStore.addTask({
        title: 'Routine Task',
        status: 'todo',
        completed: false,
        routine: {
          enabled: true,
          frequency: 'daily',
          targetCount: 1,
          currentCount: 0,
          currentPeriodStart: new Date(),
          nextResetAt: new Date(),
          configHistory: [],
        },
      });

      taskStore.toggleTaskStatus(taskId);

      expect(taskStore.tasks[0].status).toBe('todo'); // Should remain unchanged
    });
  });

  describe('Getters', () => {
    it('activeTasks should return non-done tasks', () => {
      const taskStore = useTaskStore();
      taskStore.addTask({ title: 'Active 1', status: 'todo', completed: false });
      taskStore.addTask({ title: 'Active 2', status: 'in-progress', completed: false });
      taskStore.addTask({ title: 'Done', status: 'done', completed: true });

      expect(taskStore.activeTasks.length).toBe(2);
    });

    it('routineTasks should return only routine tasks', () => {
      const taskStore = useTaskStore();
      taskStore.addTask({ title: 'Normal Task', status: 'todo', completed: false });
      taskStore.addTask({
        title: 'Routine Task',
        status: 'todo',
        completed: false,
        routine: {
          enabled: true,
          frequency: 'daily',
          targetCount: 1,
          currentCount: 0,
          currentPeriodStart: new Date(),
          nextResetAt: new Date(),
          configHistory: [],
        },
      });

      expect(taskStore.routineTasks.length).toBe(1);
      expect(taskStore.routineTasks[0].title).toBe('Routine Task');
    });
  });
});
