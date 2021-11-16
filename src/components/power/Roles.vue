<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col><el-button type="primary">添加角色</el-button></el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand" class="my-column">
          <template v-slot="slotProps">
            <div style="margin-top: 15px">
              <el-row
                :class="[
                  'my-row',
                  'vcenter',
                  'bottom-line',
                  i1 === 0 ? 'top-line' : '',
                ]"
                v-for="(item, i1) in slotProps.row.children"
                :key="item.id"
              >
                <el-col :span="5">
                  <el-tag
                    closable
                    @close="handleTagClose(slotProps.row, item.id)"
                    >{{ item.authName }}</el-tag
                  >
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <el-row
                    :class="['my-row', 'vcenter', i2 === 0 ? '' : 'top-line']"
                    v-for="(item2, i2) in item.children"
                    :key="item2.id"
                  >
                    <el-col :span="6">
                      <el-tag
                        closable
                        @close="handleTagClose(slotProps.row, item2.id)"
                        type="success"
                        >{{ item2.authName }}</el-tag
                      >
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag
                        closable
                        @close="handleTagClose(slotProps.row, item3.id)"
                        type="warning"
                        v-for="item3 in item2.children"
                        :key="item3.id"
                      >
                        {{ item3.authName }}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="slotProps">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              @click="showSetRightDialog(slotProps.row)"
              size="mini"
              type="warning"
              icon="el-icon-setting"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      @close="defKeys = []"
      title="提示"
      :visible.sync="setRightDialogVisible"
      width="50%"
    >
      <span
        ><el-tree
          ref="treeRef"
          show-checkbox
          default-expand-all
          :data="rightsList"
          :props="treeProps"
          node-key="id"
          :default-checked-keys="defKeys"
        ></el-tree
      ></span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      rightsList: [],
      defKeys: [],
      roleId: "",
      treeProps: {
        children: "children",
        label: "authName",
      },
      setRightDialogVisible: false,
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    async handleTagClose(role, rightId) {
      const confirmRes = await this.$confirm(
        "正在删除文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmRes !== "confirm") {
        return this.$message.info("已取消");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      role.children = res.data;
    },

    async showSetRightDialog(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.rightsList = res.data;
      this.getDefKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },

    getDefKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getDefKeys(item, arr);
      });
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];

      console.log(keys);
      console.log(this.roleId);
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: keys.join(",") }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败");
      }
      this.$message.success("分配权限成功");
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.my-row {
  margin-left: 42px;
}
.top-line {
  border-top: 1px solid #eee;
}

.bottom-line {
  border-bottom: 1px solid #eee;
}

.el-tag {
  margin: 7px 8px;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
