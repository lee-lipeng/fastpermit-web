<template>
  <el-dialog
    :title="title"
    :model-value="modelValue"
    @update:modelValue="handleClose"
    width="600px"
    :close-on-click-modal="false"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="fetchLoading"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          :placeholder="isEdit ? '留空则不修改密码' : '请输入初始密码'"
          show-password
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="状态" prop="is_active">
        <el-switch
          v-model="formData.is_active"
          inline-prompt
          active-text="激活"
          inactive-text="禁用"
        />
      </el-form-item>
      <el-form-item label="分配角色" prop="role_ids">
        <el-select
          v-model="formData.role_ids"
          multiple
          filterable
          placeholder="请选择用户角色"
          style="width: 100%"
        >
          <el-option
            v-for="role in allRoles"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import type { PropType } from "vue";
import {
  ElMessage,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElSwitch,
  ElSelect,
  ElOption,
} from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getAllRoles } from "@/api/role"; // 导入获取角色 API
import { getUser, createUser, updateUser, getUserRoles } from "@/api/user"; // 导入用户相关 API
import type {
  RoleInfo,
  UserCreateRequest,
  UserUpdateRequest,
  UserInfo,
} from "@/types/api"; // 导入所需类型

const props = defineProps({
  modelValue: {
    // for v-model
    type: Boolean,
    required: true,
  },
  userId: {
    // 用户 ID，null 表示新增
    type: Number as PropType<number | null>,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "success"]);

const formRef = ref<FormInstance>();
const fetchLoading = ref(false); // 加载用户/角色数据
const submitLoading = ref(false); // 提交表单
const allRoles = ref<RoleInfo[]>([]); // 所有可用角色列表

// 表单数据
const formData = reactive<Partial<UserCreateRequest & UserUpdateRequest>>({
  // 合并类型以覆盖所有字段
  username: "",
  password: "",
  email: null,
  phone: null,
  is_active: true,
  role_ids: [],
});

const isEdit = computed(() => props.userId !== null);
const title = computed(() => (isEdit.value ? "编辑用户" : "新增用户"));

// --- 表单验证规则 ---
const validatePassword = (rule: any, value: any, callback: any) => {
  if (!isEdit.value && !value) {
    // 新增模式下密码必填
    callback(new Error("请输入初始密码"));
  } else if (value && value.length < 6) {
    // 如果输入了密码，检查长度 (与后端对应)
    callback(new Error("密码长度不能少于6位"));
  } else {
    callback();
  }
};

const formRules = reactive<FormRules>({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ validator: validatePassword, trigger: "blur" }],
  email: [
    {
      type: "email",
      message: "请输入有效的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  // 可添加手机号格式验证
});
// --- 表单验证规则 End ---

// --- 数据获取 ---
const fetchAllRoles = async () => {
  try {
    const roles = await getAllRoles();
    allRoles.value = roles;
  } catch (error) {
    console.error("获取角色列表失败:", error);
    allRoles.value = []; // 出错时清空
  }
};

const fetchUserData = async (id: number) => {
  fetchLoading.value = true;
  try {
    const [userData, userRoleIds] = await Promise.all([
      getUser(id),
      getUserRoles(id), // 获取用户当前的角色 ID 列表
    ]);
    // 填充表单
    formData.username = userData.username;
    formData.email = userData.email;
    formData.phone = userData.phone;
    formData.is_active = userData.is_active;
    formData.role_ids = userRoleIds;
    formData.password = ""; // 编辑时不显示旧密码，留空表示不修改
  } catch (error) {
    console.error(`获取用户 ${id} 信息失败:`, error);
    ElMessage.error("获取用户信息失败");
    handleClose(); // 获取失败则关闭弹窗
  } finally {
    fetchLoading.value = false;
  }
};

// --- 数据获取 End ---

// --- 事件处理 ---
const resetForm = () => {
  formData.username = "";
  formData.password = "";
  formData.email = null;
  formData.phone = null;
  formData.is_active = true;
  formData.role_ids = [];
  formRef.value?.clearValidate(); // 清除校验状态
};

// 对话框打开时的处理
const handleOpen = async () => {
  resetForm(); // 先重置表单
  await fetchAllRoles(); // 获取最新的角色列表
  if (isEdit.value && props.userId) {
    await fetchUserData(props.userId);
  }
};

// 关闭对话框
const handleClose = () => {
  if (props.modelValue) {
    // 只有在 modelValue 为 true 时才触发关闭
    emit("update:modelValue", false);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        // 准备提交数据，移除 password (如果为空且是编辑模式)
        const dataToSubmit = { ...formData };
        if (isEdit.value && !dataToSubmit.password) {
          delete dataToSubmit.password;
        }

        if (isEdit.value && props.userId) {
          // 编辑模式
          await updateUser(props.userId, dataToSubmit as UserUpdateRequest);
          ElMessage.success("用户更新成功！");
        } else {
          // 新增模式
          await createUser(dataToSubmit as UserCreateRequest);
          ElMessage.success("用户新增成功！");
        }
        emit("success"); // 触发成功事件，通知父组件刷新列表
        handleClose(); // 关闭对话框
      } catch (error) {
        console.error("提交用户表单失败:", error);
        // 错误消息由拦截器处理
      } finally {
        submitLoading.value = false;
      }
    } else {
      console.log("表单验证失败");
    }
  });
};
// --- 事件处理 End ---
</script>

<style scoped>
/* 可以为对话框添加一些样式 */
</style>
