<template>
  <el-dialog
    title="分配权限"
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    width="700px"
    :close-on-click-modal="false"
    @open="handleOpen"
    class="assign-permission-dialog"
  >
    <div v-loading="loading" style="max-height: 60vh; overflow-y: auto">
      <el-input
        v-model="filterText"
        placeholder="输入权限名称、描述或分组进行过滤"
        clearable
        style="margin-bottom: 15px"
      />

      <el-checkbox
        v-if="treeData.length > 0"
        :model-value="isSelectAll"
        :indeterminate="isIndeterminate"
        @change="(val) => handleSelectAllChange(val as boolean)"
        style="margin-bottom: 10px; display: block; font-weight: bold"
      >
        全选/反选 (当前筛选结果)
      </el-checkbox>

      <el-tree
        ref="permissionTreeRef"
        :data="treeData"
        show-checkbox
        node-key="id"
        :default-checked-keys="selectedPermissionIds"
        :props="{ label: 'label', children: 'children', disabled: 'disabled' }"
        :filter-node-method="filterNode"
        default-expand-all
        :check-strictly="false"
        @check="handleTreeCheck"
      />

      <el-empty
        v-if="treeData.length === 0 && !loading"
        description="暂无权限数据"
      />
    </div>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
        保存分配
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import type { PropType } from "vue";
import {
  ElMessage,
  ElDialog,
  ElButton,
  ElInput,
  ElEmpty,
  ElTree,
  ElCheckbox,
} from "element-plus";
import type { ElTree as ElTreeType } from "element-plus";
import type { TreeNodeData } from "element-plus/es/components/tree/src/tree.type";
import { getRolePermissions, updateRolePermissions } from "@/api/role";
import { getAllPermissions } from "@/api/permission.ts";
import type { Permission } from "@/types/api";

// 定义树节点数据结构
interface TreeNode {
  id: number | string; // 节点ID，可以是数字(权限ID)或字符串(分组ID)
  label: string; // 节点显示的标签文本
  children?: TreeNode[]; // 子节点数组
  disabled?: boolean; // 是否禁用节点
  isGroup?: boolean; // 是否是分组节点
  raw?: Permission; // 原始权限数据
}

// 组件属性定义
const props = defineProps({
  modelValue: Boolean, // 控制对话框显示/隐藏
  roleId: {
    type: Number as PropType<number | null>, // 角色ID
    default: null,
  },
});

// 定义组件事件
const emit = defineEmits(["update:modelValue", "success"]);

// 响应式状态
const loading = ref(false); // 加载状态
const submitLoading = ref(false); // 提交按钮加载状态
const allPermissions = ref<Permission[]>([]); // 所有权限列表
const selectedPermissionIds = ref<number[]>([]); // 已选择的权限ID列表
const filterText = ref(""); // 过滤文本
const permissionTreeRef = ref<InstanceType<typeof ElTreeType>>(); // 树组件引用

// 获取所有权限
const fetchAllPermissions = async () => {
  try {
    const perms = await getAllPermissions();
    allPermissions.value = perms;
    console.log("获取到的所有权限:", allPermissions.value);
  } catch (error) {
    console.error("获取所有权限失败:", error);
    allPermissions.value = [];
    ElMessage.error("获取权限列表失败");
  }
};

// 获取角色已有的权限
const fetchRolePermissions = async (id: number) => {
  try {
    const ids = await getRolePermissions(id);
    selectedPermissionIds.value = ids;
    console.log(`角色 ${id} 的现有权限 ID:`, selectedPermissionIds.value);
  } catch (error) {
    console.error(`获取角色 ${id} 权限失败:`, error);
    selectedPermissionIds.value = [];
    ElMessage.error("获取角色现有权限失败");
  }
};

// 获取权限的分组键
const getGroupKey = (permission: Permission): string => {
  const desc = permission.description;
  const name = permission.name;

  // 根据description中的" "进行分割
  if (desc && desc.includes(" ")) {
    return desc.split(" ")[0].trim();
  }

  // 若未分割则使用map映射
  if (name && name.includes(":")) {
    const prefix = name.split(":")[0].trim();
    const groupMap: Record<string, string> = {
      user: "用户管理",
      role: "角色管理",
      permission: "权限定义",
      resource_type: "资源类型",
      action_type: "操作类型",
      log: "日志管理",
      system: "系统配置",
    };
    return groupMap[prefix] || prefix;
  }

  return "其他权限";
};

// 构建树形数据结构
const treeData = computed<TreeNode[]>(() => {
  const groups: { [key: string]: TreeNode } = {};
  allPermissions.value.forEach((permission) => {
    const groupKey = getGroupKey(permission);
    if (!groups[groupKey]) {
      groups[groupKey] = {
        id: `group-${groupKey}`,
        label: groupKey,
        children: [],
        disabled: true,
        isGroup: true,
      };
    }
    groups[groupKey].children?.push({
      id: permission.id,
      label: `${permission.name} (${permission.description || "无描述"})`,
      raw: permission,
    });
  });
  return Object.values(groups).sort((a, b) =>
    a.label.localeCompare(b.label, "zh-CN")
  );
});

