<template>
  <h1>stock component</h1>
  <!-- تفاصيل المخزون -->
  <v-col cols="12">
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title>
          تفاصيل المخزون
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="variant.stock.quantity" label="الكمية" type="number" hide-details="auto" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="variant.stock.purchase_price" label="سعر الشراء" type="number"
                hide-details="auto" />
            </v-col>
            <v-col cols="6">
              <v-select v-if="warehouses.length" v-model="variant.stock.سwarehouse_id" item-value="id" item-title="name"
                :items="warehouses || []" label="المخزن" required hide-details="auto" :return-object="false" />
              <v-select v-else :items="[{ id: null, name: 'لا يوجد مخازن، يرجى إضافة مخزن أولاً', disabled: true }]"
                label="المخزن" item-title="name" :value="null" required hide-details="auto" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="variant.stock.expiry_date" label="تاريخ الانتهاء" type="date"
                hide-details="auto" />
            </v-col>
            <v-col cols="6">
              <v-select v-model="variant.stock.status" :items="['available', 'unavailable']" label="الحالة"
                hide-details="auto" />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

    </v-expansion-panels>
  </v-col>

</template>

<script setup>
import { ref } from 'vue';

const warehouses = ref([
  { id: 1, name: 'المخزن الرئيسي' },
  { id: 2, name: 'مخزن الفرع' },
]);

const variant = ref({
  stock: {
    quantity: 0,
    purchase_price: 0,
    warehouse_id: null,
    expiry_date: '',
    status: 'available',
  },
});
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
}
</style>
