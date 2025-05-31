// مسارات الفواتير وكل ما يتعلق بها
export default [
  {
    path: 'invoice',
    component: () => import('@/pages/invoice/index.vue'),
    name: 'invoice',
    meta: {
      title: 'الفواتير',
      description: 'إدارة الفواتير',
      roles: ['super_admin', 'company_owner'],
    },
  },
  {
    path: 'invoiceType',
    component: () => import('@/pages/invoiceType/index.vue'),
    name: 'invoiceType',
    meta: {
      title: 'أنواع الفواتير',
      description: 'إدارة أنواع الفواتير',
      roles: ['super_admin', 'company_owner'],
    },
  },
  {
    path: 'invoices/sales',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-sales',
    meta: {
      title: 'فواتير البيع والشراء',
      invoiceType: 'sales',
      roles: ['super_admin', 'company_owner'],
    },
  },
  {
    path: 'invoices/quotation',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-quotation',
    meta: {
      title: 'عروض الأسعار',
      invoiceType: 'quotation',
      roles: ['super_admin', 'company_owner'],
    },
  },
  {
    path: 'invoices/purchase-order',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-purchase-order',
    meta: {
      title: 'طلبات الشراء',
      invoiceType: 'purchase_order',
      roles: ['super_admin', 'company_owner'],
    },
  },
  {
    path: 'invoices/sales-order',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-sales-order',
    meta: {
      title: 'طلبات البيع',
      invoiceType: 'sales_order',
      roles: ['super_admin', 'company_owner'],
    },
  },
  {
    path: 'invoices/discount',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-discount',
    meta: {
      title: 'فواتير الخصم',
      invoiceType: 'discount_invoice',
      roles: ['super_admin', 'company_owner'],
    },
  },
  {
    path: 'service-invoices',
    component: () => import('@/pages/service-invoices.vue'),
    name: 'service-invoices',
    meta: {
      title: 'فواتير الخدمة',
      description: 'قائمة فواتير الخدمة',
      roles: ['super_admin', 'company_owner'],
    },
  },
];
