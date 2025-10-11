<template>
  <v-dialog v-model="dialog" max-width="900px" persistent>
    <v-card>
      <v-btn color="error" style="position: fixed; z-index: 10" class="ma-2" icon="ri-close-line" @click="closeDialog"></v-btn>
      <v-card-title class="ma-3 text-center">
        <h2>{{ isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد' }}</h2>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-form ref="productForm" v-model="productFormValid">
          <ProductGeneralInfoForm
            :modelValue="localProduct"
            :categories="categories"
            :brands="brands"
            :productRules="productRules"
            @update:modelValue="val => (localProduct = val)"
            @update:categories="updateCategoriesList"
            @update:brands="updateBrandsList"
          />

          <v-card class="pa-2 ma-1" outlined>
            <v-card-title class="ma-2">خيارات المنتج</v-card-title>
            <v-row class="bg-grey-lighten-1 pa-2" v-for="(variant, vIndex) in localProduct.variants" :key="vIndex">
              <ProductVariantForm
                :variant="variant"
                :variantIndex="vIndex"
                :attributes="attributes"
                :warehouses="warehouses"
                :statusOptions="statusOptions"
                :productRules="productRules"
                @remove-variant="removeVariant"
              />
            </v-row>
          </v-card>

          <v-row>
            <v-col cols="12">
              <v-btn class="ma-3" color="primary" @click="addVariant">+ اضافة خيار جديد </v-btn>
            </v-col>
          </v-row>

          <v-sheet class="position-sticky bottom-0 bg-grey-lighten-2" elevation="1">
            <v-divider class="my-2"></v-divider>
            <v-card-actions class="justify-center bg-grey-lighten-3 pa-2 ma-2 gap-8">
              <v-btn
                prepend-icon="ri-save-line"
                color="success"
                variant="outlined"
                :disabled="!productFormValid"
                @click="saveProduct"
                class="text-capitalize"
              >
                {{ isEditMode ? 'حفظ التعديلات' : 'إضافة المنتج' }}
              </v-btn>
              <v-btn prepend-icon="ri-close-line" color="error" variant="outlined" @click="closeDialog" class="text-capitalize">إلغاء</v-btn>
            </v-card-actions>
          </v-sheet>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useDisplay } from 'vuetify';
import { getAll, saveItem } from '@/services/api';
import ProductGeneralInfoForm from './ProductGeneralInfoForm.vue';
import ProductVariantForm from './ProductVariantForm.vue';
import { useUserStore } from '@/stores/user';

const props = defineProps({
  dialog: Boolean,
  product: Object,
  isEditMode: Boolean,
});

const emit = defineEmits(['update:dialog', 'saved', 'close']);
const { xs } = useDisplay();

const dialog = ref(props.dialog);
const productForm = ref(null);
const productFormValid = ref(false);
const brands = ref([]);
const warehouses = ref([]);
const categories = ref([]);
const attributes = ref([]);

// القيم الافتراضية للمنتج الجديد
const defaultProduct = {
  id: null,
  name: '',
  active: true,
  featured: false,
  returnable: true,
  desc: '',
  desc_long: '',
  category_id: null,
  brand_id: null,
  variants: [
    {
      barcode: '',
      sku: '',
      retail_price: 0,
      wholesale_price: 0,
      image: null,
      weight: 0,
      dimensions: '',
      min_quantity: '',
      tax: 0,
      discount: 0,
      status: 'active',
      attributes: [],
      stocks: [
        {
          quantity: 0,
          reserved: 0,
          min_quantity: 0,
          cost: 0,
          batch: '',
          expiry: null,
          loc: '',
          status: 'available',
          warehouse_id: null,
        },
      ],
    },
  ],
};

const localProduct = ref(JSON.parse(JSON.stringify(defaultProduct)));

const productRules = {
  name: [v => !!v || 'اسم المنتج مطلوب', v => (typeof v === 'string' && v.length <= 255) || 'اسم المنتج يجب ألا يزيد عن 255 حرفًا'],
  description: [v => !v || typeof v === 'string' || 'الوصف يجب أن يكون نصًا'],
  description_long: [v => !v || typeof v === 'string' || 'الوصف المفصل يجب أن يكون نصًا'],
  retail_price: [v => (typeof v === 'number' && !isNaN(v)) || 'يجب أن يكون رقمًا', v => parseFloat(v) >= 0 || 'يجب أن يكون رقمًا موجبًا أو صفرًا'],
  wholesale_price: [v => (typeof v === 'number' && !isNaN(v)) || 'يجب أن يكون رقمًا', v => parseFloat(v) >= 0 || 'يجب أن يكون رقمًا موجبًا أو صفرًا'],
  tax: [v => (typeof v === 'number' && !isNaN(v)) || 'يجب أن يكون رقمًا', v => parseFloat(v) >= 0 || 'يجب أن يكون رقمًا موجبًا أو صفرًا'],
  discount: [v => (typeof v === 'number' && !isNaN(v)) || 'يجب أن يكون رقمًا', v => parseFloat(v) >= 0 || 'يجب أن يكون رقمًا موجبًا أو صفرًا'],
  weight: [v => (typeof v === 'number' && !isNaN(v)) || 'يجب أن يكون رقمًا', v => parseFloat(v) >= 0 || 'يجب أن يكون رقمًا موجبًا أو صفرًا'],
  quantity: [v => (typeof v === 'number' && !isNaN(v)) || 'مطلوب ويجب أن يكون رقمًا', v => parseFloat(v) >= 0 || 'يجب أن يكون رقمًا موجبًا أو صفرًا'],
  cost: [v => (typeof v === 'number' && !isNaN(v)) || 'يجب أن يكون رقمًا', v => parseFloat(v) >= 0 || 'يجب أن يكون رقمًا موجبًا أو صفرًا'],
};

watch(
  () => props.dialog,
  async val => {
    dialog.value = val;
    if (val) {
      if (props.isEditMode && props.product) {
        localProduct.value = { ...props.product };
      } else {
        localProduct.value = JSON.parse(JSON.stringify(defaultProduct));
        if (warehouses.value.length > 0) localProduct.value.variants[0].stocks[0].warehouse_id = warehouses.value[0].id;
      }
      await nextTick();
      if (productForm.value) productForm.value.resetValidation();
    }
  },
  { immediate: true }
);

watch(dialog, val => emit('update:dialog', val));

const userStore = useUserStore();
onMounted(async () => {
  userStore.loadingApi = true;
  try {
    await Promise.all([getBrands(), getAttributes(), getWarehouses(), getCategories()]);
  } finally {
    userStore.loadingApi = false;
    if (!props.isEditMode && warehouses.value.length > 0) {
      localProduct.value.variants[0].stocks[0].warehouse_id = warehouses.value[0].id;
    }
  }
});

async function getBrands() {
  try {
    const res = await getAll('brands');
    brands.value = res.data;
  } catch (e) {
    console.error(e);
  }
}

async function getAttributes() {
  try {
    const res = await getAll('attributes');
    attributes.value = res.data;
  } catch (e) {
    console.error(e);
  }
}

async function getWarehouses() {
  try {
    const res = await getAll('warehouses');
    warehouses.value = res.data;
  } catch (e) {
    console.error(e);
  }
}

async function getCategories() {
  try {
    const res = await getAll('categories');
    categories.value = res.data;
  } catch (e) {
    console.error(e);
  }
}

// تحديث المصفوفات من المكون الفرعي
function updateCategoriesList(newCategorie) {
  categories.value = [...newCategorie];
}
function updateBrandsList(newBrand) {
  brands.value = [...newBrand];
}

function addVariant() {
  localProduct.value.variants.push({
    retail_price: 0,
    wholesale_price: 0,
    image: null,
    weight: 0,
    dimensions: '',
    min_quantity: 0,
    tax: 0,
    discount: 0,
    status: 'active',
    attributes: [{ attribute_id: null, attribute_value_id: null }],
    stocks: [
      {
        quantity: 0,
        reserved: 0,
        min_quantity: 0,
        cost: 0,
        batch: '',
        expiry: null,
        loc: '',
        status: 'available',
        warehouse_id: warehouses.value[0]?.id ?? null,
      },
    ],
  });
}

function removeVariant(index) {
  localProduct.value.variants.splice(index, 1);
}

async function saveProduct() {
  if (!productForm.value) return;
  const { valid } = await productForm.value.validate();
  if (!valid) return;

  try {
    const payload = JSON.parse(JSON.stringify(localProduct.value));
    let res;
    if (payload.id) res = await saveItem('product', payload, payload.id);
    else {
      const { id, ...newPayload } = payload;
      res = await saveItem('product', newPayload);
    }
    emit('saved', res);
    closeDialog();
  } catch (e) {
    console.error(e);
  }
}

const statusOptions = [
  { value: 'active', text: 'نشط' },
  { value: 'inactive', text: 'غير نشط' },
  { value: 'discontinued', text: 'متوقف' },
];

function closeDialog() {
  dialog.value = false;
  emit('close');
}
</script>
