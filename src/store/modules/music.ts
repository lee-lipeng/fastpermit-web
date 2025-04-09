import { defineStore } from "pinia";
import { ref } from "vue";
import { ElMessage } from "element-plus";

interface MusicInfo {
  name: string;
  url: string;
  picurl: string;
}

export const useMusicStore = defineStore("music", () => {
  // 状态
  const audioPlayer = ref<HTMLAudioElement | null>(null);
  const currentMusic = ref<MusicInfo | null>(null);
  const musicLoading = ref(false);
  const isPlaying = ref(false);
  const currentTimeMusic = ref(0);
  const duration = ref(0);
  const currentProgress = ref(0);
  const musicHistory = ref<MusicInfo[]>([]);
  const currentMusicIndex = ref(-1);
  const isHandlingPlayFailure = ref(false);
  const hasFetchedMusic = ref(false);

  // 备用音乐列表
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
  ];

  // 初始化音频播放器
  const initAudioPlayer = () => {
    if (!audioPlayer.value) {
      audioPlayer.value = new Audio();
      audioPlayer.value.addEventListener("timeupdate", updateProgress);
      audioPlayer.value.addEventListener("loadedmetadata", onAudioLoaded);
      audioPlayer.value.addEventListener("ended", onAudioEnded);
    }
  };

  // 使用备用音乐
  const useBackupMusic = () => {
    if (backupMusicList.length > 0) {
      const randomIndex = Math.floor(Math.random() * backupMusicList.length);
      const backupMusic = backupMusicList[randomIndex];

      currentMusic.value = backupMusic;
      musicHistory.value.push(backupMusic);
      currentMusicIndex.value = musicHistory.value.length - 1;

      resetPlayProgress();
      ElMessage.success("已切换到备用音乐");
      return true;
    }
    return false;
  };

  // 获取随机音乐
  const fetchRandomMusic = async () => {
    musicLoading.value = true;
    pauseMusic();
    isHandlingPlayFailure.value = false;

    try {
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

      if (data.code === 1 && data.data) {
        const newMusic = {
          name: `${data.data.name} - ${data.data.artistsname || "未知歌手"}`,
          url: data.data.url,
          picurl:
            data.data.picurl ||
            "https://p2.music.126.net/hti_a0LADoFMBHvOBwAtRA==/109951167643767467.jpg",
        };

        const testAudio = new Audio();
        testAudio.src = newMusic.url;

        testAudio.addEventListener(
          "canplaythrough",
          () => {
            currentMusic.value = newMusic;
            musicHistory.value.push(newMusic);
            currentMusicIndex.value = musicHistory.value.length - 1;
            resetPlayProgress();
            hasFetchedMusic.value = true;
            ElMessage.success("获取音乐成功！请点击播放按钮开始播放");
          },
          { once: true }
        );

        testAudio.addEventListener(
          "error",
          () => {
            throw new Error("音乐URL无效");
          },
          { once: true }
        );

        testAudio.load();
      } else {
        throw new Error("获取音乐失败");
      }
    } catch (error) {
      console.error("获取随机音乐失败:", error);
      if (!useBackupMusic()) {
        ElMessage.error("获取音乐失败，请稍后再试");
      }
    } finally {
      musicLoading.value = false;
    }
  };

  // 播放上一首
  const prevMusic = () => {
    if (musicHistory.value.length > 1 && currentMusicIndex.value > 0) {
      currentMusicIndex.value--;
      currentMusic.value = musicHistory.value[currentMusicIndex.value];
      resetPlayProgress();
      playMusic();
    } else {
      ElMessage.info("已经是第一首歌曲了");
    }
  };

  // 播放下一首
  const nextMusic = () => {
    if (isHandlingPlayFailure.value) {
      return;
    }

    if (currentMusicIndex.value < musicHistory.value.length - 1) {
      currentMusicIndex.value++;
      currentMusic.value = musicHistory.value[currentMusicIndex.value];
      resetPlayProgress();
      playMusic();
    } else {
      fetchRandomMusic().then(() => {
        setTimeout(() => {
          playMusic();
        }, 500);
      });
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
      if (!hasFetchedMusic.value) {
        fetchRandomMusic().then(() => {
          setTimeout(() => {
            playMusic();
          }, 500);
        });
      }
      return;
    }

    if (audioPlayer.value) {
      isHandlingPlayFailure.value = false;

      if (audioPlayer.value.readyState >= 2 && currentTimeMusic.value > 0) {
        audioPlayer.value
          .play()
          .then(() => {
            isPlaying.value = true;
          })
          .catch((err) => {
            console.error("播放失败:", err);
            handlePlayError(err);
          });
        return;
      }

      audioPlayer.value.src = currentMusic.value.url;
      audioPlayer.value
        .play()
        .then(() => {
          isPlaying.value = true;
        })
        .catch((err) => {
          console.error("播放失败:", err);
          handlePlayError(err);
        });
    }
  };

  // 暂停音乐
  const pauseMusic = () => {
    if (audioPlayer.value) {
      audioPlayer.value.pause();
      isPlaying.value = false;
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
    isPlaying.value = false;
    nextMusic();
  };

  // 处理播放错误
  const handlePlayError = (err: Error) => {
    if (isHandlingPlayFailure.value) {
      return;
    }

    isHandlingPlayFailure.value = true;

    if (err.name === "NotAllowedError") {
      ElMessage({
        message: "请先点击页面任意位置与页面交互，然后再点击播放按钮",
        type: "warning",
        duration: 5000,
      });
      isHandlingPlayFailure.value = false;
    } else if (err.name === "NotSupportedError") {
      ElMessage.warning("音频格式不支持，尝试使用备用音乐");
      if (useBackupMusic()) {
        setTimeout(() => {
          if (audioPlayer.value) {
            audioPlayer.value.load();
          }
          isHandlingPlayFailure.value = false;
        }, 500);
      } else {
        isHandlingPlayFailure.value = false;
      }
    } else {
      ElMessage.error("播放失败，请稍后再试");
      isHandlingPlayFailure.value = false;
    }
  };

  // 拖动进度条
  const handleProgressChange = (value: number) => {
    if (audioPlayer.value && duration.value > 0) {
      const newTime = (value / 100) * duration.value;
      audioPlayer.value.currentTime = newTime;
      currentTimeMusic.value = newTime;
    }
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return {
    // 状态
    audioPlayer,
    currentMusic,
    musicLoading,
    isPlaying,
    currentTimeMusic,
    duration,
    currentProgress,
    musicHistory,
    currentMusicIndex,
    isHandlingPlayFailure,
    hasFetchedMusic,
    // 方法
    initAudioPlayer,
    fetchRandomMusic,
    prevMusic,
    nextMusic,
    playMusic,
    pauseMusic,
    resetPlayProgress,
    updateProgress,
    onAudioLoaded,
    onAudioEnded,
    handlePlayError,
    handleProgressChange,
    formatTime,
  };
});