// 节点过滤方法
const filterNode = (value: string, data: TreeNodeData): boolean => {
  const nodeData = data as any as TreeNode;

  if (!value) return true;

  if (nodeData.isGroup) {
    const groupLabelMatch = nodeData.label
      .toLowerCase()
      .includes(value.toLowerCase());
    return (
      groupLabelMatch ||
      (data.childNodes?.some((childNode: any) =>
        filterNode(value, childNode.data as TreeNodeData)
      ) ??
        false)
    );
  }

  const lowerCaseValue = value.toLowerCase();
  const labelMatch = nodeData.label.toLowerCase().includes(lowerCaseValue);
  const raw = nodeData.raw;
  const nameMatch = raw?.name?.toLowerCase().includes(lowerCaseValue);
  const descMatch = raw?.description?.toLowerCase().includes(lowerCaseValue);

  return labelMatch || !!nameMatch || !!descMatch;
};

// 监听过滤文本变化
watch(filterText, (val) => {
  permissionTreeRef.value?.filter(val);
});

// 获取当前可见的叶子节点ID列表
const getVisibleLeafNodeIds = (): number[] => {
  const visibleIds: number[] = [];
  const tree = permissionTreeRef.value;
  if (!tree || !tree.store) return [];

  const traverse = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node.visible) {
        if (node.isLeaf) {
          if (typeof node.key === "number") {
            visibleIds.push(node.key);
          }
        } else if (node.childNodes && node.childNodes.length > 0) {
          traverse(node.childNodes);
        }
      }
    });
  };
  traverse(tree.store.nodesMap ? Object.values(tree.store.nodesMap) : []);
  return visibleIds;
};

// 计算是否处于半选状态
const isIndeterminate = computed(() => {
  const visibleLeafIds = getVisibleLeafNodeIds();
  if (visibleLeafIds.length === 0) return false;
  const selectedVisibleCount = visibleLeafIds.filter((id) =>
    selectedPermissionIds.value.includes(id)
  ).length;
  return (
    selectedVisibleCount > 0 && selectedVisibleCount < visibleLeafIds.length
  );
});

// 计算是否全选
const isSelectAll = computed(() => {
  const visibleLeafIds = getVisibleLeafNodeIds();
  if (visibleLeafIds.length === 0) return false;
  return visibleLeafIds.every((id) => selectedPermissionIds.value.includes(id));
});

// 处理全选/取消全选
const handleSelectAllChange = (checkAll: boolean) => {
  const visibleLeafIds = getVisibleLeafNodeIds();
  let newSelectedIds = [...selectedPermissionIds.value];

  if (checkAll) {
    // 全选：合并当前选中和可见节点
    newSelectedIds = [...new Set([...newSelectedIds, ...visibleLeafIds])];
  } else {
    // 取消全选：从选中列表中移除可见节点
    const visibleSet = new Set(visibleLeafIds);
    newSelectedIds = newSelectedIds.filter((id) => !visibleSet.has(id));
  }
  selectedPermissionIds.value = newSelectedIds;
  permissionTreeRef.value?.setCheckedKeys(selectedPermissionIds.value, false);
};

// 对话框打开时的处理
const handleOpen = async () => {
  loading.value = true;
  selectedPermissionIds.value = [];
  filterText.value = "";
  await fetchAllPermissions();
  if (props.roleId) {
    await fetchRolePermissions(props.roleId);
  }
  await nextTick();
  permissionTreeRef.value?.setCheckedKeys(selectedPermissionIds.value, false);
  loading.value = false;
};

// 提交权限分配
const handleSubmit = async () => {
  if (props.roleId === null) {
    ElMessage.error("无效的角色 ID");
    return;
  }
  submitLoading.value = true;
  try {
    const checkedKeys = permissionTreeRef.value?.getCheckedKeys(true) ?? [];
    await updateRolePermissions(props.roleId, checkedKeys as number[]);
    ElMessage.success("权限分配成功！");
    emit("success");
    emit("update:modelValue", false);
  } catch (error) {
    console.error("分配权限失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 处理树节点勾选状态变化事件
const handleTreeCheck = (
  data: TreeNode, // 当前被操作的节点数据
  checkedInfo: { checkedKeys: (string | number)[]; checkedNodes: TreeNode[] } // 包含所有选中节点的信息
) => {
  // checkedKeys 包含所有选中的节点 key (包括分组节点，是字符串形式)
  // 我们只需要叶子节点的 key (权限 ID，是数字形式)
  selectedPermissionIds.value = checkedInfo.checkedKeys.filter(
    (key) => typeof key === "number" // 过滤出数字类型的 key (即权限 ID)
  ) as number[]; // 将过滤后的结果断言为 number[] 类型
  // console.log('当前选中的权限 ID:', selectedPermissionIds.value); // 调试用，打印当前选中的权限 ID 列表
};
// --- 事件处理 End ---
</script>

<style lang="scss" scoped>
.assign-permission-dialog {
  .el-dialog__body {
    padding-top: 10px;
  }

  :deep(.el-tree-node__content) {
    height: auto;
    padding-top: 4px;
    padding-bottom: 4px;
    align-items: flex-start;
  }

  :deep(.el-tree-node__label) {
    white-space: normal;
    line-height: 1.4;
    padding-left: 4px;
  }
}
</style>
