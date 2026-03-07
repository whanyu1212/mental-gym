import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Mental Gym',
  description: 'Personal DSA knowledge base — LeetCode, Kattis, algorithms & patterns',
  base: '/mental-gym/',

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Algorithms', link: '/algorithms/arrays' },
      { text: 'Problems', link: '/problems/leetcode' },
      { text: 'DSA from Scratch', link: '/dsa/overview' },
      { text: 'Snippets', link: '/snippets/templates' },
    ],

    sidebar: {
      '/algorithms/': [
        {
          text: 'Algorithms & Patterns',
          items: [
            { text: 'Arrays & Hashing', link: '/algorithms/arrays' },
            { text: 'Two Pointers', link: '/algorithms/two-pointers' },
            { text: 'Sliding Window', link: '/algorithms/sliding-window' },
            { text: 'Stack', link: '/algorithms/stack' },
            { text: 'Linked List', link: '/algorithms/linked-list' },
            { text: 'Binary Search', link: '/algorithms/binary-search' },
            { text: 'Trees', link: '/algorithms/trees' },
            { text: 'Graphs', link: '/algorithms/graphs' },
            { text: 'Dynamic Programming', link: '/algorithms/dp' },
          ],
        },
      ],
      '/problems/': [
        {
          text: 'Problems',
          items: [
            { text: 'LeetCode', link: '/problems/leetcode' },
            { text: 'Kattis', link: '/problems/kattis' },
          ],
        },
      ],
      '/dsa/': [
        {
          text: 'DSA from Scratch',
          items: [
            { text: 'Overview', link: '/dsa/overview' },
            { text: 'Sorting', link: '/dsa/sorting' },
            { text: 'Arrays', link: '/dsa/arrays' },
            { text: 'Linked List', link: '/dsa/linked-list' },
            { text: 'Binary Heap', link: '/dsa/binary-heap' },
            { text: 'Hash Map', link: '/dsa/hash-map' },
            { text: 'Trees', link: '/dsa/trees' },
            { text: 'Graphs', link: '/dsa/graphs' },
          ],
        },
      ],
      '/snippets/': [
        {
          text: 'Code Snippets',
          items: [
            { text: 'Templates', link: '/snippets/templates' },
            { text: 'Complexity Cheatsheet', link: '/snippets/complexity' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hanyuwu/mental-gym' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Built with VitePress',
      copyright: 'Personal DSA practice repo',
    },
  },
})
