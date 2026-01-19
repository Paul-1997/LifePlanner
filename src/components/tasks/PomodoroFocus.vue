<template>
  <div>
    <p>Focus on your tasks for 25 minutes, then take a 5-minute break.</p>
    <div class="text-center">
      <q-circular-progress
        show-value
        class="text-light-blue q-ma-md"
        :value="percentage"
        size="240px"
        color="light-blue"
      >
        {{ timeLeft }}s
      </q-circular-progress>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const percentage = ref(100);
const timeLeft = ref(1 * 60);

function startTimer() {
  const timer = setInterval(() => {
    percentage.value--;
    timeLeft.value--;
    if (percentage.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
}

startTimer();
</script>
