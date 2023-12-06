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
          <el-button type="primary" size="mini" @click="showAddDrawer">
            <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增
          </el-button>
        </span>
      </el-header>
      <el-main class="ofa-container column">
        <el-table :data="list" row-key="Id" size="small" class="ofa-table">
          <el-table-column prop="ClientId" label="客户端Id"></el-table-column>
          <el-table-column prop="ClientSecret" label="客户端密码"></el-table-column>
          <el-table-column prop="ClientName" label="客户端名称"></el-table-column>
          <el-table-column prop="AppId" label="AppId"></el-table-column>
          <el-table-column prop="AppSecret" label="AppSecret"></el-table-column>
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
      <!-- 抽屉：表单 -->
      <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" class="ofa-drawer" size="500px" @close="$refs.form.resetFields()">
        <div slot="title">
          <span class="title">{{isAdd ? '新增' : '编辑'}}客户端</span><label class="title-tips">Permission</label>
        </div>
        <el-form status-icon :model="entity" :rules="validationRules" ref="form" class="form">
          <el-form-item label="名称" prop="ClientId">
            <el-input v-model.trim="entity.Name" placeholder="请输入权限名称"></el-input>
          </el-form-item>
          <el-form-item label="代码" prop="Code">
            <el-input v-model.trim="entity.Code" placeholder="请输入权限代码"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="Remark" class="remark-item">
            <el-input show-word-limit v-model="entity.Remark" type="textarea" maxlength="100" class="remark-textarea" placeholder="请输入权限备注">
            </el-input>
          </el-form-item>
        </el-form>
        <div class="footer">
          <el-button type="primary" @click="submit" size="small">
            <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
          </el-button>
          <el-button type="warning" @click="drawerVisiable = false" size="small">
            取消
          </el-button>
        </div>
      </el-drawer>
    </el-container>
  </template>
  
  <script>
  import API from '../../../apis/sys-api'
  import { WX_CLIENT } from '../../../router/sys-router'
  
  // 微信客户端管理
  export default {
    name: WX_CLIENT.name,
    data () {
      return {
        loading: false, // 加载中
        searchOption: {
          key: '', // 关键字
          menuId: '' // 所属菜单
        },
        total: 1,
        pageIndex: 1,
        pageSize: 10,
        list: [],
        // 抽屉
        drawerVisiable: false,
        isAdd: false, // 是否添加
        entity: {},
        validationRules: {
          Name: [{ required: true, message: '请先填写权限名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2~20之间', trigger: 'blur' }],
          Code: [{ required: true, message: '请先填写权限代码', trigger: 'blur' }, { min: 2, max: 50, message: '长度在2~50之间', trigger: 'blur' }],
          MenuId: [{ required: true, message: '请先选择所属菜单', trigger: 'blur' }]
        }
      }
    },
    computed: {
      permissions () {
        return this.$root.getPermissions(WX_CLIENT.name)
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
        const url = this.$root.getApi(API.KEY, API.WX_CLIENT.URL)
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
        this.$confirm('确认要删除选中权限？删除后不可恢复，请谨慎操作！', '温馨提示', {
          type: 'warning',
          cancelButtonText: '放弃操作'
        }).then(() => {
          const url = this.$root.getApi(API.KEY, API.WX_CLIENT.BATCH_DELETE)
          this.axios.patch(url, [entity.Id]).then(response => {
            if (response.Status) this.get()
          })
        })
      },
      // 抽屉
      // 打开抽屉
      showAddDrawer () {
        this.isAdd = true
        this.entity = {}
        this.drawerVisiable = true
      },
      edit (row) {
        this.isAdd = false
        this.entity = { ...row }
        this.drawerVisiable = true
      },
      submit () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (this.isAdd) {
              this.add()
            } else {
              this.update()
            }
          }
        })
      },
      add () {
        const url = this.$root.getApi(API.KEY, API.WX_CLIENT.URL)
        this.axios.post(url, this.entity)
          .then(response => {
            if (response.Status) {
              this.init()
              this.drawerVisiable = false
            }
          })
      },
      update () {
        const url = this.$root.getApi(API.KEY, API.WX_CLIENT.URL)
        this.axios.put(url, this.entity)
          .then(response => {
            if (response.Status) {
              this.init()
              this.drawerVisiable = false
            }
          })
      }
    },
    created () {
      this.init()
    },
    components: { MenuCascader }
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
  