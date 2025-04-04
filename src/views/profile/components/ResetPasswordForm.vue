<template>
  <el-form
    ref="resetPwdFormRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    style="max-width: 600px"
  >
    <el-form-item label="旧密码" prop="old_password">
      <el-input
        type="password"
        v-model="formData.old_password"
        placeholder="请输入旧密码"
        show-password
      />
    </el-form-item>
    <el-form-item label="新密码" prop="new_password">
      <el-input
        type="password"
        v-model="formData.new_password"
        placeholder="请输入新密码"
        show-password
      />
    </el-form-item>
    <el-form-item label="确认新密码" prop="confirm_password">
      <el-input
        type="password"
        v-model="formData.confirm_password"
        placeholder="请再次输入新密码"
        show-password
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="loading"
        >确认修改</el-button
      >
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { resetPassword } from "@/api/auth";
import { useUserStore } from "@/store/modules/user";
import { useRouter } from "vue-router";

const resetPwdFormRef = ref<FormInstance>();
const loading = ref(false);
const userStore = useUserStore();
const router = useRouter();

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

// 表单验证规则
const formRules = reactive<FormRules>({
  old_password: [
    { required: true, message: "旧密码不能为空", trigger: "blur" },
  ],
  new_password: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" }, // 根据实际需求调整
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
  resetPwdFormRef.value?.resetFields();
};
</script>
