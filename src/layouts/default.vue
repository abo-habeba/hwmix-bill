<script setup>
import DefaultLayoutWithVerticalNav from './components/DefaultLayoutWithVerticalNav.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
onMounted(() => {
  // userStore
  //   .setAuthHeaderNew(localStorage.authToken)
  //   .then(() => {})
  //   .catch(() => {});
});
</script>

<template>
  <!-- <div v-if="Number(userStore.user.status) === 1"> -->
  <DefaultLayoutWithVerticalNav>
    <RouterView />
  </DefaultLayoutWithVerticalNav>
  <!-- </div> -->
  <!-- <div v-else style="width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center; z-index: 1000">
    <v-card style="padding: 30px" max-width="500">
      <v-card-title>
        مرجبا ,
        {{ userStore.user?.nickname }}
      </v-card-title>
      <v-card-subtitle>
        حسابك غير مفعل
        <br />
        اطلب من صاحب الشركه تفعيل حسابك
      </v-card-subtitle>
    </v-card>
  </div> -->
</template>

<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use '@layouts/styles/default-layout';
.layout-page-content {
  padding-inline: 0 !important;
}
</style>
