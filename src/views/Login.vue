<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>FastPermit 系统登录</span>
        </div>
      </template>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
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
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { useRouter } from "vue-router"; // 引入 useRouter
import { useUserStore } from "@/store/modules/user"; // 引入 useUserStore
import { ElMessage } from "element-plus"; // 引入 ElMessage 用于成功提示

const router = useRouter(); // 获取 router 实例
const userStore = useUserStore(); // 获取 user store 实例
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

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
        console.log("准备调用 Store 的 login action", loginForm);
        await userStore.login(loginForm); // 调用 Store 的 login action
        ElMessage.success("登录成功！"); // 显示成功提示
        // 登录成功后跳转到首页
        await router.push("/"); // 跳转到根路径，会自动重定向到 dashboard
      } catch (error) {
        // 错误信息已在 request.ts 中通过 ElMessage 显示，这里只需记录日志
        console.error("登录失败 (Login.vue):", error);
      } finally {
        loading.value = false;
      }
    } else {
      console.log("表单验证失败");
    }
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  // 使用线性渐变背景
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden; // 防止潜在的滚动条
}

.login-card {
  width: 450px; // 稍微加宽
  border-radius: 8px; // 添加圆角
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); // 添加阴影
  padding: 20px; // 增加卡片内部边距

  .el-form {
    margin-top: 20px; // 表单与标题的间距
  }

  // 调整表单项间距
  .el-form-item {
    margin-bottom: 25px; // 增加表单项底部间距
  }

  // 特别调整按钮的上边距
  .el-form-item:last-child {
    margin-bottom: 10px; // 减少最后一个表单项的底部间距
    margin-top: 10px; // 调整按钮与上方元素的间距
  }

  // 登录按钮样式微调 (可选)
  .el-button--primary {
    height: 40px; // 按钮高度
    font-size: 16px; // 按钮字体大小
  }
}

.card-header {
  text-align: center;
  span {
    font-size: 24px; // 加大标题字号
    font-weight: 600; // 稍微加粗
    color: #303133; // 标题颜色
  }
}
</style>
