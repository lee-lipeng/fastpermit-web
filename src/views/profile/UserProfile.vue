<template>
  <div class="user-profile-container">
    <div class="profile-header">
      <div class="header-content">
        <el-icon class="profile-icon"><User /></el-icon>
        <h2 class="page-title">个人中心</h2>
      </div>
    </div>

    <div class="profile-content">
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="基本资料" name="userInfo">
          <transition name="fade-transform" mode="out-in">
            <UserInfoForm />
          </transition>
        </el-tab-pane>
        <el-tab-pane label="修改密码" name="resetPassword">
          <transition name="fade-transform" mode="out-in">
            <ResetPasswordForm />
          </transition>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UserInfoForm from "./components/UserInfoForm.vue"; // 引入子组件
import ResetPasswordForm from "./components/ResetPasswordForm.vue"; // 引入子组件
import { User } from "@element-plus/icons-vue";

const activeTab = ref("userInfo"); // 默认激活的标签页
</script>

<style lang="scss" scoped>
.user-profile-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 0 auto;
  max-width: 900px;
  height: 100%;

  .profile-header {
    padding: 24px 30px;
    border-bottom: 1px solid #f0f0f0;

    .header-content {
      display: flex;
      align-items: center;

      .profile-icon {
        font-size: 28px;
        color: #1890ff;
        padding: 12px;
        background-color: rgba(24, 144, 255, 0.1);
        border-radius: 50%;
        margin-right: 16px;
      }

      .page-title {
        font-size: 22px;
        color: #303133;
        font-weight: 600;
        margin: 0;
      }
    }
  }

  .profile-content {
    padding: 24px 30px;

    .profile-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 30px;
      }

      :deep(.el-tabs__nav-wrap::after) {
        height: 2px;
        background-color: #f0f0f0;
      }

      :deep(.el-tabs__item) {
        font-size: 16px;
        padding: 0 24px 12px;
        height: 42px;
        line-height: 42px;
        transition: all 0.3s;

        &.is-active {
          color: #1890ff;
          font-weight: 600;
        }

        &:hover {
          color: #40a9ff;
        }
      }

      :deep(.el-tabs__active-bar) {
        background-color: #1890ff;
        height: 3px;
        border-radius: 3px;
      }
    }
  }
}

// 页面过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.4s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
