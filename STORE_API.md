# Task Store API 文档

> 根据最终架构设计的 Store，遵循原则：**"多个页面使用且格式一致"才放 Store**

---

## 📦 State（状态）

```typescript
tasks: Task[]              // 所有任务（一般 + 周期性）
routineCheckIns: RoutineCheckIn[]  // 打卡记录
focusSessions: FocusSession[]      // 专注记录
```

---

## 🔍 Getters（多页面共用的计算属性）

### 基础查询

| Getter | 返回类型 | 说明 | 使用页面 |
|--------|---------|------|---------|
| `activeTasks` | `Task[]` | 所有未完成任务 | HomePage, TasksPage |
| `completedTasks` | `Task[]` | 所有已完成任务 | TasksPage Tab 3, StatisticsPage |
| `generalTasks` | `Task[]` | 一般任务（非周期性） | HomePage, TasksPage Tab 1 |
| `routineTasks` | `Task[]` | 周期性任务（习惯） | HomePage, TasksPage Tab 2 |

### 特定查询

| Getter | 返回类型 | 说明 | 使用页面 |
|--------|---------|------|---------|
| `currentTask` | `Task \| null` | order 最小的未完成一般任务 | HomePage（当前聚焦） |
| `todayTasks` | `Task[]` | 今天到期的一般任务 | HomePage |
| `todayFocusSessions` | `FocusSession[]` | 今日专注记录 | HomePage, FocusDrawer |

---

## 🛠️ Methods（查询方法）

```typescript
// 根据 ID 获取任务
getTaskById(id: string): Task | undefined

// 获取任务的打卡记录
getCheckInsByTaskId(taskId: string): RoutineCheckIn[]
```

---

## ⚡ Actions（操作方法）

### 任务 CRUD

```typescript
// 新增任务
addTask(input: CreateTaskInput): string  // 返回任务 ID

// 更新任务
updateTask(id: string, updates: UpdateTaskInput): void

// 删除任务（会同时删除相关打卡和专注记录）
deleteTask(id: string): void

// 切换任务状态（todo → in-progress → done → todo）
toggleTaskStatus(id: string): void
```

### 周期性任务

```typescript
// 打卡
checkInRoutine(input: {
  taskId: string;
  frequencyAtCheckIn: RoutineFrequency;
  targetCountAtCheckIn: number;
  completedSubtasks: string[];
  note?: string;
}): string  // 返回打卡记录 ID
```

### 专注记录

```typescript
// 开始专注
startFocusSession(input: CreateFocusSessionInput): string  // 返回 session ID

// 结束专注
endFocusSession(id: string, interrupted?: boolean): void
```

---

## 🚫 不放在 Store 的内容（组件内 computed）

以下内容**仅在单一页面使用**，应该在组件内用 `computed` 计算：

### HomePage

```vue
<script setup>
import { computed } from 'vue';
import useTaskStore from 'src/stores/task';

const taskStore = useTaskStore();

// ✅ 前 5 个习惯（仅 HomePage 用）
const weeklyRoutines = computed(() => 
  taskStore.routineTasks.slice(0, 5)
);

// ✅ 今日完成数（仅 HomePage 统计卡片用）
const todayCompletedCount = computed(() => {
  const today = formatDate(new Date());
  return taskStore.completedTasks.filter(t => 
    t.completedAt && formatDate(t.completedAt) === today
  ).length;
});

// ✅ 今日专注时长（分钟）（仅 HomePage 用）
const todayFocusMinutes = computed(() => {
  const total = taskStore.todayFocusSessions.reduce(
    (sum, s) => sum + s.duration, 0
  );
  return Math.floor(total / 60);
});
</script>
```

### TasksPage

```vue
<script setup>
import { computed } from 'vue';
import useTaskStore from 'src/stores/task';

const taskStore = useTaskStore();

// ✅ 按 order 排序的任务（仅 TasksPage Tab 1 用）
const sortedTasks = computed(() => 
  [...taskStore.generalTasks].sort((a, b) => a.order - b.order)
);

// ✅ 逾期任务（仅 TasksPage 筛选用）
const overdueTasks = computed(() => {
  const today = new Date();
  return taskStore.generalTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < today
  );
});

// ✅ 本周任务（仅 TasksPage 筛选用）
const thisWeekTasks = computed(() => {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  return taskStore.generalTasks.filter(t => 
    t.dueDate && 
    isBetweenDates(t.dueDate, weekStart, weekEnd)
  );
});
</script>
```

