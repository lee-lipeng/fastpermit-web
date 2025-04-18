<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-left">
        <div class="login-logo">
          <el-icon class="logo-icon"><Lock /></el-icon>
          <h1 class="system-title">FastPermit</h1>
        </div>
        <div class="login-intro">
          <h2 class="intro-title">欢迎使用权限管理系统</h2>
          <p class="intro-desc">简洁、高效的权限管理系统</p>
        </div>
      </div>

      <div class="login-right">
        <el-card class="login-card">
          <div class="card-header">
            <span>系统登录</span>
          </div>
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            class="login-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                class="login-input"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                prefix-icon="Lock"
                @keyup.enter="handleLogin"
                class="login-input"
              />
            </el-form-item>
            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary" :underline="false" href="javascript:;"
                >忘记密码?</el-link
              >
            </div>
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleLogin"
                class="login-button"
              >
                登 录
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
    <div class="login-footer">
      <p>FastPermit © 2023 版权所有</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

// 登录表单数据
const loginForm = reactive({
  username: "",
  password: "",
});

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
});

// 处理登录逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await userStore.login(loginForm, rememberMe.value);
        ElMessage.success("登录成功！");
        await router.push("/");
      } catch (error) {
        console.error("登录失败:", error);
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  background-size: cover;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    z-index: 0;
    background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.2) 0%,
        rgba(255, 255, 255, 0) 80%
      ),
      radial-gradient(
        circle,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0) 70%
      );
    animation: rotate 60s linear infinite;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.login-content {
  display: flex;
  width: 900px;
  height: 600px;
  max-width: 90%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1;
  position: relative;
  animation: fadeIn 0.8s ease-out forwards;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    display: none;
  }

  .login-logo {
    display: flex;
    align-items: center;
    animation: slideRight 1s ease-out forwards;

    .logo-icon {
      width: 60px;
      height: 60px;
      font-size: 48px;
      margin-right: 15px;
      color: white;
    }

    .system-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }
  }

  .login-intro {
    animation: slideUp 1s ease-out forwards;
    animation-delay: 0.3s;
    opacity: 0;
    transform: translateY(20px);

    .intro-title {
      font-size: 32px;
      font-weight: 500;
      margin-bottom: 20px;
    }

    .intro-desc {
      font-size: 16px;
      opacity: 0.9;
    }
  }
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-right {
  flex: 1;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-card {
    width: 100%;
    max-width: 400px;
    border: none;
    box-shadow: none;
    padding: 0;

    .card-header {
      text-align: center;
      margin-bottom: 30px;
      animation: fadeIn 1s ease-out forwards;

      span {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        position: relative;

        &::after {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 3px;
          background: linear-gradient(to right, #1890ff, #36cfc9);
          border-radius: 3px;
        }
      }
    }

    .login-form {
      .el-form-item {
        margin-bottom: 25px;

        &:nth-child(1) {
          animation: fadeIn 0.8s ease forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }

        &:nth-child(2) {
          animation: fadeIn 0.8s ease forwards;
          animation-delay: 0.4s;
          opacity: 0;
        }

        &:last-child {
          margin-bottom: 10px;
          margin-top: 20px;
          animation: fadeIn 0.8s ease forwards;
          animation-delay: 0.8s;
          opacity: 0;
        }
      }

      .login-input {
        height: 45px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover,
        &:focus {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
      }

      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        animation: fadeIn 0.8s ease forwards;
        animation-delay: 0.6s;
        opacity: 0;
      }

      .login-button {
        width: 100%;
        height: 45px;
        font-size: 16px;
        border-radius: 8px;
        background: linear-gradient(to right, #1890ff, #36cfc9);
        border: none;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(24, 144, 255, 0.3);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

.login-footer {
  margin-top: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  z-index: 1;
  position: relative;
  animation: fadeIn 1s ease-out forwards;
  animation-delay: 1s;
  opacity: 0;
}
</style>
