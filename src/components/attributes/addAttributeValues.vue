<template>
  <div>
    <v-btn class="ma-1" color="primary" @click="openAddDialog">اضافة قيمة</v-btn>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ isEditMode ? 'تعديل قيمة' : 'اضافة قيمة جديدة' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <!-- في حالة أن الخاصية لون -->
            <v-combobox
              v-if="isCurrentAttributeColor"
              v-model="colorNameInput"
              :items="colorSuggestions"
              item-title="name_ar"
              :item-value="val => val.name_ar"
              label="اختر أو اكتب اسم اللون"
              clearable
              :menu-props="{ maxHeight: '300px' }"
              no-filter
              class="pa-3"
            >
              <template #item="{ props, item }">
                <v-list-item
                  class="ma-1"
                  v-bind="props"
                  :style="{
                    backgroundColor: item.raw.hex,
                    color: getContrastColor(item.raw.hex),
                    borderRadius: '10px !important',
                    overflow: 'hidden',
                  }"
                >
                </v-list-item>
              </template>
            </v-combobox>

            <!-- إذا لم تكن الخاصية لون -->
            <v-text-field
              v-else
              class="pa-3"
              v-model="attributeValue.name"
              label="اسم القيمة"
              :rules="[v => !!v || 'اسم القيمة مطلوب']"
              required
            ></v-text-field>

            <v-btn
              v-if="isCurrentAttributeColor"
              class="ma-3"
              :style="{ backgroundColor: attributeValue.color || '', color: getContrastColor(attributeValue.color) }"
              @click="colorPickerDialog = true"
            >
              اختر اللون يدويًا
            </v-btn>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">الغاء</v-btn>
          <v-btn color="blue darken-1" :class="{ 'forbidden-cursor': !formValid }" text @click="saveValue">
            {{ isEditMode ? 'تحديث' : 'حفظ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="colorPickerDialog" max-width="500px">
      <v-card>
        <v-card-title
          :style="{
            backgroundColor: attributeValue.color || '',
            color: getContrastColor(attributeValue.color),
            position: 'fixed',
            zIndex: '100',
            width: '100%',
          }"
        >
          اختر اللون
        </v-card-title>
        <v-card-text class="mt-10">
          <v-color-picker v-model="attributeValue.color" show-swatches hide-inputs></v-color-picker>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" class="mx-auto my-2 elevated-5" @click="colorPickerDialog = false">
            <v-icon class="mx-3" size="18">ri-check-line</v-icon>
            تم
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, defineExpose, computed } from 'vue';
import { saveItem } from '@/services/api';
import { toast } from 'vue3-toastify';
import { isColorProperty, suggestClosestColors, getExactColorHexCode, normalizeText } from '@/utils/color-utils';

const props = defineProps({
  attribute: Object,
  editValue: Object,
});

const emit = defineEmits(['value-added', 'value-edited']);

const dialog = ref(false);
const colorPickerDialog = ref(false);
const attributeValue = ref({ name: '', color: '', attribute_id: null, id: null });
const isEditMode = ref(false);
const formRef = ref(null);
const formValid = ref(false);

const colorNameInput = ref('');

// هل الخاصية تتعلق بلون؟
const isCurrentAttributeColor = computed(() => {
  return props.attribute ? isColorProperty(props.attribute.name) : false;
});

// اقتراحات الألوان
const colorSuggestions = computed(() => {
  if (!colorNameInput.value) return [];
  return suggestClosestColors(colorNameInput.value, 10);
});

// تحديد لون الخط حسب الخلفية
function getContrastColor(hexcolor) {
  if (!hexcolor || hexcolor.length < 7) return '#000000';
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y >= 128 ? '#000000' : '#FFFFFF';
}

function openAddDialog() {
  isEditMode.value = false;
  dialog.value = true;
  attributeValue.value = { name: '', color: '', attribute_id: props.attribute.id, id: null };
  colorNameInput.value = '';
}

function openEditDialog(val) {
  isEditMode.value = true;
  dialog.value = true;
  attributeValue.value = { ...val };
  if (!attributeValue.value.attribute_id && props.attribute?.id) {
    attributeValue.value.attribute_id = props.attribute.id;
  }
  if (isColorProperty(props.attribute?.name)) {
    colorNameInput.value = val.name || '';
  }
}

defineExpose({ openEditDialog, openAddDialog });

function closeDialog() {
  dialog.value = false;
  attributeValue.value = { name: '', color: '', attribute_id: null, id: null };
  colorNameInput.value = '';
  formRef.value?.resetValidation();
}

async function saveValue() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  // تحديث الاسم فقط لو الخاصية لون
  if (isCurrentAttributeColor.value) {
    attributeValue.value.name = colorNameInput.value;
  }

  try {
    const response = await saveItem('attribute-value', attributeValue.value, attributeValue.value.id, true);
    emit(isEditMode.value ? 'value-edited' : 'value-added', response);
    closeDialog();
  } catch (e) {
    console.error('Error saving:', e);
  }
}

// تحديث اللون تلقائيًا بناءً على الاسم المدخل في الكمبوبوكس
watch(colorNameInput, val => {
  if (isCurrentAttributeColor.value && val) {
    const hex = getExactColorHexCode(val);
    attributeValue.value.color = hex || '';
  }
});

// مزامنة الاسم واللون في حالة تعديل قيمة موجودة
watch(
  () => props.editValue,
  val => {
    if (val?.id) {
      openEditDialog(val);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.v-color-picker {
  max-width: none !important;
  width: auto !important;
}
.forbidden-cursor {
  cursor: not-allowed !important;
}
</style>
