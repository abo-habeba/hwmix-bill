<script setup>
import { getAll } from '@/services/api';
import { ref, nextTick, watch, onMounted, computed } from 'vue';
import { useDisplay } from 'vuetify';

const { xs } = useDisplay();
// الحالة الرئيسية
const dialog = ref(false);
const products = ref([]);
const editIndex = ref(null);
const attributes = ref([]);
const warehouses = ref([]);
const brands = ref([]);
const categories = ref([]);
const searchCategory = ref('');
const searchBrand = ref('');
const attributeValues = ref('');

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
  variants: [
    {
      attributes: [
        {
          attribute_id: null,
          attribute_value_id: null,
        },
      ],
      barcode: '',
      dimensions: '',
      discount: null,
      expiry_date: '',
      image_url: '',
      sku: '',
      status: 'active',
      tax_rate: null,
    },
  ],
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
});

function getAttributes() {
  getAll('attributes').then(res => {
    attributes.value = res.data;
  });
}
function getWarehouse() {
  getAll('warehouses').then(async res => {
    warehouses.value = res.data;
    newProduct.value.warehouse_id = warehouses.value[0].id;
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
  tax_rate: null,
  discount: null,
  attributes: [
    {
      attribute_id: null,
      attribute_value_id: null,
    },
  ], // سيتم تخزين الكائنات { attribute_id, attribute_value_id }
});

const addVariant = () => {
  // newProduct.value.variants.push(variantTemplate());
  newProduct.value.variants.push(newProduct.value.variants[0]);
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
    variants: [
      {
        attributes: [
          {
            attribute_id: null,
            attribute_value_id: null,
          },
        ],
        barcode: '',
        dimensions: '',
        discount: null,
        expiry_date: '',
        image_url: '',
        sku: '',
        status: 'active',
        tax_rate: null,
      },
    ],
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
function fetchBrands(query) {
  if (!query) return;
  getAll('brands', { search: query }).then(res => {
    brands.value = res.data;
  });
}
function fetchCategories(query) {
  if (!query) return;
  getAll('categories', { search: query }).then(res => {
    categories.value = res.data;
    console.log(categories.value);
  });
}
const formattedCategories = computed(() => {
  const flatCategories = [];

  const formatCategory = (category, depth = 0) => {
    flatCategories.push({
      id: category.id,
      name: `${'- '.repeat(depth)}${category.name}`,
    });

    if (category.children && category.children.length) {
      category.children.forEach(child => formatCategory(child, depth + 1));
    }
  };

  categories.value.forEach(cat => formatCategory(cat));
  return flatCategories;
});

// تطبيق البحث في `name` و `description`
const filteredCategories = computed(() => {
  if (!searchCategory.value) return formattedCategories.value;
  console.log(formattedCategories.value.filter(cat => cat.name.includes(searchCategory.value)));

  return formattedCategories.value.filter(cat => cat.name.includes(searchCategory.value));
});
const setAttributeValues = item => {
  console.log(item.raw.values);
  // newProduct.value.attributeValues.value = item.values;
  attributeValues.value = item.raw.values;
};
function closeDialog() {
  dialog.value = false;
}
</script>

<template>
  <v-container>
    <!-- دايلوج موحد للإضافة والتعديل -->
    <v-dialog :fullscreen="xs" v-model="dialog">
      <v-card>
        <v-btn color="error" style="position: fixed; z-index: 10" class="ma-2" icon="ri-close-line" @click="dialog = false"></v-btn>
        <v-card-title class="ma-5 text-center">
          <h2>{{ isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد' }}</h2>
        </v-card-title>
        <v-card-text :class="xs ? 'px-2' : 'px-5'">
          <!-- بيانات المنتج الأساسية -->
          <v-row class="elevation-10 my-3">
            <v-col cols="12" md="6">
              <v-text-field v-model="newProduct.name" label="اسم المنتج" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="newProduct.slug" label="الرابط السهل" required />
            </v-col>
            <!--is_active && featured && is_returnable -->
            <v-col cols="12">
              <v-row>
                <v-col>
                  <v-switch v-model="newProduct.is_active" label="نشط" />
                </v-col>
                <v-col>
                  <v-switch v-model="newProduct.featured" label="مميز" />
                </v-col>
                <v-col>
                  <v-switch v-model="newProduct.is_returnable" label="قابل للإرجاع" />
                </v-col>
              </v-row>
            </v-col>
            <!-- Categories && brands && warehouses  -->
            <v-col cols="12">
              <v-row>
                <v-col>
                  <v-combobox
                    v-model="newProduct.category_id"
                    item-value="id"
                    item-title="name"
                    :items="filteredCategories || []"
                    label="الفئة"
                    @update:modelValue="newProduct.category_id = $event ? $event.id : null"
                    v-model:search="searchCategory"
                    @update:search="fetchCategories"
                    hide-no-data
                    hide-selected
                  />
                </v-col>
                <v-col class="px-0">
                  <v-combobox
                    v-model="newProduct.brand_id"
                    item-value="id"
                    item-title="name"
                    :items="brands || []"
                    label="العلامة التجارية"
                    @update:modelValue="newProduct.brand_id = $event ? $event.id : null"
                    v-model:search="searchBrand"
                    @update:search="fetchBrands"
                    hide-no-data
                    hide-selected
                  />
                </v-col>
                <v-col>
                  <v-select
                    v-if="warehouses.length"
                    v-model="newProduct.warehouse_id"
                    item-value="id"
                    item-title="name"
                    :items="warehouses || []"
                    label="المخزن"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-textarea rows="1" auto-grow v-model="newProduct.description" label="الوصف القصير" />
            </v-col>
            <v-col cols="12">
              <v-textarea rows="2" auto-grow v-model="newProduct.description_long" label="الوصف المفصل" />
            </v-col>
          </v-row>
          <!-- بيانات المتغيرات -->
          <v-card-title> تفاصيل المنتج الإضافية </v-card-title>
          <v-card-subtitle class="pb-2"> مثل السعر والصور والخصومات </v-card-subtitle>
          <v-row class="elevation-10 my-5" v-for="(variant, vIndex) in newProduct.variants" :key="vIndex">
            <v-col cols="12">
              <!--purchase_price && retail_price && wholesale_price -->
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
            <!-- tax rate && discount -->
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
            <!-- barcode && sku -->
            <v-col cols="12">
              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="variant.barcode" label="الباركود" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="variant.sku" label="SKU" />
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
            <!-- قسم اختيار الخصائص المتعددة -->
            <v-col cols="12">
              <!-- زر إضافة خاصية -->
              <v-btn variant="text" color="primary" @click="variant.attributes.push({ attribute_id: null, attribute_value_id: null, values: [] })">
                + إضافة خصائص
              </v-btn>
              <v-card-subtitle>اختيار خصائص مثل اللون والحجم</v-card-subtitle>

              <div v-for="(attr, aIndex) in variant.attributes" :key="aIndex" class="d-flex align-center mb-2">
                <v-col cols="5">
                  <v-combobox
                    v-model="attr.attribute_id"
                    :items="attributes || []"
                    item-title="name"
                    item-value="id"
                    label="الخاصية"
                    class="mr-2"
                    @update:modelValue="attr.attribute_id = $event ? $event.id : null"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item
                        v-bind="props"
                        @click="
                          () => {
                            attr.attribute_value_id = null;
                            attr.values = item.raw.values;
                          }
                        "
                      >
                      </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>

                <v-col cols="5">
                  <v-combobox
                    v-model="attr.attribute_value_id"
                    :items="attr.values || []"
                    item-title="name"
                    item-value="id"
                    label="اختر قيمة"
                    class="mr-2"
                    :return-object="false"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item append-icon="ri-pantone-fill" :style="{ color: item.raw.value || '' }" v-bind="props"> </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>

                <v-col cols="2">
                  <v-btn variant="text" class="ms-2" color="red" icon @click="variant.attributes.splice(aIndex, 1)">
                    <v-icon>ri-delete-bin-line</v-icon>
                  </v-btn>
                </v-col>
              </div>
            </v-col>
            <v-col cols="12" md="12">
              <v-btn prepend-icon="ri-delete-bin-line" color="error" @click="removeVariant(vIndex)">حذف التفاصيل</v-btn>
            </v-col>
          </v-row>
          <v-btn variant="text" @click="addVariant" class="mb-3">+ إضافة تفاصيل جديدة</v-btn>
          <v-divider class="my-4"></v-divider>
          <div style="display: flex; position: sticky; bottom: 4px; left: 0; right: 0; width: 100%">
            <v-row>
              <v-col cols="4">
                <v-btn prepend-icon="ri-close-line" color="error" @click="closeDialog"> إلغاء </v-btn>
              </v-col>
              <v-col cols="4" class="text-center">
                <v-btn prepend-icon="ri-save-line" color="success" @click="saveProduct">
                  {{ isEditMode ? 'حفظ التعديلات' : 'إضافة المنتج' }}
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-card class="pa-4">
      <!-- زر فتح الديالوج للإضافة -->
      <v-btn color="primary" @click="openAddDialog">+ إضافة منتج</v-btn>

      <!-- جدول عرض المنتجات -->

      <v-table class="mt-4">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>رابط المنتج</th>
            <th>الفئة</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody v-if="products.length">
          <tr v-for="(product, index) in products" :key="index">
            <td>{{ product.name }}</td>
            <td>{{ product.slug }}</td>
            <td>{{ product.category_id }}</td>
            <td>
              <v-btn variant="text" color="blue" icon="ri-edit-line" @click="openEditDialog(index)"></v-btn>
              <v-btn variant="text" icon="ri-delete-bin-line" color="red" @click="removeProduct(index)"></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
    <!-- زر إرسال المنتجات -->
    <v-btn v-if="products.length" color="green" block class="mt-4" @click="submitProducts"> حفظ المنتجات </v-btn>
  </v-container>
</template>
