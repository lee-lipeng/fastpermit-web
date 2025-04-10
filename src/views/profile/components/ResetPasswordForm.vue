<template>
  <div class="reset-password-container">
    <el-form
      ref="resetPwdFormRef"
      :model="formData"
      :rules="formRules"
      label-position="top"
      class="password-form"
      status-icon
    >
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="旧密码" prop="old_password">
            <el-input
              type="password"
              v-model="formData.old_password"
              placeholder="请输入旧密码"
              show-password
              prefix-icon="Key"
              class="form-input"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="新密码" prop="new_password">
            <el-input
              type="password"
              v-model="formData.new_password"
              placeholder="请输入新密码"
              show-password
              prefix-icon="Lock"
              class="form-input"
              @input="checkPasswordStrength"
            />
            <div class="password-strength" v-if="formData.new_password">
              <div class="strength-text">
                密码强度：{{ passwordStrengthText }}
              </div>
              <div class="strength-bar">
                <div
                  class="strength-indicator"
                  :class="passwordStrengthClass"
                  :style="{ width: passwordStrengthWidth }"
                ></div>
              </div>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="确认新密码" prop="confirm_password">
            <el-input
              type="password"
              v-model="formData.confirm_password"
              placeholder="请再次输入新密码"
              show-password
              prefix-icon="Check"
              class="form-input"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item class="form-actions">
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="loading"
          class="submit-btn"
        >
          <el-icon><Key /></el-icon>
          确认修改
        </el-button>
        <el-button @click="handleReset" class="reset-btn">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-alert class="password-alert" type="warning" :closable="false" show-icon>
      <template #title>
        <span class="alert-title">安全提示</span>
      </template>
      <div class="alert-content">
        <p>密码修改成功后，系统将自动退出登录，请使用新密码重新登录。</p>
      </div>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { resetPassword } from "@/api/auth";
import { useUserStore } from "@/store/modules/user";
import { useRouter } from "vue-router";
import { Lock, Key, Check, RefreshRight } from "@element-plus/icons-vue";

const resetPwdFormRef = ref<FormInstance>();
const loading = ref(false);
const userStore = useUserStore();
const router = useRouter();
const showPasswordTips = ref(false);

// 密码强度
const passwordStrength = ref(0); // 0-4, 对应弱到强
const passwordStrengthText = computed(() => {
  const strengthTexts = ["极弱", "弱", "中等", "强", "极强"];
  return strengthTexts[passwordStrength.value];
});

const passwordStrengthClass = computed(() => {
  const classes = ["very-weak", "weak", "medium", "strong", "very-strong"];
  return classes[passwordStrength.value];
});

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value + 1) * 20}%`;
});

// 检查密码强度
const checkPasswordStrength = () => {
  const password = formData.new_password;
  if (!password) {
    passwordStrength.value = 0;
    showPasswordTips.value = false;
    return;
  }

  // 简单的密码强度判断逻辑
  let strength = 0;

  // 长度检查
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // 包含数字
  if (/\d/.test(password)) strength += 1;

  // 包含字母（大小写）
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  else if (/[a-z]/.test(password) || /[A-Z]/.test(password)) strength += 0.5;

  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

  passwordStrength.value = Math.min(4, Math.floor(strength));
};

// 表单数据
const formData = reactive({
  old_password: "",
  new_password: "",
  confirm_password: "",
});

// 自定义验证规则：确认密码
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请再次输入新密码"));
  } else if (value !== formData.new_password) {
    callback(new Error("两次输入的新密码不一致!"));
  } else {
    callback();
  }
};

// 自定义验证规则：新密码复杂度
const validatePassword = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("新密码不能为空"));
    return;
  }

  if (value.length < 6) {
    callback(new Error("密码长度不能少于6位"));
    return;
  }

  // 弱密码检查
  if (passwordStrength.value < 2) {
    callback(new Error("密码强度过低，请增加复杂度"));
    return;
  }

  callback();
};

// 表单验证规则
const formRules = reactive<FormRules>({
  old_password: [
    { required: true, message: "旧密码不能为空", trigger: "blur" },
  ],
  new_password: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    { validator: validatePassword, trigger: "blur" },
  ],
  confirm_password: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
});

// 处理表单提交
const handleSubmit = async () => {
  if (!resetPwdFormRef.value) return;
  await resetPwdFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await resetPassword(formData.old_password, formData.new_password);
        ElMessage.success("密码修改成功！请重新登录。");
        handleReset(); // 成功后清空表单
        // 密码修改成功后，强制用户重新登录
        await userStore.logout();
        router.push("/login");
      } catch (error) {
        console.error("密码修改失败:", error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 处理重置表单
const handleReset = () => {
  resetPwdFormRef.value?.resetFields();
  passwordStrength.value = 0;
  showPasswordTips.value = false;
};
</script>

<style lang="scss" scoped>
.reset-password-container {
  padding: 20px 0;

  .password-form {
    margin: 0 auto;
    max-width: 800px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      padding-bottom: 8px;
    }

    .form-input {
      .el-input__wrapper {
        padding: 0 12px;
        height: 42px;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 0 0 1px #40a9ff inset;
        }

        &:focus-within {
          box-shadow: 0 0 0 1px #1890ff inset;
        }

        .el-input__prefix-inner {
          .el-icon {
            color: #909399;
          }
        }
      }

      &:focus-within {
        .el-input__prefix-inner {
          .el-icon {
            color: #1890ff;
          }
        }
      }
    }

    .password-strength {
      margin-top: 10px;

      .strength-text {
        font-size: 13px;
        color: #606266;
        margin-bottom: 5px;
      }

      .strength-bar {
        height: 6px;
        background-color: #f0f0f0;
        border-radius: 3px;
        overflow: hidden;

        .strength-indicator {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 3px;

          &.very-weak {
            background-color: #f56c6c;
          }

          &.weak {
            background-color: #e6a23c;
          }

          &.medium {
            background-color: #409eff;
          }

          &.strong {
            background-color: #67c23a;
          }

          &.very-strong {
            background-color: #4caf50;
          }
        }
      }
    }

    .form-actions {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px dashed #f0f0f0;

      .submit-btn,
      .reset-btn {
        padding: 10px 24px;
        display: flex;
        align-items: center;
        transition: all 0.3s;

        .el-icon {
          margin-right: 6px;
        }

        &:hover {
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
        }
      }

      .submit-btn {
        background: linear-gradient(to right, #1890ff, #36cfc9);
        border: none;

        &:hover {
          box-shadow: 0 6px 15px rgba(24, 144, 255, 0.3);
        }
      }
    }
  }

  .password-alert {
    margin-top: 30px;
    border-radius: 8px;
    transition: all 0.3s;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    :deep(.el-alert__title) {
      font-weight: 600;
    }

    .alert-content {
      color: #e6a23c;
      margin-top: 5px;
      font-size: 13px;

      p {
        margin: 5px 0;
      }
    }
  }
}
</style>
