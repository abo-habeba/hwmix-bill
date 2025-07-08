<template>
  <v-container>
    <v-btn prepend-icon="ri-add-line" color="primary" @click="openWarehouseDialog">اضافة مخزن جديد</v-btn>

    <v-card class="mt-4 pa-3">
      <v-card-title>المخازن</v-card-title>
      <v-divider class="ma-1"></v-divider>
      <v-row class="flex-wrap ma-2" style="gap: 16px">
        <v-col
          v-for="warehouseItem in warehouses"
          :key="warehouseItem.id"
          cols="12"
          sm="auto"
          class="d-flex align-center elevation-2 pa-1 rounded"
          style="background: white; min-width: 280px"
        >
          <v-avatar variant="text" icon="ri-warehouse-line" color="primary" size="32" class="me-3" />
          <div class="text-lg fw-medium">
            {{ warehouseItem.name }}
          </div>
          <v-spacer />
          <v-btn icon="ri-edit-line" variant="text" color="success" @click.stop="editWarehouse(warehouseItem)" title="تعديل المخزن" class="mx-1" />
          <v-btn
            icon="ri-delete-bin-line"
            variant="text"
            color="error"
            @click.stop="confirmDelete(warehouseItem.id)"
            title="حذف المخزن"
            class="mx-1"
          />
        </v-col>

        <v-col v-if="warehouses.length === 0" cols="12">
          <v-alert type="info" border="start" class="text-center"> لا توجد مخازن حتى الآن </v-alert>
        </v-col>
      </v-row>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ warehouse.id ? 'تعديل المخزن' : 'اضافة مخزن جديد' }}</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="warehouse.name" label="اسم المخزن" :rules="[v => !!v || 'اسم المخزن مطلوب']" required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="warehouse.location" label="الموقع"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="warehouse.manager_name" label="اسم المدير"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="warehouse.capacity" label="السعة" type="number"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-select v-model="warehouse.status" item-value="value" item-title="name" :items="statusOptions" label="الحالة" required></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeWarehouseDialog">الغاء</v-btn>
          <v-btn color="blue darken-1" text @click="saveWarehouse">{{ warehouse.id ? 'تعديل' : 'حفظ' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { toast } from 'vue3-toastify';

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

// فتح نافذة إضافة/تعديل مخزن
function openWarehouseDialog() {
  warehouse.value = {
    // إعادة تعيين لنموذج جديد
    name: '',
    location: '',
    manager_name: '',
    capacity: null,
    status: 'active',
  };
  dialog.value = true;
}

// إغلاق نافذة إضافة/تعديل مخزن
function closeWarehouseDialog() {
  dialog.value = false;
  warehouse.value = {
    // إعادة تعيين النموذج بعد الإغلاق
    name: '',
    location: '',
    manager_name: '',
    capacity: null,
    status: 'active',
  };
}

// حفظ المخزن (إضافة أو تعديل)
function saveWarehouse() {
  if (!warehouse.value.name) {
    toast.error('اسم المخزن مطلوب');
    return;
  }
  let payload = {
    id: warehouse.value?.id,
    name: warehouse.value.name,
    location: warehouse.value.location,
    manager_name: warehouse.value.manager_name,
    capacity: warehouse.value.capacity,
    status: warehouse.value.status,
    company_id: warehouse.value.company_id,
    created_by: warehouse.value.created_by,
  };

  const isEdit = !!warehouse.value.id; // تحديد ما إذا كانت عملية تعديل
  saveItem('warehouse', payload, warehouse.value.id, false, true, true)
    .then(() => {
      getWarehouses(); // تحديث القائمة بعد الحفظ
      dialog.value = false;
      toast.success(isEdit ? 'تم تعديل المخزن بنجاح' : 'تم حفظ المخزن بنجاح');
      warehouse.value = {
        // إعادة تعيين النموذج
        name: '',
        location: '',
        manager_name: '',
        capacity: null,
        status: 'active',
      };
    })
    .catch(e => {
      const msg = e || (isEdit ? 'حدث خطأ أثناء تعديل المخزن' : 'حدث خطأ أثناء حفظ المخزن');
      toast.error(msg);
    });
}

// تأكيد حذف مخزن
function confirmDelete(id) {
  confirmDeleteId.value = id;
  deleteDialog.value = true;
}

// حذف مخزن
function deleteWarehouse(id) {
  deleteOne('warehouse/delete', id, true, true)
    .then(() => {
      getWarehouses(); // تحديث القائمة بعد الحذف
      deleteDialog.value = false;
      toast.success('تم حذف المخزن بنجاح');
    })
    .catch(msg => {
      toast.error(msg);
    });
}

// تعديل مخزن
function editWarehouse(wh) {
  warehouse.value = { ...wh }; // نسخ بيانات المخزن للتعديل
  dialog.value = true;
}

// جلب قائمة المخازن
function getWarehouses() {
  getAll('warehouses', { per_page: -1 }).then(res => {
    warehouses.value = res;
  });
}

onMounted(() => {
  getWarehouses();
});
</script>
