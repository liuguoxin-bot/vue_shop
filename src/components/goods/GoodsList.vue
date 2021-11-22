<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            clearable
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @clear="handleInputClear"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="handleSearch"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table border stripe :data="goodsList">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="70px"
        ></el-table-column>
        <el-table-column label="创建时间" width="140px">
          <template v-slot="slotProps">{{
            slotProps.row.add_time | formatDate
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
            ></el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDelete(slotProps.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[1, 5, 8, 10]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      goodsList: [],
      total: 0,
    };
  },

  created() {
    this.getGoodList();
  },

  methods: {
    addGoods() {
      this.$router.push("goods/add");
    },

    handleDelete(id) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`goods/${id}`);
          if (res.meta.status !== 200) {
            return this.$message.error("删除失败");
          }
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          this.getGoodList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    handleInputClear() {
      this.getGoodList();
    },

    handleSearch() {
      this.getGoodList();
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodList();
    },

    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodList();
    },

    async getGoodList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      console.log(res.data);
      this.total = res.data.total;
      this.goodsList = res.data.goods;
    },
  },
};
</script>

<style></style>
