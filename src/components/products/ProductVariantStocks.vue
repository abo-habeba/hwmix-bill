<template>
  <v-card-subtitle class="ma-2">المخزون</v-card-subtitle>
  <v-row dense v-for="(stock, sIndex) in modelValue" :key="stock.id || sIndex">
    <v-col cols="6" sm='6' md="4" lg="2">
      <v-text-field v-model.number="stock.cost" label="سعر الشراء" type="number" :rules="stockRules.cost"
        hide-details="auto" />
    </v-col>
    <v-col cols="6" sm='6' md="4" lg="2">
      <v-text-field v-model.number="stock.qty" label="الكمية" type="number" :rules="stockRules.qty"
        hide-details="auto" />
    </v-col>
    <v-col cols="6" sm='6' md="4" lg="2">
      <v-select v-if="warehouses && warehouses.length > 0" v-model="stock.warehouse_id" item-value="id"
        item-title="name" :items="warehouses" label="المخزن" :rules="[v => !!v || 'المخزن مطلوب']" required
        hide-details="auto" :return-object="false" />
      <v-select v-else :items="[{ id: null, name: 'لا يوجد مخازن، يرجى إضافة مخزن أولاً', disabled: true }]"
        label="المخزن" item-title="name" :value="null" :rules="[v => !!v || 'المخزن مطلوب']" required
        hide-details="auto" disabled />
    </v-col>
    <v-col cols="6" sm='6' md="4" lg="2">
      <v-select v-model="stock.status" :items="statusOptions" item-value="value" item-title="text" label="حالة المخزون"
        hide-details="auto" :rules="[v => !!v || 'حالة المخزون مطلوبة']" required />
    </v-col>
    <v-col cols="6" sm='6' md="4" lg="2">
      <v-text-field v-model="stock.expiry" label="تاريخ الانتهاء" type="date" hide-details="auto" />
    </v-col>
    <v-col cols="6" sm='6' md="4" lg="2">
      <v-text-field v-model="stock.loc" label="الموقع" hide-details="auto" />
    </v-col>
  </v-row>
  <v-btn v-if="modelValue.length > 1" class="mt-2" icon="ri-delete-bin-line" color="error" size="small"
    @click="removeStock(sIndex)"></v-btn>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [], // يجب أن تكون القيمة الافتراضية لمصفوفة دالة
  },
  warehouses: {
    type: Array,
    default: () => [],
  },
  stockRules: {
    type: Object,
    default: () => ({
      cost: [],
      qty: [],
    }),
  },
});

const emit = defineEmits(['update:modelValue']);
//available,unavailable,expired
const statusOptions = [
  { value: 'available', text: 'متاح' },
  { value: 'unavailable', text: 'غير متاح' },
  { value: 'expired', text: 'منتهي' },
];

// دالة لإضافة سجل مخزون جديد
function addStock() {
  const newStock = {
    qty: 0,
    reserved: 0,
    min_qty: 0,
    cost: 0,
    batch: '',
    expiry: null,
    loc: '',
    status: 'available', // تم تغييرها إلى قيمة نصية متوافقة مع statusOptions
    warehouse_id: props.warehouses.length > 0 ? props.warehouses[0].id : null,
  };
  emit('update:modelValue', [...props.modelValue, newStock]);
}

// دالة لحذف سجل مخزون
function removeStock(index) {
  // التأكد من عدم حذف آخر سجل مخزون
  if (props.modelValue.length <= 1) {
    alert('لا يمكن حذف آخر سجل مخزون لهذا الخيار.');
    return;
  }
  const updatedStocks = [...props.modelValue];
  updatedStocks.splice(index, 1);
  emit('update:modelValue', updatedStocks);
}
</script>

<style scoped>
/* يمكن إضافة أنماط إضافية هنا */
</style>
