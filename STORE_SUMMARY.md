# Task Store 完成总结

> 根据最终架构设计的 Store 已经完成！

---

## ✅ 已完成的功能

### 📦 State（状态层）
```typescript
✅ tasks: Task[]                     // 所有任务
✅ routineCheckIns: RoutineCheckIn[] // 打卡记录
✅ focusSessions: FocusSession[]     // 专注记录
```

### 🔍 Getters（计算属性）

#### 基础查询
```typescript
✅ activeTasks          // 所有未完成任务（HomePage, TasksPage）
✅ completedTasks       // 所有已完成任务（TasksPage, StatisticsPage）
✅ generalTasks         // 一般任务（非周期性）
✅ routineTasks         // 周期性任务（习惯）
```

#### 特定查询
```typescript
✅ currentTask          // order 最小的未完成一般任务
✅ todayTasks           // 今天到期的一般任务
✅ todayFocusSessions   // 今日专注记录
```

### 🛠️ Methods（查询方法）
```typescript
✅ getTaskById(id)               // 根据 ID 获取任务
✅ getCheckInsByTaskId(taskId)   // 获取任务的打卡记录
```

### ⚡ Actions（操作方法）

#### 任务 CRUD
```typescript
✅ addTask(input)           // 新增任务，返回 ID
✅ updateTask(id, updates)  // 更新任务
✅ deleteTask(id)           // 删除任务（同时删除相关记录）
✅ toggleTaskStatus(id)     // 切换任务状态
```

#### 周期性任务
```typescript
✅ checkInRoutine(input)    // 打卡（会更新 currentCount）
⏳ convertToRoutine()       // 转为周期性任务（未实现）
⏳ convertFromRoutine()     // 转为一般任务（未实现）
⏳ resetRoutinePeriod()     // 重置周期（未实现）
```

#### 专注记录
```typescript
✅ startFocusSession(input)   // 开始专注
✅ endFocusSession(id)        // 结束专注
```

---

## 📋 设计原则

### ✅ 放在 Store 的内容
**原则**：多个页面使用 + 格式一致

**已实现**：
- `activeTasks` → HomePage 和 TasksPage 都用
- `currentTask` → HomePage 当前聚焦
- `todayTasks` → HomePage 今日任务
- `todayFocusSessions` → HomePage 和 FocusDrawer 都用
- 所有 CRUD 操作

### ❌ 不放在 Store 的内容
**原则**：单页面使用 OR 不同格式

**示例**：
```typescript
// 组件内计算
const weeklyRoutines = computed(() => 
  taskStore.routineTasks.slice(0, 5)  // 只有 HomePage 需要前 5 个
);

const sortedTasks = computed(() => 
  [...taskStore.generalTasks].sort(...)  // 不同页面排序方式可能不同
);

const overdueTasks = computed(() => 
  taskStore.generalTasks.filter(...)  // 只有筛选功能需要
);
```

---

## 📊 各页面使用情况

### HomePage
```typescript
使用的 Store Getters：
- currentTask          // 当前聚焦任务
- todayTasks          // 今日任务
- routineTasks        // 习惯（取前 5 个）
- todayFocusSessions  // 今日专注

组件内计算：
- 今日完成数
- 今日专注时长（分钟）
- 统计卡片数据
```

### TasksPage
```typescript
使用的 Store Getters：
- generalTasks        // Tab 1: 一般任务
- routineTasks        // Tab 2: 习惯管理
- completedTasks      // Tab 3: 已完成

使用的 Store Actions：
- addTask()           // 新增
- updateTask()        // 编辑
- deleteTask()        // 删除
- toggleTaskStatus()  // 切换状态
- checkInRoutine()    // 打卡

组件内计算：
- 排序后的任务
- 逾期任务（筛选）
- 本周任务（筛选）
```

### StatisticsPage
```typescript
使用的 Store Data：
- completedTasks      // 完成率计算
- focusSessions       // 专注统计
- routineTasks        // 习惯完成率

组件内计算：
- 总专注时长
- 本周完成率
- 图表数据转换
- 热力图数据
```

