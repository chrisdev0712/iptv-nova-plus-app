Add-Type -AssemblyName System.Drawing

$iconPath = 'C:\Proyectos\TV\platforms\webos\icon_400x400.png'
$iconImg = [System.Drawing.Image]::FromFile($iconPath)

function Make-DashboardScreenshot() {
    $bmp = [System.Drawing.Bitmap]::new(1920, 1080)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Dark background
    $bg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(11, 15, 25))
    $g.FillRectangle($bg, 0, 0, 1920, 1080)

    # Top Navigation Bar
    $topBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(17, 24, 39))
    $g.FillRectangle($topBg, 0, 0, 1920, 100)

    # Draw App Icon at top-left
    $g.DrawImage($iconImg, 60, 15, 70, 70)

    # Title: IPTV NOVA PLUS
    $titleFont = [System.Drawing.Font]::new('Segoe UI', [float]26, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('IPTV NOVA', $titleFont, [System.Drawing.Brushes]::White, 145, 26)
    $plusFont = [System.Drawing.Font]::new('Segoe UI', [float]26, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('PLUS', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(236, 72, 153)), 320, 26)

    # Top-right: Active User & Expiration Badges
    $userBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 41, 59))
    $g.FillRectangle($userBg, 1320, 25, 260, 50)
    $expBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(20, 83, 45))
    $g.FillRectangle($expBg, 1600, 25, 260, 50)

    $badgeFont = [System.Drawing.Font]::new('Segoe UI', [float]13, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('USUARIO: Premium User', $badgeFont, [System.Drawing.Brushes]::White, 1335, 38)
    $g.DrawString('EXPIRA: 31 Diciembre 2026', $badgeFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(74, 222, 128)), 1615, 38)

    # Main 3 Smarters Cards (LIVE TV, MOVIES, SERIES)
    $c1Rect = [System.Drawing.Rectangle]::new(80, 180, 560, 680)
    $c1Grad = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(80, 180), [System.Drawing.Point]::new(640, 860), [System.Drawing.Color]::FromArgb(30, 58, 138), [System.Drawing.Color]::FromArgb(15, 23, 42))
    $g.FillRectangle($c1Grad, $c1Rect)
    $g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(59, 130, 246), 4), $c1Rect)

    $c2Rect = [System.Drawing.Rectangle]::new(680, 180, 560, 680)
    $c2Grad = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(680, 180), [System.Drawing.Point]::new(1240, 860), [System.Drawing.Color]::FromArgb(153, 27, 27), [System.Drawing.Color]::FromArgb(15, 23, 42))
    $g.FillRectangle($c2Grad, $c2Rect)
    $g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(239, 68, 68), 3), $c2Rect)

    $c3Rect = [System.Drawing.Rectangle]::new(1280, 180, 560, 680)
    $c3Grad = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(1280, 180), [System.Drawing.Point]::new(1840, 860), [System.Drawing.Color]::FromArgb(88, 28, 135), [System.Drawing.Color]::FromArgb(15, 23, 42))
    $g.FillRectangle($c3Grad, $c3Rect)
    $g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(168, 85, 247), 3), $c3Rect)

    # Titles inside cards
    $cardTitleFont = [System.Drawing.Font]::new('Segoe UI', [float]38, [System.Drawing.FontStyle]::Bold)
    $cardSubFont = [System.Drawing.Font]::new('Segoe UI', [float]18, [System.Drawing.FontStyle]::Regular)
    $descBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(203, 213, 225))

    $g.DrawString('TV EN VIVO', $cardTitleFont, [System.Drawing.Brushes]::White, 120, 680)
    $g.DrawString('Deportes, Noticias, Entretenimiento HD/4K', $cardSubFont, $descBrush, 120, 750)

    $g.DrawString('PELICULAS', $cardTitleFont, [System.Drawing.Brushes]::White, 720, 680)
    $g.DrawString('Estrenos VOD, Cine de Accion, Trailers YouTube', $cardSubFont, $descBrush, 720, 750)

    $g.DrawString('SERIES', $cardTitleFont, [System.Drawing.Brushes]::White, 1320, 680)
    $g.DrawString('Temporadas completas, Episodios y Multi-Audio', $cardSubFont, $descBrush, 1320, 750)

    # Bottom Quick Actions Bar
    $botBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(17, 24, 39))
    $g.FillRectangle($botBg, 0, 920, 1920, 160)

    $actFont = [System.Drawing.Font]::new('Segoe UI', [float]16, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('Mis Favoritos', $actFont, [System.Drawing.Brushes]::White, 120, 975)
    $g.DrawString('Mi Perfil', $actFont, [System.Drawing.Brushes]::White, 420, 975)
    $g.DrawString('Cambiar Cuenta', $actFont, [System.Drawing.Brushes]::White, 720, 975)
    $g.DrawString('Ajustes y Control Parental', $actFont, [System.Drawing.Brushes]::White, 1080, 975)

    $bmp.Save('C:\Proyectos\TV\platforms\webos\screenshot1_dashboard.png', [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $g.Dispose()
    Write-Output 'Dashboard Screenshot OK'
}

function Make-LiveScreenshot() {
    $bmp = [System.Drawing.Bitmap]::new(1920, 1080)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $bg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(11, 15, 25))
    $g.FillRectangle($bg, 0, 0, 1920, 1080)

    # Left categories bar
    $catBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(17, 24, 39))
    $g.FillRectangle($catBg, 0, 0, 420, 1080)

    $headFont = [System.Drawing.Font]::new('Segoe UI', [float]24, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('CATEGORIAS', $headFont, [System.Drawing.Brushes]::White, 50, 50)

    $cats = @('Todos los Canales', 'Deportes HD / 4K', 'Noticias Internacionales', 'Cine y Series', 'Infantiles', 'Documentales', 'Musica y Cultura')
    $itemFont = [System.Drawing.Font]::new('Segoe UI', [float]17, [System.Drawing.FontStyle]::Regular)
    for ($i = 0; $i -lt $cats.Length; $i++) {
        $y = 130 + ($i * 70)
        if ($i -eq 1) {
            $selBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(37, 99, 235))
            $g.FillRectangle($selBg, 30, $y, 360, 54)
            $g.DrawString($cats[$i], $itemFont, [System.Drawing.Brushes]::White, 55, ($y + 12))
        } else {
            $g.DrawString($cats[$i], $itemFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(156, 163, 175)), 55, ($y + 12))
        }
    }

    # Center channels list
    $chBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(20, 30, 50))
    $g.FillRectangle($chBg, 430, 0, 650, 1080)
    $g.DrawString('CANALES DEPORTIVOS', $headFont, [System.Drawing.Brushes]::White, 460, 50)

    $channels = @('ESPN Deportes UHD 4K', 'Fox Sports 1 Premium', 'DirecTV Sports HD', 'TNT Sports HD', 'TyC Sports Internacional', 'BeIN Sports LaLiga', 'DAZN F1 Ultra HD')
    for ($j = 0; $j -lt $channels.Length; $j++) {
        $y = 130 + ($j * 75)
        if ($j -eq 0) {
            $selCh = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 58, 138))
            $g.FillRectangle($selCh, 450, $y, 610, 62)
            $g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(96, 165, 250), 3), 450, $y, 610, 62)
            $g.DrawString(('> ' + $channels[$j]), $itemFont, [System.Drawing.Brushes]::White, 475, ($y + 16))
        } else {
            $g.DrawString(('  ' + $channels[$j]), $itemFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(209, 213, 219)), 475, ($y + 16))
        }
    }

    # Right Live Player Preview
    $playerRect = [System.Drawing.Rectangle]::new(1100, 50, 780, 500)
    $playerGrad = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(1100, 50), [System.Drawing.Point]::new(1880, 550), [System.Drawing.Color]::FromArgb(2, 6, 23), [System.Drawing.Color]::FromArgb(30, 41, 59))
    $g.FillRectangle($playerGrad, $playerRect)
    $g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(59, 130, 246), 4), $playerRect)

    $g.DrawString('TRANSMITIENDO EN VIVO (1080p 60fps)', [System.Drawing.Font]::new('Segoe UI', [float]15, [System.Drawing.FontStyle]::Bold), [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(74, 222, 128)), 1130, 80)
    $g.DrawString('ESPN Deportes UHD - Partido en Directo', [System.Drawing.Font]::new('Segoe UI', [float]22, [System.Drawing.FontStyle]::Bold), [System.Drawing.Brushes]::White, 1130, 120)

    # Player controls info below
    $infoBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(17, 24, 39))
    $g.FillRectangle($infoBg, 1100, 580, 780, 460)
    $g.DrawString('OPCIONES DEL REPRODUCTOR', $headFont, [System.Drawing.Brushes]::White, 1140, 610)
    $g.DrawString('Selector de pistas de audio y subtitulos en tiempo real', $itemFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(209, 213, 219)), 1140, 680)
    $g.DrawString('Anadir a Mis Canales Favoritos', $itemFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(209, 213, 219)), 1140, 740)
    $g.DrawString('Proteccion con PIN para canales para adultos (+18)', $itemFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(209, 213, 219)), 1140, 800)
    $g.DrawString('Control de relacion de aspecto (16:9, Ajustar, Zoom)', $itemFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(209, 213, 219)), 1140, 860)

    $bmp.Save('C:\Proyectos\TV\platforms\webos\screenshot2_livetv.png', [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $g.Dispose()
    Write-Output 'Live Screenshot OK'
}

function Make-VodScreenshot() {
    $bmp = [System.Drawing.Bitmap]::new(1920, 1080)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $bg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(11, 15, 25))
    $g.FillRectangle($bg, 0, 0, 1920, 1080)

    # Top search & category bar
    $topBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(17, 24, 39))
    $g.FillRectangle($topBg, 0, 0, 1920, 90)

    $titleFont = [System.Drawing.Font]::new('Segoe UI', [float]24, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('CATALOGO DE CINE Y SERIES', $titleFont, [System.Drawing.Brushes]::White, 60, 25)

    # 5 VOD Movie Posters grid
    $posters = @('Avatar: El Camino', 'Oppenheimer', 'Top Gun: Maverick', 'Dune: Parte Dos', 'Interestelar')
    $genres = @('Ciencia Ficcion 4K', 'Drama / Historia', 'Accion UHD', 'Aventura Espacial', 'Obra Maestra Sci-Fi')
    $cardColors = @([System.Drawing.Color]::FromArgb(29, 78, 216), [System.Drawing.Color]::FromArgb(180, 83, 9), [System.Drawing.Color]::FromArgb(185, 28, 28), [System.Drawing.Color]::FromArgb(109, 40, 217), [System.Drawing.Color]::FromArgb(4, 120, 87))

    for ($k = 0; $k -lt 5; $k++) {
        $x = 60 + ($k * 360)
        $y = 130
        $w = 330
        $h = 490

        $cardBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new($x, $y), [System.Drawing.Point]::new($x, ($y + $h)), $cardColors[$k], [System.Drawing.Color]::FromArgb(15, 23, 42))
        $g.FillRectangle($cardBrush, $x, $y, $w, $h)

        if ($k -eq 0) {
            $g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(59, 130, 246), 4), $x, $y, $w, $h)
        }

        # Title & genre inside poster
        $pTitle = [System.Drawing.Font]::new('Segoe UI', [float]17, [System.Drawing.FontStyle]::Bold)
        $pSub = [System.Drawing.Font]::new('Segoe UI', [float]13, [System.Drawing.FontStyle]::Regular)
        $g.DrawString($posters[$k], $pTitle, [System.Drawing.Brushes]::White, ($x + 15), ($y + 390))
        $g.DrawString($genres[$k], $pSub, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(203, 213, 225)), ($x + 15), ($y + 430))
    }

    # Bottom Details & Trailer Modal Preview
    $detailBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(17, 24, 39))
    $g.FillRectangle($detailBg, 60, 660, 1800, 370)
    $g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(59, 130, 246), 2), 60, 660, 1800, 370)

    $detTitle = [System.Drawing.Font]::new('Segoe UI', [float]28, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('Avatar: El Camino del Agua (2024)', $detTitle, [System.Drawing.Brushes]::White, 100, 700)

    $synFont = [System.Drawing.Font]::new('Segoe UI', [float]16, [System.Drawing.FontStyle]::Regular)
    $synText = 'Ambientada mas de una decada despues de los acontecimientos de la primera pelicula, narra la historia de la familia Sully, los problemas que los persiguen, los esfuerzos que hacen para mantenerse a salvo y las batallas que libran para seguir con vida.'
    $g.DrawString($synText, $synFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(203, 213, 225)), [System.Drawing.RectangleF]::new(100, 760, 1200, 100))

    # Buttons: [Reproducir Película] [Ver Trailer en YouTube] [Añadir a Favoritos]
    $btnPlay = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(37, 99, 235))
    $g.FillRectangle($btnPlay, 100, 890, 280, 65)
    $btnFont = [System.Drawing.Font]::new('Segoe UI', [float]17, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('> Reproducir', $btnFont, [System.Drawing.Brushes]::White, 150, 908)

    $btnTrailer = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 38, 38))
    $g.FillRectangle($btnTrailer, 410, 890, 340, 65)
    $g.DrawString('Trailer Oficial YouTube', $btnFont, [System.Drawing.Brushes]::White, 435, 908)

    $btnFav = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(51, 65, 85))
    $g.FillRectangle($btnFav, 780, 890, 300, 65)
    $g.DrawString('+ Mis Favoritos', $btnFont, [System.Drawing.Brushes]::White, 835, 908)

    $bmp.Save('C:\Proyectos\TV\platforms\webos\screenshot3_vod.png', [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $g.Dispose()
    Write-Output 'VOD Screenshot OK'
}

Make-DashboardScreenshot
Make-LiveScreenshot
Make-VodScreenshot

$iconImg.Dispose()
Write-Output 'ALL_CAPTURES_SUCCESS'
