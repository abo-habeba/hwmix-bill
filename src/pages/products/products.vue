<script setup>
import ProductDialog from '@/components/products/ProductDialog.vue';
import VariantEditDialog from '@/components/products/VariantEditDialog.vue';
import AttributesDisplay from '@/components/products/AttributesDisplay.vue';
import ProductSticker from '@/pages/invoices/print/ProductSticker.vue';
import { createApp, ref, onMounted, h, nextTick } from 'vue';
import { deleteOne, getAll } from '@/services/api';
import { toast } from 'vue3-toastify';

const dialog = ref(false);
const dialogProduct = ref({});
const isEditMode = ref(false);
const products = ref([]);
const confirmDelete = ref(false);
const productToDelete = ref(null);
const expandedId = ref(null);
const total = ref(0);
const loading = ref(false);
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
});
const search = ref('');

// --- متغيرات تعديل متغير المنتج ---
const variantDialog = ref(false);
const variantToEdit = ref(null);
const attributes = ref([]);
const stickerComponentRef = ref(null);

const headers = [
  { title: 'الاسم', key: 'name' },
  { title: 'اجمالي الكمية', key: 'total_available_quantity' },
  { title: 'القسم', key: 'category' },
  { title: 'الماركة', key: 'brand' },
  { title: 'الإجراء', key: 'actions', sortable: false },
];

const variantHeaders = [
  { title: 'SKU', key: 'sku' },
  { title: 'الباركود', key: 'barcode' },
  { title: 'الكمية', key: 'quantity' },
  { title: ' كمية التحزير ', key: 'min_quantity' },
  { title: 'سعر الشراء', key: 'cost' },
  { title: 'سعر الجملة', key: 'wholesale_price' },
  { title: 'سعر القطاعي', key: 'retail_price' },
  { title: 'الخصم', key: 'discount' },
  { title: 'الخصائص', key: 'attributes' },
  { title: 'الإجراء', key: 'actions', sortable: false },
];

onMounted(() => {
  fetchAttributes();
});

