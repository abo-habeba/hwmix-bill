<template>
  <v-container>
    <v-form @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="product.name" label="اسم المنتج" required></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="product.slug" label="Slug" required></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-select v-model="product.category_id" :items="categories" label="التصنيف" item-text="name" item-value="id" required></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="product.brand_id" :items="brands" label="العلامة التجارية" item-text="name" item-value="id"></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-select v-model="product.company_id" :items="companies" label="الشركة" item-text="name" item-value="id" required></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="product.warehouse_id" :items="warehouses" label="المخزن" item-text="name" item-value="id" required></v-select>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-textarea v-model="product.description" label="الوصف"></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-textarea v-model="product.description_long" label="الوصف المطول"></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-btn type="submit" color="primary">حفظ</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const product = ref({
  name: '',
  slug: '',
  description: '',
  description_long: '',
  company_id: null,
  category_id: null,
  brand_id: null,
  warehouse_id: null,
});

const categories = ref([
  { id: 1, name: 'Category 1' },
  { id: 2, name: 'Category 2' },
  // ... fetch categories from your API
]);

const brands = ref([
  { id: 1, name: 'Brand 1' },
  { id: 2, name: 'Brand 2' },
  // ... fetch brands from your API
]);

const companies = ref([
  { id: 1, name: 'Company 1' },
  { id: 2, name: 'Company 2' },
  // ... fetch companies from your API
]);

const warehouses = ref([
  { id: 1, name: 'Warehouse 1' },
  { id: 2, name: 'Warehouse 2' },
  // ... fetch warehouses from your API
]);

const submitForm = () => {
  // Handle form submission here, e.g., send data to your API
  console.log(product.value);
};
</script>
