<template>
  <v-container>
    <!-- الزر لفتح الحوار -->
    <v-btn color="primary" @click="openAddDialog">اضافة خاصية جديدة</v-btn>

    <v-card class="mt-4 pa-3">
      <v-card-title> الخصائص</v-card-title>
      <v-divider></v-divider>
      <div class="d-flex flex-wrap gap-2 pa-3">
        <v-row>
          <v-col v-if="attributes.length" v-for="attr in attributes" :key="attr.id" cols="12" sm="6" md="4" lg="3">
            <v-chip
              class="d-flex align-center pa-1"
              @click="openValuesDialog(attr)"
              :style="{
                minHeight: '35px',
              }"
            >
              <div class="ma-3 flex-grow-1">{{ attr.name }}</div>
              <v-btn
                icon
                size="x-small"
                color="primary"
                class="ma-1"
                style="margin-inline-start: 4px"
                @click.stop="openEditDialog(attr)"
                title="تعديل"
              >
                <v-icon size="18">ri-edit-line</v-icon>
              </v-btn>
              <v-btn icon size="x-small" color="error" class="ma-1" style="margin-inline-start: 2px" @click.stop="confirmDelete(attr.id)" title="حذف">
                <v-icon size="18">ri-delete-bin-line</v-icon>
              </v-btn>
            </v-chip>
          </v-col>
        </v-row>
        <v-chip v-if="attributes.length === 0">لا توجد خصائص حتى الآن</v-chip>
      </div>
      <!-- عرض القيم الخاصة بكل خاصية -->
      <div v-for="attr in attributes" :key="'values-' + attr.id">
        <v-expand-transition>
          <div v-if="showValuesId === attr.id && attr.values && attr.values.length" class="ms-8 mt-2 mb-4">
            <v-card flat class="pa-2" color="#f8f8f8">
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="val in attr.values"
                  :key="val.id"
                  class="d-flex align-center pa-1"
                  :style="{ backgroundColor: val.color || '#e0e0e0' }"
                >
                  <span>{{ val.name }}</span>
                </v-chip>
                <v-chip v-if="attr.values.length === 0">لا توجد قيم لهذه الخاصية</v-chip>
              </div>
            </v-card>
          </div>
        </v-expand-transition>
      </div>
    </v-card>
    <!-- تم ربط dialog مع v-model هنا -->
    <AddAttribute
      :attributes="attributes"
      :addDialog="addDialog"
      :editAttribute="editAttribute"
      @update:addDialog="savedAttribute"
      @update:attributes="updateAttributes"
    />

    <!-- حوار الحذف -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>تأكيد الحذف</v-card-title>
        <v-card-text>هل أنت متأكد من حذف هذه الخاصية؟</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">الغاء</v-btn>
          <v-btn color="red darken-1" text @click="deleteAttribute(confirmDeleteId)">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog لعرض القيم الخاصة بالخاصية -->
    <v-dialog v-model="valuesDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>قيم الخاصية : {{ selectedAttributeForValues?.name }}</span>
          <!-- استدعاء كمبوننت إضافة/تعديل قيمة -->
          <AddAttributeValues
            :attribute="selectedAttributeForValues"
            v-if="selectedAttributeForValues"
            :edit-value="editValueData"
            @value-added="onValueAdded"
            @value-edited="onValueEdited"
            ref="addEditValueRef"
          />
        </v-card-title>
        <v-card-text class="my-2">
          <v-row>
            <v-col v-for="val in selectedAttributeForValues.values" :key="val.id" cols="12" sm="6" md="4" lg="3">
              <div
                class="w-100 elevation-6 box-attribute-values"
                :style="{
                  backgroundColor: val.color || '#e0e0e0',
                  minHeight: '33px',
                  color: getTextColor(val.color),
                }"
              >
                <div
                  :style="{
                    backgroundColor: val.color || '#e0e0e0',
                    color: getTextColor(val.color),
                  }"
                  class="ma-3 flex-grow-1"
                >
                  {{ val.name }}
                </div>
                <v-btn
                  class="ma-2"
                  icon
                  size="x-small"
                  color="primary"
                  style="margin-inline-start: 4px"
                  @click.stop="openEditValueDialog(val)"
                  title="تعديل القيمة"
                >
                  <v-icon size="16">ri-edit-line</v-icon>
                </v-btn>
                <v-btn
                  class="ma-2"
                  icon
                  size="x-small"
                  color="error"
                  style="margin-inline-start: 2px"
                  @click.stop="confirmDeleteValue(val.id)"
                  title="حذف القيمة"
                >
                  <v-icon size="16">ri-delete-bin-line</v-icon>
                </v-btn>
              </div>
            </v-col>
            <v-col v-if="!selectedAttributeForValues.values || selectedAttributeForValues.values.length === 0" cols="12">
              <v-chip>لا توجد قيم لهذه الخاصية</v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="valuesDialog = false">إغلاق</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog تأكيد حذف قيمة -->
    <v-dialog v-model="deleteValueDialog" max-width="350px">
      <v-card>
        <v-card-title>تأكيد حذف القيمة</v-card-title>
        <v-card-text>هل أنت متأكد من حذف هذه القيمة؟</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteValueDialog = false">إلغاء</v-btn>
          <v-btn color="red darken-1" text @click="deleteValue">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAll, saveItem, deleteOne } from '@/services/api';
