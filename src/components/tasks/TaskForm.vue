<template>
  <div class="column full-height">
    <!-- Title -->
    <q-item class="q-px-none q-mb-sm">
      <q-item-section>
        <q-input
          v-model="formData.title"
          label="title"
          placeholder="Task Title"
          class="text-h6"
          dense
          autofocus
          :rules="[(val) => (val && val.length > 0) || 'Please enter a title']"
        />
      </q-item-section>
    </q-item>

    <!-- Meta Row: Note, Category, Add Subtask -->
    <div class="row q-col-gutter-sm q-mb-sm">
      <!-- Note Input -->
      <div class="col-grow">
        <q-input
          type="textarea"
          v-model="formData.note"
          placeholder="備註"
          dense
          borderless
          class="text-body2 text-grey-8 bg-grey-1 rounded-borders q-px-sm"
        >
          <template v-slot:prepend>
            <q-icon name="notes" size="xs" color="grey-6" />
          </template>
        </q-input>
      </div>

      <!-- Category Select -->
      <div class="col-auto" style="min-width: 120px">
        <q-select
          v-model="formData.category"
          :options="categoryOptions"
          label="分類"
          dense
          borderless
          emit-value
          map-options
          options-dense
          class="text-body2 bg-grey-1 rounded-borders q-px-sm"
          behavior="menu"
        >
          <template v-slot:prepend>
            <q-icon name="folder_open" size="xs" color="grey-6" />
          </template>
        </q-select>
      </div>
    </div>

    <q-separator class="q-my-sm" />

    <!-- Routine Section -->
    <div class="q-py-sm">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2 text-grey-8">週期性設定</div>
        <q-toggle v-model="isRoutine" label="啟用週期性" dense color="primary" size="sm" />
      </div>

      <!-- Routine Options (Disabled if not routine) -->
      <div class="row q-col-gutter-sm">
        <!-- Start Date -->
        <div class="col-4">
          <q-input
            v-model="routineData.startDate"
            label="開始日期"
            dense
            outlined
            :disable="!isRoutine"
            readonly
            class="cursor-pointer"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="routineData.startDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- Frequency -->
        <div class="col-4">
          <q-select
            v-model="routineData.frequency"
            :options="frequencyOptions"
            label="週期"
            dense
            outlined
            :disable="!isRoutine"
            emit-value
            map-options
          />
        </div>

        <!-- Target Count -->
        <div class="col-4">
          <q-input
            v-model.number="routineData.targetCount"
            type="number"
            label="目標/週期"
            dense
            outlined
            :disable="!isRoutine"
            :rules="[(val) => !isRoutine || val > 0 || 'Min 1']"
          />
        </div>
      </div>

      <!-- Routine Info Footer -->
      <div class="row items-center q-mt-xs text-caption text-grey-6 justify-end" v-if="isRoutine">
        <div class="q-mr-md">開始日期: {{ routineData.startDate }}</div>
        <div>下一次重置: {{ nextResetDate }}</div>
      </div>
    </div>

    <!-- Subtasks Section -->
    <!-- Divider shown if subtasks active -->

    <q-separator class="q-my-sm" />
    <div class="row items-center q-mb-sm">
      <div class="text-subtitle2 text-grey-8">子任務</div>
      <div class="col-auto">
        <q-btn
          dense
          flat
          no-caps
          class="rounded-borders q-pa-xs q-mx-xs"
          text-color="primary"
          @click="addSubtask()"
        >
          <q-icon name="playlist_add" size="xs" />
          <div class="text-caption">新增子任務</div>
        </q-btn>
      </div>
    </div>
    <template v-if="formData.subtasks.length > 0">
      <div class="q-py-sm">
        <div class="column q-gutter-y-xs">
          <div
            v-for="(sub, index) in formData.subtasks"
            :key="index"
            class="row items-center q-py-xs"
          >
            <div class="col">
              <q-input
                v-model="sub.title"
                dense
                borderless
                placeholder="子任務具體描述..."
                class="subtask-input"
                @keydown.enter.prevent="addSubtask()"
              />
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              size="sm"
              color="grey-5"
              @click="removeSubtask(index)"
            />
          </div>
        </div>
      </div>
    </template>

    <q-space />

    <!-- Footer Buttons -->
    <div class="row items-center justify-between q-pt-md">
      <TaskPropertyButtons
        v-model:quadrant="formData.quadrant"
        v-model:due-date="formData.dueDate"
        v-model:tags="formData.tags"
      />

      <div class="row q-gutter-x-sm">
        <q-btn label="Cancel" flat color="grey-7" @click="$emit('cancel')" />
        <q-btn :label="submitLabel" color="primary" unelevated @click="submitForm" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { date } from 'quasar';
import type {
  Task,
  EisenhowerQuadrant,
  CreateTaskInput,
  UpdateTaskInput,
  Subtask,
} from 'src/types/task';
import type { RoutineConfig, RoutineFrequency } from 'src/types/routine';
import TaskPropertyButtons from './TaskPropertyButtons.vue';
import { categoryList } from 'src/assets/system/categoryList.json';
import { generateUUID } from 'src/utils/id';

// Props
interface Props {
  initialData?: Partial<Task>;
  mode: 'create' | 'edit';
}
const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  (e: 'submit', data: CreateTaskInput | UpdateTaskInput): void;
  (e: 'cancel'): void;
}>();

