<template>
  <div class="ofa-form no-padding">
    <el-card content-position="left" class="form-header" shadow="never">
      <div class="form-header-text">网站设置 Website</div>
      <div class="button-box">
        <span v-if="disabled">
          <el-button @click="disabled = false" type="primary" size="mini">
            <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;编辑
          </el-button>
        </span>
        <span v-else>
          <el-button @click="submit" type="primary" size="mini">
            <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
          </el-button>
          <el-button v-show="!isAdd" @click="disabled = true" type="warning" size="mini">
            <font-awesome-icon fas icon="reply"></font-awesome-icon>&nbsp;取消
          </el-button>
        </span>
      </div>
    </el-card>
    <div class="form-content">
      <el-card content-position="left" shadow="never">
        <div slot="header">
          <span class="card-header-label">基本信息</span>
        </div>
        <div class="row">
          <div class="left-column">
            <el-form status-icon ref="form" :disabled="disabled" :rules="validationRules" :model="entity" class="base-form" label-width="120px" size="small">
              <div class="row">
                <el-form-item label="所属机构" prop="Name" class="row-item">
                  <el-select filterable remote :remote-method="getTenants" v-model.trim="entity.Name" placeholder="请搜索后选择">
                    <el-option v-for="item in tenantList" :key="item.Id" :label="item.Name" :value="item.Name">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="row">
                <el-form-item label="域名" prop="Host" class="row-item">
                  <el-input v-model.trim="entity.Host" placeholder="请输入应用的域名"></el-input>
                </el-form-item>
              </div>
              <div class="row">
                <el-form-item label="客户端Id" prop="OAuthClientId" class="row-item">
                  <el-input v-model.trim="entity.OAuthClientId" placeholder="请输入客户端Id">
                  </el-input>
                </el-form-item>
              </div>
              <div class="row">
                <el-form-item label="密码" prop="OAuthClientSecret" class="row-item">
                  <el-input type="password" v-model.trim="entity.OAuthClientSecret" placeholder="请输入客户端密码"></el-input>
                </el-form-item>
              </div>
              <div class="row">
                <el-form-item label="客户端名称" prop="OAuthClientName" class="row-item">
                  <el-input v-model.trim="entity.OAuthClientName" placeholder="请输入客户端名称"></el-input>
                </el-form-item>
              </div>
              <div class="row">
                <el-form-item label="授权地址" prop="OAuthUrl" class="row-item">
                  <el-input v-model.trim="entity.OAuthUrl" placeholder="请输入授权地址"></el-input>
                </el-form-item>
              </div>
            </el-form>
          </div>
          <div class="right-column">
            <crop-uploader v-model="entity.LoginBackgroundUrl" :maxSize="maxPicSize" @upload="uploadImage">
            </crop-uploader>
            <el-alert show-icon :closable="false" title="背景图仅能上传小于1MB的jpg、png格式图片" type="warning" style="margin-top:10px;"></el-alert>
          </div>
        </div>
      </el-card>
    </div>
    <div class="form-content" v-show="!isAdd">
      <el-card content-position="left" shadow="never">
        <div slot="header">
          <span class="card-header-label">API域名</span>
        </div>
        <div style="margin-bottom:10px;">
          <el-button class="ofa-button" size="small" @click="showApiDialog(true)">
            <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增
          </el-button>
          <el-button class="ofa-button" size="small" @click="showApiDialog(false)">
            <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;修改
          </el-button>
          <el-button class="ofa-button ofa-button-danger" size="small" @click="delApi">
            <font-awesome-icon fas icon="trash"></font-awesome-icon>&nbsp;删除
          </el-button>
        </div>
        <el-table border :data="apiList" @selection-change="apiSelectionChange" size="small" class="api-table">
          <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>
          <el-table-column prop="Name" label="名称">
          </el-table-column>
          <el-table-column prop="Code" label="模块代码">
          </el-table-column>
          <el-table-column prop="Host" label="请求域名">
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <!-- 弹窗 -->
    <el-drawer :visible.sync="apiSettingDialogVisible" :modal="false" :show-close="false" direction="rtl" class="ofa-drawer" size="400px" @close="$refs.apiForm.resetFields()">
      <div slot="title">
        <span class="title">{{isApiAdd ? '新增' : '编辑'}}API域名</span><label class="title-tips">Api</label>
      </div>
      <el-form status-icon ref="apiForm" :rules="apiValidationRules" :model="apiEntity" label-width="120px" class="ofa-form">
        <el-alert show-icon title="操作提示" type="warning" style="margin-bottom: 20px;">
          <ul class="tips">
            <li>本功能仅限开发人员使用，可对租户域名进行授权</li>
            <li>配置后对应的域名将会请求配置的Api地址</li>
            <li>菜单的代码与前端的API.KEY需要一致</li>
          </ul>
        </el-alert>
        <el-form-item label="名称" prop="Name">
          <el-select filterable remote :value="apiEntity.Name" :remote-method="getMenus" @change="selectMenu" size="small" placeholder="请输入菜单名称后选择">
            <el-option v-for="item in menuList" :key="item.Id" :label="item.Name" :value="item.Id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="代码" prop="Code">
          <el-input v-model="apiEntity.Code" size="small" placeholder="请输入菜单代码">
          </el-input>
        </el-form-item>
        <el-form-item label="域名" prop="Host">
          <el-input v-model="apiEntity.Host" size="small" placeholder="请输入Api域名"></el-input>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button type="primary" @click="submitApi" size="small">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
        </el-button>
        <el-button type="warning" @click="apiSettingDialogVisible = false" size="small">
          取消
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import API from '../../../apis/sys-api'
import { WEBSITE_SETTING, WEBSITE_SETTING_FORM } from '../../../router/sys-router'

