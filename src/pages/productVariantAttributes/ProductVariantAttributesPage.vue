<template>
    <div>
        <v-data-table v-model:expanded="expanded" :headers="headers" :items="products" item-value="id" show-expand>
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>جدول المنتجات القابل للتوسيع</v-toolbar-title>
                </v-toolbar>
            </template>

            <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
                <td>
                    <v-btn :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small"
                        variant="plain" @click="toggleExpand(internalItem)"></v-btn>
                </td>
            </template>

            <template v-slot:expanded-row="{ columns, item }">
                <tr>
                    <td :colspan="columns.length">
                        <v-data-table :headers="variantHeaders" :items="item.variants" hide-default-header
                            hide-default-footer>
                            <template v-slot:item="{ item }">
                <tr>
                    <td>{{ item.barcode }}</td>
                    <td>{{ item.sku }}</td>
                    <td>{{ item.purchase_price }}</td>
                    <td>{{ item.wholesale_price }}</td>
                    <td>{{ item.retail_price }}</td>
                    <td>{{ item.discount }}%</td>
                    <td>{{item.attributes.find(attr => attr.name === 'اللون')?.value.name}}</td>
                    <td>{{item.attributes.find(attr => attr.name === 'هشام')?.value.name}}</td>
                </tr>
            </template>
        </v-data-table>
        </td>
        </tr>
</template>
</v-data-table>
</div>
</template>

<script setup>
import { ref } from 'vue';

const headers = [
    { text: 'اسم المنتج', value: 'name' },
    { text: 'الرمز', value: 'slug' },
];

const variantHeaders = [
    { text: 'الباركود', value: 'barcode' },
    { text: 'SKU', value: 'sku' },
    { text: 'سعر الشراء', value: 'purchase_price' },
    { text: 'سعر الجملة', value: 'wholesale_price' },
    { text: 'سعر القطاعي', value: 'retail_price' },
    { text: 'الخصم', value: 'discount' },
    { text: 'اللون', value: 'color' },
    { text: 'هشام', value: 'hisham' },
];

const products = ref([
    {
        id: 12,
        name: 'ايفون 15 برو ماكس',
        slug: '-15--',
        is_active: 1,
        is_returnable: 1,
        description: 'الوصف القصير',
        variants: [
            {
                id: 1,
                barcode: 'BC1494937842',
                sku: 'SKU-C2VEVZLL',
                purchase_price: '15.00',
                wholesale_price: '20.00',
                retail_price: '30.00',
                discount: '10.00',
                attributes: [
                    { name: 'اللون', value: { name: 'احمر' } },
                    { name: 'هشام', value: { name: 'قيمة هشام 1' } },
                ],
            },
            {
                id: 2,
                barcode: 'BC1494937843',
                sku: 'SKU-C2VEVZLM',
                purchase_price: '18.00',
                wholesale_price: '25.00',
                retail_price: '35.00',
                discount: '15.00',
                attributes: [
                    { name: 'اللون', value: { name: 'أزرق' } },
                    { name: 'هشام', value: { name: 'قيمة هشام 2' } },
                ],
            },
        ],
    },
    {
        id: 13,
        name: 'سامسونج جالكسي S21',
        slug: '-S21--',
        is_active: 1,
        is_returnable: 1,
        description: 'الوصف القصير لجالكسي S21',
        variants: [
            {
                id: 3,
                barcode: 'BC1494937844',
                sku: 'SKU-C2VEVZLN',
                purchase_price: '20.00',
                wholesale_price: '27.00',
                retail_price: '40.00',
                discount: '5.00',
                attributes: [
                    { name: 'اللون', value: { name: 'أسود' } },
                    { name: 'هشام', value: { name: 'قيمة هشام 3' } },
                ],
            },
            {
                id: 4,
                barcode: 'BC1494937845',
                sku: 'SKU-C2VEVZLO',
                purchase_price: '22.00',
                wholesale_price: '30.00',
                retail_price: '45.00',
                discount: '8.00',
                attributes: [
                    { name: 'اللون', value: { name: 'فضي' } },
                    { name: 'هشام', value: { name: 'قيمة هشام 4' } },
                ],
            },
        ],
    },
]);

const expanded = ref([]);
</script>

<style scoped>
.v-data-table {
    margin-top: 20px;
}
</style>