import AddAttribute from '@/components/attributes/AddAttribute.vue';
import AddAttributeValues from '@/components/attributes/addAttributeValues.vue';
import { toast } from 'vue3-toastify';

const addDialog = ref(false);
const deleteDialog = ref(false);
const confirmDeleteId = ref(null);
const attributes = ref([]);
const editAttribute = ref(null);
const selectedAttributeId = ref(null);
const showValuesId = ref(null);
const valuesDialog = ref(false);
const selectedAttributeForValues = ref(null);
const deleteValueDialog = ref(false);
const valueToDeleteId = ref(null);

// متغيرات حوار تعديل القيمة
const editValueDialog = ref(false);
const editValueForm = ref({ id: null, name: '', color: '' });
const editValueFormRef = ref(null);
const editValueFormValid = ref(false);
const addEditValueRef = ref(null);
const editValueData = ref(null);

function getTextColor(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '#000000';
  const color = hex.replace('#', '');
  if (color.length !== 6) return '#000000';

  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? '#FFFFFF' : '#000000';
}
const savedAttribute = data => {
  addDialog.value = data.dialog;
  console.log(data.data);
};

// دالة حفظ الخاصية
function saveAttribute(payload) {
  if (!payload.name) {
    toast.error('اسم الخاصية مطلوب');
    return;
  }
  saveItem('attribute', payload, false, true, true)
    .then(() => {
      getAttributes();
      addDialog.value = false;
    })
    .catch(() => toast.error('حدث خطأ أثناء حفظ الخاصية'));
}

// دالة تأكيد الحذف
function confirmDelete(id) {
  confirmDeleteId.value = id;
  deleteDialog.value = true;
}

// دالة حذف الخاصية
function deleteAttribute(id) {
  deleteOne('attribute', id)
    .then(() => {
      getAttributes();
    })
    .finally(() => {
      confirmDeleteId.value = null;
      deleteDialog.value = false;
    });
}

// دالة جلب الخصائص
function getAttributes() {
  getAll('attributes', null, true, false).then(res => {
    attributes.value = res;
  });
}

// دالة فتح حوار الإضافة
const openAddDialog = () => {
  addDialog.value = true;
  editAttribute.value = null;
};

// دالة فتح حوار التعديل
const openEditDialog = attribute => {
  // إصلاح: يجب عمل نسخة جديدة حتى تعمل reactivity بشكل صحيح
  editAttribute.value = { ...attribute };
  addDialog.value = true;
};

