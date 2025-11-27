import { useCallback, useState } from 'react';
import { useMixerStore, AVAILABLE_LOOP_DURATIONS, type Track } from '../store/mixerStore';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useVideoSearch } from '../hooks/useYouTubeApi';

interface TrackControlProps {
  track: Track;
}

export const TrackControl = ({ track }: TrackControlProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const containerId = `youtube-player-${track.id}`;

  const {
    setTrackVideo,
    setTrackVolume,
    toggleTrackMute,
    setTrackLoopDuration,
    setTrackPlaying,
    clearTrack,
  } = useMixerStore();

  const { setRandomStartTime } = useYouTubePlayer({
    track,
    containerId,
  });

  const { searchRandomVideo } = useVideoSearch();

  // 動画を再抽選
  const handleReroll = useCallback(async () => {
    setIsLoading(true);
    try {
      const video = await searchRandomVideo();
      if (video) {
        setTrackVideo(track.id, video.videoId, video.title, video.thumbnailUrl);
      }
    } finally {
      setIsLoading(false);
    }
  }, [track.id, searchRandomVideo, setTrackVideo]);

  // 再生/停止
  const handleTogglePlay = useCallback(() => {
    if (!track.videoId) return;
    setTrackPlaying(track.id, !track.isPlaying);
  }, [track.id, track.videoId, track.isPlaying, setTrackPlaying]);

  return (
    <div className="bg-gray-900 rounded-lg p-3 flex flex-col gap-2">
      {/* トラック番号 */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-mono">Track {track.id + 1}</span>
        {track.videoId && (
          <button
            onClick={() => clearTrack(track.id)}
            className="text-gray-500 hover:text-red-400 text-xs"
            title="Clear track"
          >
            x
          </button>
        )}
      </div>

      {/* 動画表示エリア */}
      <div className="relative aspect-video bg-black rounded overflow-hidden">
        {track.videoId ? (
          <div id={containerId} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-600 text-sm">No video</span>
          </div>
        )}

        {/* サムネイルをオーバーレイ（再生中は透明） */}
        {track.thumbnailUrl && !track.isPlaying && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${track.thumbnailUrl})` }}
          />
        )}

        {/* 再生/停止ボタン */}
        {track.videoId && (
          <button
            onClick={handleTogglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
          >
            <span className="text-white text-3xl">
              {track.isPlaying ? '||' : '|>'}
            </span>
          </button>
        )}
      </div>

      {/* タイトル */}
      <div className="text-xs text-gray-400 truncate h-4">
        {track.videoTitle || 'Empty'}
      </div>

      {/* コントロール */}
      <div className="flex flex-col gap-2">
        {/* ループ時間 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12">Loop</span>
          <select
            value={track.loopDuration}
            onChange={(e) => setTrackLoopDuration(track.id, Number(e.target.value))}
            className="flex-1 bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-700"
          >
            {AVAILABLE_LOOP_DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}s
              </option>
            ))}
          </select>
        </div>

        {/* 音量 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleTrackMute(track.id)}
            className={`w-12 text-xs ${track.isMuted ? 'text-red-400' : 'text-gray-400'}`}
          >
            {track.isMuted ? 'Muted' : 'Vol'}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={track.volume}
            onChange={(e) => setTrackVolume(track.id, Number(e.target.value))}
            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={track.isMuted}
          />
          <span className="text-xs text-gray-500 w-8 text-right">
            {track.volume}
          </span>
        </div>

        {/* ボタン */}
        <div className="flex gap-1">
          <button
            onClick={handleReroll}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-xs py-1.5 rounded transition-colors"
          >
            {isLoading ? '...' : 'Reroll'}
          </button>
          {track.videoId && (
            <button
              onClick={setRandomStartTime}
              className="px-2 bg-gray-700 hover:bg-gray-600 text-white text-xs py-1.5 rounded transition-colors"
              title="Randomize start position"
            >
              Seek
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
