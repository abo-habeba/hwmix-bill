<script setup>
const props = defineProps({
  attributes: { type: Array, default: () => [] },
  fontSize: { type: String, default: '10px' },
});
function getContrastColor(hexcolor) {
  if (!hexcolor) return '#000';
  const c = hexcolor.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 186 ? '#000' : '#fff';
}
</script>
<template>
  <div class="d-flex align-center">
    <template v-if="Array.isArray(attributes) && attributes.length">
      <div v-for="(attr, idx) in attributes" :key="idx" class="d-flex align-center">
        <div
          :style="{
            display: 'flex',
            backgroundColor: attr.attribute_value?.color,
            color: getContrastColor(attr.attribute_value?.color),
            borderRadius: '15px',
            padding: '0px 1px',
            margin: '0px 2px',
            fontSize: fontSize,
            border: '#7E4EE6 1px solid ',
          }"
        >
          <span style="display: inline-block; padding: 0px 2px">
            {{ attr.attribute_value?.name ?? '-' }}
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <span class="text-grey">بدون خصائص</span>
    </template>
  </div>
</template>
