export const navbar = [
  {
    text: '首页',
    link: '/',
    activeMatch: '/'
  },
  {
    text: 'Group',
    children: [
      {
        text: 'sub-group',
        link: '/sub-group',
        activeMatch: '^/sub-group'
      },
      {
        text: 'sub-group1',
        link: '/sub-grroup1',
        activeMatch: '^/sub-group1'
      }
    ]
  },
  {
    text: 'Group1',
    children: [
      {
        text: 'sub-Group1',
        link: '/sub-Group1',
        activeMatch: '^/sub-Group1'
      }
    ]
  }
  // 字符串-页面路径文件
  // '/bar/README.md'
]
