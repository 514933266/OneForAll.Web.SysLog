<template>
  <el-container v-loading="loading">
    <el-header class="header">
      <span>
        <base-area-cascader v-model="searchOption.parentId" ref="areaCascader" size="small" placeholder="请选择上级地区">
        </base-area-cascader>
        <el-input v-model="searchOption.key" size="small" placeholder="请输入要查询的关键字" clearable></el-input>
        <el-button type="primary" class="search-btn" size="mini" @click="search">
          <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
        </el-button>
      </span>
      <span>
        <el-button type="primary" size="mini" @click="showAddDrawer">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增地区
        </el-button>
      </span>
    </el-header>
    <el-main class="ofa-container column">
      <el-table :data="list" v-loading="loading" row-key="Id" size="small" class="ofa-table">
        <el-table-column prop="Name" label="名称"></el-table-column>
        <el-table-column prop="ShortName" label="简称">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.ShortName" size="small">{{scope.row.ShortName}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Code" label="代码"></el-table-column>
        <el-table-column label="等级">
          <template slot-scope="scope">{{ types[scope.row.Level] }}</template>
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
        <span class="title">{{isAdd ? '新增' : '编辑'}}地区</span><label class="title-tips">Areas</label>
      </div>
      <el-form status-icon ref="form" :rules="validationRules" :model="entity" class="ofa-form" label-width="100px">
        <el-alert show-icon title="操作提示" type="warning" style="margin-bottom: 20px;">
          <ul class="tips">
            <li>如不了解此页面相关内容规则，请先咨询开发人员</li>
            <li>1. 填写此处内容前请先咨询开发人员，代码规则为上级代码叠加2位数字，如0101</li>
          </ul>
        </el-alert>
        <el-form-item label="上级地区" prop="ParentId" v-if="isAdd">
          <system-area-cascader showRoot ref="tree" placeholder="请选择上级地区" v-model="entity.ParentId" size="small"></system-area-cascader>
        </el-form-item>
        <el-form-item label="名称" prop="Name">
          <el-input v-model.trim="entity.Name" placeholder="请输入地区名称" size="small"></el-input>
        </el-form-item>
        <el-form-item label="代码" prop="Code">
          <el-input v-model.trim="entity.Code" placeholder="请输入地区代码" size="small"></el-input>
        </el-form-item>
        <el-form-item label="简称" prop="ShortName">
          <el-input v-model.trim="entity.ShortName" placeholder="请输入行政地区的简称，如：粤" size="small"></el-input>
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
import { AREA } from '../../../router/sys-router'
import BaseAreaCascader from '../_components/AreaCascader'
import SystemAreaCascader from '../_components/AreaCascader'
// 系统地区管理
export default {
  name: AREA.name,
  data () {
    return {
      loading: false,
      searchOption: {
        key: '', // 关键字
        parentId: 0 // 所属上级
      },
      total: 1,
      pageIndex: 1,
      pageSize: 10,
      list: [],
      types: ['异常', '省', '市', '县区', '镇街'],
      // 抽屉
      isAdd: false,
      drawerVisiable: false,
      entity: {},
      validationRules: {
        Name: [{ required: true, message: '请先填写地区名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2~20之间', trigger: 'blur' }],
        Code: [{ required: true, message: '请先填写地区代码', trigger: 'blur' }, { min: 2, max: 50, message: '长度在2~20之间', trigger: 'blur' }],
        ParentId: [{ required: true, message: '请先选择上级', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(AREA.name)
    }
  },
  methods: {
    init () {
      if (this.loading) return
      this.get()
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.AREA.URL)
      if (!this.searchOption.parentId) {
        this.searchOption.parentId = 0
      }
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
    selectionChange (rows) {
      this.selectionList = rows
    },
    del (entity) {
      this.$confirm('确认要删除该地区？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.AREA.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    // 编辑
    edit (row) {
      this.isAdd = false
      this.entity = { ParentId: 0, Code: '', ...row }
      this.drawerVisiable = true
    },
    // 打开抽屉
    showAddDrawer () {
      this.isAdd = true
      this.entity = { ParentId: 0, Code: '' }
      this.drawerVisiable = true
    },
    // 抽屉提交
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
      const url = this.$root.getApi(API.KEY, API.AREA.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.init()
            this.drawerVisiable = false
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.AREA.URL)
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
  mounted () {
    this.$refs.areaCascader.init()
  },
  components: { BaseAreaCascader, SystemAreaCascader }
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
