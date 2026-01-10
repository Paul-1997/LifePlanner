<template>
  <q-layout view="lHh Lpr lFf" class="bg-background">
    <!-- Desktop Sidebar (Hidden on Mobile) -->
    <Sidebar :drawer="leftDrawerOpen" v-if="$q.screen.gt.sm" />

    <q-page-container>
      <div :class="$q.screen.lt.sm ? 'q-pb-xl' : ''">
         <router-view />
      </div>
    </q-page-container>

    <!-- Mobile Bottom Nav -->
    <q-footer v-if="$q.screen.lt.sm" bordered class="bg-surface text-primary">
      <q-tabs no-caps active-color="primary" indicator-color="transparent" class="text-grey-5">
        <q-route-tab to="/" icon="dashboard" label="Home" />
        <q-route-tab to="/tasks" icon="check_circle" label="Tasks" />
        <q-route-tab to="/focus" icon="timer" label="Focus" />
        <q-route-tab to="/routines" icon="repeat" label="Habits" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue';
import Sidebar from 'components/Sidebar.vue';

const leftDrawerOpen = ref(true);
provide('isDrawerOpen', leftDrawerOpen);
</script>
