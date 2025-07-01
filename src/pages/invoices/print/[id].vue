<template>
    <div class="print-page">
        <v-container>
            <v-row>
                <v-col cols="12" md="8" class="mx-auto">
                    <v-card class="pa-4 mb-4">
                        <v-row align="center" justify="space-between">
                            <v-col cols="12" md="6">
                                <h2 class="text-h5">معاينة طباعة الفاتورة</h2>
                            </v-col>
                            <v-col cols="12" md="6" class="text-md-end text-center">
                                <v-btn color="primary" @click="printThermal">طباعة حرارية</v-btn>
                                <v-btn color="info" @click="showSticker = !showSticker">طباعة ستيكر منتج</v-btn>
                            </v-col>
                        </v-row>
                        <ThermalInvoicePrint v-if="invoice" :invoice="invoice" :companyName="companyName"
                            ref="thermalRef" />
                    </v-card>

                    <v-card v-if="showSticker && invoice && invoice.items" class="pa-4">
                        <h3 class="text-h6 mb-2">ستيكرات المنتجات</h3>
                        <v-row>
                            <v-col v-for="item in invoice.items" :key="item.product_id" cols="6" sm="4" md="3">
                                <ProductSticker
                                    :product="{ name: item.name, serial: item.serial || item.product_id, price: item.unit_price }"
                                    ref="stickerRefs" />
                                <v-btn color="info" size="small" class="mt-2" @click="printSticker(item)">طباعة هذا
                                    المنتج</v-btn>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getOne } from '@/services/api';
import ThermalInvoicePrint from './ThermalInvoicePrint.vue';
import ProductSticker from './ProductSticker.vue';

const route = useRoute();
const invoice = ref(null);
const companyName = 'اسم الشركة'; // يمكنك جلبه من الإعدادات لاحقاً
const showSticker = ref(false);
const thermalRef = ref(null);
const stickerRefs = ref([]);

async function fetchInvoice() {
    // جرب أولاً جلب بيانات الفاتورة من sessionStorage
    const cached = sessionStorage.getItem('print_invoice');
    if (cached) {
        try {
            invoice.value = JSON.parse(cached);
            sessionStorage.removeItem('print_invoice'); // تنظيف بعد الاستخدام
            return;
        } catch { }
    }
    // إذا لم توجد بيانات مخزنة، اجلب من السيرفر
    const id = route.params.id;
    if (!id) return;
    const res = await getOne('invoices', id);
    invoice.value = res?.data || null;
}

onMounted(fetchInvoice);

function printThermal() {
    // طباعة القسم الحراري فقط (منطق احترافي مثل الاستيكر)
    if (!thermalRef.value) return;
    // توليد HTML للطباعة
    const el = thermalRef.value.$el || thermalRef.value;
    const html = `
      <div class='thermal-print'>${el.innerHTML}</div>
    `;
    const win = window.open('', '', 'width=400,height=700,left=200,top=50');
    win.document.write(`
      <html>
        <head>
          <title>طباعة فاتورة حرارية</title>
          <style>
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            .thermal-print { width: 260px; font-size: 13px; font-family: 'Tahoma', 'Arial', sans-serif; direction: rtl; color: #000; }
            .header, .footer { text-align: center; margin-bottom: 8px; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th, .items-table td { border-bottom: 1px dashed #aaa; padding: 2px 0; text-align: center; }
            hr { border: none; border-top: 1px dashed #aaa; margin: 6px 0; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
        win.print();
        win.close();
    }, 300);
}

function printSticker(item) {
    // طباعة ستيكر منتج واحد
    const idx = invoice.value.items.findIndex(i => i.product_id === item.product_id);
    const stickerComp = document.querySelectorAll('.sticker-print')[idx];
    if (!stickerComp) return;
    const win = window.open('', '', 'width=180,height=200');
    win.document.write('<html><head><title>ستيكر منتج</title></head><body dir="rtl">');
    win.document.write(stickerComp.outerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
}
</script>

<style scoped>
.print-page {
    background: #f8f8f8;
    min-height: 100vh;
}
</style>
