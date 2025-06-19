// مسارات المنتجات وكل ما يتعلق بها
export default [
  {
    path: 'products',
    component: () => import('@/pages/products/products.vue'),
    name: 'products',
    meta: {
      title: 'المنتجات',
      description: 'إدارة وتعديل المنتجات',
      roles: ['products', 'products_all', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'product-variants',
    component: () => import('@/pages/productVariants/productVariants.vue'),
    name: 'product-variants',
    meta: {
      title: 'نسخ المنتجات',
      description: 'إدارة نسخ المنتجات',
      roles: ['products', 'products_all', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'product-variant-attributes',
    component: () => import('@/pages/productVariantAttributes/productVariantAttributes.vue'),
    name: 'product-variant-attributes',
    meta: {
      title: 'خصائص نسخ المنتجات',
      description: 'إدارة خصائص نسخ المنتجات',
      roles: ['products', 'products_all', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'attributes',
    component: () => import('@/pages/attributes/attributes.vue'),
    name: 'attributes',
    meta: {
      title: 'الخصائص',
      description: 'إدارة وتعديل الخصائص',
      roles: ['products', 'products_all', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'attribute-values',
    component: () => import('@/pages/attributeValues/attributeValues.vue'),
    name: 'attribute-values',
    meta: {
      title: 'قيم الخصائص',
      description: 'إدارة وتعديل قيم الخصائص',
      roles: ['products', 'products_all', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'brands',
    component: () => import('@/pages/brands/brands.vue'),
    name: 'brands',
    meta: {
      title: 'قيم الخصائص',
      description: 'إدارة وتعديل قيم الخصائص',
      roles: ['products', 'products_all', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'categories',
    component: () => import('@/pages/Categories/Categories.vue'),
    name: 'categories',
    meta: {
      title: 'الاقسام',
      description: 'إدارة وتعديل الاقسام',
      roles: ['products', 'products_all', 'super_admin', 'company_owner'],
    },
  },
];
