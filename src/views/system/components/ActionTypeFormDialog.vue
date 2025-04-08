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
          placeholder="请输入唯一代码，如 list, create"
          :disabled="isSystemBuiltIn"
        />
      </el-form-item>
      <el-form-item label="名称(Name)" prop="name">
        <el-input v-model="formData.name" placeholder="请输入操作类型名称，如 查看, 创建" />
      </el-form-item>
      <!-- is_system 一般不允许用户修改 -->
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
import { ref, reactive, computed, watch } from 'vue';
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
// 假设需要 getActionType(id) API 用于编辑时获取详情
import { createActionType, updateActionType, getActionTypes } from '@/api/permission.ts';
import type {
  ActionTypeCreateRequest,
  ActionTypeUpdateRequest,
} from '@/types/api.ts';

// --- Props 定义 ---
const props = defineProps({
  modelValue: Boolean,
  actionTypeId: {
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
const fetchLoading = ref(false);
const submitLoading = ref(false);
const isSystemBuiltIn = ref(false);

const formData = reactive<Partial<ActionTypeCreateRequest & ActionTypeUpdateRequest>>({
  code: '',
  name: '',
});

// --- 计算属性 ---
const isEdit = computed(() => props.actionTypeId !== null);
const title = computed(() => (isEdit.value ? '编辑操作类型' : '新增操作类型'));
// --- 计算属性 End ---

// --- 表单验证规则 ---
const formRules = reactive<FormRules>({
  code: [{ required: true, message: '请输入操作类型代码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入操作类型名称', trigger: 'blur' }],
});
// --- 表单验证规则 End ---

// --- 数据获取 ---
const fetchActionTypeData = async (id: number) => {
  fetchLoading.value = true;
  try {
    // 同样，假设通过列表查找或需要 getActionType API
    const allTypes = await getActionTypes();
    const typeData = allTypes.find(t => t.id === id);
    if (typeData) {
      formData.code = typeData.code;
      formData.name = typeData.name;
      isSystemBuiltIn.value = typeData.is_system;
    } else {
      throw new Error('Action type not found in list');
    }
  } catch (error) {
    console.error(`获取操作类型 ${id} 信息失败:`, error);
    ElMessage.error('获取操作类型信息失败');
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
  isSystemBuiltIn.value = false;
  formRef.value?.clearValidate();
};

const handleOpen = () => {
  resetForm();
  if (isEdit.value && props.actionTypeId) {
    fetchActionTypeData(props.actionTypeId);
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
        const dataToSubmit: Partial<ActionTypeUpdateRequest & ActionTypeCreateRequest> = {
             name: formData.name,
        };
         if (!isSystemBuiltIn.value) {
            dataToSubmit.code = formData.code;
         }

        if (isEdit.value && props.actionTypeId) {
          if (isSystemBuiltIn.value) {
              delete dataToSubmit.code;
          }
          await updateActionType(props.actionTypeId, dataToSubmit as ActionTypeUpdateRequest);
          ElMessage.success('操作类型更新成功！');
        } else {
           if (!dataToSubmit.code) {
              ElMessage.error('操作类型代码不能为空');
              submitLoading.value = false;
              return;
          }
          await createActionType(dataToSubmit as ActionTypeCreateRequest);
          ElMessage.success('操作类型新增成功！');
        }
        emit('success');
        handleClose();
      } catch (error) {
        console.error('提交操作类型表单失败:', error);
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
