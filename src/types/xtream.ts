export interface XtreamAuthResponse {
  user_info: {
    username: string;
    password?: string;
    message?: string;
    auth: number;
    status: string;
    exp_date: string; // timestamp or formatted date
    is_trial: string;
    active_cons: string;
    created_at: string;
    max_connections: string;
    allowed_output_formats: string[];
  };
  server_info: {
    url?: string;
    port?: string;
    https_port?: string;
    server_protocol?: string;
    rtmp_port?: string;
    timezone?: string;
    time_now?: string;
  };
}

export interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id?: number;
}

export interface XtreamLiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface XtreamVodStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string | number;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

export interface XtreamVodInfo {
  info: {
    movie_image?: string;
    tmdb_id?: string;
    name?: string;
    o_name?: string;
    cover_big?: string;
    releasedate?: string;
    episode_run_time?: string | number;
    duration_secs?: number;
    duration?: string;
    youtube_trailer?: string;
    director?: string;
    actors?: string;
    cast?: string;
    description?: string;
    plot?: string;
    age?: string;
    rating?: string | number;
    genre?: string;
    backdrop_path?: string[];
  };
  movie_data: {
    stream_id: number;
    name: string;
    container_extension: string;
  };
}

export interface XtreamSeries {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

export interface XtreamSeriesInfo {
  seasons: Array<{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    season_number: number;
    cover: string;
    cover_big: string;
  }>;
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    backdrop_path: string[];
    rating: string;
  };
  episodes: {
    [seasonNumber: string]: Array<{
      id: string;
      episode_num: number;
      title: string;
      container_extension: string;
      info: {
        duration_secs?: number;
        duration?: string;
        plot?: string;
        rating?: number;
        movie_image?: string;
      };
    }>;
  };
}

export interface SavedAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  serverUrl: string;
  status?: string;
  expDate?: string;
  maxConnections?: string;
  lastLogin?: string;
}

