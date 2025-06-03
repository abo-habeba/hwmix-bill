<script setup>
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  item: {
    type: null,
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
});

const route = useRoute();
const router = useRouter();

const isActive = computed(() => {
  return props.item?.to && route.name === props.item.to.name;
});

const openCreateDialog = event => {
  event.stopPropagation();
  if (props.item.createRoute) {
    router.push({ name: props.item.createRoute });
  }
};
</script>

<template>
  <li class="nav-link" :class="[{ disabled: item.disable }, { active: isActive }]" :title="title">
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <Component v-bind="attrs" v-on="on || {}" :is="item.to ? 'RouterLink' : 'a'" :to="item.to" :href="item.href" :target="item.target">
          <VIcon :icon="item.icon || 'ri-checkbox-blank-circle-line'" class="nav-item-icon" />
          <!-- 👉 Title -->
          <span class="nav-item-title">
            {{ item.title }}
            <VIcon v-if="item.createRoute" icon="ri-add-line" class="nav-item-create-icon" @click="openCreateDialog" />
          </span>
          <span v-if="item.badgeContent != 0" class="nav-item-badge" :class="item.badgeClass">
            {{ item.badgeContent }}
          </span>
        </Component>
      </template>
      <span>{{ title }}</span>
    </v-tooltip>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link a {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}

.nav-item-create-icon {
  margin-left: 0.5rem;
  cursor: pointer;
  color: var(--v-primary-base);
}
</style>
