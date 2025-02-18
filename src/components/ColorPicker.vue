<template>
  <v-container>
    <v-btn color="primary" @click="openCamera">فتح الكاميرا</v-btn>
    <video ref="video" autoplay playsinline class="mt-4" width="100%"></video>

    <v-btn color="success" class="mt-4" @click="captureImage">التقاط صورة</v-btn>
    <canvas ref="canvas" class="mt-4" @click="pickColor($event)"></canvas>
  </v-container>

  <!-- use
  <ColorPicker @colorSelected="handleColorSelected" /> -->
</template>

<script setup>
// use
// import ColorPicker from './ColorPicker.vue'; // تأكد من مسار الملف الصحيح
// const selectedColor = ref(null);
// function handleColorSelected(color) {
//   selectedColor.value = color;
// }

import { ref, defineEmits } from 'vue';

const emits = defineEmits(['colorSelected']);
const video = ref(null);
const canvas = ref(null);

function openCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(stream => {
      video.value.srcObject = stream;
    })
    .catch(err => {
      console.error('فشل في فتح الكاميرا:', err);
    });
}

function captureImage() {
  const context = canvas.value.getContext('2d');
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
}

function pickColor(event) {
  const context = canvas.value.getContext('2d');
  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const pixel = context.getImageData(x, y, 1, 1).data;
  const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  emits('colorSelected', color);
}
</script>

<style scoped>
video,
canvas {
  max-width: 100%;
  border: 1px solid #ccc;
}
</style>
