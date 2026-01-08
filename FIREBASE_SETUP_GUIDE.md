# Firebase 設定指南

> 當你準備好進入 Phase 3（雲端同步）時，參考這份指南

---

## 📋 目錄

1. [建立 Firebase 專案](#1-建立-firebase-專案)
2. [啟用 Firestore 資料庫](#2-啟用-firestore-資料庫)
3. [啟用 Authentication](#3-啟用-authentication)
4. [獲取配置資訊](#4-獲取配置資訊)
5. [安裝 Firebase SDK](#5-安裝-firebase-sdk)
6. [設定環境變數](#6-設定環境變數)
7. [建立 Firebase Boot 檔案](#7-建立-firebase-boot-檔案)
8. [設定安全規則](#8-設定安全規則)

---

## 1. 建立 Firebase 專案

### 步驟

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」或「Add project」
3. 輸入專案名稱：`LifePlanner`（或你想要的名稱）
4. 關閉 Google Analytics（個人使用不需要）
5. 點擊「建立專案」

**預估時間**：1-2 分鐘

---

## 2. 啟用 Firestore 資料庫

### 步驟

1. 在 Firebase Console，左側選單選擇「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇位置：`asia-east1`（台灣）或 `asia-northeast1`（東京）
4. 選擇模式：
   - **測試模式**（開發用，30 天後自動鎖定）
   - **生產模式**（需要設定規則，建議先選測試模式）
5. 點擊「建立」

### 測試模式規則（自動生成）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 2, 7); // 30 天後
    }
  }
}
```

**注意**：記得在 30 天內改為生產模式規則（見第 8 節）

---

## 3. 啟用 Authentication

### 步驟

1. 左側選單選擇「Authentication」
2. 點擊「開始使用」
3. 在「Sign-in method」標籤頁，啟用以下登入方式：

#### Google 登入

1. 點擊「Google」
2. 啟用開關
3. 輸入專案支援電子郵件（你的 Gmail）
4. 點擊「儲存」

#### Email/Password 登入（選配）

1. 點擊「Email/Password」
2. 啟用「Email/Password」
3. （可選）啟用「電子郵件連結（無密碼登入）」
4. 點擊「儲存」

---

## 4. 獲取配置資訊

### 步驟

1. 點擊專案設定（左上角齒輪圖示）
2. 選擇「專案設定」
3. 滾動到「你的應用程式」區塊
4. 點擊「Web」圖示（`</>`）
5. 輸入應用程式暱稱：`LifePlanner Web`
6. 勾選「同時為這個應用程式設定 Firebase Hosting」（選配）
7. 點擊「註冊應用程式」
8. 複製「Firebase SDK snippet」中的配置

### 配置範例

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "lifeplanner-xxxxx.firebaseapp.com",
  projectId: "lifeplanner-xxxxx",
  storageBucket: "lifeplanner-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxx"
};
```

**重要**：妥善保存這些資訊！

---

## 5. 安裝 Firebase SDK

### 使用 pnpm

```bash
pnpm add firebase
```

### 使用 npm

```bash
npm install firebase
```

### 使用 yarn

```bash
yarn add firebase
```

---

## 6. 設定環境變數

為了安全，不要直接在程式碼中寫 Firebase 配置，使用環境變數。

### 步驟

1. 在專案根目錄建立 `.env` 檔案
2. 加入 Firebase 配置（將第 4 節的值貼上）

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=lifeplanner-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lifeplanner-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=lifeplanner-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxxxxxx
```

3. 在 `.gitignore` 確認有 `.env`（避免洩漏）

```gitignore
.env
.env.local
.env.*.local
```

---

## 7. 建立 Firebase Boot 檔案

### 建立檔案：`src/boot/firebase.ts`

```typescript
import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase 配置
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化服務
const db = getFirestore(app);
const auth = getAuth(app);

// 開發環境：使用模擬器（可選）
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export default boot(() => {
  // 可以在這裡做額外的初始化
});

export { db, auth, app };
```

### 註冊 Boot 檔案

在 `quasar.config.ts` 的 `boot` 陣列加入：

```typescript
boot: ['i18n', 'axios', 'firebase'],  // 加入 'firebase'
```

---

## 8. 設定安全規則

當測試模式到期後，需要設定生產環境規則。

### Firestore 安全規則

在 Firebase Console → Firestore Database → 規則，貼上以下內容：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 只有登入用戶可以讀寫自己的資料
    match /tasks/{taskId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    match /routineCheckIns/{checkInId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    match /focusSessions/{sessionId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Storage 規則（如果使用）

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 9. 測試連線

### 建立測試頁面：`src/pages/FirebaseTestPage.vue`

```vue
<template>
  <q-page class="flex flex-center">
    <div class="q-gutter-md">
      <q-btn label="測試 Firestore 寫入" @click="testWrite" color="primary" />
      <q-btn label="測試 Firestore 讀取" @click="testRead" color="secondary" />
      <div v-if="result">
        <q-card>
          <q-card-section>
            <pre>{{ result }}</pre>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from 'src/boot/firebase';

const result = ref('');

async function testWrite() {
  try {
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello Firebase!',
      timestamp: new Date(),
    });
    result.value = `寫入成功！ID: ${docRef.id}`;
  } catch (error) {
    result.value = `錯誤: ${error}`;
  }
}

async function testRead() {
  try {
    const querySnapshot = await getDocs(collection(db, 'test'));
    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    result.value = JSON.stringify(docs, null, 2);
  } catch (error) {
    result.value = `錯誤: ${error}`;
  }
}
</script>
```

---

## 10. 常見問題

### Q: API Key 洩漏會有安全問題嗎？

A: Firebase 的 API Key 是設計為公開的，安全性由 Firestore 規則和 Authentication 控制。只要規則設定正確，就不會有問題。

### Q: 免費額度夠用嗎？

A: 對於個人使用，免費額度綽綽有餘：
- Firestore: 50,000 讀取/天、20,000 寫入/天
- Authentication: 無限制
- Storage: 1 GB

### Q: 如何備份資料？

A: 
1. 使用 Firebase Console 的匯出功能
2. 使用 `firebase-admin` SDK 寫腳本
3. 在 App 內實作匯出為 JSON 功能

### Q: 如何在開發環境測試？

A: 使用 Firebase Emulator Suite（本地模擬器）

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 初始化專案
firebase init emulators

# 啟動模擬器
firebase emulators:start
```

---

## 📚 相關資源

- [Firebase 官方文件](https://firebase.google.com/docs)
- [Firestore 資料結構設計指南](https://firebase.google.com/docs/firestore/data-model)
- [Firebase 安全規則參考](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase 定價說明](https://firebase.google.com/pricing)

---

## ✅ 檢查清單

完成 Firebase 設定後，請確認：

- [ ] Firebase 專案已建立
- [ ] Firestore 資料庫已啟用
- [ ] Authentication 已設定 Google 登入
- [ ] 配置資訊已複製並設定為環境變數
- [ ] Firebase SDK 已安裝
- [ ] Boot 檔案已建立並註冊
- [ ] 測試連線成功

---

_更新時間：2026-01-07_


