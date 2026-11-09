# Guía de Publicación Oficial: Samsung Smart TV (Tizen)

Esta guía detalla los pasos para publicar **IPTV Nova Plus** en la tienda oficial de televisores Samsung Smart TV (**Samsung Apps TV Seller Office**).

---

## 1. Archivos Listos en tu Computadora

Todos los archivos requeridos por Samsung ya están compilados y listos:

| Elemento | Archivo en tu Computadora | Especificaciones |
| :--- | :--- | :--- |
| **Paquete de la App** | `C:\Proyectos\TV\dist-packages\IPTVNovaPlus.wgt` | Paquete Tizen Web App listo |
| **Ícono de Tienda** | `C:\Proyectos\TV\platforms\tizen\icon_512x512.png` | 512 x 512 px (PNG) |
| **Captura 1 (Dashboard)** | `C:\Proyectos\TV\platforms\tizen\screenshot1.png` | 1920 x 1080 px |
| **Captura 2 (Live TV)** | `C:\Proyectos\TV\platforms\tizen\screenshot2.png` | 1920 x 1080 px |
| **Captura 3 (VOD Cine)** | `C:\Proyectos\TV\platforms\tizen\screenshot3.png` | 1920 x 1080 px |
| **Captura 4 (Reproductor)** | `C:\Proyectos\TV\platforms\tizen\screenshot4_player.png` | 1920 x 1080 px |
| **Política de Privacidad** | Enlace de tu GitHub Pages (`https://.../privacy-policy/`) | Bilingüe (EN / ES) |

---

## 2. Acceso al Portal de Samsung

1. Ingresa a: **[https://seller.samsungapps.com/tv](https://seller.samsungapps.com/tv)**
2. Inicia sesión con tu cuenta de Samsung (o crea una gratis con tu correo `christian.montano.0712@gmail.com`).
3. Si es tu primera vez, acepta los términos de desarrollador de Samsung Apps TV Seller Office.

---

## 3. Crear Nueva Aplicación

1. Haz clic en el botón azul o superior **`Add New Application`**.
2. **Application Title:** `IPTV Nova Plus`
3. **Default Language:** `English` (o Spanish).
4. Haz clic en **Confirm / Create**.

---

## 4. Llenar los Formularios de Samsung

### Pestaña 1: App Info (Información de la Aplicación)
* **Category:** `Video`
* **App Title:** `IPTV Nova Plus`
* **Description (Descripción):**
```text
IPTV Nova Plus is a modern, high-performance media player designed specifically for Samsung Smart TVs (Tizen). Optimized for smooth navigation with the Samsung TV Remote Control, IPTV Nova Plus enables users to stream and organize their own digital playlists via the Xtream Codes API.

Features:
- Complete Entertainment Hub: Dedicated sections for Live TV, Movies (VOD), and TV Series.
- Multi-Account Support: Easily manage and switch between multiple user profiles and playlists.
- Advanced Video Player: Select multiple audio tracks, embedded subtitles, and adjust aspect ratios in real time.
- Parental Control: Protect adult categories with a customizable 4-digit PIN code.
- Favorites Manager: Bookmark preferred live channels, movies, and series for instant access.
- Official Trailers: Watch official YouTube trailers directly within the movie and series cards.

Disclaimer:
IPTV Nova Plus does not host, provide, or distribute any media content or channels. It functions strictly as a media player for playlists provided by the end user.
```

* **Service Country:** Seleccionar **All Countries** (o Available Countries).
* **Privacy Policy URL:** Pega el enlace de tu GitHub Pages.

---

### Pestaña 2: App Images (Imágenes de la Aplicación)

1. **Icon Images (1920x1080 & 512x423):**
   * **Logo Asset With Transparency (32bit PNG RGBA < 300KB):** `C:\Proyectos\TV\platforms\tizen\samsung_logo_1920x1080_rgba.png`
   * **Background Image (24bit JPG < 300KB):** `C:\Proyectos\TV\platforms\tizen\samsung_bg_1920x1080.jpg`
   * **512x423 Pixels Icon (PNG < 300KB):** `C:\Proyectos\TV\platforms\tizen\samsung_icon_512x423.png`

2. **Background Image (Fondo de la Ficha en la TV - 1920x1080 JPG < 2MB):**
   * Sube: `C:\Proyectos\TV\platforms\tizen\samsung_detail_bg_1920x1080.jpg`
   *(Diseñado con el 40% izquierdo oscuro para no tapar los textos de la tienda Samsung y el arte a la derecha).*

3. **Screenshot Images (Capturas 1920x1080 JPG < 500KB):**
   * **Casilla 1 (Dashboard):** `C:\Proyectos\TV\platforms\tizen\samsung_screenshot1.jpg`
   * **Casilla 2 (Live TV):** `C:\Proyectos\TV\platforms\tizen\samsung_screenshot2.jpg`
   * **Casilla 3 (Cine VOD):** `C:\Proyectos\TV\platforms\tizen\samsung_screenshot3.jpg`
   * **Casilla 4 (Player Ultra HD):** `C:\Proyectos\TV\platforms\tizen\samsung_screenshot4.jpg`

---

### Pestaña 3: App Package (Subir el archivo de la App)
* Arrastra o selecciona el archivo:
  📂 **`C:\Proyectos\TV\dist-packages\IPTVNovaPlus.wgt`**
* El portal validará el archivo `config.xml` y mostrará la versión `1.0.1`.

---

### Pestaña 4: Test Info & QA Notes (Para los evaluadores de Samsung)
* **Test Account (Cuenta de Prueba):**
  * ID: `demo`
  * Password: `demo`
* **Note to Reviewer (Instrucciones para Samsung QA):**
```text
Dear Samsung QA Team,

For quick testing and review, please click on the button "Probar en MODO DEMO" located at the bottom of the login screen to instantly load legal sample HLS live channels and VOD content. Alternatively, you can log in using User: demo / Password: demo / Host: demo.

The app fully supports Samsung TV Remote 4-way D-Pad spatial navigation, OK key selection, and standard Return/Back key navigation. The default Parental Control PIN is 0000. Thank you!
```

---

## 5. Enviar a Revisión (Submit)

1. Revisa que todas las pestañas tengan el icono de completado en verde.
2. Haz clic en el botón **`Submit for Certification`** (o **`Submit`**).
3. Tu app entrará en el proceso de certificación de Samsung.

