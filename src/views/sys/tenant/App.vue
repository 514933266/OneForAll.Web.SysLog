<template>
  <el-container v-loading="loading">
    <el-header class="header">
      <span>
        <el-select v-model="searchOption.isEnabled" size="small" class="status-select" style="margin-right:4px">
          <el-option :value="-1" label="全部"></el-option>
          <el-option :value="1" label="启用"></el-option>
          <el-option :value="0" label="禁用"></el-option>
        </el-select>
        <el-input v-model="searchOption.key" size="small" placeholder="请根据选择的类型输入关键字" style="margin-right:4px">
        </el-input>
        <el-date-picker v-model="searchOption.startDate" type="date" class="date-picker" size="small" style="margin-right:4px" placeholder="请选择注册开始日期" format="yyyy年MM月dd日" value-format="yyyy-MM-dd">
        </el-date-picker>
        <el-date-picker v-model="searchOption.endDate" type="date" class="date-picker" size="small" placeholder="请选择注册结束日期" format="yyyy年MM月dd日" value-format="yyyy-MM-dd" style="margin-right:4px">
        </el-date-picker>
        <el-button type="primary" @click="search" size="mini">
          <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
        </el-button>
      </span>
      <span>
        <el-button type="primary" size="mini" @click="showAddDrawer">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增机构
        </el-button>
      </span>
    </el-header>
    <el-main class="ofa-container column">
      <el-table :data="list" size="small" class="ofa-table">
        <el-table-column prop="Name" label="企业名称" min-width="250px"></el-table-column>
        <el-table-column prop="Code" label="机构代码" min-width="200px"></el-table-column>
        <el-table-column prop="Manager" label="联系人"></el-table-column>
        <el-table-column prop="Phone" label="联系方式"></el-table-column>
        <el-table-column label="注册日期" width="150" align="center">
          <template slot-scope="scope">{{ new Date(scope.row.CreateTime).toString('yyyy年MM月dd日') }}</template>
        </el-table-column>
        <el-table-column label="状态" prop="IsEnabled" align="center" header-align="center" width="100">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.IsEnabled ? '启用中' : '已禁用'" placement="top">
              <el-button type="text">
                <font-awesome-icon fas icon="circle" :class="['updateIsEnabled-icon', scope.row.IsEnabled?'ofa-text-success': 'ofa-text-danger']">
                </font-awesome-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="update(scope.row)">修改</el-button>
            <el-button type="text" size="small" @click="toServicePage(scope.row)">管理</el-button>
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
        <span class="title">{{isAdd ? '新增' : '编辑'}}机构</span><label class="title-tips">Tenant</label>
      </div>

      <el-form status-icon ref="form" :rules="validationRules" :model="entityObj" class="ofa-form" label-width="100px">
        <el-form-item label="机构名称" prop="Name">
          <el-input v-model.trim="entityObj.Name" placeholder="企业的名称"></el-input>
        </el-form-item>
        <el-form-item label="信用代码" prop="Code">
          <el-input v-model.trim="entityObj.Code" placeholder="机构社会同一信用代码/自定义代码"></el-input>
        </el-form-item>
        <el-form-item label="管理人" prop="Manager">
          <el-input v-model.trim="entityObj.Manager" placeholder="企业管理者名称/负责人"></el-input>
        </el-form-item>
        <div class="row">
          <el-form-item label="是否启用">
            <el-switch v-model="entityObj.IsEnabled"></el-switch>
          </el-form-item>
          <el-form-item label="是否默认">
            <el-switch v-model="entityObj.IsDefault"></el-switch>
          </el-form-item>
        </div>
        <el-form-item label="联系电话" prop="Phone">
          <el-input v-model.trim="entityObj.Phone" placeholder="负责人联系方式"></el-input>
        </el-form-item>
        <el-form-item label="企业地址" prop="Address" class="address-item">
          <el-input class="address-textarea" placeholder="请输入具体地址，详细到门牌号" v-model="entityObj.Address"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="Description" class="description-item">
          <el-input type="textarea" class="description-textarea" placeholder="请输入企业简要介绍" v-model="entityObj.Description"></el-input>
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
import { TENANT, TENANT_SERVICE } from '../../../router/sys-router'

export default {
  name: TENANT.name,
  data () {
    return {
      loading: false, // 加载中
      searchVisiable: false, // 查询弹窗显示
      entity: {}, // 当前选中实体
      list: [],
      total: 1,
      pageIndex: 1,
      pageSize: 10,
      searchOption: {
        isEnabled: -1, // 合作状态
        key: '', // 关键字
        startDate: '', // 注册日期（开始）
        endDate: '' // 注册日期（结束）
      },
      // 抽屉
      isAdd: false,
      drawerVisiable: false,
      entityObj: {},
      validationRules: {
        Name: [{ required: true, message: '请先填写机构名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }],
        Manager: [{ max: 20, message: '不能超过20个字符', trigger: 'blur' }],
        Phone: [{ max: 20, message: '不能超过20个字符', trigger: 'blur' }],
        Code: [{ min: 0, max: 20, message: '长度不能超过50个字符', trigger: 'blur' }],
        Permissions: [{ required: true, message: '请先选择机构权限', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(TENANT.name)
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
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
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
    update (row) {
      this.isAdd = false
      this.entityObj = { IsEnabled: true, ...row }
      this.drawerVisiable = true
    },
    del (entity) {
      this.$confirm('确认要删除选中机构？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.TENANT.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.init()
        })
      })
    },
    toServicePage (params) {
      this.$root.navigate({ ...TENANT_SERVICE, params: params })
    },
    // 抽屉
    showAddDrawer () {
      this.isAdd = true
      this.entityObj = { IsEnabled: true }
      this.drawerVisiable = true
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) this.submitRemote()
      })
    },
    submitRemote () {
      if (this.isAdd) {
        this.addDrawer()
      } else {
        this.updateDrawer()
      }
    },
    addDrawer () {
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
      this.axios.post(url, this.entityObj)
        .then(response => {
          if (response.Status) {
            this.init()
            this.drawerVisiable = false
          }
        })
    },
    updateDrawer () {
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
      this.axios.put(url, this.entityObj)
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

.updateIsEnabled-icon {
  transition: all 0.3s ease;
}
</style>
