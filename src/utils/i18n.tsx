import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

export const translations = {
  es: {
    // Header & Common
    app_title: 'IPTV NOVA',
    app_plus: 'PLUS',
    admin_users: 'Administrador de Usuarios',
    select_account: 'Seleccionar Cuenta / Usuario',
    select_account_desc: 'Elige un usuario existente o agrega una nueva lista de reproducción',
    add_user: 'AGREGAR USUARIO',
    edit_account: 'EDITAR CUENTA',
    new_account: 'AGREGAR NUEVA CUENTA',
    profile_name_opt: 'Nombre del Perfil (Opcional)',
    profile_name_placeholder: 'Ej: Cuenta Personal / Casa',
    user_label: '1. Usuario',
    user_placeholder: 'Tu usuario de IPTV',
    pass_label: '2. Contraseña',
    server_label: '3. URL del Servidor / Host',
    server_placeholder: 'http://servidor-iptv.com:8080',
    cancel: 'CANCELAR',
    save_connect: 'GUARDAR Y CONECTAR',
    connect_server: 'CONECTAR CON SERVIDOR',
    try_demo: 'Probar en MODO DEMO',
    active_status: 'Activo',
    expired_status: 'Expirado',
    expires_on: 'Expira:',
    never_expires: 'Ilimitado',
    delete_confirm: '¿Eliminar cuenta permanentemente?',
    
    // Dashboard
    user_badge: 'USUARIO:',
    exp_badge: 'EXPIRA:',
    card_live: 'TV EN VIVO',
    card_live_desc: 'Canales de televisión en directo con EPG interactivo',
    card_movies: 'PELÍCULAS',
    card_movies_desc: 'Estrenos, películas en alta definición y trailers oficiales',
    card_series: 'SERIES',
    card_series_desc: 'Temporadas completas, episodios y selección de pistas',
    nav_favorites: 'Mis Favoritos',
    nav_profile: 'Mi Perfil',
    nav_accounts: 'Cambiar Cuenta',
    nav_settings: 'Ajustes',
    
    // Live / Channels
    categories: 'CATEGORÍAS',
    all_channels: 'Todos los Canales',
    search_placeholder: 'Buscar canal o contenido...',
    no_channels: 'No se encontraron canales en esta categoría',
    audio_sub_select: 'Pistas de audio y subtítulos',
    aspect_ratio: 'Relación de aspecto',
    pin_required: 'Contenido para adultos protegido por PIN',
    
    // Movies & Series
    play_now: 'Reproducir',
    watch_trailer: 'Ver Tráiler Oficial',
    add_favorites: 'Añadir a Favoritos',
    remove_favorites: 'Quitar de Favoritos',
    genres: 'Género',
    year: 'Año',
    rating: 'Calificación',
    synopsis: 'Sinopsis',
    cast: 'Reparto',
    episodes: 'Episodios',
    seasons: 'Temporadas',
    
    // Settings
    settings_title: 'Ajustes y Configuración',
    parental_control: 'Control Parental (+18)',
    parental_desc: 'Protege las categorías de adultos con un código PIN de 4 dígitos',
    parental_active: 'Control Parental Activo',
    parental_inactive: 'Control Parental Desactivado',
    change_pin: 'Cambiar Código PIN',
    default_pin_hint: 'PIN por defecto: 0000',
    stream_format: 'Formato de Transmisión',
    language_setting: 'Idioma de la Aplicación / Language',
    language_desc: 'Selecciona tu idioma preferido para la interfaz',
    
    // Player
    player_back: 'Volver',
    player_audio: 'Pistas de Audio',
    player_subs: 'Subtítulos',
    player_subs_off: 'Desactivados',
    player_aspect: 'Aspect Ratio',
    player_speed: 'Velocidad',
    aspect_16_9: '16:9 Estándar',
    aspect_fit: 'Ajustar a Pantalla',
    aspect_zoom: 'Zoom / Llenar',
    
    // Pin Modal
    enter_pin: 'Introduce el PIN de 4 dígitos',
    pin_hint: 'Por defecto: 0000',
    pin_incorrect: 'PIN incorrecto. Inténtalo de nuevo.',
    new_pin: 'Introduce el nuevo PIN de 4 dígitos',
    pin_updated: 'PIN actualizado correctamente',
    
    // Profile Modal
    profile_title: 'Perfil de Usuario',
    server_info: 'Información del Servidor',
    account_status: 'Estado de la Cuenta',
    max_connections: 'Conexiones Permitidas',
    created_at: 'Creado el',
    close: 'Cerrar'
  },
  en: {
    // Header & Common
    app_title: 'IPTV NOVA',
    app_plus: 'PLUS',
    admin_users: 'User Account Manager',
    select_account: 'Select User Account',
    select_account_desc: 'Choose an existing user or add a new playlist',
    add_user: 'ADD USER',
    edit_account: 'EDIT ACCOUNT',
    new_account: 'ADD NEW ACCOUNT',
    profile_name_opt: 'Profile Name (Optional)',
    profile_name_placeholder: 'e.g. My Home Account',
    user_label: '1. Username',
    user_placeholder: 'Your IPTV username',
    pass_label: '2. Password',
    server_label: '3. Server URL / Host',
    server_placeholder: 'http://iptv-server.com:8080',
    cancel: 'CANCEL',
    save_connect: 'SAVE & CONNECT',
    connect_server: 'CONNECT TO SERVER',
    try_demo: 'Try DEMO MODE',
    active_status: 'Active',
    expired_status: 'Expired',
    expires_on: 'Expires:',
    never_expires: 'Unlimited',
    delete_confirm: 'Permanently delete account?',
    
    // Dashboard
    user_badge: 'USER:',
    exp_badge: 'EXPIRES:',
    card_live: 'LIVE TV',
    card_live_desc: 'Live television channels with interactive EPG',
    card_movies: 'MOVIES',
    card_movies_desc: 'Latest releases, high-definition movies & official trailers',
    card_series: 'TV SERIES',
    card_series_desc: 'Full seasons, episodes, and multi-track audio selection',
    nav_favorites: 'My Favorites',
    nav_profile: 'My Profile',
    nav_accounts: 'Switch Account',
    nav_settings: 'Settings',
    
    // Live / Channels
    categories: 'CATEGORIES',
    all_channels: 'All Channels',
    search_placeholder: 'Search channel or title...',
    no_channels: 'No channels found in this category',
    audio_sub_select: 'Audio tracks and subtitles',
    aspect_ratio: 'Aspect ratio',
    pin_required: 'Adult content protected by PIN',
    
    // Movies & Series
    play_now: 'Play Movie',
    watch_trailer: 'Official Trailer',
    add_favorites: 'Add to Favorites',
    remove_favorites: 'Remove from Favorites',
    genres: 'Genre',
    year: 'Year',
    rating: 'Rating',
    synopsis: 'Synopsis',
    cast: 'Cast',
    episodes: 'Episodes',
    seasons: 'Seasons',
    
    // Settings
    settings_title: 'Settings & Preferences',
    parental_control: 'Parental Control (+18)',
    parental_desc: 'Protect adult categories with a 4-digit PIN code',
    parental_active: 'Parental Control Enabled',
    parental_inactive: 'Parental Control Disabled',
    change_pin: 'Change PIN Code',
    default_pin_hint: 'Default PIN: 0000',
    stream_format: 'Stream Format Protocol',
    language_setting: 'Application Language',
    language_desc: 'Select your preferred interface language',
    
    // Player
    player_back: 'Back',
    player_audio: 'Audio Tracks',
    player_subs: 'Subtitles',
    player_subs_off: 'Disabled',
    player_aspect: 'Aspect Ratio',
    player_speed: 'Playback Speed',
    aspect_16_9: '16:9 Standard',
    aspect_fit: 'Fit to Screen',
    aspect_zoom: 'Zoom / Fill',
    
    // Pin Modal
    enter_pin: 'Enter 4-digit PIN',
    pin_hint: 'Default: 0000',
    pin_incorrect: 'Incorrect PIN. Please try again.',
    new_pin: 'Enter new 4-digit PIN',
    pin_updated: 'PIN updated successfully',
    
    // Profile Modal
    profile_title: 'User Profile Details',
    server_info: 'Server Information',
    account_status: 'Account Status',
    max_connections: 'Allowed Connections',
    created_at: 'Created on',
    close: 'Close'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['es']) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] || key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('iptv_language');
      if (stored === 'es' || stored === 'en') return stored;
      // Default to English unless browser/TV is explicitly Spanish
      const sysLang = (navigator.language || '').toLowerCase();
      return sysLang.startsWith('es') ? 'es' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('iptv_language', lang);
    } catch {}
  };

  const t = (key: keyof typeof translations['es']): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

