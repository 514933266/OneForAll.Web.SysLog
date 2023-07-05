<template>
  <div class="ofa-container column">
    <el-card content-position="left" shadow="never" class="ofa-card">
      <div class="title ofa-text-title" size="small">异常日志明细</div>
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
          <el-form-item label="操作人：">
            <label>{{entity.CreatorName}}</label>
          </el-form-item>
          <el-form-item label="操作时间：">
            <label>{{entity.CreateTime}}</label>
          </el-form-item>
          <el-form-item label="异常摘要：">
            <label>{{entity.Name}}</label>
          </el-form-item>
          <el-form-item label="异常详情：">
            <label>{{entity.Content}}</label>
          </el-form-item>
        </el-card>
      </el-form>
    </div>
  </div>
</template>
  
  <script>
  import {
    EXCEPTION_LOG,
    EXCEPTION_LOG_FORM
  } from '../../../router/sysLog-router'
  
  export default {
    name: EXCEPTION_LOG_FORM.name,
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
        this.$root.navigate({ ...EXCEPTION_LOG, params: {} })
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
  