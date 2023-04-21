<template>
  <div class="ofa-container column">
    <el-card shadow="never">
      <div class="ofa-work-box">
        <span>
        </span>
        <span>
          <el-date-picker v-model="searchOption.startTime" type="datetime" placeholder="开始日期" format="yyyy-MM-dd"
            value-format="yyyy-MM-dd" size="mini">
          </el-date-picker>
          <el-date-picker v-model="searchOption.endTime" type="datetime" placeholder="结束日期" format="yyyy-MM-dd"
            value-format="yyyy-MM-dd" size="mini">
          </el-date-picker>
          <el-input v-model="searchOption.userName" size="mini" placeholder="操作人">
          </el-input>
          <el-input v-model="searchOption.key" size="mini" placeholder="关键字"></el-input>
          <el-button type="primary" class="search-btn" size="mini" @click="search">
            <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
          </el-button>
        </span>
      </div>
    </el-card>
    <el-card shadow="never" class="table-card">
      <el-table border :data="list" v-loading="loading" @selection-change="selectionChange" size="mini"
        class="ofa-table">
        <el-table-column width="50">
          <template slot-scope="scope">{{ scope.$index + 1 + (pageIndex - 1) * pageSize }}</template>
        </el-table-column>
        <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>
        <el-table-column prop="MoudleName" label="模块名称"></el-table-column>
        <el-table-column prop="MoudleCode" label="模块代码"></el-table-column>
        <el-table-column prop="Url" label="请求地址"></el-table-column>
        <el-table-column prop="TimeSpan" label="耗时"></el-table-column>
        <el-table-column prop="Method" label="请求方法" width="80"></el-table-column>
        <el-table-column prop="IPAddress" label="Ip地址"></el-table-column>
        <el-table-column prop="CreatorName" label="操作人" width="140"></el-table-column>
        <el-table-column prop="CreateTime" label="操作时间" width="140"></el-table-column>
        <el-table-column label="操作" width="120" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="toFormPage(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
        @current-change="pageIndexChange">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import API from '../../../apis/sysLog-api'
import {
  API_LOG,
  API_LOG_FORM
} from '../../../router/sysLog-router'

// Api日志
export default {
  name: API_LOG.name,
  props: {
    project: { Type: Object }
  },
  data () {
    return {
      searchOption: {
        key: '', // 关键字
        startTime: '', // 开始日期
        endTime: '', // 结束日期
        userName: '' // 操作人
      },
      loading: false, // 加载中
      dialogVisiable: false, // 表单弹窗显示
      isAdd: false, // 表单是否添加模式
      entity: {}, // 选中的实体
      list: [], // 需求列表
      selectionList: [], // 选中的行
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10, // 页数
      gradesVariants: ['success', 'primary', 'warning', 'danger']// 优先级标记样式
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init(to.params))
  },
  computed: {
    tableHeight () {
      // -顶部150元素高度 + 底部分页操作50高度度
      return window.innerHeight - 270
    }
  },
  methods: {
    init () {
      if (this.loading) return
      this.get()
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.API_LOG.URL)
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
      this.$root.navigate({ ...API_LOG_FORM, params: params })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
/deep/ .ofa-work-box {

  input {
    width: 200px;
    margin-left: 10px;
  }

  .search-btn {
    margin-left: 10px;
  }
}
</style>
