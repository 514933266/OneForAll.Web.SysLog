/* eslint-disable */
// 自动构建路由
var childRoutes = []
var files = require.context('../views', true, /.vue$/i)
files.keys().forEach(key => {
  if (key.match(/(components)\//i)) return
  const route = createRoute(key)
  if (route) childRoutes.push(route)
})

function createRoute (url) {
  let name = ''
  let path = ''
  const str = url.replace(/(\.\/|.vue)/g, '')
  const arr = str.split('/')
  arr.forEach((e, i) => {
    name += e.substring(0, 1).toUpperCase() + e.substring(1)
    path += e.replace(/[A-Z]/g, (c, i2) => {
      if (i2 === 0 || i2 === (e.length - 1)) {
        return c.toLowerCase()
      } else {
        return '-' + c.toLowerCase()
      }
    })

    if (i !== (arr.length - 1)) {
      path += '/'
    }
  })
  return {
    name: name,
    path: path,
    component: () => import('../views/' + str + '.vue')
  }
}

export default childRoutes
