<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        label="بحث"
        single-line
        flat
        hide-details
        variant="solo-filled"
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-btn v-if="selected.length > 0" color="error" class="ms-2" @click="confirmDeleteMultiple"> حذف المحدد ({{ selected.length }}) </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-data-table-server
      v-model="selected"
      :headers="variantHeaders"
      :items="serverItems"
      :items-length="totalItems"
      :loading="loading"
      :search="search"
      item-value="id"
      @update:options="loadItems"
      show-select
      class="elevation-1"
    >
      <template v-slot:item.attributes="{ item }">
        <AttributesDisplay :attributes="item.attributes" font-size="10px" />
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon size="small" class="me-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon size="small" @click="confirmDeleteItem(item)"> mdi-delete </v-icon>
      </template>

      <template v-slot:no-data>
        <v-alert :value="true" color="info" icon="mdi-information"> لا توجد بيانات متاحة لعرضها. </v-alert>
      </template>
    </v-data-table-server>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">تأكيد الحذف</v-card-title>
        <v-card-text>
          هل أنت متأكد أنك تريد حذف
          <span v-if="itemToDelete">هذا المتغير (SKU: {{ itemToDelete.sku }})؟</span>
          <span v-else-if="selected.length > 0">المتغيرات المحددة ({{ selected.length }}).</span>
          هذا الإجراء لا يمكن التراجع عنه.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" text @click="closeDeleteDialog">إلغاء</v-btn>
          <v-btn color="error" text @click="deleteConfirmed">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getAll, deleteAll } from '@/services/api'; // تأكد من المسار الصحيح
import { toast } from 'vue3-toastify';

const search = ref('');
const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const selected = ref([]);
const deleteDialog = ref(false);
const itemToDelete = ref(null); // للمتغير المراد حذفه فردياً

const variantHeaders = [
  { title: 'اسم المنتج', key: 'product_name' },
  { title: 'SKU', key: 'sku' },
  { title: 'الباركود', key: 'barcode' },
  { title: 'الكمية', key: 'quantity' },
  { title: ' كمية التحزير ', key: 'min_quantity' },
  { title: 'سعر الشراء', key: 'cost' },
  { title: 'سعر الجملة', key: 'wholesale_price' },
  { title: 'سعر القطاعي', key: 'retail_price' },
  { title: 'الخصم', key: 'discount' },
  { title: 'الخصائص', key: 'attributes' },
  { title: 'الإجراء', key: 'actions', sortable: false },
];

// جلب البيانات من الخادم
async function loadItems({ page, itemsPerPage, sortBy }) {
  loading.value = true;
  try {
    const params = {
      page: page,
      per_page: itemsPerPage,
      search: search.value,
      // إضافة ترتيب الفرز إذا كان متوفراً
      ...(sortBy.length
        ? {
            sort_by: sortBy[0].key,
            sort_desc: sortBy[0].order === 'desc',
          }
        : {}),
    };
    const response = await getAll('product-variants', params);
    serverItems.value = response.data;
    totalItems.value = response.total;
  } catch (error) {
    console.error('Error fetching product variants:', error);
    toast.error('خطأ في جلب المتغيرات.');
  } finally {
    loading.value = false;
  }
}

// تحديد لون الخط المناسب للخلفية (مستنسخ من color-utils)
function getContrastColor(hexcolor) {
  if (!hexcolor || hexcolor.length < 7) return '#000000';
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y >= 128 ? '#000000' : '#FFFFFF';
}

// فتح دايلوج تأكيد حذف عنصر واحد
function confirmDeleteItem(item) {
  itemToDelete.value = item;
  deleteDialog.value = true;
}

// فتح دايلوج تأكيد حذف عناصر متعددة
function confirmDeleteMultiple() {
  itemToDelete.value = null; // تأكيد أننا نحذف متعدد
  deleteDialog.value = true;
}

// إغلاق دايلوج الحذف
function closeDeleteDialog() {
  deleteDialog.value = false;
  itemToDelete.value = null;
}

// تأكيد الحذف وتنفيذه
async function deleteConfirmed() {
  try {
    let idsToDelete = [];
    if (itemToDelete.value) {
      idsToDelete.push(itemToDelete.value.id);
    } else if (selected.value.length > 0) {
      idsToDelete = { ids: selected.value };
    }

    if (idsToDelete.length === 0) return;
    console.log(`Deleting items with IDs:`, idsToDelete);

    await deleteAll('product-variant/delete', idsToDelete);
    closeDeleteDialog();
    selected.value = []; // مسح التحديد بعد الحذف
    // إعادة تحميل البيانات لتحديث الجدول
    loadItems({ page: 1, itemsPerPage: 10, sortBy: [] });
  } catch (error) {
    console.error('Error deleting product variants:', error);
  }
}

// وظيفة لتعديل عنصر (تتطلب مكون تعديل منفصل أو مودال)
function editItem(item) {
  // هنا يمكنك emit حدث لفتح مكون التعديل أو توجيه المستخدم لصفحة التعديل
  console.log('Edit item:', item);
  toast.info(`جارٍ تعديل المتغير: ${item.sku}`);
  // مثال: emit('edit-variant', item);
}

// مراقبة حقل البحث لإعادة تحميل البيانات
watch(search, () => {
  loadItems({ page: 1, itemsPerPage: 10, sortBy: [] });
});
</script>

<style scoped>
/* يمكنك إضافة أي تنسيقات خاصة بالكمبوننت هنا */
.v-chip {
  max-width: 100%; /* لمنع تجاوز محتوى Chip */
  white-space: normal; /* للسماح بالالتفاف إذا كان النص طويلاً */
  height: auto;
}
</style>
