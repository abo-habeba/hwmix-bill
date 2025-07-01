// مسارات الفواتير وكل ما يتعلق بها
export default [
  {
    path: 'invoices',
    component: () => import('@/pages/invoices/index.vue'),
    name: 'invoices',
    meta: {
      title: 'الفواتير',
      description: 'إدارة الفواتير',
      roles: ['admin.super', 'admin.company', 'invoices.page', 'invoices.view_any', 'invoices.view_children', 'invoices.view_self', 'invoices.view'],
    },
  },
  {
    path: 'invoices/invoice-create',
    component: () => import('@/pages/invoices/index.vue'),
    name: 'invoice-create',
    meta: {
      title: 'إنشاء فاتورة',
      description: 'إضافة فاتورة جديدة',
      roles: ['admin.super', 'admin.company', 'invoices.create'],
    },
  },
  {
    path: 'invoiceType',
    component: () => import('@/pages/invoiceType/index.vue'),
    name: 'invoiceType',
    meta: {
      title: 'أنواع الفواتير',
      description: 'إدارة أنواع الفواتير',
      roles: ['admin.super', 'admin.company', 'invoice_types.page'],
    },
  },
  {
    path: 'invoices/sales',
    component: () => import('@/pages/invoices/index.vue'),
    name: 'invoices-sales',
    meta: {
      title: 'فواتير البيع والشراء',
      invoiceType: 'sales',
      roles: ['admin.super', 'admin.company', 'invoices.view'],
    },
  },
  {
    path: 'invoices/quotation',
    component: () => import('@/pages/invoices/index.vue'),
    name: 'invoices-quotation',
    meta: {
      title: 'عروض الأسعار',
      invoiceType: 'quotation',
      roles: ['admin.super', 'admin.company', 'invoices.view'],
    },
  },
  {
    path: 'invoices/purchase-order',
    component: () => import('@/pages/invoices/index.vue'),
    name: 'invoices-purchase-order',
    meta: {
      title: 'طلبات الشراء',
      invoiceType: 'purchase_order',
      roles: ['admin.super', 'admin.company', 'invoices.view'],
    },
  },
  {
    path: 'invoices/sales-order',
    component: () => import('@/pages/invoices/index.vue'),
    name: 'invoices-sales-order',
    meta: {
      title: 'طلبات البيع',
      invoiceType: 'sales_order',
      roles: ['admin.super', 'admin.company', 'invoices.view'],
    },
  },
  {
    path: 'invoices/discount',
    component: () => import('@/pages/invoices/index.vue'),
    name: 'invoices-discount',
    meta: {
      title: 'فواتير الخصم',
      invoiceType: 'discount_invoice',
      roles: ['admin.super', 'admin.company', 'invoices.view'],
    },
  },
  {
    path: 'service-invoices',
    component: () => import('@/pages/service-invoices.vue'),
    name: 'service-invoices',
    meta: {
      title: 'فواتير الخدمة',
      description: 'قائمة فواتير الخدمة',
      roles: ['admin.super', 'admin.company', 'invoices.view'],
    },
  },
  {
    path: '/invoices/print/:id',
    name: 'InvoicePrint',
    component: () => import('@/pages/invoices/print/[id].vue'),
    meta: {
      title: 'طباعة الفاتورة',
      description: 'معاينة وطباعة الفاتورة الحرارية أو ستيكر المنتج',
      layout: 'blank',
    },
  },
];