const updateAttributes = attribute => {
  const index = attributes.value.findIndex(attr => attr.id === attribute.id);

  if (index !== -1) {
    // لو الخاصية موجودة: استبدلها
    attributes.value[index] = attribute;
  } else {
    // لو مش موجودة: أضفها
    attributes.value.push(attribute);
  }
};

function openValuesDialog(attr) {
  selectedAttributeForValues.value = attr;
  valuesDialog.value = true;
}

function onValueAdded(newValue) {
  if (selectedAttributeForValues.value && selectedAttributeForValues.value.values) {
    selectedAttributeForValues.value.values.push(newValue);
    // تحديث القائمة الرئيسية أيضاً
    // const idx = attributes.value.findIndex(a => a.id === selectedAttributeForValues.value.id);
    // if (idx !== -1) attributes.value[idx].values.push(newValue);
  }
}

function onValueEdited(editedValue) {
  // تحديث القيمة في القائمة
  const idx = selectedAttributeForValues.value.values.findIndex(v => v.id === editedValue.id);
  if (idx !== -1) selectedAttributeForValues.value.values[idx] = editedValue;
  // تحديث القائمة الرئيسية أيضاً
  const attrIdx = attributes.value.findIndex(a => a.id === selectedAttributeForValues.value.id);
  if (attrIdx !== -1 && attributes.value[attrIdx].values) {
    const vIdx = attributes.value[attrIdx].values.findIndex(v => v.id === editedValue.id);
    if (vIdx !== -1) attributes.value[attrIdx].values[vIdx] = editedValue;
  }
}

function confirmDeleteValue(id) {
  valueToDeleteId.value = id;
  deleteValueDialog.value = true;
}

function deleteValue() {
  deleteOne('attribute-value', valueToDeleteId.value)
    .then(() => {
      reloadAttributeValues(valueToDeleteId.value);
      deleteValueDialog.value = false;
    })
    .finally(() => {
      confirmDeleteId.value = null;
      deleteValueDialog.value = false;
    });
}

function reloadAttributeValues(deletedId = null) {
  // إذا تم حذف قيمة، احذفها مباشرة من مصفوفة القيم دون إعادة تحميل كامل
  if (deletedId && selectedAttributeForValues.value && selectedAttributeForValues.value.values) {
    selectedAttributeForValues.value.values = selectedAttributeForValues.value.values.filter(v => v.id !== deletedId);
    // تحديث القائمة الرئيسية أيضاً
    const idx = attributes.value.findIndex(a => a.id === selectedAttributeForValues.value.id);
    if (idx !== -1 && attributes.value[idx].values) {
      attributes.value[idx].values = attributes.value[idx].values.filter(v => v.id !== deletedId);
    }
    return;
  }
  // تحميل القيم للخاصية المحددة فقط إذا لم يكن حذف
  getAll(`attribute/${selectedAttributeForValues.value.id}/values`).then(res => {
    selectedAttributeForValues.value.values = res.data;
    // تحديث القائمة الرئيسية أيضاً
    const idx = attributes.value.findIndex(a => a.id === selectedAttributeForValues.value.id);
    if (idx !== -1) attributes.value[idx].values = res.data;
  });
}

// دالة فتح حوار تعديل قيمة
function openEditValueDialog(val) {
  editValueData.value = { ...val };
  // استدعاء دالة فتح الديالوج من الكمبوننت
  addEditValueRef.value && addEditValueRef.value.openEditDialog(val);
}

// دالة إغلاق حوار التعديل
function closeEditValueDialog() {
  editValueDialog.value = false;
  editValueForm.value = { id: null, name: '', color: '' };
}

onMounted(() => {
  getAttributes();
});
</script>

<style>
.gap-2 {
  gap: 8px;
}

.v-chip__content {
  width: 100% !important;
}

.box-attribute-values {
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  border-radius: 6px;
}

/* .bg-important-white {
  background-color: white !important;
}
.bg-important-default {
  background-color: #e0e0e0 !important;
} */
</style>
