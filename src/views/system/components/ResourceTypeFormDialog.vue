<template>
  <el-dialog
    :title="title"
    :model-value="modelValue"
    @update:modelValue="handleClose"
    width="500px"
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
      <el-form-item label="代码(Code)" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入唯一代码，如 user"
          :disabled="isSystemBuiltIn"
        />
      </el-form-item>
      <el-form-item label="名称(Name)" prop="name">
        <el-input v-model="formData.name" placeholder="请输入资源类型名称，如 用户" />
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
import { ref, reactive, computed } from 'vue';
import type { PropType } from 'vue';
import {
  ElMessage,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
} from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
// 在编辑时通过父组件传入的列表或重新请求列表来获取详情
import { createResourceType, updateResourceType, getResourceTypes } from '@/api/permission.ts';
import type {
  ResourceTypeCreateRequest,
  ResourceTypeUpdateRequest,
} from '@/types/api.ts';

// --- Props 定义 ---
const props = defineProps({
  modelValue: Boolean,
  resourceTypeId: { // 资源类型 ID，null 表示新增
    type: Number as PropType<number | null>,
    default: null,
  },
});
// --- Props 定义 End ---

// --- Emits 定义 ---
const emit = defineEmits(['update:modelValue', 'success']);
// --- Emits 定义 End ---

// --- 响应式状态 ---
const formRef = ref<FormInstance>();
const fetchLoading = ref(false); // 加载详情时 (如果需要)
const submitLoading = ref(false);
const isSystemBuiltIn = ref(false); // 标记是否为系统内置

// 表单数据模型
const formData = reactive<Partial<ResourceTypeCreateRequest & ResourceTypeUpdateRequest>>({
  code: '',
  name: '',
  // is_system: false, // 通常不由用户控制
});

// --- 计算属性 ---
const isEdit = computed(() => props.resourceTypeId !== null);
const title = computed(() => (isEdit.value ? '编辑资源类型' : '新增资源类型'));
// --- 计算属性 End ---

// --- 表单验证规则 ---
const formRules = reactive<FormRules>({
  code: [{ required: true, message: '请输入资源类型代码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入资源类型名称', trigger: 'blur' }],
});
// --- 表单验证规则 End ---

// --- 数据获取 ---
// 模拟获取资源类型详情 (实际可能需要 getResourceTypeById API)
const fetchResourceTypeData = async (id: number) => {
  fetchLoading.value = true;
  try {
    // 方案1: 重新请求列表并查找 (如果列表不大)
    const allTypes = await getResourceTypes();
    const typeData = allTypes.find(t => t.id === id);
    if (typeData) {
      formData.code = typeData.code;
      formData.name = typeData.name;
      isSystemBuiltIn.value = typeData.is_system; // 记录是否系统内置
    } else {
      throw new Error('Resource type not found in list');
    }
    // 方案2: 调用 getResourceType(id) API (如果后端提供)
    // const typeData = await getResourceType(id);
    // formData.code = typeData.code;
    // formData.name = typeData.name;
    // isSystemBuiltIn.value = typeData.is_system;

  } catch (error) {
    console.error(`获取资源类型 ${id} 信息失败:`, error);
    ElMessage.error('获取资源类型信息失败');
    handleClose();
  } finally {
    fetchLoading.value = false;
  }
};
// --- 数据获取 End ---

// --- 事件处理 ---
const resetForm = () => {
  formData.code = '';
  formData.name = '';
  isSystemBuiltIn.value = false; // 重置系统内置标记
  formRef.value?.clearValidate();
};

const handleOpen = () => {
  resetForm();
  if (isEdit.value && props.resourceTypeId) {
    fetchResourceTypeData(props.resourceTypeId);
  }
};

const handleClose = () => {
  if (props.modelValue) {
    emit('update:modelValue', false);
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        const dataToSubmit: Partial<ResourceTypeUpdateRequest & ResourceTypeCreateRequest> = {
            name: formData.name,
        };
        // 只有在非系统内置的情况下才允许提交 code
        if (!isSystemBuiltIn.value) {
            dataToSubmit.code = formData.code;
        }

        if (isEdit.value && props.resourceTypeId) {
          // 编辑模式
          // 如果是系统内置，不允许修改 code
          if (isSystemBuiltIn.value) {
            delete dataToSubmit.code; // 确保不提交 code
          }
          await updateResourceType(props.resourceTypeId, dataToSubmit as ResourceTypeUpdateRequest);
          ElMessage.success('资源类型更新成功！');
        } else {
          // 新增模式 (code 必填)
          if (!dataToSubmit.code) {
              ElMessage.error('资源类型代码不能为空');
              submitLoading.value = false;
              return;
          }
          await createResourceType(dataToSubmit as ResourceTypeCreateRequest);
          ElMessage.success('资源类型新增成功！');
        }
        emit('success');
        handleClose();
      } catch (error) {
        console.error('提交资源类型表单失败:', error);
      } finally {
        submitLoading.value = false;
      }
    } else {
      console.log('表单验证失败');
    }
  });
};
// --- 事件处理 End ---
</script>

<style scoped>
</style>
