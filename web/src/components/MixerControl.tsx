import { useCallback, useState } from 'react';
import { useMixerStore } from '../store/mixerStore';
import { useVideoSearch } from '../hooks/useYouTubeApi';

export const MixerControl = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    tracks,
    searchKeyword,
    isGlobalPlaying,
    setSearchKeyword,
    setTrackVideo,
    toggleGlobalPlay,
    stopAll,
  } = useMixerStore();

  const { searchRandomVideo } = useVideoSearch();

  // 全トラックに動画をロード
  const handleRerollAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const promises = tracks.map(async (track) => {
        const video = await searchRandomVideo();
        if (video) {
          setTrackVideo(track.id, video.videoId, video.title, video.thumbnailUrl);
        }
      });
      await Promise.all(promises);
    } finally {
      setIsLoading(false);
    }
  }, [tracks, searchRandomVideo, setTrackVideo]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* 検索キーワード入力 */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Keyword:</label>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="bg-gray-700 text-white text-sm rounded px-3 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none w-48"
            placeholder="Search keyword..."
          />
        </div>

        {/* グローバルコントロール */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleGlobalPlay}
            className={`px-4 py-1.5 rounded font-medium text-sm transition-colors ${
              isGlobalPlaying
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isGlobalPlaying ? 'Pause All' : 'Play All'}
          </button>

          <button
            onClick={stopAll}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors"
          >
            Stop All
          </button>

          <button
            onClick={handleRerollAll}
            disabled={isLoading}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium text-sm transition-colors"
          >
            {isLoading ? 'Loading...' : 'Reroll All'}
          </button>
        </div>

        {/* ステータス表示 */}
        <div className="text-xs text-gray-500 ml-auto">
          {tracks.filter((t) => t.videoId).length} / 8 tracks loaded
        </div>
      </div>
    </div>
  );
};
