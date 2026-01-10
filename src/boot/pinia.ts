import { defineBoot } from '#q-app/wrappers';
import { createPinia } from 'pinia';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
export default defineBoot(({ app }) => {
  // something to do
  const pinia = createPinia();
  app.use(pinia);
});
