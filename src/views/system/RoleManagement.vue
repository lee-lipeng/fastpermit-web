<template>
  <div class="role-management-container">
    <el-card shadow="hover" class="table-card">
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          v-if="userStore.hasPermission('role:create')"
          type="success"
          :icon="Plus"
          @click="handleCreate"
          class="create-button"
        >
          新增角色
        </el-button>
      </div>

      <!-- 角色表格 -->
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
        <el-table-column prop="name" label="角色名称" min-width="150">
          <template #default="scope">
            <el-tag size="small" effect="plain" type="primary">{{
              scope.row.name
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column
          prop="is_default"
          label="默认角色"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.is_default ? 'success' : 'info'"
              size="small"
              effect="light"
            >
              {{ scope.row.is_default ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 时间列 -->
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
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button
              v-if="userStore.hasPermission('role:update')"
              type="primary"
              size="small"
              :icon="Edit"
              @click.stop="handleEdit(scope.row)"
              class="operation-button"
            >
              编辑
            </el-button>
            <el-button
              v-if="userStore.hasPermission('role:update')"
              type="warning"
              size="small"
              :icon="Key"
              @click.stop="handleAssignPermissions(scope.row)"
              class="operation-button"
            >
              分配权限
            </el-button>
            <!-- 默认角色不能删除 -->
            <el-popconfirm
              v-if="
                userStore.hasPermission('role:delete') && !scope.row.is_default
              "
              title="确定要删除该角色吗?"
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
              v-else-if="
                userStore.hasPermission('role:delete') && scope.row.is_default
              "
              content="默认角色不能删除"
              placement="top"
            >
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                disabled
                class="operation-button"
              >
                删除
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑角色 对话框 -->
    <RoleFormDialog
      v-model="dialogVisible"
      :role-id="selectedRoleId"
      @success="handleFormSuccess"
    />
    <!-- 分配权限 对话框 -->
    <AssignPermissionDialog
      v-model="permissionDialogVisible"
      :role-id="selectedRoleId"
      @success="handlePermissionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElPopconfirm, ElTag, ElTooltip } from "element-plus";
import { Plus, Edit, Delete, Key } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/modules/user";
import { getAllRoles, deleteRole } from "@/api/role";
import type { RoleInfo } from "@/types/api";
import RoleFormDialog from "./components/RoleFormDialog.vue";
import AssignPermissionDialog from "./components/AssignPermissionDialog.vue";
import { formatDateTime } from "@/utils/format";

const userStore = useUserStore();
const loading = ref(false);
const tableData = ref<RoleInfo[]>([]);
const deleteLoading = reactive<Record<number, boolean>>({});

// --- 对话框状态 ---
const dialogVisible = ref(false);
const selectedRoleId = ref<number | null>(null);
const permissionDialogVisible = ref(false);
// --- 对话框状态 End ---

const fetchRoles = async () => {
  loading.value = true;
  try {
    const response = await getAllRoles();
    tableData.value = response;
  } catch (error) {
    console.error("获取角色列表失败:", error);
    ElMessage.error("获取角色列表失败");
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  selectedRoleId.value = null;
  dialogVisible.value = true;
};

const handleEdit = (row: RoleInfo) => {
  selectedRoleId.value = row.id;
  dialogVisible.value = true;
};

const handleAssignPermissions = (row: RoleInfo) => {
  selectedRoleId.value = row.id;
  permissionDialogVisible.value = true;
};

const handleDelete = async (roleId: number) => {
  deleteLoading[roleId] = true;
  try {
    await deleteRole(roleId);
    ElMessage.success("角色删除成功！");
    fetchRoles();
  } catch (error) {
    console.error("删除角色失败:", error);
    // 错误消息由拦截器处理
  } finally {
    delete deleteLoading[roleId];
  }
};

// 处理表单提交成功
const handleFormSuccess = () => {
  dialogVisible.value = false;
  fetchRoles(); // 刷新列表
};

// 处理权限分配成功
const handlePermissionSuccess = () => {
  permissionDialogVisible.value = false;
  ElMessage.success("权限分配成功！");
};

// 行点击事件
const handleRowClick = (row: RoleInfo) => {
  console.log("Row clicked:", row);
  // 可以在这里实现点击行查看详情等功能
};

// 日期格式化函数
const dateTimeFormatter = (
  row: RoleInfo,
  column: any,
  cellValue: string | null | undefined
): string => {
  return formatDateTime(cellValue);
};

onMounted(() => {
  fetchRoles();
});
</script>

<style scoped lang="scss">
.role-management-container {
  padding: 20px;
}

.table-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }

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
</style>
