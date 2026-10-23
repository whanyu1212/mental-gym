// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
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
    // Astro 7 defaults to Satteri; our remark/rehype plugins need Unified.
    // MDX inherits this processor, keeping tables, math and code tabs consistent.
    processor: unified({
      remarkPlugins: [remarkGfm, remarkMath, remarkCodeTabs],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
