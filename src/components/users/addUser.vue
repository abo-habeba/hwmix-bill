<template>
  <v-btn
    class="text-center"
    density="compact"
    variant="flat"
    style="background-color: #28a745 !important; color: white; z-index: 10"
    prepend-icon="ri-add-line"
    :to="{ name: 'edit-user' }"
  >
  </v-btn>
</template>
<script setup></script>
<style lang="scss" scoped>
.btn-add {
  position: absolute;

  // في الشاشات الصغيرة (أقل من 600px) تكون الموضع في الأسفل
  @media (max-width: 599px) {
    bottom: 20px;
    top: auto;
    right: 20px;
  }

  // في الشاشات الأكبر من 600px تكون الموضع في الأعلى
  @media (min-width: 600px) {
    top: 20px;
    bottom: auto;
    left: 20px;
  }
}
</style>
