// مسارات المخزون والمخازن
export default [
  {
    path: 'warehouses',
    component: () => import('@/pages/warehouses/warehouses.vue'),
    name: 'warehouses',
    meta: {
      title: 'المخازن',
      description: 'إدارة المخازن',
    },
  },
  {
    path: 'stock',
    component: () => import('@/pages/stock/stock.vue'),
    name: 'stock',
    meta: {
      title: 'المخزون',
      description: 'إدارة المخزون',
    },
  },
  {
    path: 'stock-transfers',
    component: () => import('@/pages/stock-transfers.vue'),
    name: 'stock-transfers',
    meta: {
      title: 'تحويلات المخزون',
      description: 'قائمة تحويلات المخزون',
      roles: ['super_admin', 'company_owner'],
    },
  },
  {
    path: 'inventory-adjustments',
    component: () => import('@/pages/inventory-adjustments.vue'),
    name: 'inventory-adjustments',
    meta: {
      title: 'تسويات المخزون',
      description: 'قائمة تسويات المخزون',
      roles: ['super_admin', 'company_owner'],
    },
  },
];
