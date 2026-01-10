<template>
  <div class="column q-gutter-y-md">
    <div class="text-h6 text-primary q-mb-sm">My Routines</div>
    
    <q-card
      v-for="routine in routines"
      :key="routine.id"
      class="cursor-pointer transition-all hover-scale"
      :class="{'bg-green-1': routine.done}"
      flat
      bordered
    >
      <q-item clickable v-ripple @click="toggleRoutine(routine.id)">
        <q-item-section avatar>
          <q-checkbox 
            v-model="routine.done" 
            checked-icon="check_circle" 
            unchecked-icon="radio_button_unchecked"
            color="positive"
            class="no-pointer-events" 
          />
        </q-item-section>

        <q-item-section>
          <q-item-label :class="{'text-strike text-grey': routine.done}">{{ routine.title }}</q-item-label>
          <q-item-label caption v-if="routine.time">
            <q-icon name="schedule" size="xs" /> {{ routine.time }}
          </q-item-label>
        </q-item-section>
        
        <q-item-section side v-if="routine.done">
           <q-icon name="emoji_events" color="warning" />
        </q-item-section>
      </q-item>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const routines = ref([
  { id: 1, title: 'Morning Run', time: '7:00 AM', done: true },
  { id: 2, title: 'Read Book', time: '20 mins', done: false },
  { id: 3, title: 'Meditate', time: '10 mins', done: false },
]);

function toggleRoutine(id: number) {
  const r = routines.value.find(x => x.id === id);
  if (r) r.done = !r.done;
}
</script>

<style scoped>
.hover-scale:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>
