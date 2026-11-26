import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://ezajkowska.pl',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
