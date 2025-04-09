<template>
  <div class="dashboard-container">
    <!-- 背景粒子效果 -->
    <div class="particles-container">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          opacity: particle.opacity,
        }"
      ></div>
    </div>

    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="greeting">
          {{ greeting }}，{{ userStore.userInfo?.username || "用户" }}
        </h1>
        <p class="sub-greeting">欢迎回到 FastPermit 权限管理系统</p>
        <div class="daily-quote">
          <p class="quote-text">{{ dailyQuote.content }}</p>
          <p class="quote-author">—— {{ dailyQuote.author }}</p>
          <el-button
            class="refresh-button"
            circle
            size="small"
            @click="refreshQuote"
            :loading="quoteLoading"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="welcome-date">
        <!-- 自定义日历组件 -->
        <div class="custom-calendar">
          <div class="calendar-header">
            <span class="month-year">{{ currentYearMonth }}</span>
          </div>
          <div class="calendar-weekdays">
            <div class="weekday" v-for="day in weekdays" :key="day">
              {{ day }}
            </div>
          </div>
          <div class="calendar-days">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="day-cell"
              :class="{
                'is-today': day.isToday,
                'is-current-month': day.isCurrentMonth,
                'is-weekend': day.isWeekend,
              }"
            >
              <span class="day-number">{{ day.date }}</span>
              <span class="day-text" v-if="day.isCurrentMonth">{{
                day.dayText
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 音乐播放器区域 -->
    <div class="music-player-section">
      <el-card class="music-player-card">
        <div class="music-player-content">
          <div class="music-cover-controls">
            <div class="music-cover">
              <el-image
                :src="currentMusic?.picurl"
                fit="cover"
                class="cover-image"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="music-controls">
              <el-button
                type="primary"
                :icon="ArrowLeft"
                circle
                @click="prevMusic"
                :disabled="musicLoading"
              />
              <el-button
                type="primary"
                :icon="isPlaying ? VideoPause : VideoPlay"
                circle
                @click="togglePlay"
                :loading="musicLoading"
              />
              <el-button
                type="primary"
                :icon="ArrowRight"
                circle
                @click="nextMusic"
                :disabled="musicLoading"
              />
            </div>
          </div>

          <div class="music-info">
            <div class="music-title">
              <span class="music-name">{{
                currentMusic?.name || "暂无音乐"
              }}</span>
            </div>
            <div class="music-progress">
              <el-slider
                v-model="currentProgress"
                :format-tooltip="formatTime"
                @change="handleProgressChange"
                :disabled="!currentMusic"
              />
              <div class="time-info">
                <span>{{ formatTime(currentTimeMusic) }}</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快速导航区 -->
    <div class="quick-navigate-section">
      <h2 class="section-title">常用功能</h2>
      <el-row :gutter="24">
        <el-col
          :xs="12"
          :sm="8"
          :md="6"
          :lg="4"
          v-for="(item, index) in quickNavigate"
          :key="index"
        >
          <el-card class="navigate-card" shadow="hover" @click="item.handler">
            <div class="navigate-icon">
              <el-icon><component :is="item.icon"></component></el-icon>
            </div>
            <div class="navigate-text">{{ item.name }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 工具和小组件区 -->
    <div class="widgets-section">
      <el-row :gutter="24">
        <!-- 时间与天气组件 -->
        <el-col :xs="24" :sm="24" :md="24">
          <el-card class="widget-card time-weather-card" shadow="hover">
            <div class="time-weather-content">
              <div class="time-column">
                <div class="current-time-display">
                  <div class="current-time">{{ currentTime }}</div>
                  <div class="current-date">{{ currentDate }}</div>
                </div>
                <div class="time-divider"></div>
                <div class="world-clocks">
                  <div
                    v-for="(clock, index) in worldClocks"
                    :key="index"
                    class="world-clock-item"
                  >
                    <div class="clock-location">{{ clock.location }}</div>
                    <div class="clock-time">{{ clock.time }}</div>
                  </div>
                </div>
              </div>

              <div class="weather-column" v-loading="weatherLoading">
                <div class="weather-header">
                  <h3>天气预报</h3>
                  <div class="weather-search">
                    <el-input
                      v-model="citySearch"
                      size="small"
                      placeholder="搜索城市..."
                      clearable
                      @keyup.enter="searchCity"
                    >
                      <template #append>
                        <el-button @click="searchCity" :icon="Search" />
                      </template>
                    </el-input>
                  </div>
                </div>

                <div class="weather-display">
                  <div class="weather-main-info">
                    <div class="weather-city-info">
                      <div class="city-name">{{ currentCity }}</div>
                      <div class="refresh-time">
                        更新于: {{ weather.refreshTime }}
                      </div>
                    </div>
                    <div class="weather-details-container">
                      <div class="weather-icon-temperature">
                        <div class="weather-icon">
                          <component :is="getWeatherIcon(weather.condition)" />
                          <div class="weather-condition">
                            {{ weather.condition }}
                          </div>
                        </div>
                        <div class="weather-temperature">
                          {{ weather.temperature }}°C
                        </div>
                      </div>
                      <div class="weather-metrics">
                        <div class="weather-metric-item">
                          <el-icon><Odometer /></el-icon>
                          <span>湿度: {{ weather.humidity }}%</span>
                        </div>
                        <div class="weather-metric-item">
                          <el-icon><WindPower /></el-icon>
                          <span>风速: {{ weather.windSpeed }} km/h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  computed,
  onBeforeUnmount,
  watch,
} from "vue";
import { cities } from "@/config/cities";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { useMusicStore } from "@/store/modules/music";
import {
  Refresh,
  Odometer,
  WindPower,
  Search,
  VideoPlay,
  VideoPause,
  ArrowLeft,
  ArrowRight,
  Picture,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

const router = useRouter();
const userStore = useUserStore();
const musicStore = useMusicStore();

// 获取时间问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "凌晨好";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
});

// 计算当前年月
const currentYearMonth = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${year}年${month}月`;
});

// 星期名称
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

// 生成当月日历数据
const calendarDays = computed(() => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  // 当月第一天
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // 当月最后一天
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // 当月第一天是星期几
  const firstDayWeekday = firstDayOfMonth.getDay();
  // 当月天数
  const daysInMonth = lastDayOfMonth.getDate();

  // 上个月最后几天
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

  const days = [];

  // 添加上个月的日期
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i;
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: false,
      dayText: "",
    });
  }

  // 添加当月日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const dayOfWeek = date.getDay();
    days.push({
      date: i,
      isCurrentMonth: true,
      isToday: i === currentDate,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dayText: weekdays[dayOfWeek],
    });
  }

  // 添加下个月的日期，补满42个格子
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: false,
      dayText: "",
    });
  }

  return days;
});

// 快速导航
const quickNavigate = reactive([
  {
    name: "用户管理",
    icon: "User",
    handler: () => router.push("/system/users"),
  },
  {
    name: "角色管理",
    icon: "Key",
    handler: () => router.push("/system/roles"),
  },
  {
    name: "权限列表",
    icon: "Setting",
    handler: () => router.push("/system/permissions/list"),
  },
  {
    name: "个人中心",
    icon: "User",
    handler: () => {
      ElMessage.success("正在前往个人中心");
      router.push({
        name: "Profile",
        params: { id: userStore.userInfo?.id },
      });
    },
  },
  {
    name: "资源管理",
    icon: "Document",
    handler: () => router.push("/system/permissions/resources"),
  },
  {
    name: "操作管理",
    icon: "Menu",
    handler: () => router.push("/system/permissions/actions"),
  },
]);

// 每日名言
const dailyQuote = reactive({
  content: "加载中...",
  author: "",
  loading: true,
});

const quoteLoading = ref(false);

// 获取每日名言
const fetchQuote = async () => {
  quoteLoading.value = true;
  try {
    // 由于CORS限制，直接使用备用数据
    const quotes = [
      { content: "道可道，非常道；名可名，非常名。", author: "老子" },
      { content: "学而不思则罔，思而不学则殆。", author: "孔子" },
      { content: "知之为知之，不知为不知，是知也。", author: "孔子" },
      { content: "工欲善其事，必先利其器。", author: "孔子" },
      { content: "三人行，必有我师焉。", author: "孔子" },
      {
        content: "不积跬步，无以至千里；不积小流，无以成江海。",
        author: "荀子",
      },
      { content: "天行健，君子以自强不息。", author: "《周易》" },
      { content: "人生自古谁无死，留取丹心照汗青。", author: "文天祥" },
      { content: "业精于勤，荒于嬉；行成于思，毁于随。", author: "韩愈" },
      { content: "读书百遍，其义自见。", author: "《三国志》" },
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    dailyQuote.content = randomQuote.content;
    dailyQuote.author = randomQuote.author;
    dailyQuote.loading = false;
  } catch (error) {
    console.error("获取名言失败:", error);
    // 使用备用数据
    dailyQuote.content = "道可道，非常道；名可名，非常名。";
    dailyQuote.author = "老子";
  } finally {
    quoteLoading.value = false;
  }
};

// 手动刷新名言
const refreshQuote = () => {
  fetchQuote();
};

// 页面美化效果 - 粒子效果
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

const particles = ref<Particle[]>([]);
const generateParticles = () => {
  const count = 40; // 粒子数量
  const newParticles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    newParticles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.5 + 0.2,
    });
  }

  particles.value = newParticles;
};

// 音乐播放器
interface MusicInfo {
  name: string;
  url: string;
  picurl: string;
}

const musicLoading = ref(false);
const currentMusic = ref(musicStore.currentMusic);
const isPlaying = ref(musicStore.isPlaying);
const currentTimeMusic = ref(musicStore.currentTimeMusic);
const duration = ref(musicStore.duration);
const currentProgress = ref(musicStore.currentProgress);

// 添加历史音乐列表，支持上一首/下一首功能
const musicHistory = ref<MusicInfo[]>([]);
const currentMusicIndex = ref(-1);

// 添加静态备用音乐列表
const backupMusicList = [
  {
    name: "夏日小溪 - 轻音乐",
    url: "https://music.163.com/song/media/outer/url?id=1324306.mp3",
    picurl:
      "https://p2.music.126.net/hti_a0LADoFMBHvOBwAtRA==/109951167643767467.jpg",
  },
  {
    name: "雨的印记 - 轻音乐",
    url: "https://music.163.com/song/media/outer/url?id=255858.mp3",
    picurl:
      "https://p2.music.126.net/hti_a0LADoFMBHvOBwAtRA==/109951167643767467.jpg",
  },
  {
    name: "风铃 - 轻音乐",
    url: "https://music.163.com/song/media/outer/url?id=139774.mp3",
    picurl:
      "https://p2.music.126.net/hti_a0LADoFMBHvOBwAtRA==/109951167643767467.jpg",
  },
  {
    name: "春日私语 - 轻音乐",
    url: "https://music.163.com/song/media/outer/url?id=5221167.mp3",
    picurl:
      "https://p2.music.126.net/hti_a0LADoFMBHvOBwAtRA==/109951167643767467.jpg",
  },
  {
    name: "夏夜微风 - 轻音乐",
    url: "https://music.163.com/song/media/outer/url?id=28445820.mp3",
    picurl:
      "https://p2.music.126.net/hti_a0LADoFMBHvOBwAtRA==/109951167643767467.jpg",
  },
];

// 防止播放失败时不断切换的标志
let isHandlingPlayFailure = false;
let hasFetchedMusic = false;

// 添加使用备用音乐的方法
const useBackupMusic = () => {
  if (backupMusicList.length > 0) {
    const randomIndex = Math.floor(Math.random() * backupMusicList.length);
    const backupMusic = backupMusicList[randomIndex];

    currentMusic.value = backupMusic;
    musicHistory.value.push(backupMusic);
    currentMusicIndex.value = musicHistory.value.length - 1;

    // 重置进度
    resetPlayProgress();

    ElMessage.success("已切换到备用音乐");
    return true;
  }
  return false;
};

// 修改获取随机音乐的函数，使用正确的API并处理响应
const fetchRandomMusic = async () => {
  musicLoading.value = true;
  musicStore.pauseMusic();

  // 重置标志
  isHandlingPlayFailure = false;

  try {
    // 使用代理URL替代直接调用API
    const response = await fetch(
      "/music-api/api/rand.music?sort=热歌榜&format=json",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    console.log("API响应数据:", data);

    if (data.code === 1 && data.data) {
      // 构建音乐对象
      const newMusic = {
        name: `${data.data.name} - ${data.data.artistsname || "未知歌手"}`,
        url: data.data.url, // API返回的音乐URL
        picurl:
          data.data.picurl ||
          "https://p2.music.126.net/hti_a0LADoFMBHvOBwAtRA==/109951167643767467.jpg",
      };

      // 检查音乐URL是否有效
      const testAudio = new Audio();
      testAudio.src = newMusic.url;

      // 添加加载事件监听
      testAudio.addEventListener(
        "canplaythrough",
        () => {
          console.log("音乐URL有效:", newMusic.url);
          currentMusic.value = newMusic;
          musicHistory.value.push(newMusic);
          currentMusicIndex.value = musicHistory.value.length - 1;
          musicStore.resetPlayProgress();
          hasFetchedMusic = true;
          ElMessage.success("获取音乐成功！请点击播放按钮开始播放");

          // 移除事件监听
          testAudio.removeEventListener("canplaythrough", () => {});
          testAudio.removeEventListener("error", () => {});
        },
        { once: true }
      );

      // 添加错误事件监听
      testAudio.addEventListener(
        "error",
        () => {
          console.error("音乐URL无效:", newMusic.url);
          throw new Error("音乐URL无效");
        },
        { once: true }
      );

      // 加载音频检查是否可播放
      testAudio.load();
    } else {
      console.error("API返回错误:", data);
      throw new Error("获取音乐失败");
    }
  } catch (error) {
    console.error("获取随机音乐失败:", error);

    // API请求失败时使用备用音乐
    if (!useBackupMusic()) {
      ElMessage.error("获取音乐失败，请稍后再试");
    }
  } finally {
    musicLoading.value = false;
  }
};

// 播放上一首
const prevMusic = async () => {
  musicLoading.value = true;
  try {
    await musicStore.prevMusic();
    currentMusic.value = musicStore.currentMusic;
    isPlaying.value = musicStore.isPlaying;
  } catch (error) {
    console.error("切换上一首失败:", error);
  } finally {
    musicLoading.value = false;
  }
};

// 播放下一首
const nextMusic = async () => {
  musicLoading.value = true;
  try {
    await musicStore.nextMusic();
    currentMusic.value = musicStore.currentMusic;
    isPlaying.value = musicStore.isPlaying;
  } catch (error) {
    console.error("切换下一首失败:", error);
  } finally {
    musicLoading.value = false;
  }
};

// 重置播放进度
const resetPlayProgress = () => {
  currentTimeMusic.value = 0;
  duration.value = 0;
  currentProgress.value = 0;
};

// 播放音乐
const playMusic = () => {
  if (!currentMusic.value) {
    if (!hasFetchedMusic) {
      fetchRandomMusic().then(() => {
        setTimeout(() => {
          musicStore.playMusic();
        }, 500);
      });
    }
    return;
  }

  if (audioPlayer.value) {
    // 重置失败处理标志
    isHandlingPlayFailure = false;

    // 检查是否是暂停后的继续播放（音频已经加载且已经有播放时间）
    if (audioPlayer.value.readyState >= 2 && currentTimeMusic.value > 0) {
      // 直接播放当前音频，不重新加载
      audioPlayer.value
        .play()
        .then(() => {
          musicStore.isPlaying = true;
          console.log("音乐继续播放");
        })
        .catch((err) => {
          console.error("播放失败:", err);
          musicStore.handlePlayError(err);
        });
      return;
    }

    // 新音乐或第一次播放，需要完整加载过程
    // 移除之前可能存在的事件监听器
    audioPlayer.value.removeEventListener("canplaythrough", canplayHandler);
    audioPlayer.value.removeEventListener("error", errorHandler);

    // 添加事件监听器检测是否加载成功
    audioPlayer.value.addEventListener("canplaythrough", canplayHandler);
    audioPlayer.value.addEventListener("error", errorHandler);

    // 加载音频
    audioPlayer.value.load();
  }
};

// 将事件处理函数定义在外部，避免重复创建
const canplayHandler = () => {
  if (!audioPlayer.value) return;

  audioPlayer.value
    .play()
    .then(() => {
      musicStore.isPlaying = true;
      // 播放成功
      console.log("音乐播放成功");
    })
    .catch((err) => {
      console.error("播放失败:", err);
      musicStore.handlePlayError(err);
    });
};

// 错误处理函数
const errorHandler = (e: Event) => {
  console.error("音频加载错误:", e);

  if (isHandlingPlayFailure) {
    console.log("已经在处理播放失败，避免循环切换");
    return;
  }

  isHandlingPlayFailure = true;

  // 尝试使用备用音乐，但只尝试一次
  ElMessage.warning("当前音乐无法播放，尝试使用备用音乐");
  if (useBackupMusic()) {
    setTimeout(() => {
      if (audioPlayer.value) {
        // 重新绑定事件并尝试播放
        audioPlayer.value.removeEventListener("canplaythrough", canplayHandler);
        audioPlayer.value.removeEventListener("error", errorHandler);

        audioPlayer.value.addEventListener("canplaythrough", canplayHandler);
        audioPlayer.value.addEventListener("error", () => {
          ElMessage.error("备用音乐也无法播放，请检查网络连接");
          isHandlingPlayFailure = false;
        });

        audioPlayer.value.load();
      }
    }, 500);
  } else {
    ElMessage.error("无法播放音乐，请稍后再试");
    isHandlingPlayFailure = false;
  }
};

// 处理播放错误
const handlePlayError = (err: Error) => {
  if (isHandlingPlayFailure) {
    return;
  }

  isHandlingPlayFailure = true;

  // 更友好的提示信息
  if (err.name === "NotAllowedError") {
    ElMessage({
      message: "请先点击页面任意位置与页面交互，然后再点击播放按钮",
      type: "warning",
      duration: 5000,
    });
    isHandlingPlayFailure = false;
  } else if (err.name === "NotSupportedError") {
    // 音频格式不支持，尝试使用备用音乐
    ElMessage.warning("音频格式不支持，尝试使用备用音乐");
    if (useBackupMusic()) {
      setTimeout(() => {
        if (audioPlayer.value) {
          audioPlayer.value.load();
        }
        isHandlingPlayFailure = false;
      }, 500);
    } else {
      isHandlingPlayFailure = false;
    }
  } else {
    ElMessage.error("播放失败，请稍后再试");
    isHandlingPlayFailure = false;
  }
};

// 暂停音乐
const pauseMusic = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    musicStore.isPlaying = false;
  }
};

// 更新进度
const updateProgress = () => {
  if (audioPlayer.value) {
    currentTimeMusic.value = audioPlayer.value.currentTime;
    if (duration.value > 0) {
      currentProgress.value = (currentTimeMusic.value / duration.value) * 100;
    }
  }
};

// 音频加载完成
const onAudioLoaded = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration;
  }
};

// 音频播放结束
const onAudioEnded = () => {
  musicStore.isPlaying = false;
  nextMusic(); // 自动播放下一首
};

// 拖动进度条
const handleProgressChange = (value: number) => {
  musicStore.handleProgressChange(value);
  currentTimeMusic.value = musicStore.currentTimeMusic;
};

// 格式化时间
const formatTime = (seconds: number): string => {
  return musicStore.formatTime(seconds);
};

// 当前时间日期
const currentTime = ref("");
const currentDate = ref("");

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  currentDate.value = now.toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

// 世界时钟
const worldClocks = ref([
  { location: "北京", time: "", date: "", timezone: 8 },
  { location: "纽约", time: "", date: "", timezone: -4 },
  { location: "伦敦", time: "", date: "", timezone: 1 },
]);

const updateClocks = () => {
  const now = new Date();

  // 更新当前时间
  updateCurrentTime();

  // 更新世界时钟
  worldClocks.value.forEach((clock) => {
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const clockTime = new Date(utc + 3600000 * clock.timezone);

    clock.time = clockTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    clock.date = clockTime.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  });
};

let clockInterval: number | null = null;

// 天气组件
const currentCity = ref("北京");
const weather = reactive({
  temperature: 23,
  condition: "晴",
  humidity: 45,
  windSpeed: 3.5,
  refreshTime: "",
});

const weatherLoading = ref(false);

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case "晴":
      return "Sunny";
    case "多云":
      return "Cloudy";
    case "阴":
      return "Moon";
    case "雨":
      return "Drizzling";
    case "雷雨":
      return "Lightning";
    default:
      return "Sunny";
  }
};

const citySearch = ref("");
const searchCity = () => {
  if (!citySearch.value.trim()) {
    ElMessage.warning("请输入城市名称");
    return;
  }

  // 检查输入的城市是否在预设列表中
  const foundCity = cities.find((city) => city.name.includes(citySearch.value));

  if (foundCity) {
    updateWeather(foundCity.name);
  } else {
    ElMessage.warning(`未找到城市: ${citySearch.value}`);
  }

  // 清空搜索框
  citySearch.value = "";
};

const updateWeather = (cityName: string) => {
  weatherLoading.value = true;

  // 为了演示，模拟API调用延迟
  setTimeout(() => {
    // 模拟天气数据变化
    const temp = Math.floor(Math.random() * 15) + 15; // 15-30度
    const conditions = ["晴", "多云", "阴", "雨", "雷雨"];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const humidity = Math.floor(Math.random() * 50) + 30; // 30-80%
    const windSpeed = (Math.random() * 8 + 1).toFixed(1); // 1-9 km/h

    weather.temperature = temp;
    weather.condition = condition;
    weather.humidity = humidity;
    weather.windSpeed = parseFloat(windSpeed);
    weather.refreshTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    currentCity.value = cityName;

    // ElMessage.success(`已更新${cityName}的天气信息`);
    weatherLoading.value = false;
  }, 800);
};

// 切换播放状态
const togglePlay = () => {
  if (isPlaying.value) {
    musicStore.pauseMusic();
  } else {
    musicStore.playMusic();
  }
  isPlaying.value = musicStore.isPlaying;
};

// 监听音乐状态变化
watch(
  () => musicStore.currentMusic,
  (newVal) => {
    currentMusic.value = newVal;
  },
  { immediate: true }
);

watch(
  () => musicStore.isPlaying,
  (newVal) => {
    isPlaying.value = newVal;
  },
  { immediate: true }
);

watch(
  () => musicStore.currentProgress,
  (newVal) => {
    currentProgress.value = newVal;
  },
  { immediate: true }
);

watch(
  () => musicStore.currentTimeMusic,
  (newVal) => {
    currentTimeMusic.value = newVal;
  },
  { immediate: true }
);

watch(
  () => musicStore.duration,
  (newVal) => {
    duration.value = newVal;
  },
  { immediate: true }
);

onMounted(() => {
  // 初始化时钟
  updateClocks();
  clockInterval = window.setInterval(updateClocks, 1000);

  // 获取每日名言
  fetchQuote();

  // 初始化天气数据
  updateWeather("北京");

  // 生成背景粒子
  generateParticles();

  // 初始化音乐播放器，但不自动播放
  musicStore.initAudioPlayer();

  // 同步当前音乐状态
  if (musicStore.currentMusic) {
    currentMusic.value = musicStore.currentMusic;
    isPlaying.value = musicStore.isPlaying;
    currentProgress.value = musicStore.currentProgress;
    currentTimeMusic.value = musicStore.currentTimeMusic;
    duration.value = musicStore.duration;
  }

  // 添加音乐播放提示
  // setTimeout(() => {
  //   ElMessage({
  //     message: "点击随机音乐的播放按钮即可享受音乐",
  //     type: "info",
  //     duration: 5000,
  //   });
  // }, 3000);
});

onBeforeUnmount(() => {
  // 清除定时器
  if (clockInterval) {
    clearInterval(clockInterval);
  }
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 120px);

  // 添加粒子效果样式
  .particles-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;

    .particle {
      position: absolute;
      background: linear-gradient(to bottom right, #1890ff, #36cfc9);
      border-radius: 50%;
      z-index: -1;
      transform: translate3d(0, 0, 0);
      animation: float 20s infinite linear;
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0) translateX(0);
    }
    25% {
      transform: translateY(-10px) translateX(10px);
    }
    50% {
      transform: translateY(0) translateX(0);
    }
    75% {
      transform: translateY(10px) translateX(-10px);
    }
    100% {
      transform: translateY(0) translateX(0);
    }
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 20px;
    color: #303133;
    position: relative;
    padding-left: 16px;
    letter-spacing: 0.5px;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 18px;
      background: linear-gradient(to bottom, #1890ff, #36cfc9);
      border-radius: 2px;
    }
  }

  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    padding: 32px 40px;
    border-radius: 16px;
    margin-bottom: 28px;
    color: white;
    box-shadow: 0 12px 24px rgba(24, 144, 255, 0.25);
    overflow: hidden;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 32px rgba(24, 144, 255, 0.3);
    }

    &::before {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(rgba(255, 255, 255, 0.1), transparent 70%);
      opacity: 0.7;
      z-index: 0;
    }

    .welcome-content {
      position: relative;
      z-index: 1;
      max-width: 50%;

      .greeting {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 10px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .sub-greeting {
        font-size: 18px;
        opacity: 0.9;
        margin: 0 0 20px;
      }

      .daily-quote {
        position: relative;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(5px);
        padding: 16px 20px;
        border-radius: 10px;
        margin-top: 16px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

        .quote-text {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 0 8px;
          line-height: 1.6;
          font-style: italic;
        }

        .quote-author {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          text-align: right;
          margin: 0;
        }

        .refresh-button {
          position: absolute;
          right: -10px;
          top: -10px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(180deg);
          }
        }
      }
    }

    .welcome-date {
      position: relative;
      z-index: 1;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(5px);
      padding: 15px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .custom-calendar {
        width: 300px;

        .calendar-header {
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 10px;
          text-align: center;

          .month-year {
            font-size: 18px;
            font-weight: 600;
            color: white;
            letter-spacing: 1px;
          }
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
          margin-bottom: 8px;

          .weekday {
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            padding: 5px 0;
          }
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(6, 1fr);
          gap: 5px;

          .day-cell {
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s;
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            cursor: default;

            &.is-current-month {
              background: rgba(255, 255, 255, 0.15);

              &:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-2px);
              }
            }

            &.is-weekend.is-current-month {
              background: rgba(255, 255, 255, 0.2);

              .day-number {
                color: rgba(255, 255, 255, 0.95);
              }
            }

            &:not(.is-current-month) {
              opacity: 0.4;
            }

            &.is-today {
              background: rgba(255, 255, 255, 0.3);
              box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6);
              transform: scale(1.05);

              .day-number {
                font-weight: 700;
                color: white;
              }

              .day-text {
                color: white;
              }

              &:hover {
                transform: scale(1.05) translateY(-2px);
              }
            }

            .day-number {
              font-size: 16px;
              font-weight: 500;
              color: rgba(255, 255, 255, 0.9);
              margin-bottom: 2px;
            }

            .day-text {
              font-size: 10px;
              color: rgba(255, 255, 255, 0.8);
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;

      .welcome-date {
        margin-top: 16px;
        width: 100%;
      }
    }
  }

  .music-player-section {
    margin: 28px 0;
    position: relative;
    z-index: 1;

    .music-player-card {
      border-radius: 16px;
      overflow: hidden;
      border: none;
      background: linear-gradient(145deg, #ffffff, #f7faff);
      box-shadow: 0 10px 20px rgba(24, 144, 255, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(24, 144, 255, 0.15);
      }

      .music-player-content {
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 24px;

        @media (max-width: 768px) {
          flex-direction: column;
          gap: 16px;
        }

        .music-cover-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          min-width: 200px;

          .music-cover {
            width: 120px;
            height: 120px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            .cover-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .image-slot {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              background: #f5f7fa;
              color: #909399;
              font-size: 30px;
            }
          }

          .music-controls {
            display: flex;
            gap: 12px;

            .el-button {
              width: 40px;
              height: 40px;
              font-size: 16px;
              transition: all 0.3s ease;

              &:hover {
                transform: scale(1.1);
              }
            }
          }
        }

        .music-info {
          flex: 1;
          min-width: 0;

          .music-title {
            margin-bottom: 16px;

            .music-name {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 1.4;
            }
          }

          .music-progress {
            .el-slider {
              margin-bottom: 8px;
            }

            .time-info {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }

  .quick-navigate-section {
    margin-bottom: 28px;
    position: relative;
    z-index: 1;

    .navigate-card {
      height: 120px;
      cursor: pointer;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      margin-bottom: 20px;
      transition: all 0.3s;
      border: none;
      overflow: hidden;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(to right, #1890ff, #36cfc9);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        background: #f0f9ff;

        &::after {
          transform: scaleX(1);
        }
      }

      .navigate-icon {
        font-size: 36px;
        color: #1890ff;
        margin-bottom: 12px;
        transition: all 0.3s;
      }

      .navigate-text {
        font-size: 16px;
        color: #606266;
        font-weight: 500;
      }
    }
  }

  .widgets-section {
    position: relative;
    z-index: 1;
    margin-top: 28px;

    .widget-card {
      margin-bottom: 24px;
      border-radius: 12px;
      transition: all 0.3s;
      overflow: hidden;
      border: none;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
      }
    }

    .time-weather-card {
      .time-weather-content {
        display: flex;
        padding: 0;

        @media (max-width: 768px) {
          flex-direction: column;
        }

        .time-column {
          flex: 1;
          padding: 28px 30px;
          background: linear-gradient(145deg, #ffffff, #f9f9f9);
          display: flex;
          flex-direction: column;
          border-right: 1px solid #f0f0f0;

          @media (max-width: 768px) {
            border-right: none;
            border-bottom: 1px solid #f0f0f0;
          }

          .current-time-display {
            text-align: center;

            .current-time {
              font-size: 52px;
              font-weight: 700;
              color: #303133;
              margin-bottom: 5px;
              font-family: "Arial", sans-serif;
              letter-spacing: 2px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .current-date {
              font-size: 18px;
              color: #606266;
              margin-bottom: 20px;
              letter-spacing: 0.5px;
            }
          }

          .time-divider {
            height: 1px;
            background: linear-gradient(
              to right,
              transparent,
              #e0e0e0,
              transparent
            );
            margin: 10px 0 20px;
          }

          .world-clocks {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;

            .world-clock-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 16px 10px;
              border-radius: 10px;
              background: linear-gradient(145deg, #f8f9fa, #f0f2f5);
              box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
              transition: all 0.3s ease;

              &:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
              }

              .clock-location {
                font-size: 14px;
                color: #606266;
                margin-bottom: 8px;
                font-weight: 600;
              }

              .clock-time {
                font-size: 20px;
                font-weight: 700;
                color: #303133;
              }
            }
          }
        }

        .weather-column {
          flex: 1;
          padding: 0;
          display: flex;
          flex-direction: column;

          .weather-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #f0f0f0;

            h3 {
              margin: 0;
              font-size: 18px;
              font-weight: 600;
              color: #303133;
            }

            .weather-search {
              width: 180px;
            }
          }

          .weather-display {
            flex: 1;
            padding: 24px 30px;
            background: linear-gradient(145deg, #f0f9ff 0%, #e6f7ff 100%);

            .weather-main-info {
              .weather-city-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;

                .city-name {
                  font-size: 24px;
                  font-weight: 700;
                  color: #303133;
                }

                .refresh-time {
                  font-size: 12px;
                  color: #909399;
                }
              }

              .weather-details-container {
                display: flex;
                align-items: center;
                justify-content: space-between;

                @media (max-width: 576px) {
                  flex-direction: column;
                  align-items: flex-start;
                }

                .weather-icon-temperature {
                  display: flex;
                  align-items: center;
                  gap: 20px;

                  .weather-icon {
                    font-size: 70px;
                    color: #1890ff;
                    filter: drop-shadow(0 3px 6px rgba(24, 144, 255, 0.3));
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    .weather-condition {
                      font-size: 16px;
                      color: #606266;
                      margin-top: 5px;
                    }
                  }

                  .weather-temperature {
                    font-size: 48px;
                    font-weight: 700;
                    color: #303133;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                  }
                }

                .weather-metrics {
                  display: flex;
                  gap: 16px;
                  margin-top: 20px;

                  @media (min-width: 576px) {
                    margin-top: 0;
                  }

                  .weather-metric-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.6);
                    padding: 8px 16px;
                    border-radius: 30px;
                    font-size: 16px;
                    color: #606266;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;

                    &:hover {
                      background: rgba(255, 255, 255, 0.8);
                      transform: translateY(-3px);
                      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
                    }

                    .el-icon {
                      font-size: 18px;
                      color: #1890ff;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.music-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.album-cover {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  object-fit: cover;
}

.music-details {
  flex: 1;
}

.music-name {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
}

.music-progress {
  width: 300px;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.music-controls {
  display: flex;
  gap: 10px;
}
</style>
