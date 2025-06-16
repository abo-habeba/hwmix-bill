<template>
  <v-row>
    <v-col cols="12" sm="4">
      <v-text-field v-model="variant.retail_price" label="سعر البيع قطاعي" type="number" hide-details="auto" />
    </v-col>
    <v-col cols="12" sm="4">
      <v-text-field v-model="variant.wholesale_price" label="سعر البيع بالجملة" type="number" hide-details="auto" />
    </v-col>
    <v-col cols="12" sm="4">
      <v-select v-model="variant.status" :items="statusOptions" item-value="value" item-title="text" label="الحالة" hide-details="auto" />
    </v-col>
    <v-col cols="12" class="my-0 py-1">
      <v-card class="mb-1 pa-2" outlined>
        <ProductVariantAttributes v-model="variant.attributes" :attributes="attributes" />
      </v-card>
    </v-col>
    <v-col cols="12" class="my-0 py-1">
      <v-card class="mb-1 pa-2" outlined>
        <ProductVariantStocks v-model="variant.stocks" :warehouses="warehouses" />
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-btn color="error" @click="$emit('remove-variant', variantIndex)">حذف هذا الخيار</v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { defineProps, defineEmits, watch } from 'vue';
import ProductVariantAttributes from './ProductVariantAttributes.vue';
import ProductVariantStocks from './ProductVariantStocks.vue';

const props = defineProps({
  variant: Object,
  variantIndex: Number,
  attributes: Array, // ProductVariantForm يستقبلها بشكل صحيح
  warehouses: Array,
  statusOptions: Array,
});

const emit = defineEmits(['remove-variant']);
</script>

<style scoped>
/* Add any specific styles here */
</style>
