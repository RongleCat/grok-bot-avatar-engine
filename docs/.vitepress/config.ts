import { defineConfig } from 'vitepress'

const enSidebar = [
  {
    text: 'Guide',
    items: [
      { text: 'Start', link: '/guide/start' },
      { text: 'Agent id', link: '/guide/identity' },
      { text: 'Shapes and color', link: '/guide/shapes' },
      { text: 'Motion', link: '/guide/motion' },
    ],
  },
  {
    text: 'API',
    items: [
      { text: 'Reference', link: '/api' },
    ],
  },
]

const zhSidebar = [
  {
    text: '指南',
    items: [
      { text: '开始', link: '/zh/guide/start' },
      { text: '用 agent id 算头像', link: '/zh/guide/identity' },
      { text: '形状和颜色', link: '/zh/guide/shapes' },
      { text: '动画', link: '/zh/guide/motion' },
    ],
  },
  {
    text: '接口',
    items: [
      { text: '参考', link: '/zh/api' },
    ],
  },
]

export default defineConfig({
  title: 'Grok Bot Avatar Engine',
  description: 'SVG avatar engine for Grok Bot characters. Agent id, outlines, motion, and the main-bot star.',
  base: '/grok-bot-avatar-engine/',
  cleanUrls: true,
  lang: 'en-US',
  lastUpdated: false,
  head: [
    ['link', { rel: 'icon', href: '/grok-bot-avatar-engine/favicon.png' }],
    ['meta', { name: 'theme-color', content: '#111111' }],
  ],
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'Grok Bot Avatar Engine',
      description: 'SVG avatar engine for Grok Bot characters.',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/start' },
          { text: 'API', link: '/api' },
          { text: 'Learn', link: 'https://bot.tiezhu.si/' },
          { text: '中文', link: '/zh/' },
        ],
        sidebar: enSidebar,
        outline: { level: [2, 3], label: 'On this page' },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/RongleCat/grok-bot-avatar-engine' },
          { icon: 'x', link: 'https://x.com/cgnot996' },
        ],
        footer: {
          message: 'Independent engine by 铁柱AGI (@cgnot996). Not an xAI or Cursor product.',
          copyright: 'MIT © 2026 RongleCat',
        },
        editLink: {
          pattern: 'https://github.com/RongleCat/grok-bot-avatar-engine/edit/main/docs/:path',
          text: 'Edit this page',
        },
      },
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      title: 'Grok Bot 头像引擎',
      description: 'Grok Bot 角色的 SVG 头像引擎。',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/start' },
          { text: '接口', link: '/zh/api' },
          { text: '学习站', link: 'https://bot.tiezhu.si/' },
          { text: 'English', link: '/' },
        ],
        sidebar: zhSidebar,
        outline: { level: [2, 3], label: '本页目录' },
        docFooter: { prev: '上一页', next: '下一页' },
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色',
        darkModeSwitchTitle: '切换到深色',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        socialLinks: [
          { icon: 'github', link: 'https://github.com/RongleCat/grok-bot-avatar-engine' },
          { icon: 'x', link: 'https://x.com/cgnot996' },
        ],
        footer: {
          message: '铁柱AGI（@cgnot996）的独立引擎。不是 xAI 或 Cursor 的产品。',
          copyright: 'MIT © 2026 RongleCat',
        },
        editLink: {
          pattern: 'https://github.com/RongleCat/grok-bot-avatar-engine/edit/main/docs/:path',
          text: '在 GitHub 上编辑此页',
        },
      },
    },
  },
})
