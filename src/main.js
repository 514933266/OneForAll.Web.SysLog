/* eslint-disable */
import ChildRoutes from './router/router'
import './assets/css/sysLog-theme.scss'

// --- 微服务环境 ---
window.AppData.registerChildRoutes(ChildRoutes)
console.log('oneforall system log module loading completed')