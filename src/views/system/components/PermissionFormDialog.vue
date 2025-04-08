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
      label-width="120px"
      v-loading="fetchLoading"
    >
      <el-form-item label="描述(Description)" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="权限的详细描述"
          :autosize="{ minRows: 2, maxRows: 4 }"
        >
          <template #prefix>
            <el-icon><Document /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="资源类型(Resource)" prop="resource_type_id">
        <el-select
          v-model="formData.resource_type_id"
          placeholder="请选择资源类型"
          style="width: 100%"
          filterable
        >
          <template #prefix>
            <el-icon><Grid /></el-icon>
          </template>
          <el-option
            v-for="item in props.resourceTypes"
            :key="item.id"
            :label="`${item.name} (${item.code})`"
            :value="item.id"
          >
            <div class="select-option-content">
              <span>{{ item.name }}</span>
              <span class="option-code">{{ item.code }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="操作类型(Action)" prop="action_type_id">
        <el-select
          v-model="formData.action_type_id"
          placeholder="请选择操作类型"
          style="width: 100%"
          filterable
        >
          <template #prefix>
            <el-icon><Operation /></el-icon>
          </template>
          <el-option
            v-for="item in props.actionTypes"
            :key="item.id"
            :label="`${item.name} (${item.code})`"
            :value="item.id"
          >
            <div class="select-option-content">
              <span>{{ item.name }}</span>
              <span class="option-code">{{ item.code }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose" :disabled="submitLoading"
        >取 消</el-button
      >
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
  ElSelect,
  ElOption,
  ElIcon,
} from "element-plus";
import { Document, Grid, Operation } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import {
  createPermission,
  updatePermission,
  readPermission as getPermission,
} from "@/api/permission.ts"; // 导入权限 API
import type {
  Permission,
  PermissionCreateRequest,
  PermissionUpdateRequest,
  ResourceType, // 导入类型
  ActionType, // 导入类型
} from "@/types/api.ts";

// --- Props 定义 ---
const props = defineProps({
  modelValue: {
    // 对话框显示状态 (v-model)
    type: Boolean,
    required: true,
  },
  permissionId: {
    // 权限 ID，null 表示新增
    type: Number as PropType<number | null>,
    default: null,
  },
  resourceTypes: {
    // 传入所有资源类型列表
    type: Array as PropType<ResourceType[]>,
    required: true,
  },
  actionTypes: {
    // 传入所有操作类型列表
    type: Array as PropType<ActionType[]>,
    required: true,
  },
});
// --- Props 定义 End ---

// --- Emits 定义 ---
const emit = defineEmits(["update:modelValue", "success"]);
// --- Emits 定义 End ---

// --- 响应式状态 ---
const formRef = ref<FormInstance>();
const fetchLoading = ref(false); // 加载权限详情时
const submitLoading = ref(false); // 提交表单时

// 表单数据模型 (类型合并用于覆盖新增和编辑字段)
const formData = reactive<
  Partial<PermissionCreateRequest & PermissionUpdateRequest>
>({
  description: null,
  resource_type_id: undefined,
  action_type_id: undefined,
});

// --- 计算属性 ---
const isEdit = computed(() => props.permissionId !== null);
const title = computed(() => (isEdit.value ? "编辑权限" : "新增权限"));
// --- 计算属性 End ---

// --- 表单验证规则 ---
const formRules = reactive<FormRules>({
  resource_type_id: [
    { required: true, message: "请选择资源类型", trigger: "change" },
  ],
  action_type_id: [
    { required: true, message: "请选择操作类型", trigger: "change" },
  ],
});
// --- 表单验证规则 End ---

// --- 数据获取 ---
// 获取权限详情 (编辑模式下)
const fetchPermissionData = async (id: number) => {
  fetchLoading.value = true;
  console.log(`[Dialog] Fetching permission data for ID: ${id}`); // Log: Start fetching
  try {
    const permData = await getPermission(id);
    console.log("[Dialog] Fetched permission data:", JSON.stringify(permData)); // Log: Fetched data

    formData.description = permData.description;
    formData.resource_type_id = permData.resource_type?.id;
    formData.action_type_id = permData.action_type?.id;

    console.log(
      "[Dialog] formData after CORRECT assignment:",
      JSON.stringify(formData)
    ); // Log: formData state
  } catch (error) {
    console.error(`获取权限 ${id} 信息失败:`, error);
    ElMessage.error("获取权限信息失败");
    handleClose(); // 获取失败则关闭弹窗
  } finally {
    fetchLoading.value = false;
  }
};
// --- 数据获取 End ---

// --- 事件处理 ---
// 重置表单
const resetForm = () => {
  formData.description = null;
  formData.resource_type_id = undefined;
  formData.action_type_id = undefined;
  formRef.value?.clearValidate(); // 清除校验状态
};

// 对话框打开时
const handleOpen = () => {
  resetForm(); // 每次打开都重置表单
  console.log(
    "[Dialog] Opening, resourceTypes prop:",
    JSON.stringify(props.resourceTypes)
  );
  console.log(
    "[Dialog] Opening, actionTypes prop:",
    JSON.stringify(props.actionTypes)
  );
  if (isEdit.value && props.permissionId) {
    fetchPermissionData(props.permissionId); // 编辑模式下加载数据
  }
  // 资源类型和操作类型列表由父组件传入 props
};

// 关闭对话框
const handleClose = () => {
  if (props.modelValue) {
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
        const dataToSubmit = {
          description: formData.description,
          resource_type_id: formData.resource_type_id,
          action_type_id: formData.action_type_id,
        };

        if (
          dataToSubmit.resource_type_id === undefined ||
          dataToSubmit.action_type_id === undefined
        ) {
          ElMessage.error("资源类型和操作类型不能为空");
          submitLoading.value = false;
          return;
        }

        if (isEdit.value && props.permissionId) {
          // 编辑模式
          await updatePermission(
            props.permissionId,
            dataToSubmit as PermissionUpdateRequest
          );
          ElMessage.success("权限更新成功！");
        } else {
          // 新增模式
          await createPermission(dataToSubmit as PermissionCreateRequest);
          ElMessage.success("权限新增成功！");
        }
        emit("success"); // 触发成功事件
        handleClose(); // 关闭对话框
      } catch (error) {
        console.error("提交权限表单失败:", error);
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

<style scoped lang="scss">
.select-option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .option-code {
    color: #909399;
    font-size: 0.9em;
    margin-left: 8px;
  }
}

/* 为表单项增加过渡效果 */
:deep(.el-form-item) {
  transition: all 0.3s ease;
  margin-bottom: 24px;

  .el-form-item__label {
    font-weight: 500;
    color: #303133;
  }

  .el-input__prefix {
    color: #909399;
  }

  .el-input__inner:focus,
  .el-textarea__inner:focus {
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
}

/* 对话框样式增强 */
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;

  .el-dialog__header {
    background-color: #f9f9f9;
    padding: 16px 20px;
    margin-right: 0;
    border-bottom: 1px solid #eee;
  }

  .el-dialog__title {
    font-weight: 600;
    color: #303133;
    font-size: 16px;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 20px;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
  }
}

/* 提高悬停和交互状态的视觉反馈 */
:deep(.el-select:hover .el-input__wrapper),
:deep(.el-input:hover .el-input__wrapper),
:deep(.el-textarea:hover .el-textarea__inner) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

/* 输入框获得焦点状态增强 */
:deep(.el-input.is-focus .el-input__wrapper),
:deep(.el-textarea.is-focus .el-textarea__inner) {
  box-shadow: 0 0 0 1px #3498db inset !important;
}
</style>
