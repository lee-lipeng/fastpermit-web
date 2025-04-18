# fastpermit-web 权限管理系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **注意**: 此项目基于 cursor+claude3.7(页面美化)+gemini2.5(整体页面框架)来开发完成，本人并不太熟悉前端，所以可能存在一些问题。

fastpermit-web 是一个现代化的权限管理系统，提供强大而灵活的用户、角色和权限管理功能。系统界面美观，交互友好，适用于各类中小型项目的权限控制需求。

## 🌟 功能特点

- **精美仪表盘**：直观展示系统概览，包含天气组件、音乐播放器和世界时钟
- **完整的 RBAC 权限控制**：基于角色的访问控制体系
- **用户管理**：创建、编辑、删除和查询用户
- **角色管理**：灵活定义和管理角色信息
- **权限管理**：细粒度的权限分配与控制
- **资源与操作类型**：支持自定义资源类型和操作类型
- **响应式设计**：适配各种屏幕尺寸

## 🛠️ 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI 组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP 客户端**：Axios
- **构建工具**：Vite

## 📦 安装与使用

### 前提条件

- Node.js (>=14.x)
- npm

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/lee-lipeng/fastpermit-web.git
cd fastpermit-web
```

2. 安装依赖

```bash
npm install
```

3. 运行开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

## 🧩 主要功能模块

### 仪表盘

- 天气组件：显示当前城市天气情况
- 音乐播放器：内置音乐播放功能，支持随机播放
- 世界时钟：显示多个时区的当前时间
- 快捷导航：快速访问常用功能

### 系统管理

- **用户管理**：用户的 CRUD 操作、状态控制、角色分配
- **角色管理**：角色的 CRUD 操作、权限分配
- **个人中心**：用户资料管理、密码修改

### 权限管理

- **权限列表**：查看所有权限
- **资源管理**：管理资源类型
- **操作管理**：管理操作类型

## 🔍 项目结构

```
fastpermit-web/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── api/             # API 接口封装
│   ├── assets/          # 项目资源文件
│   ├── config/          # 配置文件
│   ├── layouts/         # 布局组件
│   ├── router/          # 路由配置
│   ├── store/           # Pinia 状态管理
│   ├── styles/          # 全局样式
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── .gitignore           # Git 忽略配置
├── index.html           # HTML 模板
├── package.json         # 项目依赖
├── tsconfig.json        # TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 🔧 开发指南

### 后端 API 配置

本项目默认后端 API 地址为 `http://localhost:8000`，可在 `vite.config.ts` 中修改：

```typescript
server: {
  proxy: {
    "/api/v1": {
      target: "http://localhost:8000", // 修改为你的后端地址
      changeOrigin: true,
    }
  }
}
```

### 添加新页面

1. 在 `src/views` 创建新的视图组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 如需权限控制，添加 `meta` 属性：

```typescript
{
  path: "your-path",
  name: "YourComponent",
  component: () => import("@/views/YourComponent.vue"),
  meta: {
    title: "页面标题",
    requiresAuth: true,
    permission: "resource:action"
  }
}
```

## 📃 许可证

本项目采用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

## 📸 项目截图

### 仪表盘

美观的仪表盘界面，集成了天气信息、音乐播放器和系统使用快捷访问。

### 用户管理

完整的用户管理功能，支持创建、编辑、删除和查询用户。

### 角色管理

灵活的角色定义和权限分配功能。

### 权限管理

细粒度的权限控制，支持自定义资源类型和操作类型。
