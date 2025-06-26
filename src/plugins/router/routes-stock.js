// مسارات المخزون والمخازن
export default [
  {
    path: 'warehouses',
    component: () => import('@/pages/warehouses/warehouses.vue'),
    name: 'warehouses',
    meta: {
      title: 'المخازن',
      description: 'إدارة المخازن',
      roles: ['admin.super', 'admin.company', 'warehouses.page'],
    },
  },
  {
    path: 'stock',
    component: () => import('@/pages/stock/stock.vue'),
    name: 'stock',
    meta: {
      title: 'المخزون',
      description: 'إدارة المخزون',
      roles: ['admin.super', 'admin.company', 'stocks.page'],
    },
  },
  {
    path: 'stock-transfers',
    component: () => import('@/pages/stock-transfers.vue'),
    name: 'stock-transfers',
    meta: {
      title: 'تحويلات المخزون',
      description: 'قائمة تحويلات المخزون',
      roles: ['admin.super', 'admin.company', 'stocks.transfers'],
    },
  },
  {
    path: 'inventory-adjustments',
    component: () => import('@/pages/inventory-adjustments.vue'),
    name: 'inventory-adjustments',
    meta: {
      title: 'تسويات المخزون',
      description: 'قائمة تسويات المخزون',
      roles: ['admin.super', 'admin.company', 'stocks.adjustments'],
    },
  },
];
