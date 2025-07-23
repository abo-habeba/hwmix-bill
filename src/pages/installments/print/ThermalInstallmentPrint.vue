<template>
  <div class="thermal-print" ref="printArea">
    <!-- Header -->
    <div class="header flex-col">
      <div class="row company col-12">{{ companyName }}</div>
      <div class="row col-12 row-inline">
        <div class="col-6 text-left">تاريخ الخطة: {{ formatDate(installment.updated_at || installment.created_at) }}</div>
      </div>
      <div class="row customer col-12">العميل: {{ installment.user.full_name }}</div>
      <div class="row col-12 product-header">المنتجات:</div>
      <div class="row product-item" v-for="product in installment.invoice_items" :key="product.id">
        <div class="col-12 product-name">- {{ product.name }}</div>
      </div>
    </div>
    <hr />
    <!-- Installments Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>الرقم</th>
          <th>تاريخ الاستحقاق</th>
          <th>الحالة</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inst in installment.installments" :key="inst.id">
          <td>{{ inst.installment_number }}</td>
          <td>{{ formatDate(inst.due_date) }}</td>
          <td>{{ inst.status_label }}</td>
        </tr>
      </tbody>
    </table>
    <hr />
    <!-- Footer -->
    <div class="footer flex-col">
      <div class="row col-12">
        <div class="col-6 text-right">إجمالي الخطة: {{ formatCurrency(installment.total_amount) }}</div>
        <div class="col-6 text-left">الدفعة الأولى: {{ formatCurrency(installment.down_payment) }}</div>
      </div>
      <div class="row col-12">
        <div class="col-6 text-right">المتبقي: {{ formatCurrency(installment.remaining_amount) }}</div>
        <div class="col-6 text-left" v-if="installment.notes">ملاحظات: {{ installment.notes }}</div>
      </div>
      <div class="row col-12">
        <div class="col-6 text-right">عدد الأقساط: {{ installment.number_of_installments }}</div>
        <div class="col-6 text-left">إجمالي الأقساط: {{ formatCurrency(installment.total_installments_amount) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

// تعريف الخصائص (Props) التي يستقبلها المكون
const props = defineProps({
  installment: { type: Object, required: true }, // بيانات خطة الأقساط
  companyName: { type: String, default: 'بدون اسم' }, // اسم الشركة
});

// مرجع لعنصر منطقة الطباعة في القالب
const printArea = ref(null);

/**
 * تنسيق القيمة كعملة مصرية.
 * @param {number|string} val - القيمة المراد تنسيقها.
 * @returns {string} القيمة المنسقة كعملة.
 */
function formatCurrency(val) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(val || 0);
}

/**
 * تنسيق التاريخ.
 * @param {string} val - قيمة التاريخ.
 * @returns {string} التاريخ المنسق.
 */
function formatDate(val) {
  if (!val) return '';
  // يتم إنشاء كائن Date من التاريخ ثم تنسيقه
  return new Date(val).toLocaleDateString('ar-EG');
}

// عند تركيب المكون (Mounted)
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
  // طباعة النتيجة في الكونسول (للتصحيح)
  console.log('Component Scoped CSS Rules:', cssResult);
  // حفظها في متغير عام لاستخدامها في الطباعة
  window.__thermalPrintComponentCSS = cssResult;
});

/**
 * دالة الطباعة الحرارية.
 * تفتح نافذة جديدة، تضيف محتوى الطباعة والتنسيقات، ثم تقوم بالطباعة.
 */
function printThermal() {
  nextTick(() => {
    const el = printArea.value; // الحصول على عنصر منطقة الطباعة
    if (!el) return; // إذا لم يتم العثور على العنصر، توقف

    const html = `<div class='thermal-print'>${el.innerHTML}</div>`; // محتوى HTML للطباعة
    // جلب التنسيقات المستخرجة من <style scoped>
    const componentCSS = window.__thermalPrintComponentCSS || '';

    // فتح نافذة جديدة للطباعة
    const win = window.open('', '', 'width=1000,height=800,left=200,top=50');
    win.document.write(`
          <html>
            <head>
              <title>طباعة خطة أقساط حرارية</title>
              <link rel="stylesheet" href="/dist/assets/index-Dmm87GDT.css">
              <link rel="icon" type="image/svg+xml" href="/images/printer-line.svg">
              <style>
                /* Scoped component styles */
                ${componentCSS}
                /* يمكن إضافة أي تخصيص إضافي هنا إذا لزم */
                body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
                .thermal-print { width: 260px; font-size: 13px; font-family: 'Tahoma', 'Arial', sans-serif; direction: rtl; color: #000; }
                 .items-table { border: none; } 
                 .row { padding: 2px 0; }
                 .col-12 { padding: 2px 0; }
                .items-table th, .items-table td { border-bottom: 2px solid #000;padding: 3px 0; text-align: center; }
              </style>
            </head>
            <body>
              ${html}
            </body>
          </html>
        `);
    win.document.close(); // إغلاق مستند النافذة
    win.focus(); // التركيز على النافذة الجديدة

    // تأخير قصير للسماح بتحميل المحتوى قبل الطباعة
    setTimeout(() => {
      win.print(); // بدء عملية الطباعة
      win.close(); // إغلاق النافذة بعد الطباعة
    }, 300);
  });
}

// كشف الدالة printThermal لتكون متاحة من المكون الأب
defineExpose({ printThermal });
</script>

<style scoped>
/* الأنماط الخاصة بالطباعة الحرارية */
.thermal-print {
  width: 260px;
  font-size: 13px;
  font-family: 'Tahoma', 'Arial', sans-serif;
  direction: rtl;
  color: #000;
}

/* أنماط Flexbox للأعمدة */
.flex-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

/* أنماط الصفوف */
.row {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

/* أنماط الأعمدة الكاملة */
.col-12 {
  width: 100%;
  padding-top: 4px;
  padding-bottom: 4px;
}

/* أنماط الأعمدة بنصف العرض */
.col-6 {
  width: 50%;
  padding-top: 4px;
  padding-bottom: 4px;
}

/* محاذاة النص لليمين */
.text-right {
  text-align: right;
}

/* محاذاة النص لليسار */
.text-left {
  text-align: left;
}

/* أنماط الرأس والتذييل */
.header,
.footer {
  margin-bottom: 8px;
}

/* أنماط اسم الشركة في الرأس */
.company {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 2px;
  justify-content: center;
}

/* أنماط العميل في الرأس */
.customer {
  margin-bottom: 2px;
}

/* أنماط الصفوف المتجاورة */
.row-inline {
  gap: 8px;
}

/* أنماط المنتجات */
.product-header {
  font-weight: bold;
  margin-top: 5px;
  margin-bottom: 2px;
}

.product-item {
  margin-left: 10px; /* مسافة بادئة للمنتجات */
  margin-bottom: 1px;
}

.product-name {
  font-size: 12px;
}

/* أنماط جدول العناصر (الأقساط) */
.items-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000; /* إضافة حد للجدول */
  margin-top: 8px; /* مسافة من الأعلى */
}

/* أنماط رؤوس وجسم الجدول */
.items-table th,
.items-table td {
  border: 1px solid #000; /* تغيير الحدود إلى صلبة */
  padding: 2px 0;
  text-align: center;
}

/* أنماط الخط الفاصل */
hr {
  border: none;
  border-top: 1px dashed #aaa; /* خط منقط */
  margin: 6px 0;
}
</style>
