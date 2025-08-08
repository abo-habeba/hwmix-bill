<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  invoice: Object,
  visible: Boolean,
});
</script>
<template>
  <v-dialog v-model="props.visible" max-width="700" persistent>
    <v-card v-if="props.invoice">
      <v-card-title>تفاصيل الفاتورة رقم {{ props.invoice.invoice_number }}</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item>المستخدم: {{ props.invoice.user_id }}</v-list-item>
          <v-list-item>نوع الفاتورة: {{ props.invoice.invoice_type_id }}</v-list-item>
          <v-list-item>تاريخ الإصدار: {{ props.invoice.issue_date }}</v-list-item>
          <v-list-item>تاريخ الاستحقاق: {{ props.invoice.due_date }}</v-list-item>
          <v-list-item>المبلغ الإجمالي: {{ props.invoice.total_amount }}</v-list-item>
          <v-list-item>الحالة: {{ props.invoice.status_label }}</v-list-item>
          <v-list-item>ملاحظات: {{ props.invoice.notes }}</v-list-item>
          <v-list-item>تاريخ الإنشاء: {{ props.invoice.created_at }}</v-list-item>
        </v-list>
        <div v-if="props.invoice.items && props.invoice.items.length">
          <h4>عناصر الفاتورة:</h4>
          <v-table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الخصم</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in props.invoice.items" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.unit_price }}</td>
                <td>{{ item.discount }}</td>
                <td>{{ item.total }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="secondary" @click="$emit('close')">إغلاق</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
