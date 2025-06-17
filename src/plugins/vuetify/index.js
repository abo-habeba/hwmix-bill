import { createVuetify } from 'vuetify';
import { VBtn } from 'vuetify/components/VBtn';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import defaults from './defaults'; // هذا هو ملف الـ defaults الذي يحتوي على variant: 'outlined'
import { icons } from './icons';
import { themes } from './theme';

// Styles
import '@core/scss/template/libs/vuetify/index.scss';
import 'vuetify/styles';

export default function (app) {
  const vuetify = createVuetify({
    components,
    directives,
    aliases: {
      IconBtn: VBtn,
    },
    // ادمج إعدادات defaults المستوردة مع أي إعدادات global أخرى هنا
    defaults: {
      ...defaults, // قم بنشر (spread) محتويات كائن الـ defaults المستورد
      global: {
        ...defaults.global, // تأكد من دمج أي إعدادات global موجودة في ملف defaults أيضاً
        density: 'compact', // أضف أو تجاوز إعداد density هنا
      },
      // يمكنك إضافة أي إعدادات defaults أخرى مباشرة هنا إذا لم تكن موجودة في ملف defaults المستورد
    },
    icons,
    theme: {
      defaultTheme: 'light',
      themes,
    },
  });

  app.use(vuetify);
}
