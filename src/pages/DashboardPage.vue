<template>
  <q-page class="q-pa-lg">
    <!-- Header Section -->
    <GreetingHeader />

    <!-- Main Grid Layout -->
    <div class="row q-col-gutter-xl">
      
      <!-- Left Column: Routines (40%) -->
      <div class="col-12 col-md-5 col-lg-4">
        <RoutineList />
      </div>

      <!-- Right Column: Priority Tasks (60%) -->
      <div class="col-12 col-md-7 col-lg-8">
        <PriorityTaskList />
      </div>
    </div>

    <!-- Floating Focus Widget -->
    <FocusFloatingWidget />
  </q-page>
</template>

<script setup lang="ts">
import GreetingHeader from 'components/dashboard/GreetingHeader.vue';
import RoutineList from 'components/dashboard/RoutineList.vue';
import PriorityTaskList from 'components/dashboard/PriorityTaskList.vue';
import FocusFloatingWidget from 'components/dashboard/FocusFloatingWidget.vue';
</script>
