import { createVuetify } from 'vuetify';
import { VBtn } from 'vuetify/components/VBtn';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import defaults from './defaults';
import { icons } from './icons';
import { themes } from './theme';

// Styles
import '@core/scss/template/libs/vuetify/index.scss';
import 'vuetify/styles';

// ✅ استيراد اللغة العربية
import { ar } from 'vuetify/locale';

export default function (app) {
  const vuetify = createVuetify({
    components,
    directives,
    aliases: {
      IconBtn: VBtn,
    },
    defaults: {
      ...defaults,
      global: {
        ...defaults.global,
        density: 'compact',
      },
    },
    icons,
    theme: {
      defaultTheme: 'light',
      themes,
    },
    locale: {
      locale: 'ar',
      fallback: 'en',
      messages: {
        ar,
      },
    },
    rtl: true,
  });

  app.use(vuetify);
}
