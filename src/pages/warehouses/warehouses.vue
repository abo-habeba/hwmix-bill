<template>
  <v-container>
    <!-- Button to open the dialog -->
    <v-btn color="primary" @click="dialog = true">اضافة مخزن جديد</v-btn>

    <!-- Warehouses List -->
    <v-card class="mt-4 pa-3">
      <v-card-title>المخازن</v-card-title>
      <v-divider></v-divider>
      <div class="d-flex flex-wrap gap-2 pa-3">
        <v-chip class="pa-1" v-for="warehouse in warehouses" :key="warehouse.id" closable @click:close="confirmDelete(warehouse.id)">
          {{ warehouse.name }}
        </v-chip>
        <v-chip v-if="warehouses.length === 0">لا توجد مخازن حتى الآن</v-chip>
      </div>
    </v-card>

    <!-- Add Warehouse Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>اضافة مخزن جديد</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="warehouse.name" label="اسم المخزن" required></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="warehouse.location" label="الموقع"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="warehouse.manager_name" label="اسم المدير"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="warehouse.capacity" label="السعة" type="number"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-select v-model="warehouse.status" item-value="value" item-title="name" :items="statusOptions" label="الحالة" required></v-select>
            </v-col>
          </v-row>
          <!-- يمكن إضافة company_id و created_by عند الحاجة -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">الغاء</v-btn>
          <v-btn color="blue darken-1" text @click="saveWarehouse">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>تأكيد الحذف</v-card-title>
        <v-card-text>هل أنت متأكد من حذف هذا المخزن؟</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">الغاء</v-btn>
          <v-btn color="red darken-1" text @click="deleteWarehouse(confirmDeleteId)">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAll, saveItem, deleteOne } from '@/services/api';

const dialog = ref(false);
const deleteDialog = ref(false);
const confirmDeleteId = ref(null);
const warehouse = ref({
  name: '',
  location: '',
  manager_name: '',
  capacity: null,
  status: 'active',
  company_id: '',
  created_by: '',
});
const warehouses = ref([]);

const statusOptions = ref([
  { name: 'نشط', value: 'active' },
  { name: 'غير نشط', value: 'inactive' },
]);

function saveWarehouse() {
  saveItem('warehouse', warehouse.value, false, true, true).then(() => {
    getWarehouses();
    dialog.value = false;
    warehouse.value = {
      name: '',
      location: '',
      manager_name: '',
      capacity: null,
      status: 'active',
      company_id: '',
      created_by: '',
    };
  });
}

function confirmDelete(id) {
  confirmDeleteId.value = id;
  deleteDialog.value = true;
}

function deleteWarehouse(id) {
  deleteOne('warehouse', id).then(() => {
    getWarehouses();
    deleteDialog.value = false;
  });
}

function getWarehouses() {
  getAll('warehouses').then(res => {
    warehouses.value = res.data;
  });
}

onMounted(() => {
  getWarehouses();
});
</script>
