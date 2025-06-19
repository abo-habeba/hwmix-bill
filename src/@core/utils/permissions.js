import adminsPermissions from './permissions/admins.js';
import cashboxPermissions from './permissions/cashbox.js';
import usersPermissions from './permissions/users.js';
import companysPermissions from './permissions/companys.js';
import rolesPermissions from './permissions/roles.js';
import logsPermissions from './permissions/logs.js';
import transactionPermissions from './permissions/transaction.js';
import invoicesPermissions from './permissions/invoices.js';
import productsPermissions from './permissions/products.js';
import installmentsPermissions from './permissions/installments.js';
import warehousesPermissions from './permissions/warehouses.js';
import categoriesPermissions from './permissions/categories.js';
import brandsPermissions from './permissions/brands.js';
import attributesPermissions from './permissions/attributes.js';
import attributeValuesPermissions from './permissions/attributeValues.js';
import subscriptionsPermissions from './permissions/subscriptions.js';
import cashBoxTypePermissions from './permissions/cashBoxType.js';

const permissionsLocal = [
  adminsPermissions,
  cashboxPermissions,
  usersPermissions,
  companysPermissions,
  rolesPermissions,
  logsPermissions,
  transactionPermissions,
  invoicesPermissions,
  productsPermissions,
  installmentsPermissions,
  warehousesPermissions,
  categoriesPermissions,
  brandsPermissions,
  attributesPermissions,
  attributeValuesPermissions,
  subscriptionsPermissions,
  cashBoxTypePermissions,
];
// طباعة الأسماء المجمعة من الصلاحيات المحلية
console.log(
  'Loaded permissions:',
  JSON.stringify(
    permissionsLocal.reduce((acc, group) => {
      acc[group.name] = group.permissions.map(permission => permission.value);
      return acc;
    }, {}),
    null,
    2
  )
);
export function getLocalPermissions(remotePermissions) {
  if (!Array.isArray(remotePermissions)) {
    console.error('Invalid remotePermissions data:', remotePermissions);
    return [];
  }
  return permissionsLocal
    .map(group => ({
      ...group,
      permissions: group.permissions.filter(permission => remotePermissions.includes(permission.value)),
    }))
    .filter(group => group.permissions.length > 0);
}
