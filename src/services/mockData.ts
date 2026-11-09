import {
  XtreamAuthResponse,
  XtreamCategory,
  XtreamLiveStream,
  XtreamVodStream,
  XtreamSeries,
  XtreamSeriesInfo
} from '../types/xtream';

export const mockAuthResponse: XtreamAuthResponse = {
  user_info: {
    username: 'DemoUser',
    auth: 1,
    status: 'Active',
    exp_date: '1798761600', // Far future
    is_trial: '0',
    active_cons: '1',
    created_at: '1672531199',
    max_connections: '2',
    allowed_output_formats: ['m3u8', 'ts', 'mp4', 'mkv']
  },
  server_info: {
    url: 'demo.iptvsmarters.tv',
    port: '80',
    server_protocol: 'http',
    timezone: 'America/New_York',
    time_now: new Date().toISOString()
  }
};

export const mockLiveCategories: XtreamCategory[] = [
  { category_id: '1', category_name: 'DEPORTES EN VIVO (SPORTS HD)' },
  { category_id: '2', category_name: 'CINE Y ENTRETENIMIENTO' },
  { category_id: '3', category_name: 'NOTICIAS 24/7' },
  { category_id: '4', category_name: 'INFANTIL & ANIMACIÓN' },
  { category_id: '5', category_name: 'DOCUMENTALES & NATURALEZA' },
  { category_id: '6', category_name: 'MÚSICA & EVENTOS' }
];

export const mockLiveStreams: XtreamLiveStream[] = [
  {
    num: 1,
    name: 'ESPN 1 HD Latino',
    stream_type: 'live',
    stream_id: 101,
    stream_icon: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&q=80',
    epg_channel_id: 'espn1.hd',
    added: '1600000000',
    category_id: '1',
    custom_sid: '',
    tv_archive: 1,
    direct_source: '',
    tv_archive_duration: 7
  },
  {
    num: 2,
    name: 'ESPN 2 HD Premium',
    stream_type: 'live',
    stream_id: 102,
    stream_icon: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&q=80',
    epg_channel_id: 'espn2.hd',
    added: '1600000000',
    category_id: '1',
    custom_sid: '',
    tv_archive: 1,
    direct_source: '',
    tv_archive_duration: 7
  },
  {
    num: 3,
    name: 'FOX Sports 1 HD',
    stream_type: 'live',
    stream_id: 103,
    stream_icon: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&q=80',
    epg_channel_id: 'foxsports1.hd',
    added: '1600000000',
    category_id: '1',
    custom_sid: '',
    tv_archive: 1,
    direct_source: '',
    tv_archive_duration: 7
  },
  {
    num: 4,
    name: 'HBO Signature 4K',
    stream_type: 'live',
    stream_id: 201,
    stream_icon: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=150&q=80',
    epg_channel_id: 'hbo.4k',
    added: '1600000000',
    category_id: '2',
    custom_sid: '',
    tv_archive: 1,
    direct_source: '',
    tv_archive_duration: 7
  },
  {
    num: 5,
    name: 'Warner Channel HD',
    stream_type: 'live',
    stream_id: 202,
    stream_icon: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&q=80',
    epg_channel_id: 'warner.hd',
    added: '1600000000',
    category_id: '2',
    custom_sid: '',
    tv_archive: 1,
    direct_source: '',
    tv_archive_duration: 7
  },
  {
    num: 6,
    name: 'CNN en Español',
    stream_type: 'live',
    stream_id: 301,
    stream_icon: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&q=80',
    epg_channel_id: 'cnn.es',
    added: '1600000000',
    category_id: '3',
    custom_sid: '',
    tv_archive: 1,
    direct_source: '',
    tv_archive_duration: 7
  },
  {
    num: 7,
    name: 'Discovery Channel HD',
    stream_type: 'live',
    stream_id: 501,
    stream_icon: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&q=80',
    epg_channel_id: 'discovery.hd',
    added: '1600000000',
    category_id: '5',
    custom_sid: '',
    tv_archive: 1,
    direct_source: '',
    tv_archive_duration: 7
  },
  {
    num: 8,
    name: 'National Geographic Wild',
    stream_type: 'live',
    stream_id: 502,
    stream_icon: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&q=80',
    epg_channel_id: 'natgeowild.hd',
    added: '1600000000',
    category_id: '5',
    custom_sid: '',
    tv_archive: 1,
    direct_source: '',
    tv_archive_duration: 7
  }
];

export const mockVodCategories: XtreamCategory[] = [
  { category_id: '10', category_name: 'ESTRENOS 2026 / 2025' },
  { category_id: '11', category_name: 'ACCIÓN Y AVENTURA' },
  { category_id: '12', category_name: 'CIENCIA FICCIÓN' },
  { category_id: '13', category_name: 'COMEDIA & FAMILIAR' },
  { category_id: '14', category_name: 'TERROR & SUSPENSO' }
];

