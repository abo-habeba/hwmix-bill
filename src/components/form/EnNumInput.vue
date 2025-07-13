<script setup>
import { computed, watch } from 'vue';
import { VTextField } from 'vuetify/components';
import { VNumberInput } from 'vuetify/labs/VNumberInput';
const props = defineProps({
  modelValue: [String, Number], // القيمة الأساسية التي يتم ربطها
  label: String,
  type: {
    type: String,
    default: 'text', // نضمن أن النوع هو 'text' للتحكم اليدوي
  },
  hideDetails: [Boolean, String],
  outlined: Boolean,
  dense: Boolean,
  disabled: Boolean,
  readonly: Boolean,
});

const emit = defineEmits(['update:modelValue', 'input']);

/**
 * دالة مساعدة لتحويل الأرقام العربية (الهندية) إلى الأرقام الإنجليزية (اللاتينية).
 * @param {string | number} value - القيمة المراد تحويلها.
 * @returns {string | number} - القيمة مع أرقام إنجليزية.
 */
const convertArabicToEnglishDigits = value => {
  if (value === null || value === undefined) return value;
  // التعبير النمطي يطابق الأرقام العربية (٠-٩)
  // دالة الاستبدال تحول كود يونيكود للرقم العربي إلى كود يونيكود للرقم الإنجليزي المقابل
  return String(value).replace(/[\u0660-\u0669]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x0030));
};

/**
 * خاصية محسوبة (computed property) للتحكم في القيمة المعروضة في حقل النص والقيمة الأساسية.
 * تستخدم get لعرض القيمة بالإنجليزية، و set لمعالجة إدخال المستخدم.
 */
const formattedValue = computed({
  // دالة get: تستخدم لعرض القيمة في حقل النص
  get() {
    // نحول القيمة الأساسية (modelValue) إلى رقم، ثم ننسقها بالصيغة الإنجليزية (en-US)
    const num = parseFloat(props.modelValue);
    if (isNaN(num)) return ''; // إذا لم يكن رقمًا، نعيد سلسلة فارغة
    return new Intl.NumberFormat('en-US').format(num);
  },
  // دالة set: تستخدم عند قيام المستخدم بإدخال قيمة في حقل النص
  set(newValue) {
    // 1. نحول أي أرقام عربية قام المستخدم بإدخالها إلى أرقام إنجليزية
    const englishDigitsString = convertArabicToEnglishDigits(newValue);
    // 2. نزيل أي أحرف غير رقمية (مثل فواصل الآلاف) التي قد تكون موجودة
    const cleanedString = englishDigitsString.replace(/[^0-9.]/g, '');
    // 3. نحول السلسلة النظيفة إلى رقم عشري (float)
    const num = parseFloat(cleanedString);

    // نرسل القيمة الرقمية النظيفة (أو null إذا كانت غير صالحة) إلى modelValue و input
    emit('update:modelValue', isNaN(num) ? null : num);
    emit('input', isNaN(num) ? null : num);
  },
});

// مراقبة التغييرات في modelValue الخارجي وتحديث القيمة المعروضة
// هذا يضمن أن المكون يتفاعل مع التغييرات البرمجية من المكون الأب
watch(
  () => props.modelValue,
  newVal => {
    // دالة get في formattedValue ستتكفل بتحديث العرض
  },
  { immediate: true }
); // immediate: true لضمان التهيئة عند التحميل الأول
</script>

<template>
  <!-- <VTextField
    v-model="formattedValue"
    :label="label"
    type="text"
    :hide-details="hideDetails"
    :outlined="outlined"
    :dense="dense"
    :disabled="disabled"
    :readonly="readonly"
    class="english-number-input"
    inputmode="numeric"
  /> -->

  <v-number-input
    v-model="formattedValue"
    :label="label"
    type="text"
    :hide-details="hideDetails"
    :outlined="outlined"
    :dense="dense"
    :disabled="disabled"
    :readonly="readonly"
    class="english-number-input"
    inputmode="numeric"
    reverse
    controlVariant="split"
    :hideInput="false"
    inset
  ></v-number-input>
</template>

<style scoped>
.english-number-input input {
  /* فرض اتجاه النص من اليسار لليمين داخل الحقل */
  direction: ltr !important;
  unicode-bidi: plaintext !important;

  /* محاولة فرض استخدام خطوط تعرض الأرقام اللاتينية بشكل افتراضي */
  font-family: 'Segoe UI', Arial, sans-serif, 'Inter', monospace;
  /* استخدام الأرقام الجدولية لتحسين المحاذاة العمودية */
  font-variant-numeric: tabular-nums;
  /* خاصية WebKit لمحاولة فرض إعدادات اللغة الإنجليزية على مستوى المتصفح */
  -webkit-locale: 'en';
  /* فرض الأرقام الخطية (lining numbers) */
  font-feature-settings: 'lnum';
}
</style>
