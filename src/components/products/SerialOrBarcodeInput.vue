<template>
  <v-text-field v-model="serialInput" :label="label" clearable hide-details ref="serialInputField" @keyup.enter="onSerialInputEnter">
    <template #prepend>
      <v-tooltip text="فتح الكاميرا" location="top">
        <template #activator="{ props }">
          <v-icon v-bind="props" class="cursor-pointer" @click="showScanner = true" size="40" color="#10B981"> ri-qr-scan-2-line </v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>

  <v-dialog v-model="showScanner" max-width="400" persistent>
    <v-card>
      <v-alert v-if="scannerError" type="warning" dense border="start" border-color="error">
        {{ scannerError }}
      </v-alert>
      <video
        class="ma-2"
        ref="barcodeVideo"
        id="barcodeVideo"
        style="width: 100%; height: 240px; object-fit: cover"
        autoplay
        muted
        playsinline
      ></video>
      <p class="ma-auto">تاكد ان السريال واضح وان الكاميرا نظيفة</p>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/library';

const props = defineProps({
  modelValue: String,
  label: { type: String, default: 'أدخل السيريال أو امسح الباركود' },
});
const emit = defineEmits(['update:modelValue', 'product-found', 'error']);

const serialInput = ref(props.modelValue || '');
const showScanner = ref(false);
const scannerError = ref(null);
const barcodeVideo = ref(null);
const serialInputField = ref(null);
let codeReader = null;

watch(
  () => props.modelValue,
  val => {
    serialInput.value = val || '';
  }
);

watch(showScanner, async val => {
  if (val) {
    try {
      scannerError.value = null;
      codeReader = new BrowserMultiFormatReader();
      const videoElement = barcodeVideo.value;
      await codeReader.decodeFromVideoDevice(null, videoElement, (result, err) => {
        if (result) {
          serialInput.value = result.getText();
          showScanner.value = false;
          codeReader.reset();
          onSerialInputEnter();
        }
        if (err && !(err.name === 'NotFoundException')) {
          scannerError.value = 'خطأ في قراءة الباركود، حاول مجددًا';
        }
      });
    } catch (error) {
      scannerError.value = 'تعذر الوصول إلى الكاميرا';
    }
  } else if (codeReader) {
    codeReader.reset();
  }
});

async function onSerialInputEnter() {
  const serial = serialInput.value.trim();
  if (!serial) return;
  emit('update:modelValue', serial);
  // لا تبحث عن المنتج هنا، فقط أرسل السيريال للأب
  serialInput.value = '';
}
</script>
