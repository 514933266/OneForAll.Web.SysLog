<template>
    <div v-loading="loading" class="ofa-container column">
      <div class="header">
        <div class="title-box">
          <span class="title ofa-text-title">异常日志<span class="sub-title" style="margin-left: 10px;">共有<label
                class="ofa-text-primary"> {{total}} </label>条数据</span></span>
        </div>
        <div class="search-box">
          <el-date-picker v-model="searchOption.startTime" type="datetime" placeholder="开始日期" format="yyyy-MM-dd"
            value-format="yyyy-MM-dd" size="small">
          </el-date-picker>
          <el-date-picker v-model="searchOption.endTime" type="datetime" placeholder="结束日期" format="yyyy-MM-dd"
            value-format="yyyy-MM-dd" size="small">
          </el-date-picker>
          <el-input v-model="searchOption.key" size="small" placeholder="模块代码"></el-input>
          <el-button type="primary" class="search-btn" size="small" @click="search">
            <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
          </el-button>
        </div>
      </div>
      <el-table :data="list" size="small" class="ofa-table">
        <el-table-column prop="MoudleName" label="模块名称" min-width="200"></el-table-column>
        <el-table-column prop="MoudleCode" label="模块代码" min-width="200"></el-table-column>
        <el-table-column prop="Name" label="异常摘要" width="200"></el-table-column>
        <el-table-column prop="CreateTime" label="操作时间" width="160"></el-table-column>
        <el-table-column label="操作" width="120" align="center" header-align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="toFormPage(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
        @current-change="pageIndexChange">
      </el-pagination>
    </div>
  </template>
  
  <script>
  import API from '../../../apis/sysLog-api'
  import {
    GLOBAL_EXCEPTION_LOG,
    GLOBAL_EXCEPTION_LOG_FORM
  } from '../../../router/sysLog-router'
  
  // 全局异常日志
  export default {
    name: GLOBAL_EXCEPTION_LOG.name,
    data () {
      return {
        searchOption: {
          key: '', // 关键字
          startTime: '', // 开始日期
          endTime: '', // 结束日期
          userName: '' // 操作人
        },
        loading: false, // 加载中
        list: [], // 需求列表
        total: 1, // 总数据量
        pageIndex: 1, // 页码
        pageSize: 10 // 页数
      }
    },
    beforeRouteEnter (to, from, next) {
      next(vm => vm.init())
    },
    methods: {
      init () {
        if (this.loading) return
        this.loading = true
        this.get()
      },
      get () {
        const url = this.$root.getApi(API.KEY, API.GLOBAL_EXCEPTION_LOG.URL)
        this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
            params: this.searchOption
          })
          .then(response => {
            this.total = response.Total
            this.list = response.Items
            this.loading = false
          })
      },
      pageSizeChange (value) {
        this.pageSize = value
        this.$nextTick(() => this.get())
      },
      pageIndexChange (value) {
        this.pageIndex = value
        this.$nextTick(() => this.get())
      },
      search () {
        this.pageIndex = 1
        this.$nextTick(() => this.get())
      },
      toFormPage (params) {
        this.$root.navigate({ ...GLOBAL_EXCEPTION_LOG_FORM, params: params })
      }
    },
    created () {
      this.init()
    }
  }
  </script>
  
  <style lang="scss"scoped>
  .header {
    display: flex;
    flex-direction: column;
    height: auto !important;
    margin-bottom: 20px;
  
    .title-box {
      padding: 20px 0;
    }
  
    .title {
      font-size: 1.5rem;
      font-weight: 600;
    }
  
    .search-box {
  
      .el-input,
      .el-select,
      .el-date-editor {
        width: 200px;
        margin-right: 10px;
      }
    }
  
  }
  </style>
  