<template>
  <el-cascader ref="menuCascader" :props="{ children: 'Children', value: 'Id', label: 'Name', checkStrictly: true }" v-model="treePath"
    :options="tree" :placeholder="placeholder" size="small"></el-cascader>
</template>

<script>
import API from '../../../apis/sys-api'

export default {
  name: 'SysMenuCascader',
  props: {
    // 绑定值
    value: {
      type: String
    },
    // 水印
    placeholder: {
      type: String,
      default: '请选择上级菜单'
    },
    // 隐藏节点
    hiddenKey: {
      type: String,
      default: ''
    },
    // 显示根节点
    showRoot: {
      type: Boolean,
      default: false
    },
    // 根节点名称，只在showRoot为true时有效
    rootName: {
      type: String,
      default: '根节点'
    }
  },
  data () {
    return {
      tree: [],
      treePath: [],
      rootItem: {
        Id: this.$store.state.guid,
        ParentId: this.$store.state.guid,
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
      this.init()
      this.getTreePath(newValue)
    },
    treePath (newValue) {
      const index = this.treePath.length - 1
      this.$emit('input', this.treePath[index])
    }
  },
  methods: {
    init () {
      this.get()
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.MENU.URL)
      this.axios.get(url).then(response => {
        this.setTree(response)
        this.treePath = this.getTreePath(this.value)
      })
    },
    setTree (tree) {
      if (this.showRoot) {
        this.rootItem.Name = this.rootName
        tree.unshift(this.rootItem)
      }
      if (this.hiddenKey) tree = this.hiddenNode(tree)
      this.tree = tree
    },
    hiddenNode (source) {
      var index = source.findIndex(w => w.Id === this.hiddenKey)
      if (index > -1) {
        source.splice(index, 1)
      } else {
        source.forEach(e => {
          if (e.Children) e.Children = this.hiddenNode(e.Children)
        })
      }
      return source
    },
    getTreePath (value) {
      let result = [value]
      const option = this.findOption(this.tree, value)
      if (option && option.ParentId !== this.$store.state.guid) {
        result = this.getTreePath(option.ParentId).concat(result)
      }
      return result
    },
    findOption (source, value) {
      if (source) {
        for (let i = 0; i < source.length; i++) {
          const e = source[i]
          if (e.Id === value) {
            return e
          } else {
            const option = this.findOption(e.Children, value)
            if (option) return option
          }
        }
      }
      return null
    },
    getCheckedNodes () {
      return this.$refs.menuCascader.getCheckedNodes()
    }
  },
  created () {
    this.init()
  }
}
</script>
