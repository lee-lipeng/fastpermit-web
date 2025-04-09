<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">
        <span class="number">4</span>
        <div class="planet">
          <div class="ring"></div>
          <div class="surface"></div>
        </div>
        <span class="number">4</span>
      </div>
      <div class="error-message">页面迷失在宇宙中</div>
      <div class="error-description">您访问的页面可能已被移除或暂时不可用</div>
      <el-button type="primary" class="home-button" @click="goHome">
        <el-icon><HomeFilled /></el-icon>
        返回首页
      </el-button>
    </div>
    <div class="stars">
      <div v-for="n in 50" :key="n" class="star" :style="getStarStyle(n)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { HomeFilled } from "@element-plus/icons-vue";

const router = useRouter();

const goHome = () => {
  router.push("/");
};

// 生成星星的随机样式
const getStarStyle = () => {
  const size = Math.random() * 3 + 1;
  const delay = Math.random() * 2;
  const duration = Math.random() * 2 + 1;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
};
</script>

<style lang="scss" scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .error-code {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
    position: relative;

    .number {
      font-size: 120px;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }

    .planet {
      width: 100px;
      height: 100px;
      margin: 0 20px;
      position: relative;
      animation: rotate 20s linear infinite;

      .ring {
        position: absolute;
        width: 140px;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(30deg);
      }

      .surface {
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #4a90e2, #50c9c3);
        border-radius: 50%;
        position: relative;
        overflow: hidden;

        &::before {
          content: "";
          position: absolute;
          width: 30%;
          height: 30%;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          top: 20%;
          left: 20%;
        }
      }
    }
  }

  .error-message {
    font-size: 32px;
    color: #fff;
    margin-bottom: 15px;
    font-weight: 600;
  }

  .error-description {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 40px;
  }

  .home-button {
    padding: 12px 40px;
    font-size: 16px;
    border-radius: 30px;
    background: linear-gradient(45deg, #4a90e2, #50c9c3);
    border: none;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(74, 144, 226, 0.4);
    }

    .el-icon {
      margin-right: 8px;
    }
  }
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite alternate;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes twinkle {
  from {
    opacity: 0.2;
  }
  to {
    opacity: 1;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 20px;

    .error-code {
      .number {
        font-size: 80px;
      }

      .planet {
        width: 70px;
        height: 70px;
        margin: 0 10px;

        .ring {
          width: 100px;
        }
      }
    }

    .error-message {
      font-size: 24px;
    }

    .error-description {
      font-size: 16px;
    }
  }
}
</style>
