<template>
  <div class="user-management-container">
    <el-card shadow="hover" class="filter-card">
      <!-- 搜索与筛选区域 -->
      <el-form
        :inline="true"
        :model="listQuery"
        @submit.prevent="handleSearch"
        class="search-form"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="listQuery.username"
            placeholder="请输入用户名"
            clearable
            prefix-icon="User"
            class="filter-input"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="listQuery.phone"
            placeholder="请输入手机号"
            clearable
            prefix-icon="Phone"
            class="filter-input"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            @click="handleSearch"
            :loading="loading"
            class="action-button"
            >查询</el-button
          >
          <el-button
            :icon="Refresh"
            @click="handleResetSearch"
            class="action-button"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          v-if="userStore.hasPermission('user:create')"
          type="success"
          :icon="Plus"
          @click="handleCreate"
          class="create-button"
        >
          新增用户
        </el-button>
        <!-- 可以添加批量删除等按钮 -->
      </div>

      <!-- 用户表格 -->
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
        <el-table-column prop="username" label="用户名" min-width="120">
          <template #default="scope">
            <el-tag size="small" effect="plain" type="primary">{{
              scope.row.username
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" min-width="150" />
        <el-table-column
          prop="is_active"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.is_active ? 'success' : 'danger'"
              size="small"
              effect="light"
            >
              {{ scope.row.is_active ? "激活" : "禁用" }}
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
          prop="last_login"
          label="最后登录"
          min-width="160"
          :formatter="dateTimeFormatter"
        />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button
              v-if="userStore.hasPermission('user:update')"
              type="primary"
              size="small"
              :icon="Edit"
              @click.stop="handleEdit(scope.row)"
              :disabled="deleteLoading[scope.row.id]"
              class="operation-button"
            >
              编辑
            </el-button>
            <el-button
              v-if="userStore.hasPermission('user:update')"
              type="warning"
              size="small"
              :icon="Key"
              @click.stop="handleAssignPermissions(scope.row)"
              :disabled="deleteLoading[scope.row.id]"
              class="operation-button"
            >
              权限
            </el-button>
            <el-popconfirm
              v-if="
                userStore.hasPermission('user:delete') &&
                !scope.row.is_superadmin
              "
              title="确定要删除该用户吗?"
              @confirm="handleDelete(scope.row.id)"
              confirm-button-text="确认"
              cancel-button-text="取消"
              :disabled="deleteLoading[scope.row.id]"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  :loading="deleteLoading[scope.row.id]"
                  :disabled="scope.row.is_superadmin || loading"
                  @click.stop
                  class="operation-button"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
            <el-tooltip
              v-else-if="
                userStore.hasPermission('user:delete') &&
                scope.row.is_superadmin
              "
              content="超级管理员不能删除"
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

      <!-- 分页 -->
      <el-pagination
        v-if="totalUsers > 0"
        class="pagination"
        :current-page="listQuery.page"
        :page-size="listQuery.limit"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑用户 对话框 -->
    <UserFormDialog
      v-model="dialogVisible"
      :user-id="selectedUserId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElPopconfirm, ElTooltip, ElTag } from "element-plus";
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Key,
  User,
  Phone,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/modules/user";
import { getUsers, deleteUser } from "@/api/user";
import type {
  UserInfo,
  UserListRequestParams,
  PaginatedResponse,
} from "@/types/api";
import UserFormDialog from "./components/UserFormDialog.vue";
import { formatDateTime } from "@/utils/format";

const userStore = useUserStore();
const loading = ref(false);
const tableData = ref<UserInfo[]>([]);
const totalUsers = ref(0);

const listQuery = reactive<UserListRequestParams>({
  username: "",
  phone: "",
  page: 1,
  limit: 10,
});

// 对话框状态
const dialogVisible = ref(false);
const selectedUserId = ref<number | null>(null);

// 删除按钮加载状态
// 使用对象，key 为 userId，value 为 boolean
const deleteLoading = reactive<Record<number, boolean>>({});

// 日期格式化函数
const dateTimeFormatter = (
  row: UserInfo,
  column: any,
  cellValue: string | null | undefined
): string => {
  return formatDateTime(cellValue);
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response: PaginatedResponse<UserInfo> = await getUsers(listQuery);
    tableData.value = response.items;
    totalUsers.value = response.total;
  } catch (error) {
    console.error("获取用户列表失败:", error);
    ElMessage.error("获取用户列表失败");
    tableData.value = [];
    totalUsers.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  listQuery.page = 1;
  fetchUsers();
};

const handleResetSearch = () => {
  listQuery.username = "";
  listQuery.phone = "";
  listQuery.page = 1;
  fetchUsers();
};

const handleSizeChange = (val: number) => {
  listQuery.limit = val;
  listQuery.page = 1;
  fetchUsers();
};

const handleCurrentChange = (val: number) => {
  listQuery.page = val;
  fetchUsers();
};

const handleCreate = () => {
  selectedUserId.value = null;
  dialogVisible.value = true;
};

const handleEdit = (row: UserInfo) => {
  selectedUserId.value = row.id;
  dialogVisible.value = true;
};

const handleDelete = async (userId: number) => {
  deleteLoading[userId] = true;
  try {
    await deleteUser(userId);
    ElMessage.success("用户删除成功！");
    fetchUsers();
  } catch (error) {
    console.error("删除用户失败:", error);
    // 错误消息由拦截器处理
  } finally {
    delete deleteLoading[userId];
  }
};

const handleFormSuccess = () => {
  dialogVisible.value = false;
  fetchUsers();
};

const handleAssignPermissions = (row: UserInfo) => {
  ElMessage.info("分配权限功能待实现");
};

// 行点击事件
const handleRowClick = (row: UserInfo) => {
  console.log("Row clicked:", row);
  // 可以在这里实现点击行查看详情等功能
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped lang="scss">
.user-management-container {
  padding: 20px;

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

    .search-form {
      display: flex;
      flex-wrap: wrap;

      .el-form-item {
        margin-right: 18px;
      }

      .filter-input {
        width: 220px;
        transition: all 0.3s;

        &:focus {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .action-button {
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
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

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;

      :deep(.el-pagination__sizes) {
        margin-right: 15px;
      }

      :deep(.el-pager li) {
        transition: all 0.3s;

        &:hover,
        &.is-active {
          transform: translateY(-2px);
        }
      }
    }
  }
}
</style>
