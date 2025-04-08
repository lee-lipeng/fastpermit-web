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
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
        />
      </el-form-item>
      <el-form-item label="默认角色" prop="is_default">
        <el-switch
            v-model="formData.is_default"
            inline-prompt
            active-text="是"
            inactive-text="否"
        />
        <el-tooltip content="默认角色会自动分配给新注册用户，且不能被删除" placement="top">
          <el-icon style="margin-left: 4px; cursor: pointer;"><InfoFilled /></el-icon>
        </el-tooltip>
      </el-form-item>
      <!-- 注意：权限分配不在此表单处理 -->
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
import { ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElSwitch, ElTooltip, ElIcon } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue'; // 导入图标
import type { FormInstance, FormRules } from 'element-plus';
import { getRole, createRole, updateRole } from '@/api/role'; // 导入角色 API
import type { RoleCreateRequest, RoleUpdateRequest, RoleInfo } from '@/types/api'; // 导入类型

const props = defineProps({
  modelValue: Boolean,
  roleId: {
    type: Number as PropType<number | null>,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'success']);

const formRef = ref<FormInstance>();
const fetchLoading = ref(false);
const submitLoading = ref(false);

// 表单数据
const formData = reactive<Partial<RoleCreateRequest & RoleUpdateRequest>>({
  name: '',
  description: null,
  is_default: false,
});

const isEdit = computed(() => props.roleId !== null);
const title = computed(() => (isEdit.value ? '编辑角色' : '新增角色'));

// 表单验证规则
const formRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
});

// --- 数据获取 ---
const fetchRoleData = async (id: number) => {
  fetchLoading.value = true;
  try {
    // 假设 RoleInfo 包含 description 和 is_default
    const roleData = await getRole(id);
    formData.name = roleData.name;
    formData.description = roleData.description;
    formData.is_default = roleData.is_default;
  } catch (error) {
    console.error(`获取角色 ${id} 信息失败:`, error);
    ElMessage.error('获取角色信息失败');
    handleClose();
  } finally {
    fetchLoading.value = false;
  }
}

// --- 事件处理 ---
const resetForm = () => {
  formData.name = '';
  formData.description = null;
  formData.is_default = false;
  formRef.value?.clearValidate();
};

const handleOpen = () => {
  resetForm();
  if (isEdit.value && props.roleId) {
    fetchRoleData(props.roleId);
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
        const dataToSubmit = { ...formData }; // 包含 name, description, is_default

        if (isEdit.value && props.roleId) {
          await updateRole(props.roleId, dataToSubmit as RoleUpdateRequest);
          ElMessage.success('角色更新成功！');
        } else {
          // 新增模式，权限 ID 列表为空，因为权限不在这里分配
          await createRole(dataToSubmit as RoleCreateRequest);
          ElMessage.success('角色新增成功！');
        }
        emit('success');
        handleClose();
      } catch (error) {
        console.error('提交角色表单失败:', error);
      } finally {
        submitLoading.value = false;
      }
    } else {
      console.log('表单验证失败');
    }
  });
};

</script>
