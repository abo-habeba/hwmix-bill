<template>
  <v-card-subtitle class="ma-2">الخصائص (Attributes)</v-card-subtitle>

  <v-row dense v-for="(attr, aIndex) in modelValue" :key="aIndex" class="d-flex align-center">
    <!-- حقل اختيار الخاصية -->
    <v-col cols="5">
      <v-select
        v-model="attr.attribute_id"
        :items="attributes"
        item-title="name"
        item-value="id"
        label="اختر الخاصية"
        dense
        outlined
        hide-details="auto"
        @update:modelValue="val => onAttributeChange(aIndex, val)"
      />
    </v-col>

    <!-- حقل اختيار القيمة -->
    <v-col cols="5">
      <v-select
        v-model="attr.attribute_value_id"
        :items="getAttributeValues(attr.attribute_id)"
        item-title="name"
        item-value="id"
        label="اختر القيمة"
        dense
        outlined
        hide-details="auto"
        :disabled="!attr.attribute_id"
        :style="getAttributeStyle(attr.attribute_id, attr.attribute_value_id)"
      >
        <template #item="{ props, item }">
          <v-list-item v-bind="props" :style="item.raw.color ? `background:${item.raw.color};` : ''"> </v-list-item>
        </template>
      </v-select>
    </v-col>

    <!-- زر الحذف -->
    <v-col cols="2" class="text-end">
      <v-btn icon="ri-delete-bin-line" color="error" size="x-small" variant="text" @click="removeAttribute(aIndex)" />
    </v-col>
  </v-row>

  <!-- زر إضافة خاصية -->
  <v-btn class="my-2" text color="primary" density="comfortable" @click="addAttribute"> + إضافة خاصية </v-btn>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  attributes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

/**
 * إرجاع القيم المتاحة لخاصية معينة
 */
function getAttributeValues(attributeId) {
  const attribute = props.attributes.find(attr => attr.id === attributeId);
  return attribute?.values || [];
}

/**
 * إعادة تهيئة القيمة عند تغيير الخاصية
 */
function onAttributeChange(index, newAttributeId) {
  const updated = [...props.modelValue];
  updated[index] = {
    attribute_id: newAttributeId,
    attribute_value_id: null,
  };
  emit('update:modelValue', updated);
}

/**
 * إضافة خاصية جديدة
 */
function addAttribute() {
  const updated = [...props.modelValue, { attribute_id: null, attribute_value_id: null }];
  emit('update:modelValue', updated);
}

/**
 * إزالة خاصية من القائمة
 */
function removeAttribute(index) {
  const updated = [...props.modelValue];
  updated.splice(index, 1);
  emit('update:modelValue', updated);
}

/**
 * حساب لون متباين للكتابة
 */
function getContrastColor(hexcolor) {
  if (!hexcolor) return '#000';
  const color = hexcolor.substring(1);
  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 186 ? '#000' : '#fff';
}

/**
 * تحديد شكل القيمة حسب اللون لو متوفر
 */
function getAttributeStyle(attributeId, attributeValueId) {
  const selected = getAttributeValues(attributeId).find(v => v.id === attributeValueId);
  return selected?.color ? `background:${selected.color};color:${getContrastColor(selected.color)};border-radius:6px;padding-inline:6px;` : '';
}
</script>

<style scoped>
.v-select {
  min-height: 40px;
}
</style>
