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
  <v-container class="d-flex align-center justify-center" style="height: 100vh">
    <v-card
      class="pa-5"
      elevation="2"
      style="width: 100%; height: 100%; text-align: center; display: flex; align-items: center; justify-content: center"
    >
      <v-card class="pa-5" elevation="1">
        <v-card-subtitle class="mb-4"> ليس لديك صلاحية للوصول إلى {{ title }}. </v-card-subtitle>
        <v-btn color="primary" @click="goBack" class="ma-2">الرجوع إلى الخلف</v-btn>
        <v-btn color="secondary" @click="goHome">الصفحة الرئيسية</v-btn>
      </v-card>
    </v-card>
  </v-container>
</template>