export default {
  name: WEBSITE_SETTING_FORM.name,
  data () {
    return {
      loading: false, // 加载中
      isAdd: false, // 是否添加
      disabled: true, // 允许编辑
      isApiAdd: false, // 是否Api添加
      apiSettingDialogVisible: false, // 弹窗显示
      entity: {},
      apiEntity: {}, // api实体
      tenantList: [], // 机构列表
      menuList: [], // 菜单列表
      apiList: [], // api列表
      apiSelectionList: [], // 选择的api列表
      maxPicSize: 1 * 1024 * 1024 * 1024,
      validationRules: {
        Name: [{ required: true, message: '请先填写网站名称', trigger: 'blur' }, { min: 2, max: 100, message: '长度在2到20个字符', trigger: 'blur' }],
        Host: [{ required: true, message: '请先填写网站域名', trigger: 'blur' }, { min: 2, max: 200, message: '长度在2到200个字符', trigger: 'blur' }],
        OAuthClientId: [{ required: true, message: '请先填写客户端Id', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }],
        OAuthClientSecret: [{ required: true, message: '请先填写客户端密码', trigger: 'blur' }, { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }],
        OAuthClientName: [{ required: true, message: '请先填写客户端名称', trigger: 'blur' }, { min: 2, max: 100, message: '长度在2到100个字符', trigger: 'blur' }],
        OAuthUrl: [{ required: true, message: '请先填写授权Url', trigger: 'blur' }, { min: 2, max: 1000, message: '长度在2到1000个字符', trigger: 'blur' }]
      },
      apiValidationRules: {
        Name: [{ required: true, message: '请先填写Api设置名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }],
        Host: [{ required: true, message: '请先填写Api域名', trigger: 'blur' }, { min: 2, max: 200, message: '长度在2到200个字符', trigger: 'blur' }],
        Code: [{ required: true, message: '请先填写Api代码', trigger: 'blur' }, { min: 2, max: 30, message: '长度在2到30个字符', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(WEBSITE_SETTING.name)
    },
    maxSize () {
      return 10 * 1024 * 1024 * 1024
    },
    domain () {
      return this.$root.getApiDomain(API.KEY)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.entity = {
          OAuthUrl: 'https://oauth.api.fengwoyun.net/connect/token',
          ...this.$route.params,
          LoginBackgroundUrl: this.domain + this.$route.params.LoginBackgroundUrl
        }
        this.isAdd = this.entity.isAdd
        if (!this.isAdd) {
          this.disabled = true
          this.getApi()
        } else {
          this.disabled = false
        }
        this.loading = false
      }
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.URL)
      this.axios.get(`${url}/${this.entity.Id}`)
        .then(response => {
          this.isAdd = false
          this.entity = { ...response, LoginBackgroundUrl: this.domain + response.LoginBackgroundUrl }
        })
    },
    getTenants (key) {
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
      this.axios.get(`${url}/1/10`, {
        params: { key: key }
      }).then(response => {
        this.tenantList = response.Items
        this.$nextTick(() => { this.loading = false })
      })
    },
    getMenus (key) {
      const url = this.$root.getApi(API.KEY, API.MENU.URL)
      this.axios.get(url, {
        params: { hasParams: false, parentId: this.$store.state.guid, key: key }
      }).then(response => {
        this.menuList = response
      })
    },
    selectMenu (value) {
      const item = this.menuList.find(w => w.Id === value)
      if (item) {
        this.$set(this.apiEntity, 'Code', item.Code)
        this.$set(this.apiEntity, 'Name', item.Name)
        this.$set(this.apiEntity, 'Host', item.ApiUrl)
      }
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
      const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.$root.browser.closeCurrentTab({ ...WEBSITE_SETTING_FORM, params: {} })
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          this.disabled = true
          this.$root.browser.closeCurrentTab({ ...WEBSITE_SETTING_FORM, params: {} })
        })
    },
    uploadImage (upload) {
      const formData = new FormData()
      formData.append('files', upload.file, upload.filename)
      const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.BACKGROUND.replace(/{id}/, this.entity.Id))
      this.axios.post(url, formData)
        .then(response => {
          if (response.Status) {
            this.$set(this.entity, 'Id', response.Data.Id)
            this.$set(this.entity, 'LoginBackgroundUrl', this.domain + response.Data.Result.Url)
          }
        })
    },
    showApiDialog (isAdd) {
      this.isApiAdd = isAdd
      if (isAdd) {
        this.apiEntity = { Code: '', Name: '', Host: ' ' }
      } else {
        if (!this.checkHadApiSelection()) return false
        this.apiEntity = { ...this.apiSelectionList[0] }
        this.menuList = [{ Id: '', Code: this.apiEntity.Code, ApiUrl: this.apiEntity.Host }]
      }
      this.apiSettingDialogVisible = true
    },
    getApi () {
      const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.API.replace(/{id}/, this.entity.Id))
      this.axios.get(url).then(response => {
        this.apiList = response
      })
    },
    submitApi () {
      this.$refs.apiForm.validate((valid) => {
        if (valid) {
          if (this.isApiAdd) {
            this.addApi()
          } else {
            this.updateApi()
          }
        }
      })
    },
    addApi () {
      const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.API.replace(/{id}/, this.entity.Id))
      this.axios.post(url, this.apiEntity)
        .then(response => {
          if (response.Status) {
            this.apiSettingDialogVisible = false
            this.getApi()
          }
        })
    },
    updateApi () {
      const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.API.replace(/{id}/, this.entity.Id))
      this.axios.put(url, this.apiEntity)
        .then(response => {
          if (response.Status) {
            this.apiSettingDialogVisible = false
            this.getApi()
          }
        })
    },
    delApi () {
      if (!this.checkHadApiSelection()) return false
      this.$confirm('确认要删除选中Api设置？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const ids = this.apiSelectionList.map(s => s.Id)
        const url = this.$root.getApi(API.KEY, API.WEBSITE_SETTING.API_BATCH_DELETE.replace(/{id}/, this.entity.Id))
        this.axios.patch(url, ids).then(response => {
          if (response.Status) this.getApi()
        })
      })
    },
    apiSelectionChange (rows) {
      this.apiSelectionList = rows
    },
    checkHadApiSelection () {
      if (this.apiSelectionList.length < 1) {
        this.$message.error('请先选择要操作Api数据')
        return false
      }
      return true
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.ofa-form {
  /deep/ .tips {
    li {
      padding: 3px 0;
      font-size: 0.75rem;
    }
  }

  .left-column {
    flex: 1;
  }
  .right-column {
    flex: 2;
  }

  /deep/ .right-column {
    padding: 10px;
    .crop-uploader {
      width: 600px;
      height: 300px;
    }
  }

  /deep/ .ofa-form {
    margin-top: 20px;

    .row-item {
      flex: 1;
      max-width: 400px;

      .el-select,
      .el-cascader,
      .el-input {
        width: 100%;
      }
    }

    .remark-item {
      flex: 1;
      max-width: 640px;

      .remark-textarea,
      textarea {
        width: 100%;
        height: 100px;
      }
    }
  }
}
</style>
