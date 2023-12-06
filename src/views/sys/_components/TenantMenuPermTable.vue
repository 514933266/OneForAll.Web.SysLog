<template>
  <el-table border v-loading="loading" :data="list" :tree-props="{children: 'Children' }" @select="selectRow"
    @select-all="selectAllRow" ref="table" row-key="Id" size="small">
    <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>
    <el-table-column label="名称" prop="Name" width="300">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" :content="scope.row.Remark?scope.row.Remark:'无'" placement="top">
          <label>{{scope.row.Name}}</label>
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column label="功能权限" prop="Permissions">
      <template slot-scope="scope">
        <el-checkbox v-for="item in scope.row.Permissions" :key="item.Id" v-model="item.checked" size="small"
          @change="checkSinglePermission(scope.row, item)" class="perm-checkbox">
          {{ codeMode ? item.Code : item.Name }}
        </el-checkbox>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import API from '../../../apis/sys-api'

// 菜单权限
export default {
  name: 'SysTenantMenuPermTable',
  props: {
    value: {
      type: Array
    },
    // 显示代码
    codeMode: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false, // 加载中
      list: [], // 树列表
      selectionList: [], // 选中的行
      permSelectionList: [], // 选择的权限
      searchOption: {
        hasPerms: true // 包含权限
      }
    }
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(API.KEY)
    }
  },
  watch: {
    value (newValue) {
      this.permSelectionList = newValue
      this.initCheckedPermission(this.list)
    },
    permSelectionList (newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    init () {
      if (this.loading) return
      this.get()
    },
    initCheckedPermission (list) {
      list.forEach(row => {
        let rowChecked = false
        row.Permissions.forEach(item => {
          let checked = false
          const index = this.permSelectionList.findIndex(w => w.Id === item.Id)
          if (index > -1) {
            checked = true
            rowChecked = true
          }
          Object.assign(item, { checked: checked })
        })
        if (rowChecked) {
          this.addSelectionList(row, true)
          this.$refs.table.toggleRowSelection(row, true)
        }
        if (row.Children)
          this.initCheckedPermission(row.Children)
      })
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.TENANT.MENU)
      this.axios.get(url).then(response => {
        this.list = response
        this.loading = false
        this.$nextTick(() => this.initCheckedPermission(this.list))
      })
    },
    selectAllRow () {
      if (this.selectionList.length > 0) {
        this.selectionList = []
        this.permSelectionList = []
        this.$refs.table.clearSelection()
        this.initCheckedPermission(this.list)
      } else {
        this.list.forEach(e => {
          this.selectRow(this.list, e, true)
        })
      }
    },
    selectRow (list, row, checked) {
      if (checked || this.selectionList.findIndex(w => w.Id === row.Id) < 0) {
        this.setselectRow(row, true)
      } else {
        this.setselectRow(row, false)
      }
    },
    setselectRow (row, checked) {
      // 记录选中的行，用于selectionChange过滤执行次数
      this.addSelectionList(row, checked)
      this.$refs.table.toggleRowSelection(row, checked)
      row.Children.forEach(e => {
        this.selectRow(this.selectionList, e, checked)
      })
      row.Permissions.forEach(item => {
        item.checked = checked
        this.addPermissionList(item, checked)
      })
    },
    addSelectionList (row, checked) {
      const index = this.selectionList.findIndex(w => w.Id === row.Id)
      if (index < 0 && checked) {
        this.selectionList.push(row)
      } else if (index > -1 && !checked) {
        this.selectionList.splice(index, 1)
      }
    },
    addPermissionList (item, checked) {
      const index = this.permSelectionList.findIndex(w => w.Id == item.Id)
      if (index < 0 && checked) {
        this.permSelectionList.push(item)
      } else if (index > -1 && !checked) {
        this.permSelectionList.splice(index, 1)
      }
    },
    checkSinglePermission (row, item) {
      this.toggleRowSelection(row)
      this.addSelectionList(row, item.checked)
      this.addPermissionList(item, item.checked)
      this.$set(row, 'Permissions', Object.assign([], row.Permissions))
    },
    toggleRowSelection (row) {
      const checked = this.getRowSelectionCheckable(row)
      this.$refs.table.toggleRowSelection(row, checked)
    },
    getRowSelectionCheckable (row) {
      let checked = false
      checked = (row.Permissions.findIndex(w => w.checked) > -1)
      if (!checked) {
        for (let index = 0; index < row.Children.length; index++) {
          const element = row.Children[index];
          checked = this.selectionList.findIndex(w => w.Id === element.Id) > -1 || this.toggleRowSelection(element)
          if (checked) break;
        }
      }
      return checked
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.perm-checkbox {
  width: 120px;
  overflow: hidden;
}
</style>