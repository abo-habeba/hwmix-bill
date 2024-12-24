<script setup>
import { useRouter, useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';

const router = useRouter();
const route = useRoute();
const title = ref(route.params.title);
const previousTitle = ref(''); // عنوان المسار السابق

// الحصول على عنوان المسار القادم منه المستخدم
const previousPath = window.history.state.back;
onMounted(() => {
  // الحصول على السجل السابق

  if (previousPath) {
    // البحث عن المسار السابق في قائمة المسارات
    const previousRoute = router.getRoutes().find(r => r.path === previousPath);
    if (previousRoute && previousRoute.meta.title) {
      previousTitle.value = previousRoute.meta.title; // تعيين عنوان المسار السابق
    } else {
      previousTitle.value = 'غير معروف'; // عنوان افتراضي إذا لم يكن موجودًا
    }
  }
});

// دالة للرجوع إلى الصفحة السابقة
const goBack = () => {
  router.go(-1);
};

// دالة للرجوع إلى الصفحة الرئيسية
const goHome = () => {
  router.push({ name: 'dashboard' });
};
</script>

<template>
  <v-container fluid class="d-flex align-center justify-center" style="height: 100vh">
    <v-card class="pa-5" elevation="2" style="max-width: 400px; text-align: center">
      <v-card-subtitle class="mb-4"> ليس لديك صلاحية للوصول إلى {{ title }}. </v-card-subtitle>
      <v-btn color="primary" @click="goBack" class="ma-2">الرجوع إلى الخلف</v-btn>
      <v-btn color="secondary" @click="goHome">الصفحة الرئيسية</v-btn>
    </v-card>
  </v-container>
</template>
