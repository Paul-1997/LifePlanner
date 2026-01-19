<template>
  <q-btn-group>
    <!-- Priority Button -->
    <q-btn>
      <div class="row items-center no-wrap">
        <template v-if="selectedQuadrantOption">
          <q-icon name="flag" :color="selectedQuadrantOption.color" class="q-mr-xs" />
          <span :class="`text-${selectedQuadrantOption.color}`">{{
            selectedQuadrantOption.label
          }}</span>
          <q-separator vertical class="q-mx-sm" />
          <q-icon
            name="close"
            size="xs"
            class="cursor-pointer"
            @click.stop.prevent="resetQuadrant"
          />
        </template>
        <template v-else>
          <q-icon name="flag" class="on-left" />
          優先級
        </template>
      </div>
      <q-menu class="bg-grey-2 text-grey-8">
        <q-list>
          <q-item
            v-for="opt in quadrantOptions"
            :key="opt.value"
            clickable
            v-close-popup
            @click="setQuadrant(opt.value)"
          >
            <q-item-section avatar>
              <q-icon name="flag" :color="opt.color" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{ opt.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <!-- Date Button -->
    <q-btn>
      <div class="row items-center no-wrap">
        <template v-if="props.dueDate">
          <q-icon name="event" color="primary" class="q-mr-xs" />
          <span class="text-primary">{{ props.dueDate }}</span>
          <q-separator vertical class="q-mx-sm" />
          <q-icon
            name="close"
            size="xs"
            class="cursor-pointer"
            @click.stop.prevent="clearDateTime"
          />
        </template>
        <template v-else>
          <q-icon name="schedule" class="on-left" />
          日期
        </template>
      </div>
      <q-popup-proxy
        cover
        transition-show="scale"
        transition-hide="scale"
        @before-show="initDateTime"
      >
        <div class="column bg-white">
          <div class="row q-col-gutter-x-sm">
            <q-date v-model="tempDate" mask="YYYY-MM-DD" flat />
            <q-time v-model="tempTime" mask="HH:mm" flat format24h v-if="withTime" />
          </div>
          <div class="row items-center justify-between q-pa-sm q-gutter-sm bg-grey-1">
            <q-toggle v-model="withTime" label="時間" />
            <div>
              <q-btn v-close-popup label="取消" flat color="grey" />
              <q-btn v-close-popup label="確定" color="primary" flat @click="confirmDateTime" />
            </div>
          </div>
        </div>
      </q-popup-proxy>
    </q-btn>

    <!-- Tag Button -->
    <q-btn>
      <div class="row items-center no-wrap">
        <template v-if="props.tags && props.tags.length > 0">
          <q-icon name="sell" color="accent" class="q-mr-xs" />
          <span class="text-accent">
            {{ props.tags.length > 1 ? `${props.tags.length} Tags` : props.tags[0] }}
          </span>
          <q-separator vertical class="q-mx-sm" />
          <q-icon
            name="close"
            size="xs"
            class="cursor-pointer"
            @click.stop.prevent="emit('update:tags', [])"
          />
        </template>
        <template v-else>
          <q-icon name="sell" class="on-left" />
          標籤
        </template>
      </div>
      <q-menu class="bg-white q-pa-sm" style="min-width: 250px">
        <div class="column q-gutter-sm">
          <div class="text-subtitle2 q-px-sm">選擇標籤</div>
          <q-separator />
          <q-list dense>
            <q-item v-for="tag in tagOptions" :key="tag" tag="label" clickable>
              <q-item-section avatar>
                <q-checkbox
                  :model-value="props.tags"
                  @update:model-value="(val) => emit('update:tags', val)"
                  :val="tag"
                  dense
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ tag }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-separator />
          <!-- Simple add tag input -->
          <div class="row items-center q-px-sm">
            <q-input
              v-model="newTagInput"
              dense
              outlined
              placeholder="New Tag..."
              class="col"
              @keyup.enter="addNewTag"
            />
            <q-btn
              round
              flat
              dense
              icon="add"
              color="primary"
              class="q-ml-sm"
              @click="addNewTag"
              :disable="!newTagInput"
            />
          </div>
        </div>
      </q-menu>
    </q-btn>
  </q-btn-group>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { EisenhowerQuadrant } from 'src/types/task';
import { date } from 'quasar';

const props = defineProps<{
  quadrant: EisenhowerQuadrant | null;
  dueDate: string | null;
  tags: string[];
}>();

const emit = defineEmits<{
  (e: 'update:quadrant', val: EisenhowerQuadrant | null): void;
  (e: 'update:dueDate', val: string | null): void;
  (e: 'update:tags', val: string[]): void;
}>();

// --- Quadrant Logic ---
const quadrantOptions = [
  {
    label: '優先級 1',
    value: 'do-first',
    description: 'Do First (重要且緊急)',
    color: 'negative',
  },
  {
    label: '優先級 2',
    value: 'schedule',
    description: 'Schedule (重要不緊急)',
    color: 'warning',
  },
  {
    label: '優先級 3',
    value: 'delegate',
    description: 'Delegate (緊急不重要)',
    color: 'info',
  },
  {
    label: '優先級 4',
    value: 'eliminate',
    description: 'Eliminate (不重要不緊急)',
    color: 'grey-7',
  },
];

const selectedQuadrantOption = computed(() =>
  quadrantOptions.find((opt) => opt.value === props.quadrant),
);

function resetQuadrant() {
  emit('update:quadrant', null);
}

function setQuadrant(val: string) {
  emit('update:quadrant', val as EisenhowerQuadrant);
}

// --- Date Logic ---
const tempDate = ref('');
const tempTime = ref('12:00');
const withTime = ref(false);

function initDateTime() {
  const d = props.dueDate ? new Date(props.dueDate) : new Date();
  tempDate.value = date.formatDate(d, 'YYYY/MM/DD');
  tempTime.value = date.formatDate(d, 'HH:mm');
}

function confirmDateTime() {
  if (withTime.value) {
    emit('update:dueDate', `${tempDate.value} ${tempTime.value}`);
  } else {
    emit('update:dueDate', tempDate.value);
  }
}

function clearDateTime() {
  emit('update:dueDate', null);
  tempDate.value = '';
  tempTime.value = '12:00';
}

// --- Tag Logic ---
const newTagInput = ref('');
const tagOptions = ref<string[]>(['Work', 'Personal', 'Study']);

function addNewTag() {
  const val = newTagInput.value.trim();
  if (val && !tagOptions.value.includes(val)) {
    tagOptions.value.push(val);
  }
  if (val && !props.tags.includes(val)) {
    const newTags = [...props.tags, val];
    emit('update:tags', newTags);
  }
  newTagInput.value = '';
}
</script>
