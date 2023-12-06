<template>
  <div class="ofa-form no-padding">
    <el-card content-position="left" class="form-header" shadow="never">
      <div class="form-header-text">菜单管理</div>
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
        <el-form status-icon :model="entity" :rules="validationRules" :disabled="disabled" ref="form" class="form" label-position="top" size="small">
          <div class="row">
            <div class="icon-box">
              <font-awesome-icon fas :icon="entity.Icon ? entity.Icon : 'exclamation'" class="icon"></font-awesome-icon>
            </div>
            <div class="info-box">
              <div class="row">
                <el-form-item label="名称" prop="Name">
                  <el-input v-model="entity.Name" placeholder="请输入菜单名称"></el-input>
                </el-form-item>
                <el-form-item label="上级" prop="ParentId">
                  <menu-cascader showRoot v-model="entity.ParentId" :hiddenKey="entity.Id">
                  </menu-cascader>
                </el-form-item>
                <el-form-item label="类型" prop="Type">
                  <el-select v-model="entity.Type" @change="changeOpenType">
                    <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="打开方式" prop="OpenType">
                  <el-select :disabled="entity.Type !== 2" v-model="entity.OpenType">
                    <el-option label="无" :value="-1">
                    </el-option>
                    <el-option v-for="item in openTypeList" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="row">
                <el-form-item label="图标">
                  <el-input v-model="entity.Icon" placeholder="fontawesome图标">
                  </el-input>
                </el-form-item>
                <el-form-item label="代码" prop="Code">
                  <el-input v-model="entity.Code" placeholder="请输入菜单代码"></el-input>
                </el-form-item>
                <el-form-item label="排序" prop="SortNumber">
                  <el-input v-model="entity.SortNumber" placeholder="菜单会根据此值由小到大排序"></el-input>
                </el-form-item>
                <el-form-item label="启用">
                  <el-switch v-model="entity.IsEnabled"></el-switch>
                </el-form-item>
                <el-form-item label="默认">
                  <el-switch v-model="entity.IsDefault"></el-switch>
                </el-form-item>
              </div>
              <div class="row">
                <el-form-item label="链接地址" prop="Url" class="url-item">
                  <el-input v-model="entity.Url" class="url-input" placeholder="当菜单远程组件时，请输入Web地址"></el-input>
                </el-form-item>
              </div>
              <div v-show="entity.Type === 1" class="row">
                <el-form-item label="Api地址" prop="ApiUrl" class="url-item">
                  <el-input v-model="entity.ApiUrl" class="url-input" placeholder="当菜单远程组件时，请输入Api地址"></el-input>
                </el-form-item>
              </div>
              <div class="row">
                <el-form-item label="备注" prop="Remark" class="remark-item">
                  <el-input show-word-limit v-model="entity.Remark" type="textarea" class="remark-textarea" placeholder="请输入菜单备注" maxlength="300">
                  </el-input>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-form>
      </el-card>
    </div>
    <div class="form-content" v-if="!entity.isAdd">
      <!-- 权限 -->
      <el-card content-position="left" shadow="never">
        <div slot="header" class="perms-header">
          <span class="card-header-label">功能权限</span>
          <span>
            <el-button @click="addPermission" class="ofa-button">
              <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增
            </el-button>
            <el-button @click="copyPermission" class="ofa-button">
              <font-awesome-icon fas icon="copy"></font-awesome-icon>&nbsp;克隆
            </el-button>
            <el-button @click="updatePermission" class="ofa-button">
              <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;修改
            </el-button>
            <el-button @click="deletePermission" class="ofa-button ofa-button-danger">
              <font-awesome-icon fas icon="minus"></font-awesome-icon>&nbsp;移除
            </el-button>
          </span>
        </div>
        <permission-table v-model="entity" ref="permission"></permission-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import API from '../../../apis/sys-api'
import { MENU, MENU_FORM } from '../../../router/sys-router'
import MenuCascader from '../_components/MenuCascader'
import PermissionTable from './Permission'
import { MENU_TYPE, MNUE_OPEN_TYPE } from '../../../assets/js/sys-const'

export default {
  name: MENU_FORM.name,
  data () {
    return {
      typeList: MENU_TYPE,
      openTypeList: MNUE_OPEN_TYPE,
      loading: false, // 加载中
      isAdd: false, // 是否添加
      disabled: true, // 允许编辑
      entity: {}, // 菜单实体
      saving: false, // 保存中
      validationRules: {
        Name: [{ required: true, message: '请先填写菜单名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }],
        Type: [{ required: true, message: '请先选择类型', trigger: 'blur' }],
        OpenType: [{ required: true, message: '请先选择打开方式', trigger: 'blur' }],
        ParentId: [{ required: true, message: '请先选择上级菜单', trigger: 'blur' }],
        Remark: [{ min: 0, max: 300, message: '最多输入300个字符', trigger: 'blur' }]
      }
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
      if (!this.loading) {
        this.loading = true
        this.tenants = []
        this.isAdd = this.$route.params.isAdd
        this.entity = { Type: 2, OpenType: 1, Sort: 0, IsEnabled: true, IsBlank: true, ...this.$route.params }
        if (this.entity.Type !== 2) this.entity.OpenType = -1
        if (!this.isAdd) {
          this.disabled = true
        } else {
          this.disabled = false
        }
        this.loading = false
      }
    },
    changeOpenType () {
      // 组件和节点默认没有打开方式
      switch (this.entity.Type) {
        case 0:
        case 1: this.entity.OpenType = -1; break
      }
    },
    submit () {
      if (this.entity.Type !== 2) this.entity.OpenType = -1
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.$route.params.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.MENU.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.$root.browser.closeCurrentTab({ ...MENU_FORM, params: {} })
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.MENU.URL)
      this.axios.put(url, this.entity).then(response => {
        if (response.Status) {
          this.isAdd = false
          this.disabled = true
          this.$root.browser.closeCurrentTab({ ...MENU_FORM, params: {} })
        }
      })
    },
    addPermission () {
      this.$refs.permission.add()
    },
    updatePermission () {
      this.$refs.permission.update()
    },
    deletePermission () {
      this.$refs.permission.del()
    },
    copyPermission () {
      this.$refs.permission.copy()
    },
    goBack () {
      this.$refs.form.resetFields()
      this.$root.navigate({ ...MENU, params: {} })
    }
  },
  mounted () {
    this.init()
  },
  components: { MenuCascader, PermissionTable }
}
</script>

<style lang="scss" scoped>
$label-color: #99a9bf;
$border-color: #ebeef5;

.ofa-form {
  /deep/ .form {
    .icon-box {
      padding-right: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .icon {
        width: 80px;
        height: 80px;
        padding: 10px;
        border: 1px solid $border-color;
        border-radius: 50%;
      }
    }

    .info-box {
      flex: 1;
    }

    .url-item {
      flex: 1;
      max-width: 860px;

      .url-input {
        width: 100%;
      }
    }

    .remark-item {
      flex: 1;
      max-width: 860px;

      textarea {
        width: 100%;
        height: 150px;
      }
    }
  }

  .perms-header {
    display: flex;
    justify-content: space-between;
  }
}
</style>
