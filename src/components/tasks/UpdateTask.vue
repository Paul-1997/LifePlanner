<template>
  <q-card class="column full-height" style="max-width: 800px; width: 100%">
    <q-card-section class="scroll col q-pt-md">
      <TaskForm mode="create" @submit="handleSubmit" @cancel="$emit('cancel')" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import useTaskStore from 'src/stores/task';
import type { CreateTaskInput, UpdateTaskInput } from 'src/types/task';
import TaskForm from './TaskForm.vue';

const { addTask } = useTaskStore();
const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

function handleSubmit(data: CreateTaskInput | UpdateTaskInput) {
  // Force cast to CreateTaskInput as we are in create mode
  const taskId = addTask(data as CreateTaskInput);
  if (taskId) {
    emit('cancel');
  }
}
</script>

<style scoped lang="scss">
.q-card {
  border-radius: 12px;
}
</style>
