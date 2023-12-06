<template>
  <el-container v-loading="loading">
    <el-header class="header">
      <span>
        <el-input v-model="searchOption.key" size="small" placeholder="请输入要查询的关键字"></el-input>
        <el-button type="primary" class="search-btn" size="mini" @click="search">
          <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
        </el-button>
      </span>
      <span>
      </span>
    </el-header>
    <el-main class="ofa-container column">
      <el-table :data="list" row-key="Id" size="small" class="ofa-table">
        <el-table-column prop="Name" label="名称"></el-table-column>
        <el-table-column prop="Code" label="代码"></el-table-column>
        <el-table-column prop="MenuName" label="所属菜单"></el-table-column>
        <el-table-column show-overflow-tooltips prop="Remark" label="备注" width="200"></el-table-column>
        <el-table-column label="操作" width="120" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="edit(scope.row)">修改</el-button>
            <el-button type="text" class="ofa-text-danger" size="small" @click="del(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange" @current-change="pageIndexChange" size="small">
      </el-pagination>
    </el-main>
  </el-container>
</template>

<script>
import API from '../../../apis/sys-api'
import { CONTACT_US } from '../../../router/sys-router'

export default {
  name: CONTACT_US.name,
  data () {
    return {
      loading: false, // 加载中
      searchOption: {
        key: '' // 关键字
      },
      total: 1,
      pageIndex: 1,
      pageSize: 10,
      list: []
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(CONTACT_US.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (this.loading) return
      this.loading = true
      this.searchOption.menuId = this.$store.state.guid
      this.get()
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.CONTACT_US.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: this.searchOption
      }).then(response => {
        if (response) {
          this.total = response.Total
          this.list = response.Items
          this.loading = false
        }
      })
    },
    pageSizeChange (value) {
      this.pageSize = value
      this.$nextTick(() => { this.get() })
    },
    pageIndexChange (value) {
      this.pageIndex = value
      this.$nextTick(() => { this.get() })
    },
    search () {
      this.pageIndex = 1
      this.$nextTick(() => { this.get() })
    },
    del (entity) {
      this.$confirm('确认要删除选中数据？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.CONTACT_US.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
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
</style>
