import type { SidebarConfig, SidebarGroup, SidebarItem } from 'vuepress'
const jsBars  = () => {
  return {
    text: 'JS',
    link: '/js/',
    children: [
      {
        text: '目录',
        link: '/js/'
      },
      {
        text: '提问',
        link: '/js/question'
      },
    ]
  }
}
export const sidebar: SidebarConfig = [
  {
    text: '首页',
    link: '/',
    
  },
  jsBars(),
  {
    text: 'HTML-CSS',
    link: '/html-css/',
  },
  {
    text: '浏览器',
    link: '/browser/',
  },
  {
    text: '网络',
    link: '/network/',
  },
  {
    text: '算法',
    link: '/algorithm/',
  },
  {
    text: '前端工程化',
    link: '/front-end-engine/',
  },
  {
    text: '安全',
    link: '/safety/',
  },
  {
    text: '性能',
    link: '/performance/',
  },
]
