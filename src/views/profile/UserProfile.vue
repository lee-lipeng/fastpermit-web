<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>个人中心</span>
      </div>
    </template>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本资料" name="userInfo">
        <UserInfoForm />
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="resetPassword">
        <ResetPasswordForm />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UserInfoForm from "./components/UserInfoForm.vue"; // 引入子组件
import ResetPasswordForm from "./components/ResetPasswordForm.vue"; // 引入子组件

const activeTab = ref("userInfo"); // 默认激活的标签页
</script>

<style scoped>
.card-header {
  font-size: 18px;
  font-weight: bold;
}
/* 可以根据需要添加更多样式 */
</style>
