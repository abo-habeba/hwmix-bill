<template>
    <div class="sticker-print" ref="stickerArea">
        <div class="barcode-section">
            <div class="barcode-wrapper">
                <Vue3Barcode :value="serial" :width="1.5" :height="40" :display-value="false" />
            </div>
            <span class="serial-value">{{ serial }}</span>
        </div>
        <div class="info-section">
            <div>السعر: {{ formatCurrency(product.retail_price) }}</div>
        </div>
    </div>
</template>

<script setup>
import Vue3Barcode from 'vue3-barcode';
import { ref, defineExpose, onMounted } from 'vue';
const props = defineProps({
    product: { type: Object, required: true },
});
const serial = props.product.barcode || '';
const stickerArea = ref(null);
function formatCurrency(val) {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(val || 0);
}
function getSerialWithSpacing() {
    // احسب عرض الباركود الفعلي
    const barcodeEl = stickerArea.value?.querySelector('.barcode-wrapper svg');
    if (!barcodeEl) return serial;
    const barcodeWidth = barcodeEl.getBoundingClientRect().width;
    // احسب عدد الحروف
    const chars = serial.length;
    if (chars < 2) return serial;
    // احسب المسافة المطلوبة بين الحروف
    const fontSize = 12; // px
    let letterSpacing = (barcodeWidth - chars * fontSize) / (chars - 1);
    if (letterSpacing < 0) letterSpacing = 0;
    // أضف span مع ستايل letter-spacing
    return `<span style="display:inline-block;letter-spacing:${letterSpacing}px;font-size:${fontSize}px;font-weight:bold;width:100%;text-align:center;">${serial}</span>`;
}
function printSticker() {
    const serialSpaced = getSerialWithSpacing();
    const printContents = `
      <div class='sticker-print'>
        <div class='barcode-section'>
          <div class='barcode-wrapper'>${stickerArea.value.querySelector('.barcode-wrapper').innerHTML}</div>
          <span class='serial-value'>${serialSpaced}</span>
        </div>
        <div class='info-section'>
          <div>السعر: ${formatCurrency(props.product.retail_price)}</div>
        </div>
      </div>
    `;
    const printWindow = window.open('', '', 'width=1000,height=900,left=100,top=50');
    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة استيكر المنتج</title>
          <style>
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            .sticker-print { display: flex; flex-direction: column; align-items: center; justify-content: center; margin: auto; width: 140px; height: 140px; border: 1px dashed #aaa; padding: 10px; font-size: 12px; font-family: 'Tahoma', 'Arial', sans-serif; text-align: center; direction: rtl; color: #000; box-sizing: border-box; background: #fff; gap: 6px; }
            .barcode-section { display: flex; flex-direction: column; align-items: center; width: 100%; margin-bottom: 4px; }
            .barcode-wrapper { width: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; }
            .serial-value { font-size: 12px; margin-top: 2px; letter-spacing: 1px; font-weight: bold; text-align: center; width: 100%; }
            .info-section { display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; }
            .product-name { font-weight: bold; font-size: 13px; margin-bottom: 2px; word-break: break-word; max-width: 120px; text-align: center; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 300);
}
// onMounted(() => {
//     console.log('ProductSticker', props.product);

// });
defineExpose({ printSticker });
</script>

<style scoped>
.sticker-print {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 24px auto;
    width: 140px;
    height: 140px;
    border: 1px dashed #aaa;
    padding: 10px;
    font-size: 12px;
    font-family: 'Tahoma', 'Arial', sans-serif;
    text-align: center;
    direction: rtl;
    color: #000;
    box-sizing: border-box;
    background: #fff;
    gap: 6px;
}

.barcode-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-bottom: 4px;
}

.barcode-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.serial-value {
    font-size: 12px;
    margin-top: 2px;
    letter-spacing: 1px;
    font-weight: bold;
    text-align: center;
    width: 100%;
}

.info-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 100%;
}

.product-name {
    font-weight: bold;
    font-size: 13px;
    margin-bottom: 2px;
    word-break: break-word;
    max-width: 120px;
    text-align: center;
}
</style>
