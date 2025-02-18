<script setup>
import { getAll } from '@/services/api';
import { ref, reactive, watch, onMounted, computed } from 'vue';

// الحالة الرئيسية
const dialog = ref(false);
const products = ref([]);
const editIndex = ref(null);
const attributes = ref([]);
const warehouses = ref([]);
const brands = ref([]);
const categories = ref([]);

const newProduct = ref({
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
  variants: [],
});

// تحديد ما إذا كان المستخدم في وضع التعديل
const isEditMode = computed(() => editIndex.value !== null);

// استرجاع المنتجات والخصائص عند تحميل الصفحة

onMounted(() => {
  const storedProducts = localStorage.getItem('products');
  if (storedProducts) {
    products.value = JSON.parse(storedProducts);
  }
  getAttributes();
  getWarehouse();
  getCategories();
  getBrands();
});

function getAttributes() {
  getAll('attributes').then(res => {
    attributes.value = res.data;
  });
}
function getWarehouse() {
  getAll('warehouses').then(res => {
    warehouses.value = res.data;
  });
}
function getBrands() {
  getAll('brands').then(res => {
    brands.value = res.data;
  });
}
function getCategories() {
  getAll('categories').then(res => {
    categories.value = res.data;
  });
}

// تحديث localStorage عند تغيير المنتجات
watch(
  products,
  newProducts => {
    localStorage.setItem('products', JSON.stringify(newProducts));
    console.log(newProducts);
  },
  { deep: true }
);

// قالب المتغير مع كافة الحقول المطلوبة
const variantTemplate = () => ({
  barcode: '',
  sku: '',
  status: 'active',
  expiry_date: '', // مثال: "2024-12-31"
  image_url: '',
  dimensions: '',
  tax_rate: 0,
  discount: 0,
  attributes: [], // سيتم تخزين الكائنات { attribute_id, attribute_value_id }
});

const addVariant = () => {
  newProduct.value.variants.push(variantTemplate());
};

const removeVariant = index => {
  newProduct.value.variants.splice(index, 1);
};

const resetForm = () => {
  Object.assign(newProduct.value, {
    name: '',
    slug: '',
    is_active: true,
    featured: false,
    is_returnable: true,
    published_at: '',
    description: '',
    description_long: '',
    company_id: 1,
    created_by: 1,
    category_id: null,
    brand_id: null,
    warehouse_id: null,
    variants: [],
  });
};

// فتح الديالوج للإضافة: تأكد من إعادة تعيين النموذج ووضع editIndex على null
const openAddDialog = () => {
  resetForm();
  editIndex.value = null;
  dialog.value = true;
};

// فتح الديالوج للتعديل: نسخ بيانات المنتج إلى النموذج ووضع index المنتج في editIndex
const openEditDialog = index => {
  editIndex.value = index;
  Object.assign(newProduct.value, JSON.parse(JSON.stringify(products.value[index])));
  dialog.value = true;
};

// حفظ المنتج سواء للإضافة أو التعديل
const saveProduct = () => {
  if (editIndex.value !== null) {
    // تعديل المنتج
    products.value[editIndex.value] = JSON.parse(JSON.stringify(newProduct.value));
  } else {
    // إضافة منتج جديد
    products.value.push(JSON.parse(JSON.stringify(newProduct.value)));
  }
  resetForm();
  dialog.value = false;
  editIndex.value = null;
};

const removeProduct = index => {
  products.value.splice(index, 1);
};

// دالة تحويل الاسم إلى سلوج
function generateSlug(name) {
  return name
    .normalize('NFKD') // تحويل الحروف المميزة إلى أشكالها الأساسية
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '') // إزالة التشكيل من الحروف
    .replace(/[^\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/g, '-') // استبدال الرموز والمسافات بشرطات
    .replace(/^-+|-+$/g, '');
}

// مراقبة التغيير في الاسم وتحديث السلوج تلقائيًا
watch(
  () => newProduct.value.name,
  newName => {
    newProduct.value.slug = generateSlug(newName);
  },
  { immediate: true }
);

const submitProducts = () => {
  console.log('🚀 إرسال المنتجات:', JSON.stringify(products.value, null, 2));
};
</script>

