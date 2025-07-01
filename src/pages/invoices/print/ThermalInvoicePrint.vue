<template>
    <div class="thermal-print" ref="printArea">
        <!-- Header -->
        <div class="header flex-col">
            <div class="row company col-12">{{ invoice.company.name }}</div>
            <div class="row col-12 row-inline">
                <div class="col-6 text-right">فاتورة رقم: {{ invoice.invoice_number }}</div>
                <div class="col-6 text-left">التاريخ: {{ formatDate(invoice.updated_at || invoice.created_at) }}</div>
            </div>
            <div class="row customer col-12">العميل: {{ invoice.user.full_name }}</div>
        </div>
        <hr />
        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>الصنف</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in invoice.items" :key="item.product_id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.unit_price) }}</td>
                    <td>{{ formatCurrency(item.total) }}</td>
                </tr>
            </tbody>
        </table>
        <hr />
        <!-- Footer -->
        <div class="footer flex-col">
            <div class="row col-12">
                <div class="col-6 text-right">الإجمالي: {{ formatCurrency(invoice.total_amount) }}</div>
                <div class="col-6 text-left">المدفوع: {{ formatCurrency(invoice.paid_amount) }}</div>
            </div>
            <div class="row col-12">
                <div class="col-6 text-right">المتبقي: {{ formatCurrency(invoice.remaining_amount) }}</div>
                <div class="col-6 text-left" v-if="invoice.notes">ملاحظات: {{ invoice.notes }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
const props = defineProps({
    invoice: { type: Object, required: true },
    companyName: { type: String, default: 'بدون اسم' },
});
const printArea = ref(null);
function formatCurrency(val) {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(val || 0);
}
function formatDate(val) {
    if (!val) return '';
    return new Date(val).toLocaleDateString('ar-EG');
}
onMounted(() => {
    // استخراج كل قواعد CSS من <style scoped> الخاص بالكمبوننت الحالي
    const styles = Array.from(document.querySelectorAll('style[scoped]'));
    let cssResult = '';
    styles.forEach(style => {
        try {
            const sheet = style.sheet;
            if (!sheet) return;
            for (const rule of sheet.cssRules) {
                // فقط قواعد STYLE_RULE (أي ليست @media أو @keyframes ...)
                if (rule.type === CSSRule.STYLE_RULE && rule.selectorText.startsWith('.')) {
                    cssResult += `${rule.cssText}\n`;
                }
            }
        } catch (e) {
            // تجاهل أي أخطاء (قد تظهر بسبب قيود CORS)
        }
    });
    // طباعة النتيجة في الكونسول
    console.log('Component Scoped CSS Rules:', cssResult);
    // حفظها في متغير عام لاستخدامها في الطباعة
    window.__thermalPrintComponentCSS = cssResult;
});
function printThermal() {
    nextTick(() => {
        const el = printArea.value;
        if (!el) return;
        const html = `<div class='thermal-print'>${el.innerHTML}</div>`;
        // جلب التنسيقات المستخرجة من <style scoped>
        const componentCSS = window.__thermalPrintComponentCSS || '';
        const win = window.open('', '', 'width=1000,height=800,left=200,top=50');
        win.document.write(`
          <html>
            <head>
              <title>طباعة فاتورة حرارية</title>
              <link rel="stylesheet" href="/dist/assets/index-Dmm87GDT.css">
              <style>
                /* Scoped component styles */
                ${componentCSS}
                /* يمكن إضافة أي تخصيص إضافي هنا إذا لزم */
                body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
                .thermal-print { width: 260px; font-size: 13px; font-family: 'Tahoma', 'Arial', sans-serif; direction: rtl; color: #000; }
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
    });
}
defineExpose({ printThermal });
// يمكنك إضافة منطق الطباعة التلقائية هنا إذا رغبت
</script>

<style scoped>
.thermal-print {
    width: 260px;
    font-size: 13px;
    font-family: 'Tahoma', 'Arial', sans-serif;
    direction: rtl;
    color: #000;
}

.flex-col {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
}

.row {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
    justify-content: space-between;
}

.col-12 {
    width: 100%;
    padding-top: 4px;
    padding-bottom: 4px;
}

.col-6 {
    width: 50%;
    padding-top: 4px;
    padding-bottom: 4px;
}

.text-right {
    text-align: right;
}

.text-left {
    text-align: left;
}

.header,
.footer {
    margin-bottom: 8px;
}

.company {
    font-weight: bold;
    font-size: 15px;
    margin-bottom: 2px;
    justify-content: center;
}

.customer {
    margin-bottom: 2px;
}

.row-inline {
    gap: 8px;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
}

.items-table th,
.items-table td {
    border-bottom: 1px dashed #aaa;
    padding: 2px 0;
    text-align: center;
}

hr {
    border: none;
    border-top: 1px dashed #aaa;
    margin: 6px 0;
}
</style>
