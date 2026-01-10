import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import useTaskStore from 'src/stores/task';
import type { Task } from 'src/types/task';

const testTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'todo',
  quadrant: 'schedule',
  order: 0,
  changeLog: [],
};

describe('Task Store', () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
  });
  it('should add a task', () => {
    const taskStore = useTaskStore();
    taskStore.addTask(testTask);
    expect(taskStore.tasks.length).toBe(1);
  });
});
