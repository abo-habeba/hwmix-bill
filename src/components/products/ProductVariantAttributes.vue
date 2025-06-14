<template>
  <v-card-subtitle class="ma-1">الخصائص (Attributes)</v-card-subtitle>
  <v-row dense v-for="(attr, aIndex) in modelValue" :key="aIndex" class="d-flex align-center">
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
        @update:modelValue="() => (attr.attribute_value_id = null)"
      />
    </v-col>
    <v-col cols="5">
      <v-select
        v-model="attr.attribute_value_id"
        :items="getAttributeValues(attr.attribute_id)"
        item-title="name"
        item-value="id"
        label="اختر القيمة"
        dense
        outlined
        :disabled="!attr.attribute_id"
        hide-details="auto"
        :style="getAttributeStyle(attr.attribute_id, attr.attribute_value_id)"
      />
    </v-col>
    <v-col cols="2">
      <v-btn class="my-a" icon="ri-delete-bin-line" color="error" size="small" @click="removeAttribute(aIndex)"> </v-btn>
    </v-col>
  </v-row>
  <v-btn class="my-1 pa-1" text color="primary" small @click="addAttribute">+ إضافة خاصية</v-btn>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  modelValue: Array,
  attributes: {
    type: Array,
    // إزالة `required: true` والاعتماد على `default`
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

function getAttributeValues(attributeId) {
  const attribute = props.attributes.find(attr => attr.id === attributeId);
  return attribute ? attribute.values : [];
}

function getAttributeStyle(attributeId, attributeValueId) {
  const selected = getAttributeValues(attributeId).find(v => v.id === attributeValueId);
  return selected && selected.color ? `background:${selected.color};color:${getContrastColor(selected.color)};border-radius:6px;` : '';
}

function getContrastColor(hexcolor) {
  if (!hexcolor) return '#000';
  const c = hexcolor.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 186 ? '#000' : '#fff';
}

function addAttribute() {
  const newAttribute = { attribute_id: null, attribute_value_id: null };
  emit('update:modelValue', [...props.modelValue, newAttribute]);
}

function removeAttribute(index) {
  const updatedModelValue = [...props.modelValue];
  updatedModelValue.splice(index, 1);
  emit('update:modelValue', updatedModelValue);
}
</script>

<style scoped>
/* يمكن إضافة أنماط إضافية هنا */
</style>
