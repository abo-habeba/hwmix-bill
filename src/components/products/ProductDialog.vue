<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useDisplay } from 'vuetify';
import { getAll, saveItem } from '@/services/api'; // تأكد من أن المسار صحيح لخدمة الـ API
import ProductGeneralInfoForm from './ProductGeneralInfoForm.vue';
import ProductVariantForm from './ProductVariantForm.vue';
import ProductVariantAttributesForm from './ProductVariantAttributesForm.vue'; // تأكد من استيراد المكون

const props = defineProps({
  dialog: Boolean,
  product: Object,
  isEditMode: Boolean,
});

const emit = defineEmits(['update:dialog', 'saved', 'close']);
const { xs } = useDisplay();

const dialog = ref(props.dialog);
const productForm = ref(null);
const productFormValid = ref(false); // يتم تحديثها بواسطة VForm
const brands = ref([]);
const warehouses = ref([]);
const categories = ref([]);
const attributes = ref([]); // هذا هو الـ ref الذي يحمل بيانات الخصائص

// دوال مساعدة للتحقق من الأرقام
const isNumber = v => (typeof v === 'number' && !isNaN(v)) || 'يجب أن يكون رقمًا';
const isPositiveOrZero = v => parseFloat(v) >= 0 || 'يجب أن يكون رقمًا موجبًا أو صفرًا';
const isRequiredNumber = v => (typeof v === 'number' && !isNaN(v) && v !== null) || 'مطلوب ويجب أن يكون رقمًا';

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
      attributes: [], // مصفوفة فارغة للخصائص
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

function mapProductDataForEdit(apiProduct) {
  return {
    id: apiProduct.id,
    name: apiProduct.name || '',
    active: apiProduct.active ?? true,
    featured: apiProduct.featured ?? false,
    returnable: apiProduct.returnable ?? true,
    desc: apiProduct.desc || '',
    desc_long: apiProduct.desc_long || '',
    category_id: apiProduct.category_id || null,
    brand_id: apiProduct.brand_id || null,
    variants: (apiProduct.variants || []).map(variant => ({
      id: variant.id,
      barcode: variant.barcode || '',
      sku: variant.sku || '',
      retail_price: parseFloat(variant.retail_price) || 0,
      wholesale_price: parseFloat(variant.wholesale_price) || 0,
      image: variant.image || null,
      weight: parseFloat(variant.weight) || 0,
      dimensions: variant.dimensions || '',
      min_quantity: variant.min_quantity || '',
      tax: parseFloat(variant.tax) || 0,
      discount: parseFloat(variant.discount) || 0,
      status: variant.status || 'active',
      attributes: (variant.attributes || []).map(attr => ({
        attribute_id: attr.attribute_id || null,
        attribute_value_id: attr.attribute_value_id || null,
      })),
      stocks: (variant.stocks || []).map(stock => ({
        id: stock.id,
        quantity: stock.quantity || 0,
        reserved: stock.reserved || 0,
        min_quantity: stock.min_quantity || 0,
        cost: parseFloat(stock.cost) || 0,
        batch: stock.batch || '',
        expiry: stock.expiry ? new Date(stock.expiry).toISOString().substr(0, 10) : null,
        loc: stock.loc || '',
        status: stock.status ?? 'available',
        warehouse_id: stock.warehouse ? stock.warehouse.id : null,
      })),
    })),
  };
}

const productRules = {
  name: [v => !!v || 'اسم المنتج مطلوب', v => (typeof v === 'string' && v.length <= 255) || 'اسم المنتج يجب ألا يزيد عن 255 حرفًا'],
  description: [v => !v || typeof v === 'string' || 'الوصف يجب أن يكون نصًا'],
  description_long: [v => !v || typeof v === 'string' || 'الوصف المفصل يجب أن يكون نصًا'],
  retail_price: [isRequiredNumber, isPositiveOrZero],
  wholesale_price: [isRequiredNumber, isPositiveOrZero],
  tax: [isNumber, isPositiveOrZero],
  discount: [isNumber, isPositiveOrZero],
  weight: [isNumber, isPositiveOrZero],
  quantity: [isRequiredNumber, isPositiveOrZero],
  cost: [isNumber, isPositiveOrZero],
};

function setInitialWarehouseForFirstStock() {
  if (localProduct.value.variants.length > 0 && localProduct.value.variants[0].stocks.length > 0 && warehouses.value.length > 0) {
    if (localProduct.value.variants[0].stocks[0].warehouse_id === null) {
      localProduct.value.variants[0].stocks[0].warehouse_id = warehouses.value[0].id;
    }
  }
}

