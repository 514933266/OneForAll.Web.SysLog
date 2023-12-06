<template>
  <div class="ofa-form no-padding">
    <el-card content-position="left" class="form-header" shadow="never">
      <div class="form-header-text">{{`${entity.Name}-管理`}}</div>
    </el-card>
    <el-card content-position="left" class="form-content" shadow="never">
      <div class="tab-container">
        <el-tabs @tab-click="tabClick" v-model="activeTab">
          <el-tab-pane label="全部权限" name="permTab">
            <permission :tenantId="entity.Id" ref="permTable"></permission>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
import API from '../../../apis/sys-api'
import { TENANT, TENANT_SERVICE } from '../../../router/sys-router'
import Permission from './Permission.vue'

// 权限服务
export default {
  name: TENANT_SERVICE.name,
  data () {
    return {
      loading: false, // 加载中
      activeTab: 'permTab', // 当前标签页
      entity: {}
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (this.loading) return
      this.loading = true
      this.entity = { ...this.$route.params }
      this.loading = false
      this.tabClick()
    },
    tabClick () {
      switch (this.activeTab) {
        case 'permTab':
          if (this.$refs.permTable) {
            this.$refs.permTable.init();
          }
          break
      }
    },
    updateTenant () {
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
      this.axios.put(url, this.entity)
    },
    goBack () {
      this.$root.navigate({ ...TENANT, params: {} })
    }
  },
  created () {
    this.init()
  },
  components: { Permission }
}
</script>

<style lang="scss" scoped>
.tab-container {
  /deep/ .el-tabs__item {
    font-size: 1rem !important;
    padding: 10px 20px !important;
    font-weight: bold;
    height: auto;
    min-width: 160px;
    text-align: center;
  }
}

/deep/ .form {
  margin-top: 20px;

  input {
    width: 200px;
  }

  label {
    color: #99a9bf;
  }

  .address-textarea {
    .el-input,
    input {
      width: 600px !important;
    }
  }

  .description-textarea {
    width: 600px !important;
  }

  .fooder {
    display: flex;
    justify-content: flex-end;
    width: 600px;
  }
}
</style>
