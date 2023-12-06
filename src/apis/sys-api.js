var API = {
  KEY: 'OneForAll.Sys.Test',
  // 站点配置
  WEBSITE_SETTING_RESOURCE: {
    URL: '/api/SysWebsiteSettingResources/Current'
  },
  // 菜单
  MENU: {
    URL: '/api/SysMenus',
    ENABLED: '/api/SysMenus/{id}/IsEnabled',
    SORT: '/api/SysMenus/{id}/SortNumber',
    BATCH_DELETE: '/api/SysMenus/Batch/IsDeleted',
    PERMISSION: '/api/SysMenus/{id}/Permissions',
    PERM_BATCH_DELETE: '/api/SysMenus/{id}/Permissions/Batch/IsDeleted',
    CHILDREN: '/api/SysMenus/{id}/Children'
  },
  // 权限
  PERMISSION: {
    URL: '/api/SysPermissions',
    BATCH_DELETE: '/api/SysPermissions/Batch/IsDeleted'
  },
  // 地区
  AREA: {
    URL: '/api/SysAreas',
    BATCH_DELETE: '/api/SysAreas/Batch/IsDeleted',
    PROVINCE: '/api/SysAreas/Provinces',
    CHILDREN: '/api/SysAreas/{id}/Children'
  },
  // 租户
  TENANT: {
    URL: '/api/SysTenants',
    BATCH_DELETE: '/api/SysTenants/Batch/IsDeleted',
    PERMISSION: '/api/SysTenants/{id}/Permissions',
    MENU: '/api/SysTenants/{id}/Menus'
  },
  // 用户
  USER: {
    URL: '/api/SysUsers',
    BATCH_DELETE: '/api/SysUsers/Batch/IsDeleted'
  },
  // 网站设置
  WEBSITE_SETTING: {
    URL: '/api/SysWebsiteSettings',
    BATCH_DELETE: '/api/SysWebsiteSettings/Batch/IsDeleted',
    BACKGROUND: '/api/SysWebsiteSettings/{id}/BackgroundUrl',
    API: '/api/SysWebsiteSettings/{id}/Apis',
    API_BATCH_DELETE: '/api/SysWebsiteSettings/{id}/Apis/Batch/IsDeleted'
  },
  // 系统通知
  NOTIFICATION: {
    URL: '/api/SysNotifications',
    BATCH_DELETE: '/api/SysNotifications/Batch/IsDeleted',
    IMAGE: '/api/SysNotifications/{id}/Images',
    PUBLISH: '/api/SysNotifications/{id}/IsPublish'
  },
  // 联系我们
  CONTACT_US: {
    URL: '/api/SysContactUs',
    BATCH_DELETE: '/api/SysContactUs/Batch/IsDeleted'
  },
  // 微信客户端
  WX_CLIENT: {
    URL: '/api/SysWxClientSettings',
    BATCH_DELETE: '/api/SysWxClientSettings/Batch/IsDeleted'
  }
}

export default API
