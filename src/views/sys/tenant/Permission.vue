<template>
  <div class="perm-container">
    <el-alert show-icon title="操作提示" type="warning">
      <ul class="tips">
        <li>本功能仅限开发人员使用，可对租户直接进行权限分配</li>
        <li>勾选子权限默认拥有父级的查看权限</li>
      </ul>
    </el-alert>
    <div class="button-box">
      <el-button @click="bindPermission" type="primary">保存权限</el-button>
    </div>
    <menu-perm-table ref="permTable" v-model="selectionList"></menu-perm-table>
  </div>
</template>

<script>
import API from '../../../apis/sys-api'
import MenuPermTable from '../_components/MenuPermTable.vue'
import { TENANT_SERVICE } from '../../../router/sys-router'

// 权限服务
export default {
  name: 'SysTenantPermission',
  props: {
    tenantId: ''
  },
  data () {
    return {
      loading: false, // 加载中
      entity: {},
      selectionList: [] // 选中的权限
    }
  },
  methods: {
    init () {
      if (this.loading) return
      this.loading = true
      this.selectionList = []
      this.get()
    },
    get () {
      let url = this.$root.getApi(API.KEY, API.TENANT.PERMISSION)
      url = url.replace(/{id}/, this.tenantId)
      this.axios.get(url).then(response => {
        this.selectionList = [...response]
        this.loading = false
      })
    },
    bindPermission () {
      let url = this.$root.getApi(API.KEY, API.TENANT.PERMISSION)
      url = url.replace(/{id}/, this.tenantId)
      this.axios.post(url, this.selectionList).then(response => {
        if (response.Status) {
          this.$root.browser.closeCurrentTab({ ...TENANT_SERVICE, params: {} })
        }
      })
    }
  },
  created () {
    this.init()
  },
  components: { MenuPermTable }
}
</script>

<style lang="scss" scoped>
.perm-container {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;

  .button-box {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px 0;
    width: 100%;
  }
}
</style>
