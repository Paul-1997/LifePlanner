import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // 主页
      { path: '', name: 'home', component: () => import('pages/DashboardPage.vue') },

      // 任务管理
      { path: 'tasks', name: 'tasks', component: () => import('pages/TasksPage.vue') },

      // 统计分析
      {
        path: 'statistics',
        name: 'statistics',
        component: () => import('pages/StatisticsPage.vue'),
      },

      // 设置
      { path: 'settings', name: 'settings', component: () => import('pages/SettingsPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
