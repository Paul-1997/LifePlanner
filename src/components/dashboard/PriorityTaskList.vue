<template>
  <div class="column q-gutter-y-md">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-h6 text-primary">Priority Tasks</div>
      <q-btn flat dense color="primary" label="View All" icon-right="arrow_forward" to="/tasks" />
    </div>

    <!-- Task Card -->
    <q-card v-for="task in tasks" :key="task.id" flat class="q-pa-sm pointer-events-auto">
      <q-card-section>
        <div class="row items-start justify-between">
          <!-- Priority Tag -->
          <q-badge 
            :color="task.urgent ? 'negative' : 'warning'" 
            :label="task.urgent ? 'URGENT' : 'HIGH'"
            class="q-mb-sm shadow-1" 
            rounded
          />
          <q-btn flat round dense icon="edit" color="grey-5" size="sm" />
        </div>

        <div class="text-h6 q-mt-xs">{{ task.title }}</div>
        <div class="text-body2 text-grey-7 q-mt-xs">{{ task.description }}</div>

        <!-- Meta Info -->
        <div class="row items-center q-mt-md text-caption text-grey-6 q-gutter-x-md">
          <div class="row items-center">
            <q-icon name="event" class="q-mr-xs" />
            {{ task.dueDate }}
          </div>
          <q-space />
          <div class="row items-center">
             <q-avatar size="24px" class="q-mr-xs">
               <img src="https://cdn.quasar.dev/img/boy-avatar.png">
             </q-avatar>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="q-mt-md">
          <q-linear-progress :value="task.progress" color="secondary" rounded track-color="grey-2" class="q-mb-xs" />
          <div class="text-caption text-grey-6">{{ task.progress * 100 }}% Completed</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tasks = ref([
  { 
    id: 1, 
    title: 'Finalize Project Proposal', 
    description: 'Review the final draft with the team before submission.',
    urgent: true,
    dueDate: 'Tomorrow, 10:00 AM',
    progress: 0.8
  },
  { 
    id: 2, 
    title: 'Client Meeting Preparation', 
    description: 'Prepare slide deck and discussion points for the ACME Corp meeting.',
    urgent: false,
    dueDate: 'Friday, 2:00 PM',
    progress: 0.4
  }
]);
</script>
