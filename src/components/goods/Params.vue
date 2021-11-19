<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        :closable="false"
        type="warning"
        show-icon
      >
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selecteCateKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            @click="handleAddDialog"
            :disabled="isDisable"
            type="primary"
            size="mini"
          >
            添加参数
          </el-button>
          <el-table border stripe :data="manyTableData">
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <el-tag
                  closable
                  @close="handleTagClose(i, slotProps.row)"
                  v-for="(item, i) in slotProps.row.attr_vals"
                  :key="i"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.tagInputValue"
                  ref="tagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>

            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button
                  @click="editDialog(slotProps.row.attr_id)"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  >修改</el-button
                >
                <el-button
                  @click="removeParams(slotProps.row.attr_id)"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            @click="handleAddDialog"
            :disabled="isDisable"
            type="primary"
            size="mini"
          >
            添加属性
          </el-button>

          <el-table border stripe :data="onlyTableData">
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <el-tag
                  closable
                  @close="handleTagClose(i, slotProps.row)"
                  v-for="(item, i) in slotProps.row.attr_vals"
                  :key="i"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.tagInputValue"
                  ref="tagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>

            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button
                  @click="editDialog(slotProps.row.attr_id)"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  >修改</el-button
                >
                <el-button
                  @click="removeParams(slotProps.row.attr_id)"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="dialogClose"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      addForm: {
        attr_name: "",
      },

      editForm: { attr_name: "" },

      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },

      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      editDialogVisible: false,
      addDialogVisible: false,
      activeName: "many",
      cateList: [],
      selecteCateKeys: [],
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      manyTableData: [],
      onlyTableData: [],
    };
  },

  created() {
    this.getCateList();
  },

  methods: {
    showInput(info) {
      info.inputVisible = true;
      console.log(this.$refs.tagInputRef);
      this.$nextTick(() => {
        this.$refs.tagInputRef.$refs.input.focus();
      });
    },
    handleInputConfirm(row) {
      console.log("ok");
      if (row.tagInputValue.trim().length === 0) {
        row.tagInputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.tagInputValue);
      row.tagInputValue = "";
      row.inputVisible = false;
      this.saveAttrVal(row);
    },

    async saveAttrVal(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新失败");
      }

      this.$message.success("更新成功");
    },

    handleTagClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVal(row);
    },
    removeParams(id) {
      this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          console.log(id);
          console.log(this.cateId);
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${id}`
          );

          if (res.meta.status !== 200) {
            return this.$message.error("删除参数失败");
          }
          this.$message.success("删除参数成功");
          this.getParamsList();
        })
        .catch(() => this.$message.info("已取消"));
    },

    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },

    async editDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数失败");
      }

      this.editForm = res.data;
      this.editDialogVisible = true;
    },

    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;

        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改失败");
        }
        this.$message.success("修改成功");
        this.getParamsList();
        this.editDialogVisible = false;
      });
    },

    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加失败");
        }
        this.$message.success("添加成功");
        this.getParamsList();
        this.addDialogVisible = false;
      });
    },
    dialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    handleAddDialog() {
      this.addDialogVisible = true;
    },

    handleClick() {
      console.log(this.activeName);
      this.getParamsList();
    },

    handleChange() {
      // console.log(this.selecteCateKeys);
      this.getParamsList();
    },
    async getParamsList() {
      if (this.selecteCateKeys.length !== 3) {
        this.selecteCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }

      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible = false;
        item.tagInputValue = "";
      });

      // console.log(res.data);
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },

    async getCateList() {
      const { data: res } = await this.$http.get("categories");

      if (res.meta.status !== 200) {
        return this.$message.error("获取分类列表失败");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
  },
  computed: {
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },

    isDisable() {
      if (this.selecteCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    cateId() {
      if (this.selecteCateKeys.length === 3) {
        return this.selecteCateKeys[2];
      }
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
