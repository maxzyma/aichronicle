import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
process.env.CONTENT_ROOT = fileURLToPath(new URL('../', import.meta.url));
const review = process.env.REVIEW_PREVIEW === '1';
export default defineConfig({
  site: process.env.SITE_URL || 'https://maxzyma.github.io',
  base: process.env.SITE_BASE ?? '/aichronicle',
  output: 'static',
  outDir: review ? './review-dist' : './dist',
  trailingSlash: 'always',
});
