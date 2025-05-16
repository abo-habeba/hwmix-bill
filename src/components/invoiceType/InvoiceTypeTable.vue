<script setup>
import { ref, onMounted } from 'vue';
import { getAll, deleteOne } from '@/services/api';
import InvoiceTypeForm from './InvoiceTypeForm.vue';

const items = ref([]);
const loading = ref(false);
const dialog = ref(false);
const editedItem = ref({ name: '', description: '', id: null });

function fetchItems() {
  loading.value = true;
  getAll('invoice-types').then(res => {
    items.value = res.data;
    console.log(items.value);

    loading.value = false;
  });
}

function editItem(item) {
  editedItem.value = { ...item };
  dialog.value = true;
}

function addItem() {
  editedItem.value = { name: '', description: '', id: null };
  dialog.value = true;
}

function removeItem(item) {
  if (confirm('هل أنت متأكد من حذف النوع؟')) {
    deleteOne('invoice-type', item.id).then(fetchItems);
  }
}

function onSaved() {
  dialog.value = false;
  fetchItems();
}

onMounted(fetchItems);
</script>

<template>
  <v-card>
    <v-card-title class="ma-1"> أنواع الفواتير </v-card-title>
    <v-btn class="ms-5 mb-5" color="primary" @click="addItem">إضافة نوع فاتورة</v-btn>
    <v-data-table
      :items="items"
      :loading="loading"
      :headers="[
        { title: 'الاسم', value: 'name' },
        { title: 'الوصف', value: 'description' },
        { title: 'تاريخ الإنشاء', value: 'created_at' },
        // { title: 'تاريخ التعديل', value: 'updated_at' },
        { title: 'إجراءات', value: 'actions', sortable: false },
      ]"
      :items-per-page-text="'عدد العناصر في الصفحة:'"
      :no-data-text="'لا توجد بيانات'"
    >
      <template #item.actions="{ item }">
        <v-btn icon @click="editItem(item)"><v-icon>ri-pencil-line</v-icon></v-btn>
        <v-btn icon color="error" @click="removeItem(item)"><v-icon>ri-delete-bin-line</v-icon></v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" max-width="500">
      <InvoiceTypeForm :model-value="editedItem" @saved="onSaved" @close="dialog = false" />
    </v-dialog>
  </v-card>
</template>

<!-- <style scoped>
.no-wrap-table .v-data-table__td,
.no-wrap-table .v-data-table__th {
  white-space: nowrap;
}
</style> -->
