<template>
  <div class="menu-perms-box">
    <el-table border :data="list" @selection-change="selectionChange" size="small" class="perm-table">
      <el-table-column type="selection" :selectable="(row) => { return !row.isAdd }" width="55" align="center"
        header-align="center"></el-table-column>
      <el-table-column prop="Name" label="名称">
        <template slot-scope="scope">
          <label v-if="!scope.row.editable">{{scope.row.Name}}</label>
          <el-input v-else v-model="scope.row.Name" size="small" placeholder="必填，请输入权限名称">
          </el-input>
        </template>
      </el-table-column>
      <el-table-column prop="Code" label="代码">
        <template slot-scope="scope">
          <label v-if="!scope.row.editable">{{scope.row.Code}}</label>
          <el-input v-else v-model="scope.row.Code" size="small" placeholder="必填，请输入权限代码">
          </el-input>
        </template>
      </el-table-column>
      <el-table-column prop="SortCode" label="排序代码">
        <template slot-scope="scope">
          <label v-if="!scope.row.editable">{{scope.row.SortCode}}</label>
          <el-input v-else v-model="scope.row.SortCode" size="small" placeholder="请输入排序号">
          </el-input>
        </template>
      </el-table-column>
      <el-table-column prop="Remark" label="备注">
        <template slot-scope="scope">
          <label v-if="!scope.row.editable">{{scope.row.Remark}}</label>
          <el-input v-else v-model="scope.row.Remark" size="small" placeholder="请输入权限备注"></el-input>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="140">
        <template slot-scope="scope">
          <el-button v-show="scope.row.editable" @click="submit(scope.row)" type="text">
            <font-awesome-icon fas icon="check" class="ofa-text-success"></font-awesome-icon>&nbsp;
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗 -->
    <el-dialog :visible.sync="dialogVisible" title="克隆权限" width="80%" size="small">
      <menu-perm-table ref="permTable" v-model="selectionList"></menu-perm-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCopy">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import API from '../../../apis/sys-api'
import { MENU, MENU_PERMISSION } from '../../../router/sys-router'
import MenuPermTable from '../_components/MenuPermTable'

// 菜单权限
export default {
  name: MENU_PERMISSION.name,
  props: {
    value: { type: Object, default: null }
  },
  data () {
    return {
      list: [], // 权限列表
      selectionList: [], // 选中值
      isAdd: false, // 是否新增数据
      loading: false, // 加载中
      dialogVisible: false, // 表单显示
      entity: {}, // 表单实体
      activeTab: 'first',
      validationRules: {
        Name: [{ required: true, message: '请先填写权限名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2~20之间', trigger: 'blur' }],
        Code: [{ required: true, message: '请先填写权限代码', trigger: 'blur' }, { min: 2, max: 50, message: '长度在2~50之间', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(MENU.name)
    }
  },
  watch: {
    value (newValue) {
      this.init()
    }
  },
  methods: {
    init () {
      this.selectionList = []
      if (!this.loading && this.value) {
        this.get()
      }
    },
    get () {
      this.loading = true
      let url = this.$root.getApi(API.KEY, API.MENU.PERMISSION)
      url = url.replace(/{id}/, this.value.Id)
      this.axios.get(url).then(response => {
        this.list = response
        this.loading = false
      })
    },
    selectionChange (rows) {
      this.selectionList = rows
    },
    add () {
      if (this.list.findIndex(w => w.editable) > -1) return false
      this.list.push({ isAdd: true, editable: true, Name: '', Code: '', Remark: '' })
    },
    update () {
      if (!this.checkHadSelection()) return false
      if (this.list.findIndex(w => w.editable) > -1) return false
      if (!this.selectionList[0].isAdd) {
        const index = this.list.findIndex(w => w.Id === this.selectionList[0].Id)
        if (index > -1) {
          this.$set(this.list[index], 'editable', true)
        }
      }
    },
    del () {
      if (!this.checkHadSelection()) return false
      const ids = this.selectionList.map(s => s.Id)
      let url = this.$root.getApi(API.KEY, API.MENU.PERM_BATCH_DELETE)
      url = url.replace(/{id}/, this.value.Id)
      this.axios.patch(url, ids)
        .then(response => {
          if (response.Status) this.init()
        })
    },
    copy () {
      this.dialogVisible = true
      this.$nextTick(() => { this.$refs.permTable.init() })
    },
    submit (row) {
      if (row.Code.length < 1 || row.Name.length < 1) return false
      let url = this.$root.getApi(API.KEY, API.MENU.PERMISSION)
      url = url.replace(/{id}/, this.value.Id)
      if (row.isAdd) {
        this.axios.post(url, [row])
          .then(response => {
            if (response.Status) this.init()
          })
      } else {
        this.axios.put(url, row)
          .then(response => {
            if (response.Status) this.init()
          })
      }
    },
    submitCopy () {
      if (!this.checkHadPermSelection()) return false
      let url = this.$root.getApi(API.KEY, API.MENU.PERMISSION)
      url = url.replace(/{id}/, this.value.Id)
      this.axios.post(url, this.selectionList)
        .then(response => {
          if (response.Status) {
            this.init()
            this.dialogVisible = false
          }
        })
    },
    checkHadPermSelection () {
      if (this.selectionList.length < 1) {
        this.$message.error('请先选择要克隆的权限')
        return false
      }
      return true
    },
    checkHadSelection () {
      if (this.list.length < 1) {
        this.$message.error('请先选择要操作数据')
        return false
      }
      return true
    }
  },
  components: { MenuPermTable }
}
</script>
