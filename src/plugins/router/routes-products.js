// مسارات المنتجات وكل ما يتعلق بها
export default [
  {
    path: 'products',
    component: () => import('@/pages/products/products.vue'),
    name: 'products',
    meta: {
      title: 'المنتجات',
      description: 'إدارة وتعديل المنتجات',
    },
  },
  {
    path: 'product-variants',
    component: () => import('@/pages/productVariants/productVariants.vue'),
    name: 'product-variants',
    meta: {
      title: 'نسخ المنتجات',
      description: 'إدارة نسخ المنتجات',
    },
  },
  {
    path: 'product-variant-attributes',
    component: () => import('@/pages/productVariantAttributes/productVariantAttributes.vue'),
    name: 'product-variant-attributes',
    meta: {
      title: 'خصائص نسخ المنتجات',
      description: 'إدارة خصائص نسخ المنتجات',
    },
  },
  {
    path: 'attributes',
    component: () => import('@/pages/attributes/attributes.vue'),
    name: 'attributes',
    meta: {
      title: 'الخصائص',
      description: 'إدارة وتعديل الخصائص',
    },
  },
  {
    path: 'attribute-values',
    component: () => import('@/pages/attributeValues/attributeValues.vue'),
    name: 'attribute-values',
    meta: {
      title: 'قيم الخصائص',
      description: 'إدارة وتعديل قيم الخصائص',
    },
  },
  {
    path: 'brands',
    component: () => import('@/pages/brands/brands.vue'),
    name: 'brands',
    meta: {
      title: 'قيم الخصائص',
      description: 'إدارة وتعديل قيم الخصائص',
    },
  },
  {
    path: 'categories',
    component: () => import('@/pages/Categories/Categories.vue'),
    name: 'categories',
    meta: {
      title: 'الاقسام',
      description: 'إدارة وتعديل الاقسام',
    },
  },
];
