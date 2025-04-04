<template>
  <el-form
    ref="userInfoFormRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    style="max-width: 600px"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="formData.username" placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="formData.email"
        placeholder="请输入邮箱"
        type="email"
      />
    </el-form-item>
    <el-form-item label="手机号" prop="phone">
      <el-input v-model="formData.phone" placeholder="请输入手机号" />
    </el-form-item>
    <!-- is_active 通常不由用户自己修改 -->
    <!-- <el-form-item label="状态" prop="is_active">
        <el-switch v-model="formData.is_active" />
     </el-form-item> -->
    <!-- 角色通常在角色管理或用户管理中分配 -->
    <!-- <el-form-item label="角色" prop="role_ids"> ... </el-form-item> -->
    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="loading"
        >保存修改</el-button
      >
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "@/store/modules/user";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { updateCurrentUser } from "@/api/user";
import type { UserInfoUpdateRequest } from "@/types/api";

const userStore = useUserStore();
const userInfoFormRef = ref<FormInstance>();
const loading = ref(false);

// 表单数据，需要与 UserInfoUpdateRequest 类型对应
const formData = reactive<Partial<UserInfoUpdateRequest>>({
  username: "",
  email: "",
  phone: "",
  // is_active: true, // 通常不在此处修改
  // role_ids: []      // 通常不在此处修改
});

// 表单验证规则
const formRules = reactive<FormRules>({
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  email: [
    {
      type: "email",
      message: "请输入有效的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  // 可以添加手机号格式验证
});

// 组件挂载时，用 Store 中的用户信息填充表单
onMounted(() => {
  if (userStore.userInfo) {
    formData.username = userStore.userInfo.username;
    formData.email = userStore.userInfo.email ?? ""; // 处理 null
    formData.phone = userStore.userInfo.phone ?? ""; // 处理 null
    // formData.is_active = userStore.userInfo.is_active;
    // 如果需要显示角色，可以在这里处理 userStore.roles
  } else {
    // 如果 store 中没有用户信息，可能需要重新获取或提示错误
    console.warn("UserInfoForm: 未能从 store 获取用户信息");
    // userStore.fetchUserInfoAndPermissions(); // 尝试重新获取
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
          // is_active 和 role_ids 通常不由用户在此处修改
        };
        console.log("准备更新用户信息:", updateData);
        await updateCurrentUser(updateData); // 调用 API 更新
        ElMessage.success("用户信息更新成功！");
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
        // 错误消息应由 request 拦截器处理
      } finally {
        loading.value = false;
      }
    } else {
      console.log("表单验证失败");
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
