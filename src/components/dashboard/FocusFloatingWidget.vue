<template>
  <q-page-sticky position="bottom-right" :offset="[24, 24]" class="z-top">
    <div 
      class="bg-surface shadow-floating rounded-borders q-pa-sm row items-center cursor-pointer transition-all hover-expand"
      :class="{ 'expanded': isExpanded }"
      @mouseenter="isExpanded = true"
      @mouseleave="isExpanded = false"
    >
      <!-- Icon (Always Visible) -->
      <div 
        class="bg-orange-1 text-accent rounded-circle row items-center justify-center q-mr-sm"
        style="width: 40px; height: 40px"
      >
        <q-icon name="timer" size="20px" />
      </div>

      <!-- Compact View (Time Only) -->
      <div class="text-h6 text-weight-bold text-primary q-mr-sm">
        25:00
      </div>

      <!-- Expanded Controls (Hidden by default) -->
      <div v-show="isExpanded" class="row items-center q-gutter-x-sm fade-in">
        <q-separator vertical class="q-mx-sm" />
        <div class="column justify-center q-mr-md">
           <div class="text-caption text-grey-7" style="line-height: normal;">Focus on</div>
           <div class="text-caption text-weight-bold text-primary" style="line-height: normal; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
             Project Proposal
           </div>
        </div>
        <q-btn round flat color="primary" icon="play_arrow" size="sm" />
        <q-btn round flat color="grey-6" icon="stop" size="sm" />
      </div>
    </div>
  </q-page-sticky>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isExpanded = ref(false);
</script>

<style scoped>
.rounded-circle {
  border-radius: 50%;
}

.hover-expand {
  max-width: 130px;
  overflow: hidden;
  transition: max-width 0.3s ease, box-shadow 0.3s ease;
}

.hover-expand.expanded {
  max-width: 400px; /* Adjust based on content */
}

.fade-in {
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
