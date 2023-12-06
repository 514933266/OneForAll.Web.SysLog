<template>
  <el-container v-loading="loading">
    <el-header class="header">
      <span>
        <search-input enterable v-model="searchOption.key" placeholder="输入菜单名称搜索" size="small"></search-input>
      </span>
      <span>
        <el-button @click="add" type="primary" size="small">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增菜单
        </el-button>
        <el-button @click="showSortArrow = !showSortArrow" class="ofa-button ofa-button-success" size="small">
          <font-awesome-icon fas icon="exchange-alt" rotation="90"></font-awesome-icon>
          &nbsp;{{showSortArrow ? '完成排序' : '调整排序'}}
        </el-button>
      </span>
    </el-header>
    <el-main class="ofa-container column">
      <el-table :data="list" :tree-props="{children: 'Children'}" ref="table" row-key="Id" size="small" class="ofa-table" row-class-name="name-box">
        <el-table-column label="名称" prop="Name">
          <template slot-scope="scope">
            <label>{{scope.row.Name}}</label>
            <transition name="el-fade-in-linear">
              <div v-show="showSortArrow" class="name-arrow-box">
                <font-awesome-icon :key="scope.row.Id + 'arrow-up'" @click="sort(scope.row, true)" fas icon="arrow-up" class="arrow-up">
                </font-awesome-icon>
                <font-awesome-icon :key="scope.row.Id + 'arrow-down'" @click="sort(scope.row, false)" fas icon="arrow-down" class="arrow-down">
                </font-awesome-icon>
              </div>
            </transition>
          </template>
        </el-table-column>
        <el-table-column label="图标" prop="Icon" width="50" align="center">
          <template slot-scope="scope">
            <font-awesome-icon v-if="scope.row.Icon" fas :icon="scope.row.Icon" class="arrow-up"></font-awesome-icon>
          </template>
        </el-table-column>
        <el-table-column label="代码" prop="Code"></el-table-column>
        <el-table-column label="类型" prop="Type" width="100" align="center" header-align="center">
          <template slot-scope="scope">
            <el-tag size="small">{{types[scope.row.Type].label}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="备注" prop="Remark"></el-table-column>
        <el-table-column label="状态" prop="IsEnabled" align="center" header-align="center" width="100">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.IsEnabled ? '启用中' : '已禁用'" placement="top">
              <el-button type="text" @click="updateIsEnabled(scope.row)">
                <font-awesome-icon fas icon="circle" :class="['updateIsEnabled-icon', scope.row.IsEnabled?'ofa-text-success': 'ofa-text-danger']">
                </font-awesome-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="update(scope.row)">修改</el-button>
            <el-button type="text" @click="showCopyDialog(scope.row)" size="small">克隆</el-button>
            <el-button type="text" class="ofa-text-danger" size="small" @click="del(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 弹窗 -->
      <el-dialog :visible.sync="dialogVisible" :title="'克隆菜单到【' + copyMenu.Name + '】'" width="80%" size="small">
        <el-alert show-icon title="操作提示" type="warning">
          <ul class="tips">
            <li>勾选的内容会添加成为菜单【{{copyMenu.Name}}】的子级菜单</li>
            <li>菜单的权限也会同步克隆</li>
          </ul>
        </el-alert>
        <el-form status-icon :model="entity" :rules="validationRules" ref="form" class="form" label-width="80px">
          <div class="row">
            <menu-table ref="menuTable" v-model="copyList" :initList="list"></menu-table>
          </div>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="copy">确 定</el-button>
        </span>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>
import API from '../../../apis/sys-api'
import MenuTable from '../_components/MenuTable'
import { MENU, MENU_FORM } from '../../../router/sys-router'
import { MENU_TYPE, MNUE_OPEN_TYPE } from '../../../assets/js/sys-const'

export default {
  name: MENU.name,
  data () {
    return {
      types: MENU_TYPE,
      openTypes: MNUE_OPEN_TYPE,
      loading: false, // 加载中
      sorting: false, // 排序中
      enabling: false, // 启用中
      showSortArrow: false, // 显示排序箭头
      copyMenu: {}, // 需要克隆操作的菜单
      list: [], // 树列表
      searchOption: {
        key: '' // 关键字
      },
      dialogVisible: false, // 克隆弹窗显示
      copyList: [] // 选中克隆行
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(MENU.name)
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
      const url = this.$root.getApi(API.KEY, API.MENU.URL)
      this.axios.get(url, {
        params: this.searchOption
      }).then(response => {
        this.list = response
        this.loading = false
      })
    },
    selectionChange (rows) {
      this.selectionList = rows
    },
    add () {
      this.toFormPage({ isAdd: true })
    },
    update (entity) {
      this.toFormPage(entity)
    },
    updateIsEnabled (entity) {
      if (this.enabling) {
        this.$message.error('正在修改设置中...')
        return
      }
      this.enabling = true
      const isEnable = !entity.IsEnabled
      let url = this.$root.getApi(API.KEY, API.MENU.ENABLED)
      url = url.replace(/{id}/, entity.Id)
      this.axios.patch(url, isEnable)
        .then(response => {
          if (response.Status) {
            this.enabling = false
            entity.IsEnabled = isEnable
          }
        })
    },
    sort (entity, isUp) {
      if (this.sorting) {
        this.$message.error('别着急，正在修改设置中...')
        return
      }
      this.sorting = true
      const sortNumber = isUp ? 1 : 0
      let url = this.$root.getApi(API.KEY, API.MENU.SORT)
      url = url.replace(/{id}/, entity.Id) + '?sortNumber=' + sortNumber
      this.axios.patch(url).then(response => {
        if (response.Status) {
          this.sorting = false
          this.get()
        }
      })
    },
    del (entity) {
      this.$confirm('确认要删除选中菜单？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.MENU.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    showCopyDialog (entity) {
      this.copyMenu = entity
      this.dialogVisible = true
    },
    copy () {
      const url = this.$root.getApi(API.KEY, API.MENU.CHILDREN).replace(/{id}/, this.copyMenu.Id)
      const ids = this.$refs.menuTable.getSelections().map(s => s.Id)
      if (ids.length < 1) {
        this.$message.error('请选择要克隆的子级菜单')
        return
      }
      this.axios.post(url, ids).then(response => {
        if (response.Status) {
          this.get()
          this.dialogVisible = false
        }
      })
    },
    toFormPage (params) {
      this.$root.navigate({ ...MENU_FORM, params: params })
    }
  },
  created () {
    this.init()
  },
  components: { MenuTable }
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

.form {
  margin-top: 10px;
}

.menu-table {
  margin-bottom: 25px;
  border-bottom: 0;
}

.updateIsEnabled-icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.name-arrow-box {
  float: right;
  font-size: 1rem;
  color: #c0c4cc;
  transition: all 0.5s ease-in;

  .arrow-up,
  .arrow-down {
    transition: all 0.3s ease;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      color: #409eff;
    }
  }

  .arrow-up {
    margin-right: 12px;
  }

  &::after {
    clear: both;
  }
}
</style>