function fetchAttributes() {
  getAll('attributes', null, true, false).then(res => {
    attributes.value = res.data;
  });
}
function fetchProducts() {
  loading.value = true;
  const { page, itemsPerPage, sortBy } = options.value;
  const sortField = sortBy.length ? sortBy[0].key : 'id';
  const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'desc';
  getAll('products', {
    page,
    per_page: itemsPerPage,
    sort_by: sortField,
    sort_order: sortOrder,
    search: search.value,
  })
    .then(res => {
      products.value = res.data;
      total.value = res.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

function openAddDialog() {
  isEditMode.value = false;
  dialogProduct.value = {};
  dialog.value = true;
}

function openEditDialog(product) {
  dialog.value = true;
  isEditMode.value = true;
  dialogProduct.value = JSON.parse(JSON.stringify(product));
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
  deleteOne('product/delete', productToDelete.value.id)
    .then(() => {
      fetchProducts(); // جلب المنتجات من السيرفر بعد الحذف
      toast.success('تم حذف المنتج بنجاح');
      confirmDelete.value = false;
      productToDelete.value = null;
    })
    .catch(() => toast.error('حدث خطأ أثناء حذف المنتج'));
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id;
}

function getContrastColor(hexcolor) {
  if (!hexcolor) return '#000';
  const c = hexcolor.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 186 ? '#000' : '#fff'; // إذا فاتح اعمل النص اسود، غير كده ابيض
}

function openVariantEditDialog(variant, productId) {
  variantToEdit.value = JSON.parse(JSON.stringify(variant));
  // أضف id المنتج للمتغير
  variantToEdit.value.product_id = productId;
  console.log('openVariantEditDialog', variantToEdit.value);
  console.log('attributes', attributes.value);
  variantDialog.value = true;
}

function saveVariant(editedVariant) {
  // ابحث عن المنتج المفتوح حالياً (expandedId)
  const product = products.value.find(p => p.id === (editedVariant.product_id || expandedId.value));
  if (!product) return;
  const idx = product.variants.findIndex(v => v.id === editedVariant.id);
  if (idx !== -1) {
    product.variants[idx] = editedVariant;
  }
  variantDialog.value = false;
}

function isMobileDevice() {
  return /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(navigator.userAgent);
}

const showMobileStickerDialog = ref(false);

function openStickerDialog(variant) {
  if (!isMobileDevice()) {
    // نافذة طباعة مباشرة بدون دايالوج (سطح المكتب)
    const container = document.createElement('div');
    document.body.appendChild(container);
    const app = createApp({
      render() {
        return h(ProductSticker, {
          product: variant,
          ref: 'stickerRef',
        });
      },
      mounted() {
        nextTick(() => {
          this.$refs.stickerRef.printSticker();
          setTimeout(() => {
            app.unmount();
            document.body.removeChild(container);
          }, 5000);
        });
      },
    });
    app.mount(container);
  } else {
    // منطق خاص بالموبايل: عرض الاستيكر في Dialog ثم طباعة الصفحة كاملة
    stickerComponentRef.value = variant;
    showMobileStickerDialog.value = true;
  }
}

function printMobileSticker() {
  // إخفاء كل شيء عدا الاستيكر أثناء الطباعة
  const originalBody = document.body.innerHTML;
  const stickerHtml = document.getElementById('mobile-sticker-print').outerHTML;
  document.body.innerHTML = stickerHtml;
  window.print();
  document.body.innerHTML = originalBody;
  showMobileStickerDialog.value = false;
}
</script>

<template>
  <v-container class="pa-1" style="max-width: 1200px">
    <ProductDialog v-model:dialog="dialog" :product="dialogProduct" :isEditMode="isEditMode" @saved="onProductSaved" />
    <VariantEditDialog v-model="variantDialog" :variant="variantToEdit" :attributes="attributes" @save="saveVariant" />
    <v-card class="pa-2" style="overflow-x: auto; overflow-y: unset">
      <div class="d-flex align-center justify-space-between mb-2">
        <h3 class="text-h6 font-weight-bold mb-0">قائمة المنتجات</h3>
        <v-btn color="primary" @click="openAddDialog" size="small">+ إضافة منتج</v-btn>
        <div class="d-flex align-center gap-2">
          <v-text-field
            v-model="search"
            placeholder="بحث عن منتج..."
            hide-details
            rounded
            style="max-width: 180px; min-width: 120px; font-size: 13px"
            @keydown.enter="fetchProducts"
            @blur="fetchProducts"
            clearable
            @click:clear="
              () => {
                search = '';
                fetchProducts();
              }
            "
            prepend-inner-icon="ri-search-line"
            @click:prepend-inner="fetchProducts"
          />
        </div>
      </div>

      <v-data-table
        :items="products"
        :headers="headers"
        item-key="id"
        class="text-start"
        density="compact"
        style="direction: rtl"
        :loading="loading"
        :options.sync="options"
        :server-items-length="total"
        :items-per-page="options.itemsPerPage"
        :page.sync="options.page"
        :sort-by.sync="options.sortBy"
        no-data-text="لا توجد بيانات"
        loading-text="جاري تحميل البيانات..."
        items-per-page-text="عدد العناصر في الصفحة"
        page-text="{0}-{1} من {2}"
        @update:options="fetchProducts"
      >
        <template #item="{ item }">
          <tr :class="{ 'bg-product-expanded': expandedId === item.id }" @click="toggleExpand(item.id)" style="cursor: pointer">
            <td>{{ item.name }}</td>
            <td>{{ item.total_available_quantity }}</td>
            <td>{{ item.category?.name ?? '-' }}</td>
            <td>{{ item.brand?.name ?? '-' }}</td>
            <td @click.stop>
              <v-btn class="mx-2" size="small" icon="ri-edit-line" color="primary" @click.stop="openEditDialog(item)" />
              <v-btn class="mx-2" size="small" icon="ri-delete-bin-line" color="error" @click.stop="askDelete(item)" />
            </td>
          </tr>
          <tr v-if="expandedId === item.id">
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
                <template #item="{ item: variant }">
                  <tr :class="variant.quantity <= variant.min_quantity ? 'bg-variant-min-quantity' : 'bg-variant-normal'">
                    <td>{{ variant.sku }}</td>
                    <td>{{ variant.barcode }}</td>
                    <td>{{ variant.quantity }}</td>
                    <td>{{ variant.min_quantity }}</td>
                    <td>{{ variant.cost }}</td>
                    <td>{{ variant.wholesale_price }}</td>
                    <td>{{ variant.retail_price }}</td>
                    <td>{{ variant.discount }}</td>
                    <td>= <AttributesDisplay :attributes="variant.attributes" font-size="10px" /></td>
                    <td>
                      <div>
                        <v-btn size="x-small" icon color="blue" title="تعديل" @click.stop="openVariantEditDialog(variant, item.id)"
                          ><v-icon size="16">ri-edit-line</v-icon></v-btn
                        >
                        <v-btn size="x-small" icon color="red" title="حذف"><v-icon size="16">ri-delete-bin-line</v-icon></v-btn>
                        <v-btn size="x-small" icon color="success" title="طباعة استيكر" @click.stop="openStickerDialog(variant)"
                          ><v-icon size="16">ri-printer-line</v-icon></v-btn
                        >
                      </div>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="confirmDelete" max-width="340" persistent>
      <v-card>
        <v-card-title>تأكيد الحذف</v-card-title>
        <v-card-text>هل أنت متأكد أنك تريد حذف هذا المنتج؟</v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="removeProduct" size="small">تأكيد</v-btn>
          <v-btn @click="confirmDelete = false" size="small">إلغاء</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog خاص بطباعة الاستيكر على الموبايل -->
    <v-dialog v-model="showMobileStickerDialog" max-width="350" persistent>
      <v-card>
        <v-card-title class="text-center">معاينة استيكر المنتج</v-card-title>
        <v-card-text>
          <div id="mobile-sticker-print">
            <ProductSticker :product="stickerComponentRef" ref="mobileStickerRef" />
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="printMobileSticker">طباعة</v-btn>
          <v-btn color="grey" @click="showMobileStickerDialog = false">إغلاق</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
/* .v-data-table td {
  padding: 5px !important;
  font-size: 13px !important;
} */

::v-deep(.v-data-table th),
.v-data-table td {
  padding: 5px !important;
}

.v-btn .v-icon {
  font-size: 14px !important;
  /*  border:#7E4EE6 .125rem solid ; */
}

.v-chip {
  font-size: 11px;
  margin: 0 2px 2px 0;
}

.bg-product-expanded {
  background-color: #b3e0ff !important;
}

.bg-variant-normal {
  background-color: #e6f6ff !important;
}

.bg-variant-min-quantity {
  background-color: #fff9c4 !important;
}

.v-data-table {
  overflow-x: unset !important;
  overflow-y: unset !important;
}

.v-card {
  overflow-y: unset !important;
}
</style>
