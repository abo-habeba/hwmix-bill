<script setup>
import { onMounted } from 'vue';
import { getOne } from './services/api';
import { useUserStore } from './stores/user';
const userStore = useUserStore();
onMounted(() => {
  userStore.fetchUser();
});
</script>

<template>
  <div v-if="userStore.loadingApi" class="box-loader">
    <div class="loader"></div>
  </div>
  <!-- <div class="error-Server">
    <div class="errorServer"></div>
  </div> -->
  <v-locale-provider rtl>
    <VApp>
      <VCol style="position: relative" cols="12">
        <RouterView />
      </VCol>
    </VApp>
  </v-locale-provider>
</template>
<style scoped>
.box-loader {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0000001e;
  block-size: 100%;
  inline-size: 100%;
  inset: 0;
  cursor: progress;
}

.loader {
  padding: 1px;
  border-radius: 50%;
  animation: l4 1s infinite steps(10);
  aspect-ratio: 1;
  background: conic-gradient(#0000 10%, #3c33f0) content-box;
  inline-size: 50px;
  mask: repeating-conic-gradient(#0000 0deg, #000 1deg 20deg, #0000 21deg 36deg),
    radial-gradient(farthest-side, #0000 calc(100% - var(--b) - 1px), #000 calc(100% - var(--b)));
  mask-composite: destination-in;
  mask-composite: intersect;

  --b: 8px;
}

.error-Server {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0000001e;
  block-size: 100%;
  inline-size: 100%;
  inset: 0;
  cursor: progress;
}

.errorServer {
  padding: 1px;
  border-radius: 50%;
  animation: l4 1s infinite steps(10);
  aspect-ratio: 1;
  background: conic-gradient(#0000 10%, #3c33f0) content-box;
  inline-size: 50px;
  mask: repeating-conic-gradient(#0000 0deg, #000 1deg 20deg, #0000 21deg 36deg),
    radial-gradient(farthest-side, #0000 calc(100% - var(--b) - 1px), #000 calc(100% - var(--b)));
  mask-composite: destination-in;
  mask-composite: intersect;

  --b: 8px;
}

@keyframes l4 {
  to {
    transform: rotate(1turn);
  }
}
</style>
<style lang="scss">
.v-checkbox-btn.v-selection-control .v-label {
  white-space: nowrap;
}
.v-table {
  white-space: nowrap !important;
}
.layout-page-content {
  padding-inline: 0 !important;
}
</style>
