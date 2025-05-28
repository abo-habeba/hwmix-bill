<script setup>
import ProductDialog from '@/components/products/ProductDialog.vue';
import { ref, onMounted } from 'vue';
import { deleteOne, getAll } from '@/services/api';
import { toast } from 'vue3-toastify';

const dialog = ref(false);
const dialogProduct = ref({});
const isEditMode = ref(false);
const products = ref([]);
const confirmDelete = ref(false);
const productToDelete = ref(null);
const expandedId = ref(null);

const headers = [
  { title: 'الاسم', key: 'name' },
  { title: 'الكمية', key: 'stock_quantity' },
  { title: 'الفئة', key: 'category' },
  { title: 'الماركة', key: 'brand' },
  { title: 'الإجراء', key: 'actions', sortable: false },
];

const variantHeaders = [
  { title: 'SKU', key: 'sku' },
  { title: 'الباركود', key: 'barcode' },
  { title: 'سعر الشراء', key: 'purchase_price' },
  { title: 'سعر الجملة', key: 'wholesale_price' },
  { title: 'سعر التجزئة', key: 'retail_price' },
  { title: 'الخصم', key: 'discount' },
  { title: 'الخصائص', key: 'attributes' },
  { title: 'الإجراء', key: 'actions', sortable: false },
];

onMounted(() => {
  getProducts();
});

function getProducts() {
  getAll('products').then(res => {
    products.value = res.data;
  });
}

function openAddDialog() {
  dialogProduct.value = {};
  isEditMode.value = false;
  dialog.value = true;
}

function openEditDialog(product) {
  dialogProduct.value = { ...product };
  isEditMode.value = true;
  dialog.value = true;
}

function onProductSaved(product) {
  const idx = products.value.findIndex(p => p.id === product.id);
  if (idx !== -1) products.value[idx] = product;
  else products.value.push(product);
  dialog.value = false;
}

function askDelete(product) {
  productToDelete.value = product;
  confirmDelete.value = true;
}

function removeProduct() {
  if (!productToDelete.value) return;
  deleteOne('product-variant', productToDelete.value.id)
    .then(() => {
      products.value = products.value.filter(p => p.id !== productToDelete.value.id);
      toast.success('تم حذف المنتج بنجاح');
      confirmDelete.value = false;
      productToDelete.value = null;
    })
    .catch(() => toast.error('حدث خطأ أثناء حذف المنتج'));
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id;
}
</script>

<template>
  <v-container class="pa-1" style="max-width: 1200px">
    <ProductDialog v-model:dialog="dialog" :product="dialogProduct" :isEditMode="isEditMode" @saved="onProductSaved" />
    <v-card class="pa-2">
      <div class="d-flex align-center justify-space-between mb-2">
        <h3 class="text-h6 font-weight-bold mb-0">قائمة المنتجات</h3>
        <v-btn color="primary" @click="openAddDialog" size="small">+ إضافة منتج</v-btn>
      </div>
      <v-data-table
        :items="products"
        :headers="headers"
        item-key="id"
        class="text-start th-no-padding"
        density="compact"
        style="direction: rtl"
        no-data-text="لا توجد بيانات"
        loading-text="جاري تحميل البيانات..."
        items-per-page-text="عدد العناصر في الصفحة"
        page-text="{0}-{1} من {2}"
      >
        <template #item="{ item }">
          <tr :class="{ 'expanded-row': expandedId === item.id }" @click="toggleExpand(item.id)" style="cursor: pointer">
            <td>{{ item.name }}</td>
            <td>{{ item.stock_quantity ?? item.variants?.[0]?.stock_quantity ?? '-' }}</td>
            <td>{{ item.category?.name || '-' }}</td>
            <td>{{ item.brand?.name || '-' }}</td>
            <td @click.stop>
              <v-btn size="x-small" icon="ri-edit-line" color="blue" @click.stop="openEditDialog(item)" />
              <v-btn size="x-small" icon="ri-delete-bin-line" color="red" @click.stop="askDelete(item)" />
            </td>
          </tr>

          <tr v-if="expandedId === item.id" class="variant-table-bg">
            <td colspan="5" class="pa-0">
              <v-data-table
                :items="item.variants"
                :headers="variantHeaders"
                item-key="id"
                density="compact"
                class="text-start"
                hide-default-footer
                no-data-text="لا يوجد متغيرات لهذا المنتج"
              >
                <template #item="{ item }">
                  <tr>
                    <td>{{ item.sku }}</td>
                    <td>{{ item.barcode }}</td>
                    <td>{{ item.purchase_price }}</td>
                    <td>{{ item.wholesale_price }}</td>
                    <td>{{ item.retail_price }}</td>
                    <td>{{ item.discount }}</td>
                    <td>
                      <v-chip v-for="(attr, idx) in item.attributes" :key="idx" size="x-small">
                        {{ attr.name }}: {{ attr.value?.name || '-' }}
                      </v-chip>
                    </td>
                    <td>
                      <v-btn size="x-small" icon color="blue" title="تعديل"><v-icon size="16">ri-edit-line</v-icon></v-btn>
                      <v-btn size="x-small" icon color="red" title="حذف"><v-icon size="16">ri-delete-bin-line</v-icon></v-btn>
                      <v-btn size="x-small" icon color="success" title="طباعة"><v-icon size="16">ri-printer-line</v-icon></v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="confirmDelete" max-width="340">
      <v-card>
        <v-card-title>تأكيد الحذف</v-card-title>
        <v-card-text>هل أنت متأكد أنك تريد حذف هذا المنتج؟</v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="removeProduct" size="small">تأكيد</v-btn>
          <v-btn @click="confirmDelete = false" size="small">إلغاء</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<style scoped>
.v-data-table th,
.v-data-table td,
.th-no-padding th {
  padding: 2px !important;
  font-size: 13px !important;
}

.v-btn .v-icon {
  font-size: 14px !important;
}

.v-chip {
  font-size: 11px;
  margin: 0 2px 2px 0;
}

/* ✅ لون الصف المفتوح */
.expanded-row {
  background-color: #e3f2fd !important;
}

/* ✅ لون جدول المتغيرات */
.variant-table-bg {
  background-color: #f1f8fe !important;
}
</style>