### StatisticsPage

```vue
<script setup>
import { computed } from 'vue';
import useTaskStore from 'src/stores/task';

const taskStore = useTaskStore();

// ✅ 总专注时长（仅统计页用）
const totalFocusTime = computed(() => 
  taskStore.focusSessions.reduce((sum, s) => sum + s.duration, 0)
);

// ✅ 本周完成率（仅统计页用）
const weekCompletionRate = computed(() => {
  const weekStart = getWeekStart();
  const weekTasks = taskStore.tasks.filter(t => 
    t.createdAt >= weekStart
  );
  const completed = weekTasks.filter(t => t.status === 'done').length;
  return weekTasks.length > 0 
    ? (completed / weekTasks.length * 100).toFixed(1) 
    : 0;
});

// ✅ 习惯完成率图表数据（仅统计页用）
const habitCompletionData = computed(() => {
  return taskStore.routineTasks.map(task => ({
    name: task.title,
    rate: (task.routine!.currentCount / task.routine!.targetCount * 100).toFixed(1)
  }));
});
</script>
```

---

## 📊 设计原则总结

### ✅ 放在 Store 的条件

1. **多页面使用**：至少 2 个以上页面需要
2. **格式一致**：所有页面使用的数据格式相同
3. **核心数据**：是应用的核心业务逻辑

**例子**：
- `activeTasks` → HomePage 和 TasksPage 都要用
- `currentTask` → HomePage 显示，未来可能在 FocusDrawer 也要显示
- `todayFocusSessions` → HomePage 和 FocusDrawer 都要用

### ❌ 放在组件的条件

1. **单页面使用**：只有一个页面需要
2. **格式不同**：不同页面需要不同的数据格式
3. **临时计算**：UI 展示相关的计算

**例子**：
- 前 10 笔任务 → 只有某个列表需要
- 逾期任务 → 只有筛选功能需要
- 图表数据转换 → 只有统计页需要
- 排序后的任务 → 不同页面可能排序方式不同

---

## 🎯 使用示例

### HomePage

```vue
<template>
  <q-page>
    <!-- 当前聚焦任务 -->
    <div v-if="taskStore.currentTask">
      正在进行：{{ taskStore.currentTask.title }}
    </div>

    <!-- 今日任务 -->
    <div v-for="task in taskStore.todayTasks" :key="task.id">
      {{ task.title }}
    </div>

    <!-- 本周习惯（前5个） -->
    <div v-for="habit in weeklyRoutines" :key="habit.id">
      {{ habit.title }} - {{ habit.routine.currentCount }}/{{ habit.routine.targetCount }}
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue';
import useTaskStore from 'src/stores/task';

const taskStore = useTaskStore();

// 组件内计算
const weeklyRoutines = computed(() => 
  taskStore.routineTasks.slice(0, 5)
);
</script>
```

### TasksPage

```vue
<template>
  <q-page>
    <q-tabs v-model="tab">
      <q-tab name="general" label="待办任务" />
      <q-tab name="routine" label="习惯管理" />
    </q-tabs>

    <q-tab-panels v-model="tab">
      <!-- Tab 1: 一般任务 -->
      <q-tab-panel name="general">
        <div v-for="task in sortedTasks" :key="task.id">
          {{ task.title }}
        </div>
      </q-tab-panel>

      <!-- Tab 2: 习惯管理 -->
      <q-tab-panel name="routine">
        <div v-for="habit in taskStore.routineTasks" :key="habit.id">
          {{ habit.title }}
          <q-btn @click="handleCheckIn(habit.id)">打卡</q-btn>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import useTaskStore from 'src/stores/task';

const taskStore = useTaskStore();
const tab = ref('general');

// 组件内排序
const sortedTasks = computed(() => 
  [...taskStore.generalTasks].sort((a, b) => a.order - b.order)
);

const handleCheckIn = (taskId: string) => {
  const task = taskStore.getTaskById(taskId);
  if (!task || !task.routine) return;

  taskStore.checkInRoutine({
    taskId,
    frequencyAtCheckIn: task.routine.frequency,
    targetCountAtCheckIn: task.routine.targetCount,
    completedSubtasks: [],
  });
};
</script>
```

---

## 🔄 更新日志

- 2026-01-09: 根据最终架构设计初始版本
- 明确了 Store 和组件的职责分工
- 实现了核心的 CRUD 和业务逻辑

