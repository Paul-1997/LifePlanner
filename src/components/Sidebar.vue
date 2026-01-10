<template>
  <q-drawer
    v-model="drawerModel"
    show-if-above
    :width="260"
    :breakpoint="600"
    class="bg-surface"
  >
    <div class="column full-height">
      <!-- Brand Header -->
      <div class="q-pa-lg">
        <div class="text-h5 text-weight-bold text-primary row items-center">
          <q-icon name="menu_book" class="q-mr-sm" />
          LifePlanner
        </div>
      </div>

      <!-- Navigation -->
      <q-scroll-area class="col">
        <q-list padding class="text-grey-7">
          <template v-for="(menuItem, index) in menuList" :key="index">
            <q-item
              clickable
              :to="menuItem.to"
              :active="route.path === menuItem.to"
              active-class="text-primary bg-blue-1 text-weight-bold"
              class="rounded-borders q-mx-md q-mb-xs"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>

      <!-- User Profile (Bottom) -->
      <div class="q-pa-md q-mt-auto">
        <q-item clickable class="rounded-borders">
          <q-item-section avatar>
            <q-avatar size="32px" color="primary" text-color="white">P</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">Paul</q-item-label>
            <q-item-label caption>Pro Plan</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { inject, ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isDrawerOpen = inject('isDrawerOpen');
const drawerModel = computed({
  get: () => isDrawerOpen.value,
  set: (val) => isDrawerOpen.value = val,
});
const menuList = ref([
  {
    label: 'Home',
    icon: 'home',
    to: '/',
  },
  {
    label: 'Tasks',
    icon: 'task',
    to: '/tasks',
  },
  {
    label: 'Statistics',
    icon: 'bar_chart',
    to: '/statistics',
  },
  {
    label: 'Settings',
    icon: 'settings',
    to: '/settings',
  },
]);
</script>
