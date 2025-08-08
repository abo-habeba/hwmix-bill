<script setup>
import { ref, watch, computed } from 'vue';
import { useDisplay } from 'vuetify';

const props = defineProps({
  modelValue: Boolean,
  variant: Object,
  attributes: Array,
});
const emit = defineEmits(['update:modelValue', 'save']);
const dialog = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
});
const localVariant = ref({});

watch(
  () => props.variant,
  v => {
    localVariant.value = JSON.parse(JSON.stringify(v || {}));
  },
  { immediate: true }
);

function getAttributeValues(attributeId) {
  if (!attributeId) return [];
  const attr = props.attributes.find(a => a.id === attributeId);
  return attr ? attr.values : [];
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
  localVariant.value.attributes = localVariant.value.attributes || [];
  localVariant.value.attributes.push({ attribute_id: null, attribute_value_id: null });
}
function removeAttribute(aIndex) {
  localVariant.value.attributes.splice(aIndex, 1);
}
function closeDialog() {
  emit('update:modelValue', false);
}
function save() {
  emit('save', JSON.parse(JSON.stringify(localVariant.value)));
  closeDialog();
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card class="bg-grey-lighten-4 pa-2">
      <v-card-title>تعديل متغير المنتج</v-card-title>
      <v-row class="bg-grey-lighten-4 pa-2">
        <v-col class="bg-grey-lighten-4 pa-2" cols="12">
          <v-row>
            <v-col cols="4">
              <v-text-field v-model="localVariant.purchase_price" label="سعر الشراء" type="number" hide-details="auto" />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="localVariant.retail_price" label="سعر القطاعي" type="number" hide-details="auto" />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="localVariant.wholesale_price" label="سعر الجملة" type="number" hide-details="auto" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="localVariant.tax_rate" label="نسبة الضريبة" type="number" hide-details="auto" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="localVariant.discount" label="الخصم" type="number" hide-details="auto" />
            </v-col>
          </v-row>
        </v-col>
        <v-col class="py-0" cols="12">
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="localVariant.expiry_date" label="تاريخ الانتهاء" type="date" hide-details="auto" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="localVariant.image_url" label="رابط الصورة" hide-details="auto" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="mt-4">
          <v-card-subtitle>الخصائص (Attributes)</v-card-subtitle>
          <v-row dense v-for="(attr, aIndex) in localVariant.attributes" :key="aIndex" class="d-flex align-center">
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
                @change="() => (attr.attribute_value_id = null)"
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
                ::return-object="false"
                hide-details="auto"
                :style="
                  (() => {
                    const selected = getAttributeValues(attr.attribute_id).find(v => v.id === attr.attribute_value_id);
                    return selected && selected.color
                      ? `background:${selected.color};color:${getContrastColor(selected.color)};border-radius:6px;`
                      : '';
                  })()
                "
              >
                <template #item="{ item, props: itemProps }">
                  <v-list-item
                    v-bind="itemProps"
                    :style="item.raw.color ? `background:${item.raw.color};color:${getContrastColor(item.raw.color)};border-radius:6px;` : ''"
                  >
                  </v-list-item>
                </template>
                <template #selection="{ item }">
                  <span
                    :style="
                      item.raw.color
                        ? `background:${item.raw.color};color:${getContrastColor(
                            item.raw.color
                          )};padding:2px 8px;border-radius:6px;display:inline-block`
                        : ''
                    "
                  >
                    {{ item.raw.name }}
                  </span>
                </template>
              </v-select>
            </v-col>
            <v-col cols="2">
              <v-btn class="my-a" icon="ri-delete-bin-line" color="error" @click="removeAttribute(aIndex)"> </v-btn>
            </v-col>
          </v-row>
          <v-btn class="my-2" text color="primary" small @click="addAttribute">+ إضافة خاصية جديدة</v-btn>
        </v-col>
      </v-row>
      <v-divider class="my-4"></v-divider>
      <v-row>
        <v-col cols="6">
          <v-btn prepend-icon="ri-close-line" color="error" @click="closeDialog"> إلغاء </v-btn>
        </v-col>
        <v-col cols="6" class="text-center">
          <v-btn prepend-icon="ri-save-line" color="success" @click="save"> حفظ </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.forbidden-cursor {
  cursor: not-allowed !important;
}
</style>
