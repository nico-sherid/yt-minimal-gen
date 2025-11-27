import { create } from 'zustand';

export interface Track {
  id: number;
  videoId: string | null;
  videoTitle: string;
  thumbnailUrl: string;
  volume: number; // 0-100
  isMuted: boolean;
  loopDuration: number; // seconds
  isPlaying: boolean;
  startTime: number; // ループ開始位置（秒）
}

interface MixerState {
  tracks: Track[];
  searchKeyword: string;
  isGlobalPlaying: boolean;
  isApiReady: boolean;

  // Actions
  setApiReady: (ready: boolean) => void;
  setSearchKeyword: (keyword: string) => void;
  setTrackVideo: (trackId: number, videoId: string, title: string, thumbnailUrl: string) => void;
  setTrackVolume: (trackId: number, volume: number) => void;
  toggleTrackMute: (trackId: number) => void;
  setTrackLoopDuration: (trackId: number, duration: number) => void;
  setTrackPlaying: (trackId: number, isPlaying: boolean) => void;
  setTrackStartTime: (trackId: number, startTime: number) => void;
  toggleGlobalPlay: () => void;
  playAll: () => void;
  stopAll: () => void;
  clearTrack: (trackId: number) => void;
}

const LOOP_DURATIONS = [2, 3, 6, 8, 9, 12, 16];

const createInitialTracks = (): Track[] => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    videoId: null,
    videoTitle: '',
    thumbnailUrl: '',
    volume: 50,
    isMuted: false,
    loopDuration: LOOP_DURATIONS[Math.floor(Math.random() * LOOP_DURATIONS.length)],
    isPlaying: false,
    startTime: 0,
  }));
};

export const useMixerStore = create<MixerState>((set) => ({
  tracks: createInitialTracks(),
  searchKeyword: 'ambient noise',
  isGlobalPlaying: false,
  isApiReady: false,

  setApiReady: (ready) => set({ isApiReady: ready }),

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  setTrackVideo: (trackId, videoId, title, thumbnailUrl) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, videoId, videoTitle: title, thumbnailUrl, startTime: 0 }
          : track
      ),
    })),

  setTrackVolume: (trackId, volume) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, volume } : track
      ),
    })),

  toggleTrackMute: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, isMuted: !track.isMuted } : track
      ),
    })),

  setTrackLoopDuration: (trackId, duration) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, loopDuration: duration } : track
      ),
    })),

  setTrackPlaying: (trackId, isPlaying) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, isPlaying } : track
      ),
    })),

  setTrackStartTime: (trackId, startTime) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, startTime } : track
      ),
    })),

  toggleGlobalPlay: () =>
    set((state) => {
      const newIsPlaying = !state.isGlobalPlaying;
      return {
        isGlobalPlaying: newIsPlaying,
        tracks: state.tracks.map((track) =>
          track.videoId ? { ...track, isPlaying: newIsPlaying } : track
        ),
      };
    }),

  playAll: () =>
    set((state) => ({
      isGlobalPlaying: true,
      tracks: state.tracks.map((track) =>
        track.videoId ? { ...track, isPlaying: true } : track
      ),
    })),

  stopAll: () =>
    set((state) => ({
      isGlobalPlaying: false,
      tracks: state.tracks.map((track) => ({ ...track, isPlaying: false })),
    })),

  clearTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              videoId: null,
              videoTitle: '',
              thumbnailUrl: '',
              isPlaying: false,
              startTime: 0,
            }
          : track
      ),
    })),
}));

export const AVAILABLE_LOOP_DURATIONS = LOOP_DURATIONS;
