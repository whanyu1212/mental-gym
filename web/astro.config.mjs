// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCodeTabs from './src/lib/remark-code-tabs.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://whanyu1212.github.io',
  base: process.env.NODE_ENV === 'production' ? '/mental-gym' : '',
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
    remarkPlugins: [remarkMath, remarkCodeTabs],
    rehypePlugins: [rehypeKatex],
  },
});
