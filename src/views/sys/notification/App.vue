<template>
  <el-container v-loading="loading">
    <el-header class="header">
      <span>
        <search-input enterable v-model="searchOption.key" @click="get" placeholder="输入标题搜索" size="small">
        </search-input>
      </span>
      <span>
        <el-button type="primary" size="mini" @click="add">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增
        </el-button>
      </span>
    </el-header>
    <el-main class="ofa-container column">
      <!-- 主体内容 -->
      <el-table :data="list" size="small" class="ofa-table">
        <el-table-column prop="Title" label="标题"></el-table-column>
        <el-table-column prop="IsPublish" label="状态" width="80">
          <template slot-scope="scope">
            {{scope.row.IsPublish ?'已发布': '草稿'}}
          </template>
        </el-table-column>
        <el-table-column prop="Type" label="目标" width="80">
          <template slot-scope="scope">
            {{types[scope.row.Type].label}}
          </template>
        </el-table-column>
        <el-table-column prop="CreateTime" label="创建时间" width="180">
          <template slot-scope="scope">
            {{ new Date(scope.row.CreateTime).toString('yyyy年MM月dd日 hh:mm') }}
          </template>
        </el-table-column>
        <el-table-column prop="UpdateTime" label="最后更新时间" width="180">
          <template slot-scope="scope">
            {{ new Date(scope.row.UpdateTime).toString('yyyy年MM月dd日 hh:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="update(scope.row)">修改</el-button>
            <el-button v-if="!scope.row.IsPublish" type="text" size="small" @click="publish(scope.row)">发布</el-button>
            <el-button type="text" class="ofa-text-danger" size="small" @click="del(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange" @current-change="pageIndexChange">
      </el-pagination>
    </el-main>
  </el-container>
</template>

<script>
import API from '../../../apis/sys-api'
import { NOTIFICATION, NOTIFICATION_FORM } from '../../../router/sys-router'
import { NOTIFICATION_TYPE } from '../../../assets/js/sys-const'

// 系统通知
export default {
  name: NOTIFICATION.name,
  data () {
    return {
      types: NOTIFICATION_TYPE, // 消息类型
      loading: false, // 加载中
      key: '',
      searchOption: {
        key: '', // 搜索条件（关键字）
        dates: []
      },
      total: 1,
      pageIndex: 1,
      pageSize: 10,
      list: []
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(NOTIFICATION.name)
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
      const url = this.$root.getApi(API.KEY, API.NOTIFICATION.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: {
          key: this.key
        }
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
      this.$confirm('确认要删除该文章？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.NOTIFICATION.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    publish (entity) {
      const url = this.$root.getApi(API.KEY, API.NOTIFICATION.PUBLISH.replace(/{id}/, entity.Id))
      this.axios.patch(url).then(response => {
        if (response.Status) this.get()
      })
    },
    changeType (node) {
      this.typeId = node.value
      this.get()
    },
    toFormPage (params) {
      this.$root.navigate({ ...NOTIFICATION_FORM, params: params })
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

  > span {
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

/deep/.el-table {
  margin-bottom: 25px;

  .article-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 90px;

    .article-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    .title {
      font-size: 18px;
      cursor: pointer;
    }

    .info {
      span {
        padding: 0 10px;
      }
      label {
        color: #99a9bf;
      }
    }
  }

  .el-image {
    margin: 0 0.75rem;
    width: 160px;
    height: 90px;
    background: #f5f7fa;

    .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  }
}

table tr td:last-child svg {
  cursor: pointer;
  margin-right: 0.875rem;
}
</style>
