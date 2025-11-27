import { useEffect, useRef, useCallback } from 'react';
import type { YouTubePlayer } from '../types/youtube';
import { PlayerState } from '../types/youtube';
import { useMixerStore, type Track } from '../store/mixerStore';

interface UseYouTubePlayerProps {
  track: Track;
  containerId: string;
}

export const useYouTubePlayer = ({ track, containerId }: UseYouTubePlayerProps) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const loopIntervalRef = useRef<number | null>(null);
  const isApiReady = useMixerStore((state) => state.isApiReady);
  const setTrackStartTime = useMixerStore((state) => state.setTrackStartTime);

  // プレイヤーを破棄
  const destroyPlayer = useCallback(() => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
  }, []);

  // ループ処理を開始
  const startLoopInterval = useCallback(() => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
    }

    loopIntervalRef.current = window.setInterval(() => {
      if (!playerRef.current) return;

      try {
        const currentTime = playerRef.current.getCurrentTime();
        const startTime = track.startTime;
        const endTime = startTime + track.loopDuration;

        if (currentTime >= endTime || currentTime < startTime) {
          playerRef.current.seekTo(startTime, true);
        }
      } catch {
        // ignore
      }
    }, 100); // 100msごとにチェック
  }, [track.startTime, track.loopDuration]);

  // プレイヤーを初期化
  useEffect(() => {
    if (!isApiReady || !track.videoId) {
      return;
    }

    // 既存のプレイヤーを破棄
    destroyPlayer();

    // コンテナ要素の存在確認
    const container = document.getElementById(containerId);
    if (!container) return;

    // 新しいプレイヤーを作成
    try {
      playerRef.current = new window.YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId: track.videoId,
        playerVars: {
          autoplay: track.isPlaying ? 1 : 0,
          controls: 0,
          loop: 0,
          mute: track.isMuted ? 1 : 0,
          start: Math.floor(track.startTime),
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(track.volume);
            if (track.isMuted) {
              event.target.mute();
            }
            if (track.isPlaying) {
              event.target.seekTo(track.startTime, true);
              event.target.playVideo();
              startLoopInterval();
            }
          },
          onStateChange: (event) => {
            if (event.data === PlayerState.ENDED) {
              // ループ再開
              event.target.seekTo(track.startTime, true);
              event.target.playVideo();
            }
          },
        },
      });
    } catch {
      // ignore
    }

    return () => {
      destroyPlayer();
    };
  }, [isApiReady, track.videoId, containerId]);

  // 再生状態の変更
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (track.isPlaying) {
        playerRef.current.playVideo();
        startLoopInterval();
      } else {
        playerRef.current.pauseVideo();
        if (loopIntervalRef.current) {
          clearInterval(loopIntervalRef.current);
          loopIntervalRef.current = null;
        }
      }
    } catch {
      // ignore
    }
  }, [track.isPlaying, startLoopInterval]);

  // 音量の変更
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      playerRef.current.setVolume(track.volume);
    } catch {
      // ignore
    }
  }, [track.volume]);

  // ミュート状態の変更
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (track.isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    } catch {
      // ignore
    }
  }, [track.isMuted]);

  // ループ時間の変更
  useEffect(() => {
    if (!playerRef.current || !track.isPlaying) return;

    startLoopInterval();
  }, [track.loopDuration, track.startTime, startLoopInterval]);

  // ランダムな開始位置を設定
  const setRandomStartTime = useCallback(() => {
    if (!playerRef.current) return;

    try {
      const duration = playerRef.current.getDuration();
      if (duration > track.loopDuration) {
        const maxStart = duration - track.loopDuration;
        const randomStart = Math.floor(Math.random() * maxStart);
        setTrackStartTime(track.id, randomStart);
        playerRef.current.seekTo(randomStart, true);
      }
    } catch {
      // ignore
    }
  }, [track.id, track.loopDuration, setTrackStartTime]);

  return {
    player: playerRef.current,
    setRandomStartTime,
  };
};