### FocusDrawer
```typescript
使用的 Store：
- todayFocusSessions      // 今日记录
- startFocusSession()     // 开始专注
- endFocusSession()       // 结束专注

组件内计算：
- 今日总时长
- 计时器状态
```

---

## 🎯 使用示例

### 1. 新增一般任务

```typescript
import useTaskStore from 'src/stores/task';

const taskStore = useTaskStore();

const taskId = taskStore.addTask({
  title: '完成报告',
  status: 'todo',
  quadrant: 'do-first',
  dueDate: new Date('2026-01-10'),
  order: 1,
});
```

### 2. 新增习惯

```typescript
const habitId = taskStore.addTask({
  title: '晨间运动',
  status: 'todo',
  quadrant: 'schedule',
  order: 0,
  routine: {
    enabled: true,
    frequency: 'weekly',
    targetCount: 5,
    currentCount: 0,
    currentPeriodStart: new Date(),
    nextResetAt: getWeekEnd(),
    configHistory: [],
  },
});
```

### 3. 打卡

```typescript
const task = taskStore.getTaskById(habitId);

taskStore.checkInRoutine({
  taskId: habitId,
  frequencyAtCheckIn: task.routine.frequency,
  targetCountAtCheckIn: task.routine.targetCount,
  completedSubtasks: [],
  note: '今天跑了 5 公里',
});
```

### 4. 切换任务状态

```typescript
// todo → in-progress
taskStore.toggleTaskStatus(taskId);

// in-progress → done
taskStore.toggleTaskStatus(taskId);

// done → todo（重新打开）
taskStore.toggleTaskStatus(taskId);
```

### 5. 开始专注

```typescript
const sessionId = taskStore.startFocusSession({
  taskId: taskId,  // 或 null 表示纯专注
  type: 'pomodoro-25',
  interrupted: false,
  endAt: undefined,
});

// 25 分钟后结束
setTimeout(() => {
  taskStore.endFocusSession(sessionId, false);
}, 25 * 60 * 1000);
```

---

## ⏳ 待实现的功能

根据实际需求，以下功能可以后续添加：

### 周期性任务扩展
```typescript
⏳ convertToRoutine(taskId, config)    // 转换为习惯
⏳ convertFromRoutine(taskId)          // 转换为一般任务
⏳ resetRoutinePeriod(taskId)          // 手动重置周期
⏳ updateRoutineConfig(taskId, config) // 修改习惯配置
```

### 子任务管理（如果需要）
```typescript
⏳ addSubtask(parentId, subtask)       // 新增子任务
⏳ deleteSubtask(parentId, subtaskId)  // 删除子任务
⏳ reorderSubtasks(parentId, ids)      // 重新排序
```

### 批量操作（如果需要）
```typescript
⏳ bulkDeleteTasks(ids)                // 批量删除
⏳ bulkUpdateTasks(updates)            // 批量更新
```

---

## 🔄 下一步

1. **LocalStorage 持久化**
   - 创建 `src/boot/storage.ts`
   - 监听 Store 变化自动保存
   - 启动时自动加载

2. **单元测试**
   - 测试所有 Getters
   - 测试所有 Actions
   - 测试边界情况

3. **页面实现**
   - HomePage
   - TasksPage
   - StatisticsPage
   - FocusDrawer

---

## 📝 代码质量

✅ **TypeScript 严格模式通过**
✅ **ESLint 检查通过**
✅ **类型安全完整**
✅ **代码注释清晰**
✅ **遵循最佳实践**

---

## 📚 相关文档

- `STORE_API.md` - 完整的 API 文档
- `DEVELOPMENT_GUIDE.md` - 开发指南
- `src/types/` - 类型定义

---

**更新时间**：2026-01-09
**版本**：v1.0.0
**状态**：核心功能完成 ✅

