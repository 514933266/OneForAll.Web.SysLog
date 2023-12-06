<template>
  <el-container v-loading="loading">
    <el-header class="header">
      <span>
        <search-input enterable v-model="searchOption.key" @click="search" placeholder="输入用户名称或账号搜索" size="small">
        </search-input>
      </span>
      <span>
        <el-button type="primary" size="mini" @click="showAddDrawer">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增账号
        </el-button>
      </span>
    </el-header>
    <el-main class="ofa-container column">
      <el-table :data="list" size="small" class="ofa-table">
        <el-table-column prop="Name" label="名称">
          <template slot-scope="scope">
            <div class="user-icon">
              <el-avatar :src="(domain + scope.row.IconUrl)"></el-avatar>
              <label>{{scope.row.Name}}</label>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="UserName" label="账号"></el-table-column>
        <el-table-column prop="TenantName" label="所属企业"></el-table-column>
        <el-table-column label="最后登录时间">
          <template slot-scope="scope">{{scope.row.LastLoginTime ? scope.row.LastLoginTime : '未登录' }}</template>
        </el-table-column>
        <el-table-column label="最后登录Ip">
          <template slot-scope="scope">{{scope.row.LastLoginIp ? scope.row.LastLoginIp : '未登录' }}</template>
        </el-table-column>
        <el-table-column label="管理员账号">
          <template slot-scope="scope">
            <el-tag :type="scope.row.IsDefault === true ? 'danger' : 'info'" size="small">
              {{scope.row.IsDefault ? '管理员' : '普通账号'}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.Status === status[0].value ? 'danger' : 'success'" effect="dark" size="small">
              {{status.find(w => w.value == scope.row.Status).label}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="edit(scope.row)">修改</el-button>
            <el-button type="text" class="ofa-text-danger" size="small" @click="del(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange" @current-change="pageIndexChange">
      </el-pagination>
    </el-main>

    <!-- 抽屉：表单 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" class="ofa-drawer" size="500px" @close="$refs.form.resetFields()">
      <div slot="title">
        <span class="title">{{isAdd ? '新增' : '编辑'}}用户</span><label class="title-tips">User</label>
      </div>
      <el-form status-icon ref="form" :rules="validationRules" :model="entity" class="ofa-form" label-width="100px">
        <el-alert show-icon title="操作提示" type="warning" style="margin-bottom:20px;">
          <ul class="tips">
            <li>1. 默认用户不可删除，权限和机构同步</li>
            <li>2. 初始密码与账号相同</li>
          </ul>
        </el-alert>
        <el-form-item label="是否默认">
          <el-switch v-model="entity.IsDefault"></el-switch>
        </el-form-item>
        <el-form-item label="所属机构" prop="TenantId">
          <el-select filterable remote v-model="entity.TenantId" :remote-method="getTenants" placeholder="请输入机构名称进行查询">
            <el-option v-for="item in tenants" :key="item.Id" :label="item.Name" :value="item.Id">
              <span class="float-left">{{item.Name}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号" prop="UserName">
          <el-input v-model.trim="entity.UserName" placeholder="请输入用户账号">
          </el-input>
        </el-form-item>
        <el-form-item label="名称" prop="Name">
          <el-input v-model.trim="entity.Name" placeholder="请输入用户名称"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="Status">
          <el-select v-model="entity.Status" placeholder="请选择账号初始状态">
            <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
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
import BASE_API from '../../../apis/base-api'
import { USER } from '../../../router/sys-router'
import { NOT_ALLOWED, SUCCESS } from '../../../untils/error'

export default {
  name: USER.name,
  data () {
    return {
      loading: false, // 加载中
      serverUrl: API.BASE_SERVICE_DOMAIN,
      searchOption: {
        key: '' // 搜索条件（关键字）
      },
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10, // 页数
      list: [], // 用户列表
      status: [{ value: NOT_ALLOWED, label: '封禁' }, { value: SUCCESS, label: '正常' }], // 状态
      // 抽屉
      isAdd: false,
      drawerVisiable: false,
      entity: {},
      tenants: [],
      types: [{ value: SUCCESS, label: '正常' }, { value: NOT_ALLOWED, label: '封禁' }],
      validationRules: {
        TenantId: [{ required: true, message: '请先选择用户所属机构', trigger: 'change' }],
        Name: [{ required: true, message: '请先填写用户名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到8个字符', trigger: 'blur' }],
        UserName: [{ required: true, message: '请先填写用户登录账号', trigger: 'blur' }, { min: 6, max: 20, message: '长度在6到20个字符', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(USER.name)
    },
    domain () {
      return this.$root.getApiDomain(BASE_API.KEY)
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
      const url = this.$root.getApi(API.KEY, API.USER.URL)
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
    del (entity) {
      this.$confirm('确认要删除选中用户？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.USER.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    // 抽屉
    showAddDrawer () {
      this.isAdd = true
      this.entity = { IsDefault: true, Status: 1 }
      this.drawerVisiable = true
    },
    edit (row) {
      this.isAdd = false
      this.entity = { IsDefault: true, Status: 1, ...row }
      this.getTenant(this.entity.TenantId)
      this.drawerVisiable = true
    },
    getTenant (id) {
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
      this.axios.get(`${url}/${id}`)
        .then(response => {
          this.tenants = [response]
        })
    },
    getTenants (key) {
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
      this.axios.get(`${url}/1/10`, {
        params: {
          key: key
        }
      }).then(response => {
        this.tenants = response.Items
      })
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
      const url = this.$root.getApi(API.KEY, API.USER.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.init()
            this.drawerVisiable = false
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.USER.URL)
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
.user-icon {
  display: flex;
  align-items: center;

  label {
    margin-left: 10px;
  }
}
</style>
