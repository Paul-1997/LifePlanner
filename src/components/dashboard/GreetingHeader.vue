<template>
  <div class="row items-center justify-start q-mb-xl">
    <!-- Greeting -->
    <q-btn flat dense round icon="menu" aria-label="toggle menu"  class="q-mr-lg" @click="isDrawerOpen = !isDrawerOpen"/>
    <div>
      <div class="text-h4 text-weight-bold text-primary">Good Evening, Paul 👋</div>
      <div class="text-subtitle1 text-grey-7 q-mt-sm">
        You have <span class="text-weight-bold text-accent">3 priority tasks</span> remaining today.
      </div>
    </div>

    <!-- Add Task Button -->
    <q-btn
      color="primary"
      icon="add"
      label="New Task"
      class="q-ml-auto"
      rounded
      unelevated
      no-caps
    />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

// Logic for greeting time (Morning/Evening) will go here later
const isDrawerOpen = inject('isDrawerOpen');
</script>
