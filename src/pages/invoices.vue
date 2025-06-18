<template>
  <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
    <!-- المُفعِّل: حقل نصيّ readonly -->
    <template #activator="{ props }">
      <v-text-field v-model="formattedDate" label="اختر التاريخ" readonly v-bind="props" />
    </template>

    <!-- منتقي التاريخ -->
    <v-date-picker v-model="startDate" @input="updateDate" :title="'اختر التاريخ'" locale="ar-eg" />
  </v-menu>
</template>

<script setup>
import { ref, watch } from 'vue'

/* ▸ الحالة (state) */
const menu = ref(false)
const startDate = ref(null)   // القيمة الخام (Date أو null)
const formattedDate = ref('')   // النص المعروض في الحقل

/* ▸ دالة تُرجِع التاريخ بصيغة yyyy‑MM‑dd */
function formatDate(dateObj) {
  if (!dateObj) return ''
  const yyyy = dateObj.getFullYear()
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/* ▸ يُستدعى عند اختيار تاريخ من الـ picker */
function updateDate(val) {
  formattedDate.value = formatDate(new Date(val))
  menu.value = false        // إغلاق الـ menu
}

/* ▸ مزامنة فورمات التاريـخ لو اتغيَّر برّا الـ picker */
watch(startDate, val => {
  formattedDate.value = formatDate(val ? new Date(val) : null)
})
</script>
