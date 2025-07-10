<template>
  <div class="app-footer d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 تذييل: المحتوى الأيسر -->
    <span class="d-flex align-center text-body-2 text-medium-emphasis">
      &copy; 2025 - {{ new Date().getFullYear() }}
      صنع من
      <VIcon icon="ri-heart-line" color="error" size="1.25rem" class="mx-1" />
      بواسطة
      <a href="https://www.facebook.com/hesham.mohamed.ahmed.abdalmaboud" target="_blank" rel="noopener noreferrer" class="text-primary ms-1"
        >ابو حبيبة</a
      >
    </span>
    <!-- 👉 تذييل: المحتوى الأيمن (معطل حاليًا) -->
    <!-- <span class="d-md-flex gap-x-4 text-primary d-none">
      <a href="https://themeselection.com/license/" target="noopener noreferrer">الترخيص</a>
      <a href="https://themeselection.com/" target="_blank" rel="noopener noreferrer">المزيد من الثيمات</a>
      <a href="https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/documentation/" target="_blank" rel="noopener noreferrer">التوثيق</a>
      <a href="https://themeselection.com/support/" target="_blank" rel="noopener noreferrer">الدعم</a>
    </span> -->
  </div>
</template>

<style scoped>
/* .app-footer {
  position: fixed; 
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 1rem 1.5rem; 
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05); 
  z-index: 1000; 
  height: 60px; 
} */
.app-footer {
  background-color: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
  height: 60px;
  width: 100%;
}
</style>
