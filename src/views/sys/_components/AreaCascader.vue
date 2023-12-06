<template>
  <el-cascader ref="list" clearable v-model="treePath" :options="list" :placeholder="placeholder" :size="size" :props="{ children: 'Children', value: 'Id', label: 'Name', checkStrictly: true, lazy: true, lazyLoad: this.getChildren }">
    <template slot-scope="{ node, data }">
      <span>{{ data.Name }}</span><label v-if="data.ShortName">（{{data.ShortName}}）</label>
    </template>
  </el-cascader>
</template>

<script>
import API from '../../../apis/sys-api'

export default {
  name: 'SysAreaCascader',
  props: {
    placeholder: {
      type: String,
      default: '请选择地区'
    },
    value: {
      type: Number
    },
    // 是否显示根节点
    showRoot: {
      type: Boolean,
      default: false
    },
    // 详情参考element-ui
    size: {
      type: String,
      default: 'small'
    },
    // 根节点名称，只在showRoot为true时有效
    rootName: {
      type: String,
      default: '根节点'
    }
  },
  data () {
    return {
      list: [], // 地区树
      treePath: '', // 选中的路径
      rootItem: {
        Id: 0,
        Name: '根节点'
      }
    }
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(API.KEY)
    }
  },
  watch: {
    value (newValue) {
      // 暂时不实现双向绑定
      return false
    },
    treePath (newValue) {
      this.$emit('input', newValue[newValue.length - 1])
    }
  },
  methods: {
    init () {
      this.getProvinces()
    },
    getProvinces () {
      const url = this.$root.getApi(API.KEY, API.AREA.PROVINCE)
      this.axios.get(url)
        .then(response => {
          if (this.showRoot) {
            this.rootItem.Name = this.rootName
            response.unshift(this.rootItem)
          }
          this.list = response
        })
    },
    getChildren (node, resolve) {
      if (!node.data) return false
      let url = this.$root.getApi(API.KEY, API.AREA.CHILDREN)
      url = url.replace(/{id}/, node.data.Id)
      this.axios.get(url).then(response => {
        resolve(response)
      })
    },
    setTreePath () {
      this.treePath = [this.value]
    }
  },
  created () {
    this.init()
  }
}
</script>
