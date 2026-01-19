<template>
  <div class="column q-gutter-y-md">
    <div class="row items-center q-pl-md task__nav">
      <q-tabs
        dense
        rounded
        class="text-grey bg-white"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="todo" label="Todo" />
        <q-tab name="routine" label="Routine" />
      </q-tabs>
      <q-space />
      <q-select
        v-model="selectedCategory"
        :options="categoryOptions"
        label="sort by"
        emit-value
        map-options
        behavior="menu"
        dense
        style="width: 120px"
      >
      </q-select>
    </div>
    <!-- Task Card -->
    <q-card v-for="(task, index) in tasks" :key="task.id" flat class="pointer-events-auto">
      <q-card-section v-if="!isEditTask || editTaskIndex !== index">
        <div class="row items-start justify-between">
          <!-- Priority Tag -->
          <q-badge
            :color="quadrantTheme.find((t) => t.quadrant === task.quadrant)?.color"
            :label="quadrantTheme.find((t) => t.quadrant === task.quadrant)?.label"
            class="q-mb-sm shadow-1"
            rounded
          />
          <div class="row items-center">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="grey-5"
              size="sm"
              @click="handleOnEditMode(index)"
            />
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="grey-5"
              size="sm"
              @click="handleDeleteTask(task.id)"
            />
          </div>
        </div>

        <div class="text-h6 q-mt-xs">
          <q-checkbox v-model="task.completed" />
          {{ task.title }}
        </div>
        <p class="text-body2 text-grey-6 q-mt-xs q-pl-md">{{ task.note }}</p>

        <!-- Meta Info -->
        <div class="row items-center q-mt-md text-caption text-grey-6 q-gutter-x-md">
          <div
            class="row items-center text-body2"
            :style="`color: ${categoryList.find((category) => category.title === task.category)?.color}`"
          >
            <q-icon name="home" class="q-mr-xs" />
            {{ task.category }}
          </div>
          <div class="row items-center text-body2 text-grey-8">
            <q-icon name="event" class="q-mr-xs" v-if="task.dueDate" />
            {{ task.dueDate }}
          </div>
        </div>
      </q-card-section>
      <!-- edit mode -->
      <q-card-section v-else name="edit">
        <TaskForm
          :initial-data="task"
          mode="edit"
          @submit="(data) => handleTaskSubmit(task.id, data)"
          @cancel="cancelEdit"
        />
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import useTaskStore from 'src/stores/task';
import { storeToRefs } from 'pinia';
import TaskForm from './TaskForm.vue';
import { categoryList } from 'src/assets/system/categoryList.json';
import type { CreateTaskInput, UpdateTaskInput } from 'src/types/task';

const taskStore = useTaskStore();
const { tasks } = storeToRefs(taskStore);

const handleTaskSubmit = (taskId: string, data: CreateTaskInput | UpdateTaskInput) => {
  taskStore.updateTask(taskId, data as UpdateTaskInput);
  cancelEdit();
};

const cancelEdit = () => {
  isEditTask.value = false;
  editTaskIndex.value = -1;
};

const handleDeleteTask = (id: string) => {
  taskStore.deleteTask(id);
};
const handleOnEditMode = (index: number) => {
  isEditTask.value = true;
  editTaskIndex.value = index;
};
const isEditTask = ref(false);
const editTaskIndex = ref(-1);

const quadrantTheme = [
  {
    quadrant: 'do-first',
    color: 'negative',
    label: 'Urgent',
  },
  {
    quadrant: 'delegate',
    color: 'warning',
    label: 'High',
  },
  {
    quadrant: 'schedule',
    color: 'info',
    label: 'Normal',
  },
  {
    quadrant: 'eliminate',
    color: 'warning',
    label: 'Low',
  },
];

const selectedCategory = ref('all');
const categoryOptions = ref([
  { label: 'Quadrant', value: 'quadrant' },
  { label: 'Date', value: 'date' },
  { label: 'Default', value: 'default' },
  { label: 'CreatedTime', value: 'createdTime' },
]);
</script>

<style scoped>
.task__nav + * {
  margin-top: 0px;
}
</style>
