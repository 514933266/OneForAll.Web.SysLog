<template>
    <div class="ofa-container column">
      <el-card content-position="left" shadow="never" class="ofa-card">
        <div class="title ofa-text-title" size="small">登录日志明细</div>
      </el-card>
      <div class="form-content">
        <el-form status-icon ref="form" :model="entity" class="tenant-form" label-width="120px" size="small">
          <el-card content-position="left" shadow="never" class="ofa-card">
            <div slot="header">
              <span class="card-header-label">基本信息</span>
            </div>
            <el-form-item label="登录账号：">
              <label>{{entity.UserName}}</label>
            </el-form-item>
            <el-form-item label="来源：">
              <label>{{entity.Source}}</label>
            </el-form-item>
            <el-form-item label="登录方式：">
              <label>{{entity.LoginType}}</label>
            </el-form-item>
            <el-form-item label="Ip地址：">
              <label>{{entity.IPAddress}}</label>
            </el-form-item>
            <el-form-item label="账号昵称：">
              <label>{{entity.CreatorName}}</label>
            </el-form-item>
            <el-form-item label="登录时间：">
              <label>{{entity.CreateTime}}</label>
            </el-form-item>
          </el-card>
        </el-form>
      </div>
    </div>
  </template>
  
  <script>
  import {
    LOGIN_LOG,
    LOGIN_LOG_FORM
  } from '../../../router/sysLog-router'
  
  export default {
    name: LOGIN_LOG_FORM.name,
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
        this.$root.navigate({ ...LOGIN_LOG, params: {} })
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
  