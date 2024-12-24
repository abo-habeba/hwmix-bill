<template>
  <div id="myElement">
    <h1>My Element</h1>
  </div>
</template>

<script setup>
const element = document.querySelector('#myElement') // اختر العنصر المطلوب
// const rect = element.getBoundingClientRect()

/////////////////////////////////

// تحديد العنصر الذي نريد التعامل معه باستخدام المعرّف (id) الخاص به
const myElement = document.querySelector('#myElement')
// إضافة مستمع للحدث 'mousemove' إلى العنصر
// يتم تشغيل هذا الحدث عند تحريك الماوس داخل العنصر
// الحصول على الإحداثيات والموقع الحالي للعنصر بالنسبة لنافذة العرض
const rect = myElement.getBoundingClientRect()
console.log('العرض:', rect.width)
console.log('الارتفاع:', rect.height)
console.log('المسافة من أعلى الصفحة:', rect.top)
console.log('المسافة من يسار الصفحة:', rect.left)

// حساب الموضع الأفقي للماوس داخل العنصر
// يتم ذلك بطرح موقع الحافة اليسرى للعنصر من موضع الماوس الأفقي
const mouseX = event.clientX - rect.left

// حساب الموضع العمودي للماوس داخل العنصر
// يتم ذلك بطرح موقع الحافة العلوية للعنصر من موضع الماوس العمودي
const mouseY = event.clientY - rect.top

// طباعة إحداثيات الماوس بالنسبة للعنصر في وحدة البيكسل
console.log(`موضع الماوس بالنسبة للعنصر: X: ${mouseX}px, Y: ${mouseY}px`)
</script>
