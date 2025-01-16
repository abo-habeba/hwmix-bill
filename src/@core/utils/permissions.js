const permissionsLocal = [
  // admins
  {
    name: 'إدار الادمن',
    permissions: [
      { value: 'super.admin', name: 'صلاحيات السيستم كاملة' },
      { value: 'company.owner', name: ' جميع صلاحيات الشركة التابع لها ' },
    ],
  },
  // users
  {
    name: 'إدارة المستخدمين',
    permissions: [
      { value: 'users', name: 'صفحة المستخدمين' },

      { value: 'users.all', name: 'جميع المستخدمين' },
      { value: 'users.all.own', name: 'المستخدمين التابعين له' },
      { value: 'users.all.self', name: 'عرض المستخدم الخاص به' },

      { value: 'users.show', name: 'عرض تفاصيل أي مستخدم' },
      { value: 'users.show.own', name: 'عرض تفاصيل المستخدمين التابعين له' },
      { value: 'users.show.self', name: 'عرض تفاصيل حسابه الشخصي' },

      { value: 'users.create', name: 'إنشاء مستخدم' },

      { value: 'users.update', name: 'تعديل أي مستخدم' },
      { value: 'users.update.own', name: 'تعديل المستخدمين التابعين له' },
      { value: 'users.update.self', name: 'تعديل حسابه الشخصي' },

      { value: 'users.delete', name: 'حذف أي مستخدم' },
      { value: 'users.delete.own', name: 'حذف المستخدمين التابعين له' },
      { value: 'users.delete.self', name: 'حذف حسابه الشخصي' },
    ],
  },
  // companys
  {
    name: 'إدارة الشركات',
    permissions: [
      { value: 'companys', name: 'صفحة الشركات' },
      { value: 'companys.all', name: 'جميع الشركات' },
      { value: 'companys.all.own', name: 'الشركات التابعين له' },
      { value: 'companys.all.self', name: 'عرض الشركات الخاص به' },

      { value: 'companys.show', name: 'عرض تفاصيل أي شركة' },
      { value: 'companys.show.own', name: 'عرض تفاصيل الشركات التابعين له' },
      { value: 'companys.show.self', name: 'عرض تفاصيل الشركة الخاصه به' },

      { value: 'companys.create', name: 'إنشاء شركة' },

      { value: 'companys.update', name: 'تعديل أي شركة' },
      { value: 'companys.update.own', name: 'تعديل الشركات التابعين له' },
      { value: 'companys.update.self', name: 'تعديل الشركه الخاصه به' },

      { value: 'companys.delete', name: 'حذف أي شركة' },
      { value: 'companys.delete.own', name: 'حذف الشركات التابعين له' },
      { value: 'companys.delete.self', name: 'حذف الشركه الخاصه به' },
    ],
  },

  // roles
  {
    name: 'إدارة الأدوار',
    permissions: [
      { value: 'roles', name: ' صفحة الأدوار' },
      { value: 'roles.all', name: ' جميع الأدوار' },
      { value: 'roles.all.self', name: 'عرض الأدوار الخاصة به ' },
      { value: 'roles.all.own', name: 'الأدوار التابعة له' },

      { value: 'roles.show', name: 'عرض تفاصيل أي دور' },
      { value: 'roles.show.own', name: ' تفاصيل الأدوار التابعة له' },
      { value: 'roles.show.self', name: ' تفاصيل الأدوار الخاصه به ' },

      { value: 'roles.create', name: 'إنشاء دور' },

      { value: 'roles.update', name: 'تعديل أي دور' },
      { value: 'roles.update.self', name: 'تعديل الأدوار الخاصه به' },
      { value: 'roles.update.own', name: 'تعديل الأدوار التابعة له' },

      { value: 'roles.delete', name: 'حذف أي دور' },
      { value: 'roles.delete.self', name: 'حذف الأدوار الخاصه به' },
      { value: 'roles.delete.own', name: 'حذف الأدوار التابعة له' },
    ],
  },
  // logs
  {
    name: 'إدارة السجلات',
    permissions: [
      { value: 'logs', name: 'صفحة السجلات' },

      { value: 'logs.all', name: 'عرض جميع السجلات' },
      { value: 'logs.all.own', name: 'عرض السجلات التابعة له' },
      { value: 'logs.all.self', name: 'عرض السجلات الخاصة به' },

      { value: 'logs.show', name: 'عرض تفاصيل أي سجل' },
      { value: 'logs.show.own', name: 'عرض تفاصيل السجلات التابعة له' },
      { value: 'logs.show.self', name: 'عرض تفاصيل السجلات الخاصة به' },

      { value: 'logs.create', name: 'إنشاء سجل' },
      { value: 'logs.update', name: 'تعديل سجل' },
      { value: 'logs.update.own', name: 'تعديل السجلات التابعة له' },
      { value: 'logs.update.self', name: 'تعديل السجلات الخاصة به' },

      { value: 'logs.delete', name: 'حذف السجلات' },
      { value: 'logs.delete.own', name: 'حذف السجلات التابعة له' },
      { value: 'logs.delete.self', name: 'حذف السجلات الخاصة به' },
    ],
  },
  // transaction
  {
    name: 'إدارة المعاملات',
    permissions: [
      { value: 'transaction', name: 'صفحة المعاملات' },
      { value: 'transfer', name: 'تحويل رصيد لأي مستخدم' },
      { value: 'deposit', name: 'إيداع رصيد لأي مستخدم' },
      { value: 'withdraw', name: 'سحب رصيد من أي مستخدم' },
      { value: 'transactions.all', name: 'عرض جميع عمليات التحويل' },
      { value: 'transactions.all.own', name: 'عرض عمليات التحويل التابعة له' },
    ],
  },
];

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
