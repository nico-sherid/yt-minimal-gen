import { useEffect, useCallback } from 'react';
import { useMixerStore } from '../store/mixerStore';

let isApiLoading = false;
let isApiLoaded = false;
const apiReadyCallbacks: (() => void)[] = [];

export const useYouTubeApi = () => {
  const setApiReady = useMixerStore((state) => state.setApiReady);
  const isApiReady = useMixerStore((state) => state.isApiReady);

  useEffect(() => {
    if (isApiLoaded) {
      setApiReady(true);
      return;
    }

    if (isApiLoading) {
      apiReadyCallbacks.push(() => setApiReady(true));
      return;
    }

    isApiLoading = true;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      isApiLoaded = true;
      isApiLoading = false;
      setApiReady(true);
      apiReadyCallbacks.forEach((cb) => cb());
      apiReadyCallbacks.length = 0;
    };
  }, [setApiReady]);

  return { isApiReady };
};

// YouTube検索（フロントエンドのみで実現）
// 注意: YouTube Data API は API キーが必要です。
// 開発用に、ダミーの動画IDリストを使用するフォールバックを用意
const FALLBACK_VIDEOS = [
  { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio', thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg' },
  { id: '5qap5aO4i9A', title: 'lo-fi beats', thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg' },
  { id: 'DWcJFNfaw9c', title: 'ambient music', thumbnail: 'https://img.youtube.com/vi/DWcJFNfaw9c/mqdefault.jpg' },
  { id: 'lTRiuFIWV54', title: 'relaxing music', thumbnail: 'https://img.youtube.com/vi/lTRiuFIWV54/mqdefault.jpg' },
  { id: 'hHW1oY26kxQ', title: 'study music', thumbnail: 'https://img.youtube.com/vi/hHW1oY26kxQ/mqdefault.jpg' },
  { id: 'rUxyKA_-grg', title: 'nature sounds', thumbnail: 'https://img.youtube.com/vi/rUxyKA_-grg/mqdefault.jpg' },
  { id: 'lE6RYpe9IT0', title: 'rain sounds', thumbnail: 'https://img.youtube.com/vi/lE6RYpe9IT0/mqdefault.jpg' },
  { id: 'q76bMs-NwRk', title: 'coffee shop', thumbnail: 'https://img.youtube.com/vi/q76bMs-NwRk/mqdefault.jpg' },
  { id: 'WPni755-Krg', title: 'jazz music', thumbnail: 'https://img.youtube.com/vi/WPni755-Krg/mqdefault.jpg' },
  { id: 'sjkrrmBnpGE', title: 'chillhop', thumbnail: 'https://img.youtube.com/vi/sjkrrmBnpGE/mqdefault.jpg' },
  { id: 'kgx4WGK0oNU', title: 'meditation', thumbnail: 'https://img.youtube.com/vi/kgx4WGK0oNU/mqdefault.jpg' },
  { id: 'lCOF9LN_Zxs', title: 'synthwave', thumbnail: 'https://img.youtube.com/vi/lCOF9LN_Zxs/mqdefault.jpg' },
];

export interface VideoSearchResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}

export const useVideoSearch = () => {
  const searchKeyword = useMixerStore((state) => state.searchKeyword);

  const searchRandomVideo = useCallback(async (): Promise<VideoSearchResult | null> => {
    // フォールバック: ランダムに動画を選択
    const randomIndex = Math.floor(Math.random() * FALLBACK_VIDEOS.length);
    const video = FALLBACK_VIDEOS[randomIndex];
    return {
      videoId: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnail,
    };
  }, [searchKeyword]);

  return { searchRandomVideo };
};
