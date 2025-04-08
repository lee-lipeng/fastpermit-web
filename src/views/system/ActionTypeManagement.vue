<template>
  <div class="action-type-management-container">
    <el-card shadow="hover" class="filter-card">
      <!-- 筛选区域 -->
      <el-form
        :inline="true"
        :model="listQuery"
        @submit.prevent="handleSearch"
        class="filter-form"
      >
        <el-form-item label="代码" class="filter-item">
          <el-input
            v-model="listQuery.code"
            placeholder="请输入代码"
            clearable
            @keyup.enter="handleSearch"
            class="filter-input"
          >
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="名称" class="filter-item">
          <el-input
            v-model="listQuery.name"
            placeholder="请输入名称"
            clearable
            @keyup.enter="handleSearch"
            class="filter-input"
          >
            <template #prefix>
              <el-icon><Edit /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="filter-buttons">
          <el-button
            type="primary"
            :icon="Search"
            @click="handleSearch"
            :loading="loading"
            class="filter-button"
          >
            查询
          </el-button>
          <el-button
            :icon="Refresh"
            @click="handleResetSearch"
            class="filter-button"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          v-if="userStore.hasPermission('action_type:create')"
          type="success"
          :icon="Plus"
          @click="handleCreate"
          class="create-button"
        >
          新增操作类型
        </el-button>
      </div>

      <!-- 操作类型表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        row-key="id"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="code" label="代码" min-width="150">
          <template #default="scope">
            <el-tag size="small" effect="plain" type="warning">{{
              scope.row.code
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column
          prop="is_system"
          label="系统内置"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.is_system ? 'success' : 'info'"
              size="small"
              effect="light"
            >
              {{ scope.row.is_system ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          label="创建时间"
          min-width="160"
          :formatter="dateTimeFormatter"
        />
        <el-table-column
          prop="updated_at"
          label="更新时间"
          min-width="160"
          :formatter="dateTimeFormatter"
        />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button
              v-if="userStore.hasPermission('action_type:update')"
              type="primary"
              size="small"
              :icon="Edit"
              @click.stop="handleEdit(scope.row)"
              class="operation-button"
            >
              编辑
            </el-button>
            <el-popconfirm
              v-if="
                userStore.hasPermission('action_type:delete') &&
                !scope.row.is_system
              "
              title="确定要删除该操作类型吗? 这可能会影响关联的权限。"
              @confirm="handleDelete(scope.row.id)"
              confirm-button-text="确认"
              cancel-button-text="取消"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  :loading="deleteLoading[scope.row.id]"
                  @click.stop
                  class="operation-button"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
            <el-tooltip
              v-else-if="scope.row.is_system"
              content="系统内置类型不能删除"
              placement="top"
            >
              <span>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  disabled
                  class="operation-button"
                >
                  删除
                </el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑操作类型 对话框 -->
    <ActionTypeFormDialog
      v-model="dialogVisible"
      :action-type-id="selectedActionTypeId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElPopconfirm, ElTag, ElTooltip } from "element-plus";
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Document,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/modules/user";
import { getActionTypes, deleteActionType } from "@/api/permission";
import type { ActionType } from "@/types/api";
import ActionTypeFormDialog from "./components/ActionTypeFormDialog.vue";
import { formatDateTime } from "@/utils/format";

const userStore = useUserStore();
const loading = ref(false);
const tableData = ref<ActionType[]>([]);
const deleteLoading = reactive<Record<number, boolean>>({});

// 筛选参数
const listQuery = reactive({
  code: "",
  name: "",
});

// --- 对话框状态 ---
const dialogVisible = ref(false);
const selectedActionTypeId = ref<number | null>(null);
// --- 对话框状态 End ---

// --- 日期格式化辅助函数 ---
const dateTimeFormatter = (
  row: ActionType,
  column: any,
  cellValue: string | null | undefined
): string => {
  return formatDateTime(cellValue);
};
// --- 日期格式化辅助函数 End ---

// 获取操作类型列表
const fetchActionTypes = async () => {
  loading.value = true;
  try {
    // 获取全部操作类型列表
    let allTypes = await getActionTypes();
    // 前端筛选逻辑
    if (listQuery.code) {
      allTypes = allTypes.filter((t) =>
        t.code.toLowerCase().includes(listQuery.code.toLowerCase())
      );
    }
    if (listQuery.name) {
      allTypes = allTypes.filter((t) =>
        t.name.toLowerCase().includes(listQuery.name.toLowerCase())
      );
    }
    tableData.value = allTypes;
  } catch (error) {
    console.error("获取操作类型列表失败:", error);
    ElMessage.error("获取操作类型列表失败");
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  fetchActionTypes();
};

// 处理重置搜索
const handleResetSearch = () => {
  listQuery.code = "";
  listQuery.name = "";
  fetchActionTypes();
};

// 处理新增按钮点击
const handleCreate = () => {
  selectedActionTypeId.value = null;
  dialogVisible.value = true;
};

// 处理编辑按钮点击
const handleEdit = (row: ActionType) => {
  selectedActionTypeId.value = row.id;
  dialogVisible.value = true;
};

// 处理删除按钮点击
const handleDelete = async (actionTypeId: number) => {
  deleteLoading[actionTypeId] = true;
  try {
    await deleteActionType(actionTypeId);
    ElMessage.success("操作类型删除成功！");
    fetchActionTypes(); // 重新加载列表
  } catch (error) {
    console.error("删除操作类型失败:", error);
    // 错误消息由拦截器处理
  } finally {
    delete deleteLoading[actionTypeId];
  }
};

// 行点击事件
const handleRowClick = (row: ActionType) => {
  console.log("Row clicked:", row);
  // 可以在这里实现点击行查看详情等功能
};

// 处理表单成功提交事件
const handleFormSuccess = () => {
  dialogVisible.value = false;
  fetchActionTypes(); // 刷新列表
};

// 组件挂载时加载初始数据
onMounted(() => {
  fetchActionTypes();
});
</script>

<style scoped lang="scss">
.action-type-management-container {
  padding: 20px;
}

.filter-card,
.table-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;

  .filter-item {
    margin-bottom: 0;
  }

  .filter-buttons {
    margin-left: auto;
    margin-bottom: 0;
  }

  .filter-input {
    width: 220px;
    transition: all 0.3s;

    &:focus {
      width: 260px;
    }
  }

  .filter-button {
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

.table-card {
  .action-buttons {
    margin-bottom: 15px;

    .create-button {
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }

  :deep(.el-table) {
    border-radius: 6px;
    overflow: hidden;

    .el-table__header-wrapper {
      th {
        font-weight: 600;
        transition: background-color 0.3s;
      }
    }

    .el-table__row {
      transition: background-color 0.3s;
      cursor: pointer;

      &:hover > td {
        background-color: #f0f9ff !important;
      }

      &.current-row > td {
        background-color: #ecf5ff !important;
      }

      .operation-button {
        padding: 4px 12px;
        margin: 0 3px;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-1px);
        }
      }
    }

    .el-tag {
      transition: all 0.3s;

      &:hover {
        transform: translateY(-1px);
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .filter-form {
    .filter-buttons {
      margin-left: 0;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      gap: 10px;
    }
  }
}
</style>
