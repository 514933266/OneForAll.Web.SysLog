<template>
  <el-container v-loading="loading">
    <el-header class="header">
      <span>
        <search-input enterable v-model="searchOption.key" @click="search" placeholder="输入域名或名称搜索" size="small">
        </search-input>
      </span>
      <span>
        <el-button type="primary" size="small" @click="add">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增站点
        </el-button>
      </span>
    </el-header>
    <el-main class="ofa-container column">
      <el-table :data="list" size="small" class="ofa-table">
        <el-table-column prop="Name" label="所属机构"></el-table-column>
        <el-table-column prop="Host" label="域名"></el-table-column>
        <el-table-column prop="OAuthClientId" label="客户端Id"></el-table-column>
        <el-table-column prop="OAuthClientName" label="客户端名称"></el-table-column>
        <el-table-column label="操作" width="120" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="update(scope.row)">修改</el-button>
            <el-button type="text" class="ofa-text-danger" size="small" @click="del(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
        @current-change="pageIndexChange">
      </el-pagination>
    </el-main>
  </el-container>
</template>

<script>
import API from '../../../apis/sys-api'
import { WEBSITE_SETTING, WEBSITE_SETTING_FORM } from '../../../router/sys-router'
import { NOT_ALLOWED, SUCCESS } from '../../../untils/error'

export default {
  name: WEBSITE_SETTING.name,
  data () {
    return {
      loading: false, // 加载中
      searchOption: {
        key: '' // 搜索条件（关键字）
      },
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10, // 页数
      list: [], // 用户列表
      status: [{ value: SUCCESS, label: '正常' }, { value: NOT_ALLOWED, label: '封禁' }] // 状态
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(WEBSITE_SETTING.name)
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
      const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: this.searchOption
      }).then(response => {
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
    add () {
      this.toFormPage({ isAdd: true })
    },
    update (entity) {
      this.toFormPage(entity)
    },
    del (entity) {
      this.$confirm('确认要删除选中站点配置？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    toFormPage (params) {
      this.$root.navigate({ ...WEBSITE_SETTING_FORM, params: params })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  background-color: #fff;
  justify-content: space-between;
  margin-bottom: 20px;
  border-radius: 10px;

  input {
    width: 200px;
  }

  /deep/ .el-cascader,
  /deep/ .el-input,
  /deep/ .el-date-editor {
    width: 200px;
    margin-right: 10px;
  }

  >span {
    display: flex;
  }

  /deep/ .el-select {
    width: 100px;
    margin-right: 10px;

    .el-input {
      width: 100px;
    }
  }
}
</style>