// --- Constants ---
const categoryOptions = categoryList.map((c) => ({ label: c.title, value: c.title }));
const frequencyOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

// --- State ---

const formData = ref({
  title: '',
  note: '',
  category: '雜項', // Default category
  subtasks: [] as {
    title: string;
    status: 'todo' | 'done';
    completed: boolean;
    id?: string;
    completedAt?: Date | undefined;
  }[],
  quadrant: null as EisenhowerQuadrant | null,
  tags: [] as string[],
  dueDate: null as string | null,
});

// Routine State
const isRoutine = ref(false);
const routineData = ref({
  startDate: date.formatDate(new Date(), 'YYYY-MM-DD'),
  frequency: 'daily' as RoutineFrequency,
  targetCount: 1,
});

// --- Computed ---
const submitLabel = computed(() => (props.mode === 'create' ? 'Create' : 'Save'));

const nextResetDate = computed(() => {
  if (!routineData.value.startDate) return '-';
  const start = new Date(routineData.value.startDate);
  let next = new Date(start);

  // Logic: Calculate next reset from now? Or from start?
  // Usually 'Next Reset' means the end of the *current* period.
  // If StartDate is Today, and frequency is Daily, NextReset is Tomorrow.
  // If StartDate is Today, and frequency is Weekly, NextReset is +7 days.

  if (routineData.value.frequency === 'daily') {
    next = date.addToDate(next, { days: 1 });
  } else if (routineData.value.frequency === 'weekly') {
    next = date.addToDate(next, { days: 7 });
  } else if (routineData.value.frequency === 'monthly') {
    next = date.addToDate(next, { months: 1 });
  }

  return date.formatDate(next, 'YYYY-MM-DD');
});

// --- Initialization ---
onMounted(() => {
  if (props.initialData) {
    formData.value.title = props.initialData.title || '';
    formData.value.note = props.initialData.note || '';
    formData.value.category = props.initialData.category || '雜項';
    formData.value.quadrant = props.initialData.quadrant || null;
    formData.value.tags = props.initialData.tags || [];
    // Handle Date: Task uses Date object? Or string?
    // Typescript: Task.dueDate is Date | undefined.
    // Prop is Partial<Task>.
    if (props.initialData.dueDate) {
      formData.value.dueDate = date.formatDate(props.initialData.dueDate, 'YYYY-MM-DD HH:mm');
    }

    // Subtasks
    // Task.subtasks has { id, title, status, completed ... }
    if (props.initialData.subtasks) {
      formData.value.subtasks = props.initialData.subtasks.map((s) => ({
        title: s.title,
        status: s.status,
        completed: s.completed,
        id: s.id,
        completedAt: s.completedAt,
      }));
    }

    // Routine
    if (props.initialData.routine) {
      isRoutine.value = props.initialData.routine.enabled;
      routineData.value.frequency = props.initialData.routine.frequency;
      routineData.value.targetCount = props.initialData.routine.targetCount;
      routineData.value.startDate = date.formatDate(
        props.initialData.routine.currentPeriodStart,
        'YYYY-MM-DD',
      );
    }
  }
});

// --- Methods ---
function addSubtask() {
  formData.value.subtasks.push({
    title: '',
    status: 'todo',
    completed: false,
  });
}

function removeSubtask(index: number) {
  formData.value.subtasks.splice(index, 1);
}

function submitForm() {
  // Validate?
  if (!formData.value.title.trim()) return;

  // Build Payload
  const payload: any = {
    title: formData.value.title,
    note: formData.value.note,
    category: formData.value.category,
    tags: formData.value.tags,
    quadrant: formData.value.quadrant,
    subtasks: formData.value.subtasks
      .filter((s) => s.title.trim() !== '') // Filter out empty subtasks
      .map(
        (s): Subtask => ({
          id: s.id || generateUUID(), // Generate ID for new subtasks
          title: s.title,
          status: s.status,
          completed: s.completed,
          completedAt: s.completedAt,
        }),
      ),
  };

  if (formData.value.dueDate) {
    payload.dueDate = new Date(formData.value.dueDate);
  }

  // Routine
  if (isRoutine.value) {
    const routineConfig: RoutineConfig = {
      enabled: true,
      frequency: routineData.value.frequency,
      targetCount: routineData.value.targetCount,
      currentCount: 0, // Reset count or keep? For Edit mode, we might need to preserve if not changing freq.
      // For now, simple implementation.
      currentPeriodStart: new Date(routineData.value.startDate),
      nextResetAt: new Date(nextResetDate.value), // This is a computed string, need to ensure correct Date
      configHistory: [],
    };
    // Simple fix for nextResetAt
    if (props.initialData?.routine && props.mode === 'edit') {
      // If editing, merge? Or overwrite?
      // If frequency changes, reset.
      // If just target count changes, keep current progress?
      routineConfig.currentCount = props.initialData.routine.currentCount;
      routineConfig.configHistory = props.initialData.routine.configHistory;

      // If start date changed or frequency changed, re-calc next reset.
    }

    payload.routine = routineConfig;
  } else {
    // Explicitly set routine to undefined to remove it in edit mode
    payload.routine = undefined;
  }

  emit('submit', payload);
}
</script>

<style scoped lang="scss">
// Custom Styling
.subtask-input {
  :deep(.q-field__native) {
    padding-bottom: 2px;
    border-bottom: 1px solid #ddd;
  }
  :deep(.q-field__control:before) {
    border-bottom: none; // remove default
  }
}
</style>
