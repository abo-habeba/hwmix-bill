// مسارات المنتجات وكل ما يتعلق بها
export default [
  {
    path: 'products',
    component: () => import('@/pages/products/products.vue'),
    name: 'products',
    meta: {
      title: 'المنتجات',
      description: 'إدارة وتعديل المنتجات',
      roles: ['admin.super', 'company.owner', 'products.page'],
    },
  },
  {
    path: 'product-variants',
    component: () => import('@/pages/productVariants/productVariants.vue'),
    name: 'product-variants',
    meta: {
      title: 'نسخ المنتجات',
      description: 'إدارة نسخ المنتجات',
      roles: ['admin.super', 'company.owner', 'product_variants.page'],
    },
  },
  {
    path: 'product-variant-attributes',
    component: () => import('@/pages/productVariantAttributes/productVariantAttributes.vue'),
    name: 'product-variant-attributes',
    meta: {
      title: 'خصائص نسخ المنتجات',
      description: 'إدارة خصائص نسخ المنتجات',
      roles: ['admin.super', 'company.owner', 'product_variant_attributes.page'],
    },
  },
  {
    path: 'attributes',
    component: () => import('@/pages/attributes/attributes.vue'),
    name: 'attributes',
    meta: {
      title: 'الخصائص',
      description: 'إدارة وتعديل الخصائص',
      roles: ['admin.super', 'company.owner', 'attributes.page'],
    },
  },
  {
    path: 'attribute-values',
    component: () => import('@/pages/attributeValues/attributeValues.vue'),
    name: 'attribute-values',
    meta: {
      title: 'قيم الخصائص',
      description: 'إدارة وتعديل قيم الخصائص',
      roles: ['admin.super', 'company.owner', 'attribute_values.page'],
    },
  },
  {
    path: 'brands',
    component: () => import('@/pages/brands/brands.vue'),
    name: 'brands',
    meta: {
      title: 'العلامات التجارية',
      description: 'إدارة وتعديل العلامات التجارية',
      roles: ['admin.super', 'company.owner', 'brands.page'],
    },
  },
  {
    path: 'categories',
    component: () => import('@/pages/Categories/Categories.vue'),
    name: 'categories',
    meta: {
      title: 'الاقسام',
      description: 'إدارة وتعديل الاقسام',
      roles: ['admin.super', 'company.owner', 'categories.page'],
    },
  },
];
