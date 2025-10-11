<template>
  <v-autocomplete
    v-model="selectedId"
    :items="items"
    :item-title="itemTitle"
    item-value="id"
    :label="label"
    :loading="isLoading"
    :search="searchText"
    clearable
    hide-details
    ref="autocompleteRef"
    @update:search="onSearch"
    @update:model-value="onSelect"
    @keydown.enter.prevent="handleFreeTextOnEnter"
  >
    <template #no-data>
      <v-list-item :title="searchText" @click="handleCreation(searchText)">
        <template #prepend>
          <v-icon icon="ri-add-line" color="primary"></v-icon>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { ref, computed } from 'vue';
import { saveItem } from '@/services/api';

const props = defineProps({
  modelValue: [Number, String, null],
  items: { type: Array, default: () => [] },
  label: { type: String, default: 'البحث' },
  entity: { type: String, required: true, validator: val => ['category', 'brand'].includes(val) },
  itemTitle: { type: String, default: 'name' },
});

const emit = defineEmits(['update:modelValue', 'item-created']);

const isLoading = ref(false);
const searchText = ref('');
const autocompleteRef = ref(null);

const selectedId = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

function onSearch(val) {
  searchText.value = val;
}

function onSelect(value) {
  if (value && props.items.some(i => i.id === value)) {
    searchText.value = '';
  }
}

async function handleCreation(itemName) {
  if (!itemName) return;

  if (props.items.some(i => i[props.itemTitle].toLowerCase() === itemName.toLowerCase())) {
    searchText.value = '';
    return;
  }

  isLoading.value = true;
  try {
    const payload = { name: itemName };
    const createdItem = await saveItem(props.entity, payload, false, false, true, false);
    console.log('نم الحفظ', createdItem.data);

    createdItem.data.entity = props.entity;
    emit('item-created', createdItem.data);
    await nextTick();
    if (autocompleteRef.value) {
      autocompleteRef.value.blur();
    }

    console.log('تم المرور علي الحدث', createdItem.data);
  } catch (error) {
    console.error(`فشل إضافة ${props.entity}:`, error);
  } finally {
    isLoading.value = false;
    searchText.value = '';
  }
}

function handleFreeTextOnEnter() {
  const trimmedText = searchText.value?.trim();
  if (!trimmedText) return;

  if (!props.items.some(i => i[props.itemTitle].toLowerCase() === trimmedText.toLowerCase())) {
    handleCreation(trimmedText);
  } else {
    searchText.value = '';
  }
}
</script>

<style scoped>
/* أنماط إضافية إذا لزم الأمر */
</style>
