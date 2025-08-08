<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { deleteOne } from '@/services/api';
import InvoiceItemForm from './InvoiceItemForm.vue';

const props = defineProps({
  invoiceId: Number,
  items: Array,
});
const emit = defineEmits(['updated']);

const dialog = ref(false);
const editedItem = ref(null);

function editItem(item) {
  editedItem.value = { ...item };
  dialog.value = true;
}

function addItem() {
  editedItem.value = { invoice_id: props.invoiceId };
  dialog.value = true;
}

function removeItem(item) {
  if (confirm('هل أنت متأكد من حذف العنصر؟')) {
    deleteOne('invoice-item', item.id).then(() => emit('updated'));
  }
}

function onSaved() {
  dialog.value = false;
  emit('updated');
}
</script>

<template>
  <v-card>
    <v-card-title>
      عناصر الفاتورة
      <v-spacer />
      <v-btn color="primary" @click="addItem">إضافة عنصر</v-btn>
    </v-card-title>
    <v-data-table
      :items="props.items"
      :headers="[
        { text: 'المنتج', value: 'name' },
        { text: 'الكمية', value: 'quantity' },
        { text: 'سعر الوحدة', value: 'unit_price' },
        { text: 'الخصم', value: 'discount' },
        { text: 'الإجمالي', value: 'total' },
        { text: 'إجراءات', value: 'actions', sortable: false },
      ]"
    >
      <template #item.actions="{ item }">
        <v-btn icon @click="editItem(item)"><v-icon>mdi-pencil</v-icon></v-btn>
        <v-btn icon color="error" @click="removeItem(item)"><v-icon>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" max-width="600" persistent>
      <InvoiceItemForm :model-value="editedItem" :invoice-id="props.invoiceId" @saved="onSaved" @close="dialog = false" />
    </v-dialog>
  </v-card>
</template>
