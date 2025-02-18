<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  item: { type: Object, required: true },
  activeItem: { type: String, default: '' },
});

const emit = defineEmits(['update:activeItem']);

const toggleItem = () => {
  if (props.activeItem === props.item.title) {
    emit('update:activeItem', '');
  } else {
    emit('update:activeItem', props.item.title);
  }
};
</script>

<template>
  <li class="nav-group" :class="{ open: activeItem === item.title }">
    <div class="nav-group-label" @click="toggleItem">
      <VIcon :icon="item.icon || 'ri-checkbox-blank-circle-line'" class="nav-item-icon" />
      <span class="nav-item-title">{{ item.title }}</span>
      <VIcon icon="ri-arrow-right-s-line" class="nav-group-arrow" />
    </div>
    <div class="nav-group-children-wrapper">
      <ul v-show="activeItem === item.title" class="nav-group-children">
        <slot />
      </ul>
    </div>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-group {
    &-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .nav-group-children-wrapper {
      transition: max-height 0.3s ease-in-out;
      overflow: hidden;
    }

    &.open .nav-group-children-wrapper {
      max-height: 500px; // يمكنك تعديل القيمة حسب الحاجة
    }
  }
  .open {
    background-color: #e6e7ec;
    max-height: 500px;
    overflow: hidden;
    border-radius: 25px 0 0 25px;
  }
}
</style>
