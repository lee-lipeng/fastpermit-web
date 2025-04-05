<template>
  <div class="user-management-container">
    <el-card shadow="never">
      <!-- 搜索与筛选区域 -->
      <el-form :inline="true" :model="listQuery" @submit.prevent="handleSearch">
        <el-form-item label="用户名">
          <el-input
            v-model="listQuery.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="listQuery.phone"
            placeholder="请输入手机号"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            @click="handleSearch"
            :loading="loading"
            >查询</el-button
          >
          <el-button :icon="Refresh" @click="handleResetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 20px">
      <!-- 操作按钮 -->
      <div style="margin-bottom: 15px">
        <el-button
          v-if="userStore.hasPermission('user:create')"
          type="success"
          :icon="Plus"
          @click="handleCreate"
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
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" min-width="150" />
        <el-table-column
          prop="is_active"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
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
              @click="handleEdit(scope.row)"
              :disabled="deleteLoading[scope.row.id]"
            >
              编辑
            </el-button>
            <el-button
              v-if="userStore.hasPermission('user:update')"
              type="warning"
              size="small"
              :icon="Key"
              @click="handleAssignPermissions(scope.row)"
              :disabled="deleteLoading[scope.row.id]"
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
              <el-button type="danger" size="small" :icon="Delete" disabled>
                删除
              </el-button>
            </el-tooltip>
            <!-- 未来可以添加 '分配角色' 等按钮 -->
            <!-- <el-button type="warning" size="small" @click="handleAssignRoles(scope.row)">分配角色</el-button> -->
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="totalUsers > 0"
        style="margin-top: 20px; display: flex; justify-content: flex-end"
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

// --- 对话框状态 ---
const dialogVisible = ref(false);
const selectedUserId = ref<number | null>(null);
// --- 对话框状态 End ---

// --- 新增：删除按钮加载状态 ---
// 使用对象，key 为 userId，value 为 boolean
const deleteLoading = reactive<Record<number, boolean>>({});
// --- 删除按钮加载状态 End ---

// --- 新增：日期格式化辅助函数 ---
const dateTimeFormatter = (
  row: UserInfo,
  column: any,
  cellValue: string | null | undefined
): string => {
  return formatDateTime(cellValue);
};
// --- 日期格式化辅助函数 End ---

const fetchUsers = async () => {
  loading.value = true;
  console.log("发起获取用户列表请求，参数:", listQuery);
  try {
    const response: PaginatedResponse<UserInfo> = await getUsers(listQuery);
    tableData.value = response.items;
    totalUsers.value = response.total;
  } catch (error) {
    console.error("获取用户列表失败:", error);
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
  console.log("打开新增用户对话框");
  selectedUserId.value = null;
  dialogVisible.value = true;
};

const handleEdit = (row: UserInfo) => {
  console.log("打开编辑用户对话框, 用户信息:", row);
  selectedUserId.value = row.id;
  dialogVisible.value = true;
};

const handleDelete = async (userId: number) => {
  console.log("删除用户 ID:", userId);
  deleteLoading[userId] = true;
  try {
    await deleteUser(userId);
    ElMessage.success("用户删除成功！");
    fetchUsers();
  } catch (error) {
    console.error("删除用户失败:", error);
  } finally {
    delete deleteLoading[userId];
  }
};

const handleFormSuccess = () => {
  dialogVisible.value = false;
  fetchUsers();
};

const handleAssignPermissions = (row: UserInfo) => {
  console.log("打开分配权限对话框, 用户:", row);
  ElMessage.info("分配权限功能待实现");
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
/* 可以添加一些特定样式 */
.user-management-container {
  padding: 20px;
}
</style>
