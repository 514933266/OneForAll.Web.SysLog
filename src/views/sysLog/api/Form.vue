<template>
  <div class="ofa-container column">
    <el-card content-position="left" shadow="never" class="ofa-card">
      <div class="title ofa-text-title" size="small">Api日志明细 Detail</div>
    </el-card>
    <div class="form-content">
      <el-form status-icon ref="form" :model="entity" class="tenant-form" label-width="120px" size="small">
        <el-card content-position="left" shadow="never" class="ofa-card">
          <div slot="header">
            <span class="card-header-label">基本信息</span>
          </div>
          <el-form-item label="模块名称：">
            <label>{{entity.MoudleName}}</label>
          </el-form-item>
          <el-form-item label="模块代码：">
            <label>{{entity.MoudleCode}}</label>
          </el-form-item>
          <el-form-item label="控制器：">
            <label>{{entity.Controller}}</label>
          </el-form-item>
          <el-form-item label="方法：">
            <label>{{entity.Action}}</label>
          </el-form-item>
          <el-form-item label="耗时：">
            <label>{{entity.TimeSpan}}</label>
          </el-form-item>
          <el-form-item label="Ip地址：">
            <label>{{entity.IPAddress}}</label>
          </el-form-item>
          <el-form-item label="浏览器信息：">
            <label>{{entity.UserAgent}}</label>
          </el-form-item>
          <el-form-item label="操作人：">
            <label>{{entity.CreatorName}}</label>
          </el-form-item>
          <el-form-item label="消耗时间：">
            <label>{{entity.TimeSpan}}</label>
          </el-form-item>
          <el-form-item label="操作时间：">
            <label>{{entity.CreateTime}}</label>
          </el-form-item>
        </el-card>
        <el-card content-position="left" shadow="never" class="ofa-card">
          <div slot="header">
            <span class="card-header-label">请求信息</span>
          </div>
          <el-form-item label="状态码：">
            <label>{{entity.StatusCode}}</label>
          </el-form-item>
          <el-form-item label="请求方法：">
            <label>{{entity.Method}}</label>
          </el-form-item>
          <el-form-item label="请求类型：">
            <label>{{entity.ContentType}}</label>
          </el-form-item>
          <el-form-item label="请求域名：">
            <label>{{entity.Host}}</label>
          </el-form-item>
          <el-form-item label="请求地址：">
            <label>{{entity.Url}}</label>
          </el-form-item>
          <el-form-item label="请求参数：">
            <label>{{entity.RequestBody}}</label>
          </el-form-item>
          <el-form-item label="响应：">
            <label>{{entity.ReponseBody}}</label>
          </el-form-item>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script>
import {
  API_LOG,
  API_LOG_FORM
} from '../../../router/sysLog-router'

export default {
  name: API_LOG_FORM.name,
  data () {
    return {
      entity: {} // 表单实体
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      this.entity = {
        ...this.$route.params
      }
    },
    goBack () {
      this.$root.navigate({ ...API_LOG, params: {} })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.ofa-container  {
  background-color: transparent;

  .title {
    font-size:1.5rem;
  }
}
</style>
