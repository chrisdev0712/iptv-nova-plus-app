# 📺 Guía Oficial de Publicación en LG Content Store (webOS)
## Aplicación: IPTV Nova Plus

Esta guía te explica paso a paso cómo publicar **IPTV Nova Plus** en la tienda oficial de LG Smart TV para que esté disponible para descargar en cualquier televisor LG del mundo.

---

## 📦 Tu Archivo Instalador Listo para Subir

El paquete oficial compilado y validado para la tienda LG ya fue generado en tu proyecto:
* **Ubicación:** `C:\Proyectos\TV\dist-packages\com.iptvnova.plus_1.0.0_all.ipk`
* **Tamaño:** ~312 KB (ultra ligero)
* **ID:** `com.iptvnova.plus`
* **Versión:** `1.0.0`

---

## ⚠️ Regla de Oro para que LG apruebe tu App (Evitar Rechazo)

Las tiendas de LG y Samsung rechazan aplicaciones que se promocionen como *"IPTV con canales gratis de cable"*. 
Para ser aprobada (exactamente igual que como aprueban a **IPTV Smarters Pro**, **IBO Player** o **Nanomid**):
1. **La app debe presentarse como:** *"Un reproductor multimedia avanzado para que los usuarios reproduzcan sus propias listas de contenido legal (Xtream Codes API y M3U)"*.
2. En la descripción debe indicarse claramente: *"Esta aplicación no incluye canales ni contenido preinstalado. El usuario debe proporcionar sus propias credenciales de suscripción"*.
3. En la prueba de certificación de LG, el revisor te pedirá una cuenta de prueba temporal para verificar que la interfaz funcione.

---

## 🚀 Pasos para Publicar en LG Seller Lounge

### Paso 1: Crear Cuenta de Desarrollador en LG
1. Ingresa a **[LG Seller Lounge](https://seller.lgappstv.com/)**.
2. Haz clic en **Sign Up** (Registrarse).
3. Selecciona tipo de cuenta:
   * **Individual** (si publicas como persona natural).
   * **Corporate** (si publicas como empresa).
4. Confirma tu correo electrónico e inicia sesión.

---

### Paso 2: Crear Nueva Aplicación
1. En el panel principal de LG Seller Lounge, haz clic en **"App Submission"** (o "Add App").
2. Selecciona **TV App**.
3. Tipo de Aplicación: Selecciona **Web App**.

---

### Paso 3: Subir el Paquete `.ipk`
1. En la sección **App File / Package**, haz clic en **Upload**.
2. Selecciona el archivo:
   `C:\Proyectos\TV\dist-packages\com.iptvnova.plus_1.0.0_all.ipk`
3. El sistema de LG validará automáticamente el archivo (verificará `appinfo.json`, resolución 1080p, íconos y permisos). Pasará con éxito (Success).

---

### Paso 4: Completar la Información de la Tienda (Copy & Paste)

#### 📝 Título de la Aplicación:
```text
IPTV Nova Plus
```

#### 📌 Categoría:
```text
Entertainment / Media Player / Video
```

#### 📄 Descripción Corta (Short Description):
```text
Reproductor multimedia avanzado y elegante para listas y contenido Xtream Codes API.
```

#### 📖 Descripción Completa (Full Description):
```text
IPTV Nova Plus es un reproductor multimedia de alto rendimiento diseñado exclusivamente para Smart TVs LG webOS.

Características principales:
- Interfaz intuitiva y moderna optimizada para navegación con control remoto LG Magic Remote.
- Soporte completo para API de Xtream Codes (Live TV, Películas VOD y Series).
- Administrador multi-usuario: guarda múltiples listas y cambia de cuenta en un solo clic.
- Guía electrónica de programación (EPG).
- Control Parental con bloqueo PIN para categorías y contenido protegido.
- Opciones avanzadas de reproducción: selección de pistas de audio multicanal, subtítulos y relación de aspecto.
- Soporte para trailers oficiales.

AVISO LEGAL IMPORTANTE:
- IPTV Nova Plus NO proporciona, almacena ni incluye ningún tipo de contenido multimedia, canales de televisión ni transmisiones.
- El usuario es el único responsable de ingresar y gestionar sus propias listas y credenciales legítimas.
- La aplicación es estrictamente un reproductor de software.
```

#### 🏷️ Palabras Clave (Keywords / Tags):
```text
iptv, media player, xtream, video player, stream, live tv, player, movies, vod
```

---

### Paso 5: Recursos Visuales (Iconos y Capturas)

LG solicita los siguientes gráficos:
1. **Icono Cuadrado (80x80 px):**
   * Ya generado en: `C:\Proyectos\TV\platforms\webos\icon.png`
2. **Icono Grande (130x130 px):**
   * Ya generado en: `C:\Proyectos\TV\platforms\webos\largeIcon.png`
3. **Fondo de Carga / Splash (1920x1080 px):**
   * Ya generado en: `C:\Proyectos\TV\platforms\webos\splash.png`
4. **Capturas de Pantalla (Screenshots):**
   * Se requieren de **3 a 5 capturas en 1920x1080 px**.
   * Puedes tomar capturas de:
     1. El Dashboard principal (con los 3 bloques Live, Movies, Series).
     2. La guía de canales Live TV con EPG.
     3. El catálogo de Películas VOD.
     4. La pantalla de Series y temporadas.
     5. El reproductor con su menú de ajustes (Audio, Subs y Calidad).

---

### Paso 6: Datos para los Revisores de LG (Test Account)
En la casilla **"Notes to Reviewer"** (Notas para el revisor de LG):
* Proporciona un usuario y contraseña de prueba (puedes generar una cuenta demo temporal en tu panel Xtream con un par de canales de prueba públicos/legales) para que los ingenieros de LG comprueben que el reproductor funciona.
* Ejemplo:
  ```text
  Test Credentials for QA Verification:
  Server URL: http://...
  Username: test_qa
  Password: ...
  ```

---

### Paso 7: Enviar a Certificación (Submit for Review)
1. Revisa que todos los campos tengan el check verde.
2. Haz clic en el botón azul **"Submit for Certification"**.
3. **Tiempo de Revisión:** El equipo de LG suele tardar entre **3 y 6 días hábiles** en revisar la aplicación y publicarla en la tienda oficial de LG Content Store.

