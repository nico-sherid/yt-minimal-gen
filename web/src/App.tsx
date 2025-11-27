import { useMixerStore } from './store/mixerStore';
import { useYouTubeApi } from './hooks/useYouTubeApi';
import { TrackControl } from './components/TrackControl';
import { MixerControl } from './components/MixerControl';

function App() {
  const tracks = useMixerStore((state) => state.tracks);
  const { isApiReady } = useYouTubeApi();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Minimal Loop Mixer</h1>
        <p className="text-sm text-gray-500">
          8-track YouTube loop mixer for experimental music
        </p>
      </header>

      {/* API ローディング表示 */}
      {!isApiReady && (
        <div className="text-center py-8 text-gray-500">
          Loading YouTube API...
        </div>
      )}

      {/* Mixer Controls */}
      {isApiReady && <MixerControl />}

      {/* Track Grid */}
      {isApiReady && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <TrackControl key={track.id} track={track} />
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-600">
        Press "Reroll All" to load random videos, then "Play All" to start the mix
      </footer>
    </div>
  );
}

export default App;
