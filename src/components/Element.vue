<template>
  <div id="myElement">
    <h1>My Element</h1>
  </div>
</template>

<script setup>
const element = document.querySelector('#myElement');
const myElement = document.querySelector('#myElement');
const rect = myElement.getBoundingClientRect();
const mouseX = event.clientX - rect.left;

const mouseY = event.clientY - rect.top;
</script>
