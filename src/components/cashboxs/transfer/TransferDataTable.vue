<template>
  <v-data-table :headers="headers" :items="items" item-key="id" class="elevation-1" hide-default-footer density="compact">
    <template #no-data>
      <v-row class="pa-4">
        <v-col class="text-center text-grey"> لا توجد بيانات متاحة </v-col>
      </v-row>
    </template>

    <template #item.name="{ item }">
      {{ item.name }}
    </template>

    <template #item.quantity="{ item }">
      <v-text-field
        v-model.number="item.quantity"
        type="number"
        min="1"
        dense
        hide-details
        style="max-width: 60px"
        @input="updateItemQuantity(item)"
      />
    </template>

    <template #item.unit_price="{ item }">
      {{ formatCurrency(item.unit_price) }}
    </template>

    <template #item.discount="{ item }">
      <v-text-field
        v-model.number="item.discount"
        type="number"
        min="0"
        :max="item.unit_price"
        dense
        hide-details
        style="max-width: 60px"
        @input="updateItemQuantity(item)"
      />
    </template>

    <template #item.total="{ item }">
      {{ formatCurrency(item.total) }}
    </template>

    <template #item.actions="{ item }">
      <v-btn icon color="error" @click="removeInvoiceItem(item.id)">
        <v-icon>ri-delete-bin-line</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'TransferDataTable',
  props: {
    headers: {
      type: Array,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        currencyDisplay: 'symbol',
      }).format(value || 0);
    },
    updateItemQuantity(item) {
      if (!item) return;
      item.quantity = Math.max(1, item.quantity);
      item.discount = Math.max(0, item.discount);
      item.total = item.unit_price * item.quantity - item.discount;
      this.$emit('update-total');
    },
    removeInvoiceItem(id) {
      this.$emit('remove-item', id);
    },
  },
};
</script>
