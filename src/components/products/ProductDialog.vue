<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useDisplay } from 'vuetify';
import { getAll, saveItem } from '@/services/api';
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
const localProduct = ref({
  name: '',
  slug: '',
  is_active: true,
  featured: false,
  is_returnable: true,
  description: '',
  description_long: '',
  category_id: null,
  brand_id: null,
  warehouse_id: null,
  variants: [
    {
      attributes: [
        {
          attribute_id: null,
          attribute_value_id: null,
        },
      ],
      dimensions: '',
      discount: null,
      expiry_date: '',
      image_url: '',
      status: 'active',
      tax_rate: null,
    },
  ],
});
const brands = ref([]);
const warehouses = ref([]);
const categories = ref([]);

const productRules = {
  name: [v => !!v || 'اسم المنتج مطلوب', v => (typeof v === 'string' && v.length <= 255) || 'اسم المنتج يجب ألا يزيد عن 255 حرفًا'],
  description: [v => !v || typeof v === 'string' || 'الوصف يجب أن يكون نصًا'],
  description_long: [v => !v || typeof v === 'string' || 'الوصف المفصل يجب أن يكون نصًا'],
};

watch(
  () => props.dialog,
  val => (dialog.value = val)
);
watch(dialog, val => emit('update:dialog', val));
watch(
  () => props.product,
  val => {
    if (val && Object.keys(val).length) localProduct.value = { ...val };
  }
);

onMounted(() => {
  getBrands();
  getWarehouses();
  getCategories();
});

function getBrands() {
  getAll('brands').then(res => {
    brands.value = res.data;
  });
}
function getWarehouses() {
  getAll('warehouses').then(res => {
    warehouses.value = res.data;
  });
}
function getCategories() {
  getAll('categories').then(res => {
    categories.value = res.data;
  });
}

function closeDialog() {
  emit('close');
  dialog.value = false;
}

function addVariant() {
  localProduct.value.variants.push({
    attributes: [{ attribute_id: null, attribute_value_id: null }],
    dimensions: '',
    discount: null,
    expiry_date: '',
    image_url: '',
    status: 'active',
    tax_rate: null,
  });
}
function removeVariant(index) {
  localProduct.value.variants.splice(index, 1);
}

function saveProduct() {
  if (!productForm.value) return;
  productForm.value.validate().then(async ({ valid }) => {
    if (!valid) return;
    try {
      const res = await saveItem('product', localProduct.value, localProduct.value.id || false);
      emit('saved', res.data);
      closeDialog();
    } catch (e) {
      // يمكن إضافة إشعار خطأ هنا
    }
  });
}
</script>

<template>
  <v-dialog :fullscreen="xs" v-model="dialog">
    <v-card>
      <v-btn color="error" style="position: fixed; z-index: 10" class="ma-2" icon="ri-close-line" @click="closeDialog"></v-btn>
      <v-card-title class="ma-5 text-center">
        <h2>{{ isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد' }}</h2>
      </v-card-title>
      <v-card-text :class="xs ? 'px-2' : 'px-5'">
        <v-form ref="productForm" v-model="productFormValid">
          <v-row class="elevation-10 my-3">
            <v-col cols="12" md="6">
              <v-text-field v-model="localProduct.name" label="اسم المنتج" :rules="productRules.name" required />
            </v-col>
            <v-col cols="12">
              <v-row>
                <v-col>
                  <v-switch v-model="localProduct.is_active" label="نشط" :color="localProduct.is_active ? 'primary' : 'grey'" />
                </v-col>
                <v-col>
                  <v-switch v-model="localProduct.featured" label="مميز" :color="localProduct.featured ? 'primary' : 'grey'" />
                </v-col>
                <v-col>
                  <v-switch v-model="localProduct.is_returnable" label="قابل للإرجاع" :color="localProduct.is_returnable ? 'primary' : 'grey'" />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-row>
                <v-col>
                  <v-combobox
                    v-model="localProduct.category_id"
                    item-value="id"
                    item-title="name"
                    :items="categories || []"
                    label="الفئة"
                    :rules="[v => !!v || 'الفئة مطلوبة']"
                    required
                  />
                </v-col>
                <v-col class="px-0">
                  <v-combobox v-model="localProduct.brand_id" item-value="id" item-title="name" :items="brands || []" label="العلامة التجارية" />
                </v-col>
                <v-col>
                  <v-select
                    v-if="warehouses.length"
                    v-model="localProduct.warehouse_id"
                    item-value="id"
                    item-title="name"
                    :items="warehouses || []"
                    label="المخزن"
                    required
                  />
                  <v-select
                    v-else
                    :items="[{ id: null, name: 'لا يوجد مخازن، يرجى إضافة مخزن أولاً', disabled: true }]"
                    label="المخزن"
                    item-title="name"
                    :value="null"
                    required
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-textarea rows="1" auto-grow v-model="localProduct.description" label="الوصف القصير" :rules="productRules.description" />
            </v-col>
            <v-col cols="12">
              <v-textarea rows="2" auto-grow v-model="localProduct.description_long" label="الوصف المفصل" :rules="productRules.description_long" />
            </v-col>
          </v-row>
          <!-- تفاصيل المنتج الإضافية -->
          <v-card-title> تفاصيل المنتج الإضافية </v-card-title>
          <v-row class="elevation-10 my-5" v-for="(variant, vIndex) in localProduct.variants" :key="vIndex">
            <v-col cols="12">
              <v-row>
                <v-col cols="4">
                  <v-text-field v-model="variant.purchase_price" label="سعر الشراء" type="number" />
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="variant.retail_price" label="سعر التجزئة" type="number" />
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="variant.wholesale_price" label="سعر الجملة" type="number" />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="variant.tax_rate" label="نسبة الضريبة" type="number" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="variant.discount" label="الخصم" type="number" />
                </v-col>
              </v-row>
            </v-col>
            <v-col class="py-0" cols="12">
              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="variant.expiry_date" label="تاريخ الانتهاء" type="date" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="variant.image_url" label="رابط الصورة" />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-btn variant="text" color="primary" @click="addVariant">+ إضافة تفاصيل جديدة</v-btn>
              <v-btn variant="text" color="error" @click="removeVariant(vIndex)">حذف التفاصيل</v-btn>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <v-row>
            <v-col cols="6">
              <v-btn prepend-icon="ri-close-line" color="error" @click="closeDialog"> إلغاء </v-btn>
            </v-col>
            <v-col cols="6" class="text-center">
              <v-btn prepend-icon="ri-save-line" color="success" :class="{ 'forbidden-cursor': !productFormValid }" @click="saveProduct">
                {{ isEditMode ? 'حفظ التعديلات' : 'إضافة المنتج' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.forbidden-cursor {
  cursor: not-allowed !important;
}
</style>