export const mockVodStreams: XtreamVodStream[] = [
  {
    num: 1,
    name: 'Gladiator II (2024)',
    stream_type: 'movie',
    stream_id: 5001,
    stream_icon: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
    rating: '8.4',
    rating_5based: 4.2,
    added: '1600000000',
    category_id: '10',
    container_extension: 'mp4',
    custom_sid: '',
    direct_source: ''
  },
  {
    num: 2,
    name: 'Dune: Part Two (2024)',
    stream_type: 'movie',
    stream_id: 5002,
    stream_icon: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
    rating: '8.8',
    rating_5based: 4.4,
    added: '1600000000',
    category_id: '12',
    container_extension: 'mp4',
    custom_sid: '',
    direct_source: ''
  },
  {
    num: 3,
    name: 'Oppenheimer (2023)',
    stream_type: 'movie',
    stream_id: 5003,
    stream_icon: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&q=80',
    rating: '8.9',
    rating_5based: 4.5,
    added: '1600000000',
    category_id: '10',
    container_extension: 'mp4',
    custom_sid: '',
    direct_source: ''
  },
  {
    num: 4,
    name: 'John Wick: Chapter 4',
    stream_type: 'movie',
    stream_id: 5004,
    stream_icon: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    rating: '8.0',
    rating_5based: 4.0,
    added: '1600000000',
    category_id: '11',
    container_extension: 'mp4',
    custom_sid: '',
    direct_source: ''
  },
  {
    num: 5,
    name: 'Deadpool & Wolverine',
    stream_type: 'movie',
    stream_id: 5005,
    stream_icon: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
    rating: '8.2',
    rating_5based: 4.1,
    added: '1600000000',
    category_id: '10',
    container_extension: 'mp4',
    custom_sid: '',
    direct_source: ''
  }
];

export const mockSeriesCategories: XtreamCategory[] = [
  { category_id: '20', category_name: 'SERIES TENDENCIAS' },
  { category_id: '21', category_name: 'DRAMA & SUSPENSO' },
  { category_id: '22', category_name: 'CIENCIA FICCIÓN' }
];

export const mockSeriesList: XtreamSeries[] = [
  {
    num: 1,
    name: 'The Last of Us',
    series_id: 9001,
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    plot: 'Veinte años después de que una plaga diezmara la civilización, Joel es contratado para sacar de contrabando a Ellie, una niña de 14 años, de una opresiva zona de cuarentena.',
    cast: 'Pedro Pascal, Bella Ramsey',
    director: 'Craig Mazin, Neil Druckmann',
    genre: 'Drama, Sci-Fi',
    releaseDate: '2023',
    last_modified: '1680000000',
    rating: '8.9',
    rating_5based: 4.5,
    backdrop_path: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80'],
    youtube_trailer: '',
    episode_run_time: '60',
    category_id: '20'
  },
  {
    num: 2,
    name: 'Stranger Things',
    series_id: 9002,
    cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
    plot: 'Cuando un niño desaparece, un pequeño pueblo descubre un misterio que involucra experimentos secretos y fuerzas sobrenaturales terroríficas.',
    cast: 'Millie Bobby Brown, Finn Wolfhard',
    director: 'The Duffer Brothers',
    genre: 'Sci-Fi, Terror',
    releaseDate: '2016-2025',
    last_modified: '1680000000',
    rating: '8.7',
    rating_5based: 4.4,
    backdrop_path: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80'],
    youtube_trailer: '',
    episode_run_time: '55',
    category_id: '20'
  },
  {
    num: 3,
    name: 'House of the Dragon',
    series_id: 9003,
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
    plot: 'La historia de la Casa Targaryen, ambientada 200 años antes de los acontecimientos de Juego de Tronos.',
    cast: 'Matt Smith, Emma D\'Arcy',
    director: 'Ryan J. Condal',
    genre: 'Fantasía, Drama',
    releaseDate: '2022',
    last_modified: '1680000000',
    rating: '8.5',
    rating_5based: 4.3,
    backdrop_path: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80'],
    youtube_trailer: '',
    episode_run_time: '60',
    category_id: '21'
  }
];

export const mockSeriesDetails: { [key: number]: XtreamSeriesInfo } = {
  9001: {
    seasons: [
      {
        id: 1,
        season_number: 1,
        name: 'Temporada 1',
        episode_count: 3,
        air_date: '2023-01-15',
        overview: 'Primera temporada de The Last of Us',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
        cover_big: ''
      }
    ],
    info: {
      name: 'The Last of Us',
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
      plot: 'Veinte años después de una plaga apocalíptica, Joel acompaña a Ellie a través de unos Estados Unidos desolados.',
      cast: 'Pedro Pascal, Bella Ramsey',
      director: 'Craig Mazin',
      genre: 'Drama, Sci-Fi',
      releaseDate: '2023',
      backdrop_path: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80'],
      rating: '8.9'
    },
    episodes: {
      '1': [
        {
          id: '90011',
          episode_num: 1,
          title: 'Cuando estés perdido en la oscuridad',
          container_extension: 'mp4',
          info: {
            duration: '1h 21m',
            plot: 'Veinte años después de que un brote de hongos diezmara el planeta, los supervivientes Joel y Tess tienen la tarea de llevar a Ellie a salvo.'
          }
        },
        {
          id: '90012',
          episode_num: 2,
          title: 'Infectados',
          container_extension: 'mp4',
          info: {
            duration: '53m',
            plot: 'Después de escapar de la zona de cuarentena, Joel y Tess discuten sobre el destino de Ellie mientras atraviesan las ruinas de Boston.'
          }
        },
        {
          id: '90013',
          episode_num: 3,
          title: 'Mucho mucho tiempo',
          container_extension: 'mp4',
          info: {
            duration: '1h 15m',
            plot: 'Cuando un desconocido llega al complejo de Bill, ambos forjan una conexión poco probable.'
          }
        }
      ]
    }
  }
};

// Big Buck Bunny and standard test streams for preview
export const testLiveStreamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
export const testVodStreamUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
export const testSeriesStreamUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