watch(
  () => props.dialog,
  async val => {
    dialog.value = val;
    if (val) {
      if (props.isEditMode && props.product) {
        localProduct.value = mapProductDataForEdit(props.product);
      } else {
        localProduct.value = JSON.parse(JSON.stringify(defaultProduct));
        setInitialWarehouseForFirstStock();
      }
      await nextTick();
      if (productForm.value) {
        productForm.value.resetValidation();
      }
    }
  },
  { immediate: true }
);

watch(dialog, val => {
  emit('update:dialog', val);
});

watch(
  () => props.product,
  newVal => {
    if (props.isEditMode && newVal) {
      localProduct.value = mapProductDataForEdit(newVal);
    }
  }
);

onMounted(async () => {
  await Promise.all([getBrands(), getAttributes(), getWarehouses(), getCategories()]);
  if (!props.isEditMode) {
    setInitialWarehouseForFirstStock();
  }
});

async function getBrands() {
  try {
    const res = await getAll('brands', null, true, false);
    brands.value = res.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
  }
}

async function getAttributes() {
  try {
    const res = await getAll('attributes', null, true, true);
    attributes.value = res.data;
  } catch (error) {
    console.error('Error fetching attributes:', error);
  }
}

async function getWarehouses() {
  try {
    const res = await getAll('warehouses', null, true, false);
    warehouses.value = res.data;
    if (!props.isEditMode) {
      setInitialWarehouseForFirstStock();
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error);
  }
}

async function getCategories() {
  try {
    const res = await getAll('categories', null, true, false);
    categories.value = res.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
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
        warehouse_id: warehouses.value.length > 0 ? warehouses.value[0].id : null,
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

    if (Object.prototype.hasOwnProperty.call(payload, 'active')) {
    } else if (Object.prototype.hasOwnProperty.call(payload, 'is_active')) {
      payload.active = payload.is_active;
      delete payload.is_active;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'returnable')) {
    } else if (Object.prototype.hasOwnProperty.call(payload, 'is_returnable')) {
      payload.returnable = payload.is_returnable;
      delete payload.is_returnable;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'desc')) {
    } else if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
      payload.desc = payload.description;
      delete payload.description;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'desc_long')) {
    } else if (Object.prototype.hasOwnProperty.call(payload, 'description_long')) {
      payload.desc_long = payload.description_long;
      delete payload.desc_long;
    }

    payload.variants.forEach(variant => {
      if (variant.stocks && variant.stocks.length > 0) {
        variant.stocks.forEach(stock => {
          if (!stock.warehouse_id && warehouses.value.length > 0) {
            stock.warehouse_id = warehouses.value[0].id;
          }
        });
      }
    });

    let res;
    if (payload.id) {
      res = await saveItem('product', payload, payload.id);
    } else {
      const { id, ...newProductPayload } = payload;
      res = await saveItem('product', newProductPayload);
    }

    emit('saved', res.data);
    closeDialog();
  } catch (e) {
    console.error('Error saving product:', e);
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

<template>
  <v-dialog v-model="dialog" max-width="900px">
    <v-card>
      <v-btn color="error" style="position: fixed; z-index: 10" class="ma-2" icon="ri-close-line"
        @click="closeDialog"></v-btn>
      <v-card-title class="ma-3 text-center">
        <h2>{{ isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد' }}</h2>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-form ref="productForm" v-model="productFormValid">
          <ProductGeneralInfoForm :modelValue="localProduct" :categories="categories" :brands="brands"
            :productRules="productRules" @update:modelValue="value => (localProduct = value)" />

          <v-card class="pa-2 ma-1" outlined>
            <v-card-title class="ma-2"> خيارات المنتج </v-card-title>
            <v-row class="bg-grey-lighten-1 pa-2" v-for="(variant, vIndex) in localProduct.variants" :key="vIndex">
              <ProductVariantForm :variant="variant" :variantIndex="vIndex" :attributes="attributes"
                :warehouses="warehouses" :statusOptions="statusOptions" :productRules="productRules"
                @remove-variant="removeVariant" />
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
              <v-btn prepend-icon="ri-save-line" color="success" variant="outlined" :disabled="!productFormValid"
                @click="saveProduct" class="text-capitalize">
                {{ isEditMode ? 'حفظ التعديلات' : 'إضافة المنتج' }}
              </v-btn>
              <v-btn prepend-icon="ri-close-line" color="error" variant="outlined" @click="closeDialog"
                class="text-capitalize"> إلغاء </v-btn>
            </v-card-actions>
          </v-sheet>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* يمكن إضافة أنماط إضافية هنا */
</style>
