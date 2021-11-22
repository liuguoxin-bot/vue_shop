<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template v-slot="slotProps">
            <el-tag type="success" v-if="slotProps.row.order_pay === 1"
              >已付款</el-tag
            >
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="slotProps">
            {{ slotProps.row.create_time | formatDate }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button
              @click="handleEditDialog"
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              @click="handleProgressDialog"
              type="success"
              icon="el-icon-location"
              size="mini"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

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
      @close="handleCloseEditDialog"
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form
        :model="editAdressForm"
        :rules="editAdressRules"
        ref="editAdressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="adress1">
          <el-cascader
            :options="cityData"
            v-model="editAdressForm.adress1"
            style="width: 100%"
          ></el-cascader>
        </el-form-item>

        <el-form-item label="详细地址" prop="adress2">
          <el-input v-model="editAdressForm.adress2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditAddress">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata";
import progressData from "./progress";
export default {
  data() {
    return {
      progressInfo: [],
      progressDialogVisible: false,
      cityData,
      editAdressForm: {
        adress1: "",
        adress2: "",
      },

      editAdressRules: {
        adress1: [
          { required: true, message: "请选择省市区县", trigger: "blur" },
        ],
        adress2: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },

      editDialogVisible: false,
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },

      total: 0,
      orderList: [],
    };
  },

  created() {
    this.getOrderList();
  },

  methods: {
    async handleProgressDialog() {
      this.progressInfo = progressData.data;
      this.progressDialogVisible = true;
      console.log(this.progressInfo);
    },
    handleCloseEditDialog() {
      this.$refs.editAdressFormRef.resetFields();
    },
    handleEditAddress() {},
    handleEditDialog() {
      this.editDialogVisible = true;
    },

    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取订单数据失败");
      }
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },

    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getOrderList();
    },
  },
};
</script>

<style></style>
