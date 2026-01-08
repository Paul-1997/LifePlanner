# LifePlanner 開發指南

> 完整的逐步開發路線圖，從零到完整產品

---

## 📋 目錄

- [專案概述](#專案概述)
- [技術棧](#技術棧)
- [已完成項目](#已完成項目)
- [開發路線圖](#開發路線圖)
  - [Phase 1: 核心功能](#phase-1-核心功能)
  - [Phase 2: 進階功能](#phase-2-進階功能)
  - [Phase 3: 雲端同步](#phase-3-雲端同步)
  - [Phase 4: 多平台打包](#phase-4-多平台打包)
  - [Phase 5: 擴展功能](#phase-5-擴展功能)

---

## 專案概述

**LifePlanner** 是一個跨平台的時間與事務管理工具，核心目標是提升個人工作效率。

### 核心特色

- 📝 **任務管理**：一次性任務 + 週期性習慣
- 🎯 **四象限管理**：艾森豪矩陣（重要/緊急）
- ⏱️ **專注模式**：番茄鐘計時器
- 📊 **視覺化統計**：多種圖表呈現進度
- ☁️ **雲端同步**：Firebase 跨設備即時同步
- 🌐 **多平台**：網頁 / Windows / iOS

---

## 技術棧

- **框架**：Vue 3 + TypeScript + Quasar 2
- **狀態管理**：Pinia
- **路由**：Vue Router
- **圖表**：Chart.js 或 ECharts
- **後端**：Firebase (Firestore + Authentication)
- **多平台**：Electron (桌面) + Capacitor (移動)

---

## ✅ 已完成項目

- [x] 建立資料模型（`src/types/`）
  - `task.ts` - 任務相關型別
  - `routine.ts` - 週期性任務型別
  - `focus.ts` - 專注模式型別
  - `statistics.ts` - 統計相關型別
- [x] 建立工具函數（`src/utils/`）
  - `id.ts` - ID 生成
  - `date.ts` - 日期時間處理
  - `routine.ts` - 週期性任務邏輯

---

## 開發路線圖

---

## Phase 1: 核心功能

> **目標**：完成基本任務管理，可以新增、編輯、打卡任務，並使用本地存儲

### 1.1 建立 Pinia Store（任務管理）

**檔案**：`src/stores/task-store.ts`

**步驟**：

1. 建立基礎 Store 結構
2. 定義 state（tasks, routineCheckIns, focusSessions）
3. 實作 getters（查詢任務、打卡記錄等）
4. 實作 actions（CRUD 操作）

**關鍵功能**：

- `addTask()` - 新增任務
- `updateTask()` - 更新任務
- `deleteTask()` - 刪除任務
- `toggleTaskStatus()` - 切換任務狀態
- `checkInRoutine()` - 週期性任務打卡
- `convertToRoutine()` - 轉為週期性任務
- `convertFromRoutine()` - 轉為一般任務

**範例程式碼**：

```typescript
import { defineStore } from 'pinia';
import type { Task, RoutineCheckIn, FocusSession } from 'src/types';
import { generateId } from 'src/utils';

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    routineCheckIns: [] as RoutineCheckIn[],
    focusSessions: [] as FocusSession[],
  }),

  getters: {
    // 所有非歸檔任務
    activeTasks: (state) => state.tasks.filter((t) => t.status !== 'done'),

    // 根據 ID 獲取任務
    getTaskById: (state) => (id: string) => {
      return state.tasks.find((t) => t.id === id);
    },

    // 獲取任務的打卡記錄
    getCheckInsByTaskId: (state) => (taskId: string) => {
      return state.routineCheckIns.filter((c) => c.taskId === taskId);
    },
  },

  actions: {
    // 實作各種操作...
  },
});
```

**測試**：

- 在 Vue DevTools 中檢查 Store 狀態
- 測試新增、編輯、刪除任務

---

### 1.2 建立 LocalStorage 持久化插件

**檔案**：`src/boot/storage.ts`

**步驟**：

1. 建立 boot 檔案
2. 監聽 Store 變化
3. 自動存儲到 LocalStorage
4. App 啟動時自動載入

**範例程式碼**：

```typescript
import { boot } from 'quasar/wrappers';
import { useTaskStore } from 'src/stores/task-store';

const STORAGE_KEY = 'lifeplanner-data';

export default boot(({ store }) => {
  const taskStore = useTaskStore(store);

  // 載入本地資料
  const loadData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        taskStore.$patch(parsed);
      } catch (error) {
        console.error('載入資料失敗', error);
      }
    }
  };

  // 儲存資料
  const saveData = () => {
    const data = {
      tasks: taskStore.tasks,
      routineCheckIns: taskStore.routineCheckIns,
      focusSessions: taskStore.focusSessions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // 初始載入
  loadData();

  // 監聽變化並儲存
  taskStore.$subscribe(() => {
    saveData();
  });
});
```

**配置**：
在 `quasar.config.ts` 的 `boot` 陣列加入 `'storage'`

---

### 1.3 建立主要頁面路由

**檔案**：`src/router/routes.ts`

**步驟**：

1. 定義主要頁面路由
2. 建立對應的 Vue 組件

**路由結構**：

```typescript
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: 'tasks', component: () => import('pages/TasksPage.vue') },
      { path: 'tasks/:id', component: () => import('pages/TaskDetailPage.vue') },
      { path: 'routines', component: () => import('pages/RoutinesPage.vue') },
      { path: 'focus', component: () => import('pages/FocusPage.vue') },
      { path: 'statistics', component: () => import('pages/StatisticsPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
    ],
  },
];
```

**建立空白頁面**：

```bash
# 建立這些檔案（先用簡單的模板）
src/pages/DashboardPage.vue
src/pages/TasksPage.vue
src/pages/TaskDetailPage.vue
src/pages/RoutinesPage.vue
src/pages/FocusPage.vue
src/pages/StatisticsPage.vue
src/pages/SettingsPage.vue
```

---

### 1.4 實作可收合側邊欄佈局

**檔案**：`src/layouts/MainLayout.vue`

**步驟**：

1. 使用 Quasar 的 QDrawer 組件
2. 實作左側導航欄
3. 實作收合/展開功能
4. 響應式設計（手機自動收合）

**範例程式碼**：

```vue
<template>
  <q-layout view="hHh lpR fFf">
    <!-- 頂部工具列 -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title>LifePlanner</q-toolbar-title>
        <q-btn flat round icon="account_circle" />
      </q-toolbar>
    </q-header>

    <!-- 側邊欄 -->
    <q-drawer v-model="drawer" :width="250" :breakpoint="500" show-if-above bordered>
      <q-scroll-area class="fit">
        <q-list>
          <q-item clickable v-ripple to="/">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>儀表板</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/tasks">
            <q-item-section avatar>
              <q-icon name="task" />
            </q-item-section>
            <q-item-section>所有任務</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/routines">
            <q-item-section avatar>
              <q-icon name="repeat" />
            </q-item-section>
            <q-item-section>習慣追蹤</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/focus">
            <q-item-section avatar>
              <q-icon name="timer" />
            </q-item-section>
            <q-item-section>專注模式</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/statistics">
            <q-item-section avatar>
              <q-icon name="bar_chart" />
            </q-item-section>
            <q-item-section>統計分析</q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable v-ripple to="/settings">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>設定</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- 主內容區 -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const drawer = ref(true);

function toggleDrawer() {
  drawer.value = !drawer.value;
}
</script>
```

---

### 1.5 建立任務列表組件

**檔案**：`src/components/TaskList.vue`

**步驟**：

1. 顯示任務列表
2. 支援勾選完成
3. 顯示任務資訊（標題、分類、截止日期）
4. 點擊進入詳情

**範例程式碼**：

```vue
<template>
  <q-list bordered separator>
    <q-item v-for="task in tasks" :key="task.id" clickable @click="$emit('click', task)">
      <!-- 完成勾選 -->
      <q-item-section side>
        <q-checkbox
          :model-value="task.status === 'done'"
          @update:model-value="$emit('toggle-status', task)"
        />
      </q-item-section>

      <!-- 任務內容 -->
      <q-item-section>
        <q-item-label :class="{ 'text-strike': task.status === 'done' }">
          {{ task.title }}
        </q-item-label>
        <q-item-label caption>
          <q-badge v-if="task.category" :label="task.category" />
          <span v-if="task.dueDate" class="q-ml-sm"> 截止: {{ formatDate(task.dueDate) }} </span>
        </q-item-label>
      </q-item-section>

      <!-- 四象限標記 -->
      <q-item-section side>
        <q-badge :color="getQuadrantColor(task.quadrant)">
          {{ getQuadrantLabel(task.quadrant) }}
        </q-badge>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import type { Task, EisenhowerQuadrant } from 'src/types';
import { formatDate } from 'src/utils';

defineProps<{
  tasks: Task[];
}>();

defineEmits<{
  (e: 'click', task: Task): void;
  (e: 'toggle-status', task: Task): void;
}>();

function getQuadrantColor(quadrant: EisenhowerQuadrant): string {
  const colors = {
    'do-first': 'red',
    schedule: 'orange',
    delegate: 'blue',
    eliminate: 'grey',
  };
  return colors[quadrant];
}

function getQuadrantLabel(quadrant: EisenhowerQuadrant): string {
  const labels = {
    'do-first': '緊急重要',
    schedule: '重要',
    delegate: '緊急',
    eliminate: '普通',
  };
  return labels[quadrant];
}
</script>
```

---

### 1.6 實作快速新增任務（FAB 按鈕）

**檔案**：`src/pages/TasksPage.vue`

**步驟**：

1. 加入浮動操作按鈕（Floating Action Button）
2. 點擊彈出簡單對話框
3. 輸入標題即可快速建立
4. 其他欄位使用預設值

**範例程式碼**：

```vue
<template>
  <q-page class="q-pa-md">
    <task-list :tasks="activeTasks" @toggle-status="handleToggle" />

    <!-- 浮動按鈕 -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="showQuickAddDialog" />
    </q-page-sticky>

    <!-- 快速新增對話框 -->
    <q-dialog v-model="quickAddDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">快速新增任務</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="quickAddTitle"
            label="任務標題"
            autofocus
            @keyup.enter="handleQuickAdd"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn flat label="新增" color="primary" @click="handleQuickAdd" />
          <q-btn flat label="詳細設定" color="secondary" @click="showDetailDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTaskStore } from 'src/stores/task-store';
import TaskList from 'src/components/TaskList.vue';

const taskStore = useTaskStore();
const quickAddDialog = ref(false);
const quickAddTitle = ref('');

const activeTasks = computed(() => taskStore.activeTasks);

function showQuickAddDialog() {
  quickAddTitle.value = '';
  quickAddDialog.value = true;
}

function handleQuickAdd() {
  if (!quickAddTitle.value.trim()) return;

  taskStore.addTask({
    title: quickAddTitle.value.trim(),
    status: 'todo',
    quadrant: 'schedule', // 預設為重要不緊急
    order: 0,
    changeLog: [],
  });

  quickAddDialog.value = false;
}

function handleToggle(task: Task) {
  taskStore.toggleTaskStatus(task.id);
}
</script>
```

---

### 1.7 實作完整任務編輯表單

**檔案**：`src/components/TaskEditDialog.vue`

**步驟**：

1. 完整的表單欄位（標題、描述、分類、四象限、日期等）
2. 支援新增和編輯模式
3. 表單驗證

**範例程式碼**：

```vue
<template>
  <q-dialog v-model="showDialog" @hide="handleClose">
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? '編輯任務' : '新增任務' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <!-- 標題 -->
        <q-input
          v-model="form.title"
          label="任務標題 *"
          :rules="[(val) => !!val || '請輸入標題']"
        />

        <!-- 描述 -->
        <q-input v-model="form.description" label="描述" type="textarea" rows="3" />

        <!-- 四象限 -->
        <q-select
          v-model="form.quadrant"
          :options="quadrantOptions"
          label="重要/緊急程度"
          emit-value
          map-options
        />

        <!-- 分類 -->
        <q-input v-model="form.category" label="分類（如：工作、學習）" />

        <!-- 截止日期 -->
        <q-input v-model="form.dueDate" label="截止日期">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="form.dueDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <!-- 週期性任務選項 -->
        <q-checkbox v-model="isRoutine" label="設為週期性任務" />

        <div v-if="isRoutine" class="q-gutter-sm">
          <q-select
            v-model="routineFrequency"
            :options="frequencyOptions"
            label="頻率"
            emit-value
            map-options
          />
          <q-input v-model.number="routineTargetCount" type="number" label="目標次數" min="1" />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" color="grey" v-close-popup />
        <q-btn flat label="儲存" color="primary" @click="handleSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Task, EisenhowerQuadrant, RoutineFrequency } from 'src/types';

// ... 實作邏輯
</script>
```

---

### 1.8 實作週期性任務打卡功能

**檔案**：`src/components/RoutineCheckInDialog.vue`

**步驟**：

1. 顯示任務的子任務清單
2. 勾選完成的項目
3. 可填寫備註
4. 確認打卡並更新狀態

**範例程式碼**：

```vue
<template>
  <q-dialog v-model="showDialog">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">✅ 打卡：{{ task?.title }}</div>
      </q-card-section>

      <q-card-section v-if="task?.subtasks && task.subtasks.length > 0">
        <div class="text-subtitle2 q-mb-sm">請確認完成的項目：</div>
        <q-list>
          <q-item v-for="subtask in task.subtasks" :key="subtask.id">
            <q-item-section side>
              <q-checkbox v-model="completedSubtasks" :val="subtask.id" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ subtask.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="note"
          label="備註（選填）"
          type="textarea"
          rows="2"
          placeholder="例如：今天跑了 5 公里"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" color="grey" v-close-popup />
        <q-btn flat label="確認打卡" color="primary" @click="handleCheckIn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// ... 實作邏輯
</script>
```

---

## Phase 2: 進階功能

> **目標**：完成統計頁面、四象限視圖、子任務管理、主題切換

### 2.1 建立四象限視圖頁面

### 2.2 實作子任務管理

### 2.3 建立統計頁面基礎架構

### 2.4 實作數字儀表板

### 2.5 實作折線圖（專注時間趨勢）

### 2.6 實作條形圖（習慣達標率）

### 2.7 實作日曆視圖

### 2.8 實作主題切換功能

_（詳細步驟將在 Phase 1 完成後提供）_

---

## Phase 3: 雲端同步

> **目標**：整合 Firebase，實現跨設備即時同步

### 3.1 建立 Firebase 專案並設定

### 3.2 整合 Firebase SDK

### 3.3 實作 Google 登入

### 3.4 實作即時資料同步

### 3.5 處理離線模式

_（詳細步驟將在 Phase 2 完成後提供）_

---

## Phase 4: 多平台打包

> **目標**：建置各平台版本

### 4.1 配置 PWA

### 4.2 配置 Electron（Windows 桌面版）

### 4.3 配置 Capacitor（iOS 版）

_（詳細步驟將在 Phase 3 完成後提供）_

---

## Phase 5: 擴展功能

> **目標**：Google Calendar 整合、番茄鐘模式等

### 5.1 實作番茄鐘計時器

### 5.2 整合 Google Calendar

### 5.3 實作資料匯出/匯入

### 5.4 實作客製化主題色

_（根據實際需求逐步加入）_

---

## 💡 開發建議

### 每個步驟的流程

1. **閱讀步驟說明**
2. **建立或修改檔案**
3. **測試功能**
4. **提交 Git**
5. **詢問下一步**

### 遇到問題時

- 先檢查 Vue DevTools（State、Components）
- 查看瀏覽器 Console 是否有錯誤
- 查看 ESLint 錯誤提示
- 詢問我具體問題

### Git 提交建議

每完成一個小步驟就提交：

```bash
git add .
git commit -m "feat: 完成任務列表組件"
```

---

## 🎯 下一步行動

**現在請開始 Phase 1.1：建立 Pinia Store**

完成後告訴我，我會檢查並指導下一步！

---

_更新時間：2026-01-07_
