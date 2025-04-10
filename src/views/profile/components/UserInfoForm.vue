<template>
  <div class="user-info-form-container">
    <div class="user-card">
      <div class="avatar-section">
        <el-avatar :size="80" class="user-avatar">
          {{ formData.username?.charAt(0).toUpperCase() || "U" }}
        </el-avatar>
        <div class="avatar-info">
          <h3 class="username">{{ formData.username || "用户名" }}</h3>
          <div class="user-roles">
            <el-tag
              v-for="role in userRoles"
              :key="role.id"
              type="info"
              effect="plain"
              class="role-tag"
            >
              {{ role.name }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-label">上次登录</div>
          <div class="stat-value">
            {{ formatDateTime(userStore.userInfo?.last_login) || "未记录" }}
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">注册时间</div>
          <div class="stat-value">
            {{ formatDateTime(userStore.userInfo?.created_at) || "未记录" }}
          </div>
        </div>
      </div>
    </div>

    <el-divider content-position="left">
      <div class="divider-content">
        <el-icon><EditPen /></el-icon>
        <span class="divider-text">个人资料设置</span>
      </div>
    </el-divider>

    <el-form
      ref="userInfoFormRef"
      :model="formData"
      :rules="formRules"
      label-position="top"
      class="profile-form"
      status-icon
    >
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              class="form-input"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入邮箱"
              type="email"
              prefix-icon="Message"
              class="form-input"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="请输入手机号"
              prefix-icon="Iphone"
              class="form-input"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账户状态">
            <el-tag
              :type="userStore.userInfo?.is_active ? 'success' : 'danger'"
              class="status-tag"
            >
              {{ userStore.userInfo?.is_active ? "已激活" : "未激活" }}
            </el-tag>
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
          <el-icon><Check /></el-icon>
          保存修改
        </el-button>
        <el-button @click="handleReset" class="reset-btn">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useUserStore } from "@/store/modules/user";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { updateCurrentUser } from "@/api/user";
import type { UserInfoUpdateRequest } from "@/types/api";
import {
  User,
  Message,
  Iphone,
  EditPen,
  Check,
  RefreshRight,
} from "@element-plus/icons-vue";
import { formatDateTime } from "@/utils/format";

const userStore = useUserStore();
const userInfoFormRef = ref<FormInstance>();
const loading = ref(false);

// 表单数据，需要与 UserInfoUpdateRequest 类型对应
const formData = reactive<Partial<UserInfoUpdateRequest>>({
  username: "",
  email: "",
  phone: "",
});

// 用户角色计算属性
const userRoles = computed(() => {
  return userStore.roles || [];
});

// 表单验证规则
const formRules = reactive<FormRules>({
  username: [
    { required: true, message: "用户名不能为空", trigger: "blur" },
    { min: 2, max: 20, message: "用户名长度应为2-20个字符", trigger: "blur" },
  ],
  email: [
    {
      type: "email",
      message: "请输入有效的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入有效的手机号码",
      trigger: "blur",
    },
  ],
});

// 组件挂载时，用 Store 中的用户信息填充表单
onMounted(() => {
  if (userStore.userInfo) {
    formData.username = userStore.userInfo.username;
    formData.email = userStore.userInfo.email ?? ""; // 处理 null
    formData.phone = userStore.userInfo.phone ?? ""; // 处理 null
  } else {
    console.warn("UserInfoForm: 未能从 store 获取用户信息");
  }
});

// 处理表单提交
const handleSubmit = async () => {
  if (!userInfoFormRef.value) return;
  await userInfoFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 准备提交的数据，只包含需要更新的字段
        const updateData: UserInfoUpdateRequest = {
          username: formData.username,
          email: formData.email || null, // 如果为空字符串，转为 null
          phone: formData.phone || null, // 如果为空字符串，转为 null
        };
        await updateCurrentUser(updateData); // 调用 API 更新
        ElMessage.success("个人资料更新成功！");
        // 更新成功后，可能需要重新获取用户信息以更新 Store 和显示
        await userStore.fetchUserInfoAndPermissions();
        // 手动更新表单数据以匹配 store（如果 store 更新后有变化）
        if (userStore.userInfo) {
          formData.username = userStore.userInfo.username;
          formData.email = userStore.userInfo.email ?? "";
          formData.phone = userStore.userInfo.phone ?? "";
        }
      } catch (error) {
        console.error("用户信息更新失败:", error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 处理重置表单
const handleReset = () => {
  if (userStore.userInfo) {
    formData.username = userStore.userInfo.username;
    formData.email = userStore.userInfo.email ?? "";
    formData.phone = userStore.userInfo.phone ?? "";
    userInfoFormRef.value?.clearValidate(); // 清除校验状态
  }
};
</script>

<style lang="scss" scoped>
.user-info-form-container {
  padding: 0;

  .user-card {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    border-radius: 10px;
    background-color: #f9fafc;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

    .avatar-section {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 200px;
      margin-bottom: 16px;

      @media (min-width: 768px) {
        margin-bottom: 0;
      }

      .user-avatar {
        background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
        font-weight: bold;
        font-size: 32px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(24, 144, 255, 0.25);
        }
      }

      .avatar-info {
        margin-left: 16px;

        .username {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px;
          color: #303133;
        }

        .user-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;

          .role-tag {
            font-size: 12px;
            padding: 0 8px;
            height: 24px;
            line-height: 22px;
            border-radius: 4px;
            transition: all 0.3s;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
          }
        }
      }
    }

    .user-stats {
      display: flex;
      gap: 16px;
      margin-right: 10px;

      .stat-item {
        text-align: center;
        padding: 8px 16px;
        border-radius: 6px;
        background-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        min-width: 120px;

        .stat-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 13px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }

  .el-divider {
    margin: 20px 0;

    .divider-content {
      display: flex;
      align-items: center;

      .el-icon {
        margin-right: 8px;
        font-size: 16px;
        color: #1890ff;
      }

      .divider-text {
        font-size: 16px;
        color: #606266;
        font-weight: 500;
      }
    }
  }

  .profile-form {
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
        height: 40px;
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

    .status-tag {
      margin-top: 8px;
      padding: 4px 10px;
      font-size: 13px;
    }

    .form-actions {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px dashed #f0f0f0;

      .submit-btn,
      .reset-btn {
        padding: 8px 20px;
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
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }
      }
    }
  }
}
</style>
