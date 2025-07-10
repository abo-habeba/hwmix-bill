<template>
  <div class="app-footer d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 تذييل: المحتوى الأيسر -->
    <span class="d-flex align-center">
      <span class="pa-1">2025 &copy; {{ new Date().getFullYear() }}</span>
      <span class="pa-1">صنع من</span>
      <VIcon icon="ri-heart-line" color="error" size="1.25rem" class="mx-1" />
      <span class="pa-1">
        بواسطة
        <a href="https://www.facebook.com/hesham.mohamed.ahmed.abdalmaboud" target="_blank" rel="noopener noreferrer" class="text-primary ms-1"
          >ابو حبيبة</a
        ></span
      >
    </span>
    <!-- 👉 تذييل: المحتوى الأيمن (معطل حاليًا) -->
    <!-- <span class="d-md-flex gap-x-4 text-primary d-none">
      <a href="https://themeselection.com/license/" target="noopener noreferrer">الترخيص</a>
      <a href="https://themeselection.com/" target="noopener noreferrer">المزيد من الثيمات</a>
      <a href="https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/documentation/" target="noopener noreferrer">التوثيق</a>
      <a href="https://themeselection.com/support/" target="noopener noreferrer">الدعم</a>
    </span> -->
  </div>
</template>

<style scoped>
.app-footer {
  position: fixed; /* تثبيت العنصر */
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: white;
  padding: 1rem 1.5rem; /* مسافة داخلية */
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05); /* ظل خفيف في الأعلى */
  z-index: 1000; /* لضمان ظهوره فوق المحتوى الآخر */
  height: 60px; /* ارتفاع ثابت للتذييل */
}
</style>
