const permissionsLocal = [
  // admins
  {
    name: 'إدار الادمن',
    permissions: [
      { value: 'super_admin', name: 'صلاحيات السيستم كاملة' },
      { value: 'company_owner', name: ' جميع صلاحيات الشركة التابع لها ' },
    ],
  },
  // cashbox
  {
    name: 'إدارة الخزن',
    permissions: [
      { value: 'cashbox', name: 'صفحة الخزن' },

      { value: 'cashbox_all', name: 'جميع الخزن' },
      { value: 'cashbox_all_own', name: 'الخزن التابعة له' },
      { value: 'cashbox_all_self', name: 'عرض الخزنة الخاصة به' },

      { value: 'cashbox_show', name: 'عرض تفاصيل أي خزنة' },
      { value: 'cashbox_show_own', name: 'عرض تفاصيل الخزن التابعة له' },
      { value: 'cashbox_show_self', name: 'عرض تفاصيل خزنة الخاصة به' },

      { value: 'cashbox_create', name: 'إنشاء خزنة' },

      { value: 'cashbox_update', name: 'تعديل أي خزنة' },
      { value: 'cashbox_update_own', name: 'تعديل الخزن التابعة له' },
      { value: 'cashbox_update_self', name: 'تعديل خزنة الخاصة به' },

      { value: 'cashbox_delete', name: 'حذف أي خزنة' },
      { value: 'cashbox_delete_own', name: 'حذف الخزن التابعة له' },
      { value: 'cashbox_delete_self', name: 'حذف خزنة الخاصة به' },
    ],
  },
  // users
  {
    name: 'إدارة المستخدمين',
    permissions: [
      { value: 'users', name: 'صفحة المستخدمين' },

      { value: 'users_all', name: 'جميع المستخدمين' },
      { value: 'users_all_own', name: 'المستخدمين التابعين له' },
      { value: 'users_all_self', name: 'عرض المستخدم الخاص به' },

      { value: 'users_show', name: 'عرض تفاصيل أي مستخدم' },
      { value: 'users_show_own', name: 'عرض تفاصيل المستخدمين التابعين له' },
      { value: 'users_show_self', name: 'عرض تفاصيل حسابه الشخصي' },

      { value: 'users_create', name: 'إنشاء مستخدم' },

      { value: 'users_update', name: 'تعديل أي مستخدم' },
      { value: 'users_update_own', name: 'تعديل المستخدمين التابعين له' },
      { value: 'users_update_self', name: 'تعديل حسابه الشخصي' },

      { value: 'users_delete', name: 'حذف أي مستخدم' },
      { value: 'users_delete_own', name: 'حذف المستخدمين التابعين له' },
      { value: 'users_delete_self', name: 'حذف حسابه الشخصي' },
    ],
  },
  // companys
  {
    name: 'إدارة الشركات',
    permissions: [
      { value: 'companys', name: 'صفحة الشركات' },
      { value: 'companys_all', name: 'جميع الشركات' },
      { value: 'companys_all_own', name: 'الشركات التابعين له' },
      { value: 'companys_all_self', name: 'عرض الشركات الخاص به' },

      { value: 'companys_show', name: 'عرض تفاصيل أي شركة' },
      { value: 'companys_show_own', name: 'عرض تفاصيل الشركات التابعين له' },
      { value: 'companys_show_self', name: 'عرض تفاصيل الشركة الخاصه به' },

      { value: 'companys_create', name: 'إنشاء شركة' },

      { value: 'companys_update', name: 'تعديل أي شركة' },
      { value: 'companys_update_own', name: 'تعديل الشركات التابعين له' },
      { value: 'companys_update_self', name: 'تعديل الشركه الخاصه به' },

      { value: 'companys_delete', name: 'حذف أي شركة' },
      { value: 'companys_delete_own', name: 'حذف الشركات التابعين له' },
      { value: 'companys_delete_self', name: 'حذف الشركه الخاصه به' },
    ],
  },

  // roles
  {
    name: 'إدارة الأدوار',
    permissions: [
      { value: 'roles', name: ' صفحة الأدوار' },
      { value: 'roles_all', name: ' جميع الأدوار' },
      { value: 'roles_all_self', name: 'عرض الأدوار الخاصة به ' },
      { value: 'roles_all_own', name: 'الأدوار التابعة له' },

      { value: 'roles_show', name: 'عرض تفاصيل أي دور' },
      { value: 'roles_show_own', name: ' تفاصيل الأدوار التابعة له' },
      { value: 'roles_show_self', name: ' تفاصيل الأدوار الخاصه به ' },

      { value: 'roles_create', name: 'إنشاء دور' },

      { value: 'roles_update', name: 'تعديل أي دور' },
      { value: 'roles_update_self', name: 'تعديل الأدوار الخاصه به' },
      { value: 'roles_update_own', name: 'تعديل الأدوار التابعة له' },

      { value: 'roles_delete', name: 'حذف أي دور' },
      { value: 'roles_delete_self', name: 'حذف الأدوار الخاصه به' },
      { value: 'roles_delete_own', name: 'حذف الأدوار التابعة له' },
    ],
  },
  // logs
  {
    name: 'إدارة السجلات',
    permissions: [
      { value: 'logs', name: 'صفحة السجلات' },

      { value: 'logs_all', name: 'عرض جميع السجلات' },
      { value: 'logs_all_own', name: 'عرض السجلات التابعة له' },
      { value: 'logs_all_self', name: 'عرض السجلات الخاصة به' },

      { value: 'logs_show', name: 'عرض تفاصيل أي سجل' },
      { value: 'logs_show_own', name: 'عرض تفاصيل السجلات التابعة له' },
      { value: 'logs_show_self', name: 'عرض تفاصيل السجلات الخاصة به' },

      { value: 'logs_create', name: 'إنشاء سجل' },
      { value: 'logs_update', name: 'تعديل سجل' },
      { value: 'logs_update_own', name: 'تعديل السجلات التابعة له' },
      { value: 'logs_update_self', name: 'تعديل السجلات الخاصة به' },

      { value: 'logs_delete', name: 'حذف السجلات' },
      { value: 'logs_delete_own', name: 'حذف السجلات التابعة له' },
      { value: 'logs_delete_self', name: 'حذف السجلات الخاصة به' },
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
      { value: 'transactions_all', name: 'عرض جميع عمليات التحويل' },
      { value: 'transactions_all_own', name: 'عرض عمليات التحويل التابعة له' },
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
