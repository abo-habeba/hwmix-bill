<template>
  <div>
    <v-btn class="ma-1" color="primary" @click="openAddDialog">اضافة قيمة</v-btn>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ isEditMode ? 'تعديل قيمة' : 'اضافة قيمة جديدة' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-combobox
              v-if="isCurrentAttributeColor"
              v-model="colorNameInput"
              :items="colorSuggestions"
              item-title="name_ar"
              item-value="name_ar"
              label="اختر أو اكتب اسم اللون"
              clearable
              :menu-props="{ maxHeight: '300px', class: 'color-suggestions-menu' }"
              no-filter
              class="pa-4"
              @update:modelValue="handleColorSelection"
              @change="handleColorSelection"
            >
              <template #prepend-inner>
                <div
                  v-if="displayColorHex"
                  :style="{
                    backgroundColor: displayColorHex,
                    width: '50px',
                    height: '24px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    marginRight: '8px',
                  }"
                ></div>
              </template>
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.name_ar"
                  :style="{
                    backgroundColor: item.raw.hex,
                    color: getContrastColor(item.raw.hex),
                    borderRadius: '4px',
                    margin: '4px 8px',
                  }"
                  @click="selectSuggestedColor(item.raw)"
                >
                </v-list-item>
              </template>
            </v-combobox>

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
              :style="{
                backgroundColor: displayColorHex || '',
                color: getContrastColor(displayColorHex),
              }"
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
            backgroundColor: displayColorHex || '',
            color: getContrastColor(displayColorHex),
            position: 'sticky',
            top: '0',
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
import { isColorProperty, suggestClosestColors, getExactColorHexCode, normalizeText, colorDatabase } from '@/utils/color-utils';

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

const isCurrentAttributeColor = computed(() => {
  return props.attribute ? isColorProperty(props.attribute.name) : false;
});

const colorSuggestions = computed(() => {
  if (!colorNameInput.value) return [];
  return suggestClosestColors(colorNameInput.value, 10);
});

const displayColorHex = computed(() => {
  if (attributeValue.value.color) return attributeValue.value.color;
  if (colorNameInput.value) {
    const exactColor = colorDatabase.find(
      c =>
        normalizeText(c.name_ar) === normalizeText(colorNameInput.value) ||
        normalizeText(c.name_en) === normalizeText(colorNameInput.value) ||
        (c.synonyms && c.synonyms.some(s => normalizeText(s) === normalizeText(colorNameInput.value)))
    );
    return exactColor ? exactColor.hex : getExactColorHexCode(colorNameInput.value);
  }
  return null;
});

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

  if (isCurrentAttributeColor.value) {
    attributeValue.value.name = colorNameInput.value;
    attributeValue.value.color = displayColorHex.value || '';
  }

  try {
    const response = await saveItem('attribute-value', attributeValue.value, attributeValue.value.id, true);
    emit(isEditMode.value ? 'value-edited' : 'value-added', response);
    closeDialog();
  } catch (e) {
    console.error('Error saving:', e);
  }
}

// معالجة اختيار اللون من قائمة الاقتراحات
function selectSuggestedColor(colorObject) {
  if (isCurrentAttributeColor.value && colorObject) {
    colorNameInput.value = colorObject.name_ar; // تعيين اسم اللون للعرض في combobox
    attributeValue.value.color = colorObject.hex; // تعيين اللون السداسي العشري
    attributeValue.value.name = colorObject.name_ar; // تعيين اسم اللون كقيمة فعلية للحفظ
  }
}

// معالجة تحديث modelValue للـ v-combobox (عند الكتابة أو عند الضغط على عنصر)
function handleColorSelection(val) {
  // val قد تكون string (إذا كتب المستخدم) أو كائن (إذا تم اختيار عنصر)
  if (typeof val === 'string') {
    colorNameInput.value = val;
    const hex = getExactColorHexCode(val);
    attributeValue.value.color = hex || '';
    attributeValue.value.name = val; // تأكيد تعيين الاسم
  } else if (val && typeof val === 'object' && val.name_ar) {
    colorNameInput.value = val.name_ar;
    attributeValue.value.color = val.hex || '';
    attributeValue.value.name = val.name_ar;
  } else {
    attributeValue.value.color = '';
    attributeValue.value.name = '';
  }
}

// مراقبة props.editValue لفتح نافذة التعديل
watch(
  () => props.editValue,
  val => {
    if (val?.id) {
      openEditDialog(val);
    }
  },
  { immediate: true }
);

// مراقبة colorNameInput لتحديث اللون فقط في حالة عدم الاختيار المباشر
// هذه المراقبة ستكمل عمل handleColorSelection في حالة الكتابة اليدوية فقط
// watch(colorNameInput, val => {
//   if (isCurrentAttributeColor.value && val && typeof val === 'string') {
//     const hex = getExactColorHexCode(val);
//     if (hex) {
//       attributeValue.value.color = hex;
//     }
//   }
// });
</script>

<style scoped>
.v-color-picker {
  max-width: none !important;
  width: auto !important;
}
.forbidden-cursor {
  cursor: not-allowed !important;
}

/* حل مشكلة التمرير في الجوال */
.color-suggestions-menu .v-overlay__content {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* لإصلاح مشكلة الضغط المزدوج */
/* تم تعديل منطق اختيار العناصر في القالب و handleColorSelection */
/* إضافة @change على v-combobox يمكن أن يساعد في بعض السيناريوهات. */
</style>