<template>
  <v-container>
    <!-- زر فتح الديالوج للإضافة -->
    <v-btn color="primary" @click="openAddDialog">+ إضافة منتج</v-btn>

    <!-- دايلوج موحد للإضافة والتعديل -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          {{ isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد' }}
        </v-card-title>
        <v-card-text>
          <!-- بيانات المنتج الأساسية -->
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="newProduct.name" label="اسم المنتج" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="newProduct.slug" label="رابط المنتج" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch v-model="newProduct.is_active" label="فعال" />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch v-model="newProduct.featured" label="مميز" />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch v-model="newProduct.is_returnable" label="قابل للإرجاع" />
            </v-col>
            <!-- <v-col cols="12" md="6">
              <v-text-field v-model="newProduct.published_at" label="تاريخ النشر" type="datetime-local" />
            </v-col> -->
            <v-col cols="12">
              <v-textarea v-model="newProduct.description" label="الوصف" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="newProduct.description_long" label="الوصف المطول" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="newProduct.category_id" :items="[1, 2, 3]" label="الفئة" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="newProduct.brand_id" :items="[1, 2, 3]" label="العلامة التجارية" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="newProduct.warehouse_id" :items="[1, 2, 3]" label="المستودع" />
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- بيانات المتغيرات -->
          <v-card-subtitle>متغيرات المنتج</v-card-subtitle>
          <v-btn @click="addVariant" color="primary" class="mb-3">+ إضافة متغير</v-btn>

          <v-row v-for="(variant, vIndex) in newProduct.variants" :key="vIndex" class="mb-3">
            <v-col cols="12" md="3">
              <v-text-field v-model="variant.barcode" label="الباركود" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="variant.sku" label="SKU" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="variant.purchase_price" label="سعر الشراء" type="number" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="variant.wholesale_price" label="سعر الجملة" type="number" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="variant.retail_price" label="سعر التجزئة" type="number" />
            </v-col>
            <v-col cols="12" md="3">
              <v-select v-model="variant.status" :items="['active', 'inactive']" label="الحالة" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="variant.expiry_date" label="تاريخ الانتهاء" type="date" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="variant.image_url" label="رابط الصورة" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="variant.tax_rate" label="معدل الضريبة" type="number" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="variant.discount" label="الخصم" type="number" />
            </v-col>

            <!-- قسم اختيار الخصائص المتعددة -->
            <v-col cols="12">
              <div v-for="(attr, aIndex) in variant.attributes" :key="aIndex" class="d-flex align-center mb-2">
                <v-select
                  v-model="attr.attribute_id"
                  :items="attributes"
                  item-title="name"
                  item-value="id"
                  label="الخاصية"
                  @update:modelValue="attr.attribute_value_id = null"
                  class="mr-2"
                >
                </v-select>
                <v-select
                  v-model="attr.attribute_value_id"
                  :items="attributes.find(item => item.id === attr.attribute_id)?.values || []"
                  item-title="name"
                  item-value="id"
                  label="قيمة الخاصية"
                  class="mr-2"
                >
                </v-select>
                <v-btn color="red" icon @click="variant.attributes.splice(aIndex, 1)">
                  <v-icon>ri-delete-bin-line</v-icon>
                </v-btn>
              </div>
              <v-btn color="primary" small @click="variant.attributes.push({ attribute_id: null, attribute_value_id: null })"> + إضافة خاصية </v-btn>
            </v-col>

            <v-col cols="12" md="12">
              <v-btn color="red" @click="removeVariant(vIndex)">حذف المتغير</v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-btn color="success" block @click="saveProduct">
            {{ isEditMode ? 'حفظ التعديلات' : 'إضافة المنتج' }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- جدول عرض المنتجات -->
    <v-table class="mt-4" v-if="products.length">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>رابط المنتج</th>
          <th>الفئة</th>
          <th>الإجراء</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(product, index) in products" :key="index">
          <td>{{ product.name }}</td>
          <td>{{ product.slug }}</td>
          <td>{{ product.category_id }}</td>
          <td>
            <v-btn color="blue" @click="openEditDialog(index)"> <v-icon left>ri-edit-line</v-icon> تعديل </v-btn>
            <v-btn color="red" @click="removeProduct(index)"> <v-icon left>ri-delete-bin-line</v-icon> حذف </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- زر إرسال المنتجات -->
    <v-btn v-if="products.length" color="green" block class="mt-4" @click="submitProducts"> حفظ المنتجات </v-btn>
  </v-container>
</template>
