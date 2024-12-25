<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();
const title = computed(() => route.params.title);

const goBack = () => {
  router.go(-1);
};

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
