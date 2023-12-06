<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header" shadow="never">
      <div class="form-header-text">系统通知 Notification</div>
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
        <el-form status-icon ref="form" :rules="validationRules" :model="entity" :disabled="disabled" class="form" label-width="100px">
          <el-form-item label="标题" prop="Title">
            <el-input v-model.trim="entity.Title" style="width:100%" placeholder="请输入通知标题"></el-input>
          </el-form-item>
          <el-form-item label="类型" prop="Content">
            <el-radio-group v-model="entity.Type" @change="changeSelectType" size="small">
              <el-radio v-for="item in types" :key="item.value" :label="item.value">{{item.label}}</el-radio>
            </el-radio-group>
            <div v-show="entity.Type == 2" class="account-tag-box">
              <el-tag closable v-for="item in accountSelectionList" :key="item.Id" @close="removeAccountSelection(item)" type="primary">
                {{item.UserName}}</el-tag>
            </div>
          </el-form-item>
          <el-form-item label="内容" prop="Content">
            <tinymce-editor v-if="!loading" :key="entity.Id" v-model="entity.Content" @uploadImage="uploadImage" :disabled="disabled"></tinymce-editor>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <!-- 选择账户弹窗 -->
    <el-dialog append-to-body title="选择向指定账号发送通知" :visible.sync="accountDialogVisible" width="60%" :before-close="closeFixTeamDialog">
      <div class="fix-account-box">
        <search-input enterable v-model="accountSearchOption.key" @click="getAccounts" placeholder="输入用户名称或账号搜索" size="small"></search-input>
        <div class="account-box">
          <el-table border :data="accountList" @selection-change="accountSelectionChange" ref="accountTable" row-key="Id" size="small" height="300px">
            <el-table-column prop="UserName" label="账号列表" header-align="center">
              <template slot-scope="scope">
                {{scope.row.UserName}}&nbsp;
                <el-tag size="small" type="primary">{{scope.row.TenantName}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="80">
              <template slot-scope="scope">
                <el-button type="text" @click="addAccountSelection(scope.row)" class="ofa-text-primary">
                  选择
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-table border :data="accountSelectionList" row-key="Id" size="small" height="300px">
            <el-table-column prop="UserName" label="已选账号" header-align="center">
              <template slot-scope="scope">
                {{scope.row.UserName}}&nbsp;
                <el-tag size="small" type="primary">{{scope.row.TenantName}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="80">
              <template slot-scope="scope">
                <el-button type="text" @click="removeAccountSelection(scope.row)" class="ofa-text-danger">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAccountSelection">取 消</el-button>
        <el-button type="primary" @click="accountDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import API from '../../../apis/sys-api'
import { NOTIFICATION, NOTIFICATION_FORM } from '../../../router/sys-router'
import { NOTIFICATION_TYPE } from '../../../assets/js/sys-const'

// 系统通知
export default {
  name: NOTIFICATION_FORM.name,
  data () {
    return {
      types: NOTIFICATION_TYPE, // 消息类型
      loading: false, // 加载中
      isAdd: false, // 是否添加
      disabled: false, // 允许编辑
      accountDialogVisible: false, // 显示账号选择弹窗
      accountList: [], // 账号列表
      accountSelectionList: [], // 选择账号列表
      accountSearchOption: {
        key: ''
      }, // 账号搜索条件
      entity: {}, // 当前对象
      validationRules: {
        Title: [{ required: true, message: '请先填写通知标题', trigger: 'blur' }, { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }],
        Content: [{ required: true, message: '请先填写内容', trigger: 'blur' }]
      }
    }
  },
  computed: {
    uploadHeader () {
      return { authorization: `bearer ${this.$store.getters.access_token}` }
    },
    uploadUrl () {
      return API.NOTIFICATION.IMAGE.replace(/{id}/, this.entity.Id)
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
        this.isAdd = this.$route.params.isAdd
        this.entity = { Id: this.$store.state.guid, Type: 0, ToAccounts: [], ...this.$route.params }
        if (!this.isAdd) {
          this.disabled = true
        } else {
          this.disabled = false
        }
        this.loading = false
      }
    },
    changeSelectType (value) {
      // 选择指定账号
      if (value === 2) {
        this.accountDialogVisible = true
      }
    },
    getAccounts () {
      const url = this.$root.getApi(API.KEY, API.USER.URL)
      this.axios.get(`${url}/1/50`, {
        params: this.accountSearchOption
      }).then(response => {
        this.accountList = response.Items
      })
    },
    addAccountSelection (entity) {
      if (this.accountSelectionList.findIndex(w => w.Id === entity.Id) < 0) {
        this.accountSelectionList.push(entity)
      }
    },
    removeAccountSelection (entity) {
      var index = this.accountSelectionList.findIndex(w => w.Id === entity.Id)
      if (index > -1) {
        this.accountSelectionList.splice(index, 1)
      }
    },
    cancelAccountSelection () {
      this.accountDialogVisible = false
      this.accountSelectionList = []
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.entity.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    add () {
      this.entity.ToAccounts = this.accountSelectionList
      const url = this.$root.getApi(API.KEY, API.NOTIFICATION.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.$root.browser.closeCurrentTab({ ...NOTIFICATION_FORM, params: {} })
          }
        })
    },
    update () {
      this.entity.ToAccounts = this.accountSelectionList
      const url = this.$root.getApi(API.KEY, API.NOTIFICATION.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.disabled = true
            this.$root.browser.closeCurrentTab({ ...NOTIFICATION_FORM, params: {} })
          }
        })
    },
    publish () {
      this.entity.IsPublish = true
      this.submit()
    },
    uploadSuccess (res, file) {
      if (res.Status) {
        this.entity.IconUrl = this.domain + res.Data.Result.Url
        Object.assign(this.entity, { Id: res.Data.Id })
      }
    },
    uploadImage (upload) {
      const url = this.$root.getApi(API.KEY, API.NOTIFICATION.IMAGE.replace(/{id}/, this.entity.Id))
      this.upload(url, upload, (response) => {
        if (response.Status) {
          Object.assign(this.entity, {
            Id: response.Data.Id
          })
          const imgUrl = this.domain + response.Data.Result.Url
          upload.success(imgUrl)
        }
      })
    },
    upload (url, upload, callback) {
      var formData = new FormData()
      formData.append('files', upload.file, upload.filename)
      this.axios.post(url, formData)
        .then(response => {
          callback(response)
        })
    },
    goBack () {
      this.$refs.form.resetFields()
      this.$root.navigate({ ...NOTIFICATION, params: {} })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.account-box {
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
}

.account-tag-box {
  margin-top: 4px;
  .el-tag {
    margin-left: 6px;
  }
}
</style>
