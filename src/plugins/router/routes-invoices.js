// مسارات الفواتير وكل ما يتعلق بها
export default [
  {
    path: 'invoices',
    component: () => import('@/pages/invoices/index.vue'),
    name: 'invoices',
    meta: {
      title: 'الفواتير',
      description: 'إدارة الفواتير',
      roles: ['invoices', 'invoices_all'],
    },
  },
  {
    path: 'invoices/invoice-create',
    component: () => import('@/pages/invoices/index.vue'),
    name: 'invoice-create',
    meta: {
      title: 'إنشاء فاتورة',
      description: 'إضافة فاتورة جديدة',
      roles: ['invoices_create'],
    },
  },
  {
    path: 'invoiceType',
    component: () => import('@/pages/invoiceType/index.vue'),
    name: 'invoiceType',
    meta: {
      title: 'أنواع الفواتير',
      description: 'إدارة أنواع الفواتير',
      roles: ['invoices'],
    },
  },
  {
    path: 'invoices/sales',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-sales',
    meta: {
      title: 'فواتير البيع والشراء',
      invoiceType: 'sales',
      roles: ['invoices'],
    },
  },
  {
    path: 'invoices/quotation',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-quotation',
    meta: {
      title: 'عروض الأسعار',
      invoiceType: 'quotation',
      roles: ['invoices'],
    },
  },
  {
    path: 'invoices/purchase-order',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-purchase-order',
    meta: {
      title: 'طلبات الشراء',
      invoiceType: 'purchase_order',
      roles: ['invoices'],
    },
  },
  {
    path: 'invoices/sales-order',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-sales-order',
    meta: {
      title: 'طلبات البيع',
      invoiceType: 'sales_order',
      roles: ['invoices'],
    },
  },
  {
    path: 'invoices/discount',
    component: () => import('@/pages/invoices.vue'),
    name: 'invoices-discount',
    meta: {
      title: 'فواتير الخصم',
      invoiceType: 'discount_invoice',
      roles: ['invoices'],
    },
  },
  {
    path: 'service-invoices',
    component: () => import('@/pages/service-invoices.vue'),
    name: 'service-invoices',
    meta: {
      title: 'فواتير الخدمة',
      description: 'قائمة فواتير الخدمة',
      roles: ['invoices'],
    },
  },
];
