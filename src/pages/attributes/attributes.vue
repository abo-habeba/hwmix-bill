<template>
  <v-container>
    <!-- الزر لفتح الحوار -->
    <v-btn color="primary" @click="addDialog = true">اضافة خاصية جديدة</v-btn>

    <v-card class="mt-4 pa-3">
      <v-card-title> الخصائص</v-card-title>
      <v-divider></v-divider>
      <div class="d-flex flex-wrap gap-2 pa-3">
        <v-chip class="pa-1" v-for="attr in attributes" :key="attr.id" closable @click:close="confirmDelete(attr.id)">
          {{ attr.name }}
        </v-chip>
        <v-chip v-if="attributes.length === 0">لا توجد خصائص حتى الآن</v-chip>
      </div>
    </v-card>
    <!-- تم ربط dialog مع v-model هنا -->
    <AddAttribute :attributes="attributes" :addDialog="addDialog" @update:addDialog="savedAttribute" />

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
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAll, saveItem, deleteOne } from '@/services/api';
import AddAttribute from '@/components/attributes/AddAttribute.vue';
import { toast } from 'vue3-toastify';

const addDialog = ref(false);
const deleteDialog = ref(false);
const confirmDeleteId = ref(null);
const attributes = ref([]);

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
      toast.success('تم حفظ الخاصية بنجاح');
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
      deleteDialog.value = false;
      toast.success('تم حذف الخاصية بنجاح');
    })
    .catch(() => toast.error('حدث خطأ أثناء حذف الخاصية'));
}

// دالة جلب الخصائص
function getAttributes() {
  getAll('attributes').then(res => {
    attributes.value = res.data;
  });
}

onMounted(() => {
  getAttributes();
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
