# IPTV Nova Plus - Multiplataforma (LG webOS, Samsung Tizen, Android TV, Web)

Aplicación de IPTV completa basada en la **API de Xtream Codes**, diseñada con la interfaz y experiencia clásica de **IPTV Smarters** optimizada para Smart TVs.

---

## 📺 Características

1. **Dashboard Principal estilo Smarters:**
   - Título oficial: **IPTV NOVA PLUS** con animación arcoíris brillante.
   - Reloj digital en tiempo real y fecha.
   - Aviso grande en alta visibilidad del **Usuario Activo** y la **Fecha de Expiración**.
   - Los 3 bloques emblemáticos:
     - 🔴 **LIVE TV** (Canales en Vivo)
     - 🎬 **MOVIES** (Películas VOD en 4K/HD)
     - 📺 **SERIES** (Series, Temporadas y Episodios)
2. **Administrador Multi-Usuario:**
   - Lista de usuarios guardados con tarjetas independientes.
   - Botón para agregar múltiples listas de reproducción Xtream.
   - Cambio rápido de usuario con un solo clic.
3. **Control Parental con PIN (0000 por defecto):**
   - Bloqueo automático para categorías y contenido de adultos (+18 / XXX).
   - Teclado PIN en pantalla (compatible con control remoto y teclado físico).
   - Configuración en Ajustes para cambiar la contraseña o activar/desactivar la protección.
4. **Reproductor Avanzado con Menú de Ajustes (Engranaje):**
   - Selector de pistas de audio (Español Latino, Inglés, etc.).
   - Selector de subtítulos.
   - Indicador y selector de resolución/calidad de pantalla (4K, 1080p Full HD, 720p).
   - Cambio de relación de aspecto (Ajustar, Pantalla completa, Llenar).
   - Velocidad de reproducción (0.75x a 2.0x).
5. **Trailers Oficiales de YouTube:**
   - Botón directo para reproducir trailers oficiales en películas y series desde el reproductor embebido de YouTube.
6. **Hub Central de Favoritos:**
   - Marca con estrella canales, películas y series para acceso rápido.

---

## 🚀 Cómo Probar en Desarrollo (PC)

```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000`.

### Controles de teclado (Simulación de Control Remoto de TV)
- **Flechas `[▲] [▼] [◀] [▶]`**: Mover el foco entre botones, tarjetas y canales.
- **`[Enter]`**: Seleccionar / Abrir / Reproducir.
- **`[Backspace]` o `[Escape]`**: Botón "Atrás" (Volver al dashboard o salir del reproductor).

---

## 📦 Empaquetado para LG Smart TV (webOS)

Para generar el instalador `.ipk` listo para la tienda de LG o para instalar directo en tu TV:
```bash
npm run package:webos
```
El archivo se creará en:
`dist-packages/com.iptvnova.plus_1.0.0_all.ipk`

> Consulta la guía paso a paso para publicar en la tienda oficial de LG en:
> [`docs/GUIA_PUBLICACION_LG_STORE.md`](docs/GUIA_PUBLICACION_LG_STORE.md)
