import { defineUserConfig, defaultTheme } from 'vuepress'
import { navbar } from './constant-config/navbar'
import { sidebar } from './constant-config/slideBar'

export default defineUserConfig({
  base: '/front-body-of-knowledge/',
  lang: 'zh-CN',
  title: 'muxiao-123',
  description: 'front-body-of-knowledge',
  // head: [[ 'link', { rel: 'stylesheet', href: '' } ]],
  // 打包配置输出目录， default`${sourceDir}/.vuepress/dist`
  dest: '/dist',
  // 静态资源文件目录 default `${sourceDir/.vuepress/public}`
  theme: defaultTheme({
    navbar,
    sidebar,
  }),
  debug: true
})
