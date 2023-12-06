<template>
  <el-table border :data="list" :tree-props="{children: 'Children'}" @select="selectRow"
    @selection-change="selectionChange" ref="table" row-key="Id" size="small" class="menu-table">
    <div slot="empty" style="height:400px">
      <nodata></nodata>
    </div>
    <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>
    <el-table-column label="名称" prop="Name"></el-table-column>
    <el-table-column label="备注" prop="Remark"></el-table-column>
    <el-table-column label="状态" prop="IsEnabled" align="center" header-align="center" width="100">
      <template slot-scope="scope">
        <label :class="scope.row.IsEnabled?'ofa-text-success': 'ofa-text-danger'">{{scope.row.IsEnabled ? '使用中' : '未使用'}}</label>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import API from '../../../apis/sys-api'

export default {
  name: 'SysMenuTable',
  props: {
    // 默认列表
    initList: { type: Array, default: null }
  },
  data () {
    return {
      loading: false, // 加载中
      list: [], // 树列表
      selectionList: [], // 选中行
      searchOptions: {
        isEnabled: true, // 合作状态
        key: '', // 关键字
        status: -1, // 状态
        startDate: '', // 注册日期（开始）
        endDate: '' // 注册日期（结束）
      }
    }
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(API.KEY)
    }
  },
  methods: {
    init () {
      if (this.value) this.selectionList = this.value
      if (!this.loading) {
        this.loading = true
        this.get()
      }
    },
    get () {
      if (this.initList) {
        this.list = this.initList
        this.loading = false
      } else {
        const url = this.$root.getApi(API.KEY, API.MENU.URL)
        this.axios.get(url).then(response => {
          this.list = response
          this.$nextTick(() => { this.loading = false })
        })
      }
    },
    selectRow (selection, row) {
      var index = this.selectionList.findIndex(w => w.Id === row.Id)
      var checked = index < 0
      if (checked) {
        this.selectionList.push(row)
      } else {
        this.selectionList.splice(index, 1)
      }
      this.initChecked(row.Children, checked)
    },
    initChecked (list, checked) {
      if (list) {
        list.forEach(row => {
          this.$refs.table.toggleRowSelection(row, checked)
          if (checked) {
            this.selectionList.push(row)
          } else {
            var index = this.selectionList.findIndex(w => w.Id === row.Id)
            if (index > -1) this.selectionList.splice(index, 1)
          }
          if (row.Children && row.Children.length > 0) {
            this.initChecked(row.Children, checked)
          }
        })
      }
    },
    getSelections () {
      return this.selectionList
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.menu-table {
  margin-bottom: 25px;
  border-bottom: 0;
}
</style>
