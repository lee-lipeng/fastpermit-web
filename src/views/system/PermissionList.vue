<template>
  <div class="permission-list-container">
    <el-card shadow="hover" class="filter-card">
      <!-- 筛选区域 -->
      <el-form
        :inline="true"
        :model="filters"
        @submit.prevent="handleSearch"
        class="filter-form"
      >
        <el-form-item label="资源类型" class="filter-item">
          <el-select
            v-model="filters.resource_type_id"
            placeholder="全部资源类型"
            clearable
            @change="handleSearch"
            style="width: 200px"
            filterable
          >
            <template #prefix>
              <el-icon><Grid /></el-icon>
            </template>
            <el-option
              v-for="item in resourceTypes"
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
        <el-form-item label="操作类型" class="filter-item">
          <el-select
            v-model="filters.action_type_id"
            placeholder="全部操作类型"
            clearable
            @change="handleSearch"
            style="width: 200px"
            filterable
          >
            <template #prefix>
              <el-icon><Operation /></el-icon>
            </template>
            <el-option
              v-for="item in actionTypes"
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
        <el-form-item class="filter-buttons">
          <el-button
            type="primary"
            :icon="Search"
            @click="handleSearch"
            :loading="loading"
          >
            查询
          </el-button>
          <el-button :icon="Refresh" @click="handleResetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          v-if="userStore.hasPermission('permission:create')"
          type="success"
          :icon="Plus"
          @click="handleCreate"
          class="create-button"
        >
          新增权限
        </el-button>
      </div>

      <!-- 权限表格 -->
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
        <el-table-column
          prop="name"
          label="权限标识"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="scope">
            <el-tag size="small" type="info">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column label="资源类型" min-width="120" show-overflow-tooltip>
          <template #default="scope">
            <el-tag
              size="small"
              type="success"
              effect="light"
              v-if="scope.row.resource_type"
            >
              {{ scope.row.resource_type.name }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作类型" min-width="120" show-overflow-tooltip>
          <template #default="scope">
            <el-tag
              size="small"
              type="warning"
              effect="light"
              v-if="scope.row.action_type"
            >
              {{ scope.row.action_type.name }}
            </el-tag>
            <span v-else>-</span>
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
              v-if="userStore.hasPermission('permission:update')"
              type="primary"
              size="small"
              :icon="Edit"
              @click.stop="handleEdit(scope.row)"
              class="operation-button"
            >
              编辑
            </el-button>
            <el-popconfirm
              v-if="userStore.hasPermission('permission:delete')"
              title="确定要删除该权限吗?"
              @confirm="handleDelete(scope.row.id)"
              confirm-button-text="确认"
              cancel-button-text="取消"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  class="operation-button"
                  @click.stop
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 新增/编辑权限 对话框 -->
    <PermissionFormDialog
      v-model="dialogVisible"
      :permission-id="selectedPermissionId"
      :resource-types="resourceTypes"
      :action-types="actionTypes"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Search, Refresh, Plus, Edit, Delete } from "@element-plus/icons-vue";
import { Grid, Operation } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/modules/user";
import {
  getPaginatedPermissions,
  deletePermission,
  getResourceTypes,
  getActionTypes,
} from "@/api/permission";
import type {
  Permission,
  PermissionListRequestParams,
  ResourceType,
  ActionType,
} from "@/types/api";
import PermissionFormDialog from "./components/PermissionFormDialog.vue";
import { formatDateTime } from "@/utils/format";

const userStore = useUserStore();
const loading = ref(false);
const tableData = ref<Permission[]>([]);
const total = ref(0);

const currentPage = ref(1);
const pageSize = ref(20);

const filters = reactive({
  resource_type_id: undefined as number | undefined,
  action_type_id: undefined as number | undefined,
});

const getParams = (): PermissionListRequestParams => {
  return {
    ...filters,
    page: currentPage.value,
    limit: pageSize.value,
  };
};

const dialogVisible = ref(false);
const selectedPermissionId = ref<number | null>(null);

const resourceTypes = ref<ResourceType[]>([]);
const actionTypes = ref<ActionType[]>([]);

const fetchPermissions = async () => {
  loading.value = true;
  try {
    const response = await getPaginatedPermissions(getParams());
    tableData.value = response.items;
    total.value = response.total;
  } catch (error) {
    console.error("获取权限列表失败:", error);
    ElMessage.error("获取权限列表失败");
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const fetchResourceTypes = async () => {
  try {
    resourceTypes.value = await getResourceTypes();
  } catch (error) {
    console.error("获取资源类型列表失败:", error);
    resourceTypes.value = [];
  }
};

const fetchActionTypes = async () => {
  try {
    actionTypes.value = await getActionTypes();
  } catch (error) {
    console.error("获取操作类型列表失败:", error);
    actionTypes.value = [];
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchPermissions();
};

const handleResetSearch = () => {
  filters.resource_type_id = undefined;
  filters.action_type_id = undefined;
  currentPage.value = 1;
  fetchPermissions();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchPermissions();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchPermissions();
};

const handleCreate = () => {
  selectedPermissionId.value = null;
  dialogVisible.value = true;
};

const handleEdit = (row: Permission) => {
  selectedPermissionId.value = row.id;
  dialogVisible.value = true;
};

const handleDelete = async (id: number) => {
  try {
    await deletePermission(id);
    ElMessage.success("权限删除成功！");
    if (tableData.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }
    fetchPermissions();
  } catch (error) {
    console.error("删除权限失败:", error);
  }
};

const handleFormSuccess = () => {
  dialogVisible.value = false;
  fetchPermissions();
};

const handleRowClick = (row: Permission) => {
  console.log("Row clicked:", row);
};

const dateTimeFormatter = (
  row: any,
  column: any,
  cellValue: string | null | undefined
) => {
  return formatDateTime(cellValue);
};

onMounted(async () => {
  await Promise.all([fetchResourceTypes(), fetchActionTypes()]);
  fetchPermissions();
});
</script>

<style scoped lang="scss">
.permission-list-container {
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

  :deep(.el-select) {
    .el-input__wrapper {
      transition: all 0.3s;
    }

    &:hover .el-input__wrapper {
      box-shadow: 0 0 0 1px #dcdfe6 inset;
    }
  }

  :deep(.el-button) {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;

  :deep(.el-pagination) {
    padding: 0;
    margin: 0;

    .el-pagination__sizes,
    .el-pagination__jump {
      margin-left: 16px;
    }
  }
}

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
