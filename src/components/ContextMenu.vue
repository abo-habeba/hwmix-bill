<template>
  <v-list
    id="menuAction"
    class="pa-0 v-list-menu"
    :style="{
      backgroundColor: '#ededf3',
      position: 'absolute',
      ...menuActionStyles,
    }"
  >
    <v-list-item
      v-for="action in actions"
      :style="{ color: action.color }"
      :key="action.title"
      :prepend-icon="action.icon"
      :title="action.title"
      @click="handleAction(action)"
    >
    </v-list-item>
  </v-list>
</template>

<script setup>
import { defineExpose, defineProps, ref } from 'vue';

const props = defineProps({
  actions: {
    type: Array,
    required: true,
  },
});

const handleAction = action => {
  if (typeof action.callback === 'function') {
    action.callback();
  }
};

const menuActionStyles = ref({
  left: null,
  top: null,
  zIndex: -100,
  opacity: 0,
});

const colsContextMenu = () => {
  menuActionStyles.value = {
    left: null,
    top: null,
    zIndex: -100,
    opacity: 0,
  };
};

function showContextMenu(event) {
  const dataTable = document.querySelector('#dataTable');
  const menuAction = document.querySelector('#menuAction');

  event.preventDefault(); // منع القائمة السياقية الافتراضية
  const dataTableRect = dataTable.getBoundingClientRect();
  const dataTableWidth = dataTableRect.width;
  const dataTableHeight = dataTableRect.height;
  const dataTableTop = dataTableRect.top;
  const dataTableLeft = dataTableRect.left;

  const menuActionRect = menuAction.getBoundingClientRect();
  const menuActionWidth = menuActionRect.width;
  const menuActionHeight = menuActionRect.height;

  // حساب موضع الماوس داخل dataTable
  const menuLemitY = dataTableHeight - menuActionHeight;
  const mouseY = event.clientY - dataTableTop - 20;
  const menuLemitX = dataTableWidth - menuActionWidth;
  const mouseX = event.clientX - dataTableLeft;

  menuActionStyles.value = {
    left: mouseX >= menuLemitX ? `${menuLemitX}px` : `${mouseX}px`,
    top: mouseY >= menuLemitY ? `${menuLemitY}px` : `${mouseY}px`,
    zIndex: 9999,
    opacity: 1,
  };
}
defineExpose({ showContextMenu, colsContextMenu });
</script>
<style lang="scss">
.v-list-menu {
  border: 1px #c6b5d3 solid;
  border-radius: 4px;
  user-select: none;
  z-index: 9999;
  .v-list-item {
    border-bottom: 1px #c6b5d3 solid;
    &:hover {
      background-color: #d6c1e0;
    }
  }
}
</style>
