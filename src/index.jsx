import { render } from 'solid-js/web';
import App from './App';
import './index.css';
import { Router } from '@solidjs/router';

import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: import.meta.env.VITE_PUBLIC_SENTRY_DSN,
  environment: import.meta.env.VITE_PUBLIC_APP_ENV,
  integrations: [Sentry.browserTracingIntegration()],
  initialScope: {
    tags: {
      type: 'frontend',
      projectId: import.meta.env.VITE_PUBLIC_APP_ID,
    },
  },
});

// Add PWA support
window.progressierAppRuntimeSettings = {
  uid: import.meta.env.VITE_PUBLIC_APP_ID,
  icon512:
    'https://otebnzqfzytqyyjdfhzr.supabase.co/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=512&height=512',
  name: 'رحلتك معنا',
  shortName: 'رحلتك معنا',
};
let script = document.createElement('script');
script.setAttribute(
  'src',
  'https://progressier.app/z8yY3IKmfpDIw3mSncPh/script.js'
);
script.setAttribute('defer', 'true');
document.querySelector('head').appendChild(script);

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById('root')
);