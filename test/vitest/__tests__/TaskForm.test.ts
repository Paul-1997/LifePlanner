import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { Quasar } from 'quasar';
import TaskForm from 'src/components/tasks/TaskForm.vue';

// Mock categoryList
vi.mock('src/assets/system/categoryList.json', () => ({
  categoryList: [
    { title: '工作', color: '#3B82F6' },
    { title: '學習', color: '#F59E0B' },
    { title: '生活', color: '#10B981' },
    { title: '雜項', color: '#6B7280' },
  ],
}));

// Mock generateUUID
vi.mock('src/utils/id', () => ({
  generateUUID: vi.fn(() => `test-uuid-${Math.random().toString(36).substr(2, 9)}`),
}));

describe('TaskForm.vue', () => {
  let wrapper: VueWrapper<any>;

  const mountComponent = (props: Record<string, any> = {}) => {
    return mount(TaskForm, {
      props: {
        mode: 'create',
        ...props,
      },
      global: {
        plugins: [Quasar, createPinia()],
        stubs: {
          TaskPropertyButtons: true,
        },
      },
    });
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Initialization', () => {
    it('should initialize with empty form in create mode', () => {
      wrapper = mountComponent({ mode: 'create' });

      const vm = wrapper.vm as any;
      expect(vm.formData.title).toBe('');
      expect(vm.formData.note).toBe('');
      expect(vm.formData.subtasks).toEqual([]);
      expect(vm.isRoutine).toBe(false);
    });

    it('should populate form data from initialData in edit mode', async () => {
      const initialData = {
        title: 'Test Task',
        note: 'Test Note',
        category: '工作',
        tags: ['tag1', 'tag2'],
        subtasks: [{ id: 'sub-1', title: 'Subtask 1', status: 'todo' as const, completed: false }],
      };

      wrapper = mountComponent({
        mode: 'edit',
        initialData,
      });

      // Wait for onMounted to complete
      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      expect(vm.formData.title).toBe('Test Task');
      expect(vm.formData.note).toBe('Test Note');
      expect(vm.formData.category).toBe('工作');
      expect(vm.formData.tags).toEqual(['tag1', 'tag2']);
      expect(vm.formData.subtasks.length).toBe(1);
      expect(vm.formData.subtasks[0].id).toBe('sub-1');
    });

    it('should initialize routine data from initialData', async () => {
      const initialData = {
        title: 'Routine Task',
        routine: {
          enabled: true,
          frequency: 'weekly' as const,
          targetCount: 3,
          currentCount: 1,
          currentPeriodStart: new Date('2026-01-15'),
          nextResetAt: new Date('2026-01-22'),
          configHistory: [],
        },
      };

      wrapper = mountComponent({
        mode: 'edit',
        initialData,
      });

      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      expect(vm.isRoutine).toBe(true);
      expect(vm.routineData.frequency).toBe('weekly');
      expect(vm.routineData.targetCount).toBe(3);
    });
  });

  describe('Subtask Management', () => {
    it('addSubtask should add a new subtask with default values', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      expect(vm.formData.subtasks.length).toBe(0);

      vm.addSubtask();

      expect(vm.formData.subtasks.length).toBe(1);
      expect(vm.formData.subtasks[0].title).toBe('');
      expect(vm.formData.subtasks[0].status).toBe('todo');
      expect(vm.formData.subtasks[0].completed).toBe(false);
    });

    it('removeSubtask should remove subtask at given index', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      vm.addSubtask();
      vm.addSubtask();
      vm.formData.subtasks[0].title = 'First';
      vm.formData.subtasks[1].title = 'Second';

      expect(vm.formData.subtasks.length).toBe(2);

      vm.removeSubtask(0);

      expect(vm.formData.subtasks.length).toBe(1);
      expect(vm.formData.subtasks[0].title).toBe('Second');
    });
  });

  describe('Submit Form', () => {
    it('should emit submit event with correct payload in create mode', async () => {
      wrapper = mountComponent({ mode: 'create' });
      const vm = wrapper.vm as any;

      vm.formData.title = 'New Task';
      vm.formData.note = 'Some note';
      vm.formData.category = '工作';

      vm.submitForm();

      expect(wrapper.emitted('submit')).toBeTruthy();
      const emittedPayload = wrapper.emitted('submit')![0][0] as any;
      expect(emittedPayload.title).toBe('New Task');
      expect(emittedPayload.note).toBe('Some note');
      expect(emittedPayload.category).toBe('工作');
    });

    it('should not submit if title is empty', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      vm.formData.title = '   '; // whitespace only

      vm.submitForm();

      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should generate ID for new subtasks on submit', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      vm.formData.title = 'Task with New Subtask';
      vm.addSubtask();
      vm.formData.subtasks[0].title = 'New Subtask Without ID';

      expect(vm.formData.subtasks[0].id).toBeUndefined();

      vm.submitForm();

      const emittedPayload = wrapper.emitted('submit')![0][0] as any;
      expect(emittedPayload.subtasks[0].id).toBeDefined();
      expect(emittedPayload.subtasks[0].id).toContain('test-uuid');
    });

    it('should preserve existing subtask ID on submit in edit mode', async () => {
      const initialData = {
        title: 'Edit Task',
        subtasks: [
          {
            id: 'existing-id-123',
            title: 'Existing Subtask',
            status: 'todo' as const,
            completed: false,
          },
        ],
      };

      wrapper = mountComponent({ mode: 'edit', initialData });
      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      vm.formData.subtasks[0].title = 'Modified Title';

      vm.submitForm();

      const emittedPayload = wrapper.emitted('submit')![0][0] as any;
      expect(emittedPayload.subtasks[0].id).toBe('existing-id-123');
    });

    it('should filter out empty subtasks on submit', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      vm.formData.title = 'Task';
      vm.addSubtask();
      vm.addSubtask();
      vm.formData.subtasks[0].title = 'Valid Subtask';
      vm.formData.subtasks[1].title = '   '; // empty

      vm.submitForm();

      const emittedPayload = wrapper.emitted('submit')![0][0] as any;
      expect(emittedPayload.subtasks.length).toBe(1);
      expect(emittedPayload.subtasks[0].title).toBe('Valid Subtask');
    });

    it('should include routine config when isRoutine is true', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      vm.formData.title = 'Routine Task';
      vm.isRoutine = true;
      vm.routineData.frequency = 'weekly';
      vm.routineData.targetCount = 5;

      vm.submitForm();

      const emittedPayload = wrapper.emitted('submit')![0][0] as any;
      expect(emittedPayload.routine).toBeDefined();
      expect(emittedPayload.routine.enabled).toBe(true);
      expect(emittedPayload.routine.frequency).toBe('weekly');
      expect(emittedPayload.routine.targetCount).toBe(5);
    });

    it('should set routine to undefined when isRoutine is false', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      vm.formData.title = 'Non-Routine Task';
      vm.isRoutine = false;

      vm.submitForm();

      const emittedPayload = wrapper.emitted('submit')![0][0] as any;
      expect(emittedPayload.routine).toBeUndefined();
    });
  });

  describe('Computed Properties', () => {
    it('submitLabel should return Create in create mode', () => {
      wrapper = mountComponent({ mode: 'create' });
      const vm = wrapper.vm as any;
      expect(vm.submitLabel).toBe('Create');
    });

    it('submitLabel should return Save in edit mode', () => {
      wrapper = mountComponent({ mode: 'edit' });
      const vm = wrapper.vm as any;
      expect(vm.submitLabel).toBe('Save');
    });

    it('nextResetDate should calculate correctly for daily', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      vm.routineData.startDate = '2026-01-20';
      vm.routineData.frequency = 'daily';

      expect(vm.nextResetDate).toBe('2026-01-21');
    });

    it('nextResetDate should calculate correctly for weekly', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      vm.routineData.startDate = '2026-01-20';
      vm.routineData.frequency = 'weekly';

      expect(vm.nextResetDate).toBe('2026-01-27');
    });

    it('nextResetDate should calculate correctly for monthly', () => {
      wrapper = mountComponent();
      const vm = wrapper.vm as any;

      vm.routineData.startDate = '2026-01-20';
      vm.routineData.frequency = 'monthly';

      expect(vm.nextResetDate).toBe('2026-02-20');
    });
  });

  describe('Cancel Action', () => {
    it('should emit cancel event when cancel button is clicked', async () => {
      wrapper = mountComponent();

      await wrapper.find('button[class*="grey-7"]').trigger('click');

      expect(wrapper.emitted('cancel')).toBeTruthy();
    });
  });
});
