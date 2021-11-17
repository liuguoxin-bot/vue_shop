<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="handleAddCate">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        border
        :show-row-hover="false"
        :expand-type="false"
        :selection-type="false"
        show-index
        index-text="#"
        class="tree-table"
      >
        <template slot="isok" scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted == false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <template slot="order" scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
          >
            二级
          </el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">
            编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">
            删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页列表区域 -->

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <el-dialog
      @close="hancleCateDialogClose"
      title="提示"
      :visible.sync="addCatedialogVisible"
      width="50%"
    >
      <el-form
        :model="cateRuleForm"
        :rules="cateRules"
        ref="cateRuleFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="cateRuleForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            clearable
            v-model="seletedList"
            :options="parentCateList"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
      },
      seletedList: [],
      parentCateList: [],
      cateRuleForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      cateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      addCatedialogVisible: false,
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      cateList: [],
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
          minWidth: "150px",
        },
      ],
    };
  },

  created() {
    this.getCateList();
  },

  methods: {
    hancleCateDialogClose() {
      this.$refs.cateRuleFormRef.resetFields();
      this.seletedList = [];
      this.cateRuleForm.cat_level = 0;
      this.cateRuleForm.cat_pid = 0;
    },
    addCate() {
      this.$refs.cateRuleFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.cateRuleForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCatedialogVisible = false;
      });
    },
    handleChange() {
      console.log(this.seletedList);
      if (this.seletedList.length !== 0) {
        this.cateRuleForm.cat_pid =
          this.seletedList[this.seletedList.length - 1];
        this.cateRuleForm.cat_level = this.seletedList.length;
      } else {
        this.cateRuleForm.cat_pid = 0;

        this.cateRuleForm.cat_level = 0;
      }
    },
    handleAddCate() {
      this.getParentCateList();
      this.addCatedialogVisible = true;
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      console.log(res);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },

    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }
      this.parentCateList = res.data;
    },
  },
};
</script>

<style lang="scss" scoped>
.tree-table {
  margin-top: 15px;
}
</style>
