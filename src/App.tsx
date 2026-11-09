import React, { useState, useEffect } from 'react';
import { XtreamClient } from './services/xtream';
import { SavedAccount, XtreamLiveStream, XtreamVodStream, XtreamSeries } from './types/xtream';
import { AccountsScreen } from './components/AccountsScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { LiveScreen } from './components/LiveScreen';
import { MoviesScreen } from './components/MoviesScreen';
import { SeriesScreen } from './components/SeriesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { PlayerScreen } from './components/PlayerScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSpatialNav } from './hooks/useSpatialNav';

export type AppView = 'accounts' | 'dashboard' | 'live' | 'movies' | 'series' | 'favorites' | 'settings' | 'player';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('accounts');
  const [previousView, setPreviousView] = useState<AppView>('dashboard');
  const [client, setClient] = useState<XtreamClient | null>(null);
  const [account, setAccount] = useState<SavedAccount | null>(null);

  // Player state
  const [playerConfig, setPlayerConfig] = useState<{
    title: string;
    subtitle?: string;
    streamUrl: string;
    streamType: 'live' | 'movie' | 'series';
    currentLiveIndex?: number;
    liveChannelsList?: XtreamLiveStream[];
  } | null>(null);

  // Auto-login check if an active account was selected previously
  useEffect(() => {
    try {
      const activeId = localStorage.getItem('iptv_active_id');
      const stored = localStorage.getItem('iptv_accounts');
      if (stored) {
        const accountsList: SavedAccount[] = JSON.parse(stored);
        const found = accountsList.find(a => a.id === activeId) || accountsList[0];
        if (found) {
          const autoClient = new XtreamClient(found.serverUrl, found.username, found.password);
          setClient(autoClient);
          setAccount(found);
          setCurrentView('dashboard');
        }
      }
    } catch {
      // Stay on accounts view
    }
  }, []);

  // Back button handler for Smart TV remote control
  const handleBackAction = () => {
    if (currentView === 'player') {
      setCurrentView(previousView);
      setPlayerConfig(null);
    } else if (['live', 'movies', 'series', 'settings', 'favorites'].includes(currentView)) {
      setCurrentView('dashboard');
    } else if (currentView === 'dashboard') {
      // Go to accounts screen
      setCurrentView('accounts');
    }
  };

  useSpatialNav({
    onBack: handleBackAction
  });

  const handleSelectAccount = (newClient: XtreamClient, newAccount: SavedAccount) => {
    setClient(newClient);
    setAccount(newAccount);
    setCurrentView('dashboard');
  };

  const handleSwitchAccount = () => {
    setCurrentView('accounts');
  };

  const handleLogout = () => {
    localStorage.removeItem('iptv_active_id');
    setClient(null);
    setAccount(null);
    setCurrentView('accounts');
  };

  // Play Live Stream
  const handlePlayLiveStream = (stream: XtreamLiveStream, allStreams: XtreamLiveStream[]) => {
    if (!client) return;
    const format = (localStorage.getItem('iptv_format') as 'm3u8' | 'ts') || 'm3u8';
    const url = client.getLiveStreamUrl(stream.stream_id, format);
    const index = allStreams.findIndex(s => s.stream_id === stream.stream_id);

    setPreviousView('live');
    setPlayerConfig({
      title: stream.name,
      subtitle: `Canal #${stream.num || stream.stream_id}`,
      streamUrl: url,
      streamType: 'live',
      currentLiveIndex: index >= 0 ? index : 0,
      liveChannelsList: allStreams
    });
    setCurrentView('player');
  };

  // Switch Live Channel (Next / Prev)
  const handleSwitchChannel = (direction: 'next' | 'prev') => {
    if (!playerConfig || !playerConfig.liveChannelsList || playerConfig.currentLiveIndex === undefined || !client) return;
    const list = playerConfig.liveChannelsList;
    let newIndex = playerConfig.currentLiveIndex + (direction === 'next' ? 1 : -1);

    if (newIndex >= list.length) newIndex = 0;
    if (newIndex < 0) newIndex = list.length - 1;

    const nextStream = list[newIndex];
    const format = (localStorage.getItem('iptv_format') as 'm3u8' | 'ts') || 'm3u8';
    const url = client.getLiveStreamUrl(nextStream.stream_id, format);

    setPlayerConfig({
      ...playerConfig,
      title: nextStream.name,
      subtitle: `Canal #${nextStream.num || nextStream.stream_id}`,
      streamUrl: url,
      currentLiveIndex: newIndex
    });
  };

  // Play VOD Movie
  const handlePlayMovie = (movie: XtreamVodStream) => {
    if (!client) return;
    const ext = movie.container_extension || 'mp4';
    const url = client.getVodStreamUrl(movie.stream_id, ext);

    setPreviousView('movies');
    setPlayerConfig({
      title: movie.name,
      subtitle: 'Película',
      streamUrl: url,
      streamType: 'movie'
    });
    setCurrentView('player');
  };

  // Play Series Episode
  const handlePlayEpisode = (series: XtreamSeries, seasonNum: string, episode: any) => {
    if (!client) return;
    const url = client.getSeriesStreamUrl(episode.id, episode.container_extension || 'mp4');

    setPreviousView('series');
    setPlayerConfig({
      title: `${series.name} - T${seasonNum}:E${episode.episode_num || ''}`,
      subtitle: episode.title || 'Episodio',
      streamUrl: url,
      streamType: 'series'
    });
    setCurrentView('player');
  };

  return (
    <div className="h-full w-full bg-[#080d1a] text-white">
      <ErrorBoundary onReset={() => setCurrentView('dashboard')}>
        {currentView === 'accounts' && <AccountsScreen onSelectAccount={handleSelectAccount} />}

        {currentView === 'dashboard' && client && account && (
          <DashboardScreen
            client={client}
            account={account}
            onNavigate={view => setCurrentView(view)}
            onLogout={handleLogout}
            onSwitchAccount={handleSwitchAccount}
          />
        )}

        {currentView === 'live' && client && (
          <LiveScreen
            client={client}
            onBack={() => setCurrentView('dashboard')}
            onPlayStream={handlePlayLiveStream}
          />
        )}

        {currentView === 'favorites' && client && (
          <FavoritesScreen
            client={client}
            onBack={() => setCurrentView('dashboard')}
            onPlayLive={handlePlayLiveStream}
            onSelectMovie={handlePlayMovie}
            onSelectSeries={() => setCurrentView('series')}
          />
        )}

        {currentView === 'movies' && client && (
          <MoviesScreen
            client={client}
            onBack={() => setCurrentView('dashboard')}
            onPlayMovie={handlePlayMovie}
          />
        )}

        {currentView === 'series' && client && (
          <SeriesScreen
            client={client}
            onBack={() => setCurrentView('dashboard')}
            onPlayEpisode={handlePlayEpisode}
          />
        )}

        {currentView === 'settings' && client && account && (
          <SettingsScreen
            client={client}
            account={account}
            onBack={() => setCurrentView('dashboard')}
            onLogout={handleLogout}
            onSwitchAccount={handleSwitchAccount}
          />
        )}

        {currentView === 'player' && playerConfig && (
          <PlayerScreen
            title={playerConfig.title}
            subtitle={playerConfig.subtitle}
            streamUrl={playerConfig.streamUrl}
            streamType={playerConfig.streamType}
            onBack={handleBackAction}
            onNextChannel={() => handleSwitchChannel('next')}
            onPrevChannel={() => handleSwitchChannel('prev')}
          />
        )}
      </ErrorBoundary>
    </div>
  );
};
