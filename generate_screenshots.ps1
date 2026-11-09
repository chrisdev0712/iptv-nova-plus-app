Add-Type -AssemblyName System.Drawing

function Create-Promo($title, $subtitle, $filename, $accentR, $accentG, $accentB) {
    $bmp = New-Object System.Drawing.Bitmap 1920, 1080
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
    $g.FillRectangle($bgBrush, 0, 0, 1920, 1080)

    # Top Header bar
    $headerBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 41, 59))
    $g.FillRectangle($headerBrush, 0, 0, 1920, 100)

    $titleFont = New-Object System.Drawing.Font('Segoe UI', [float]30, [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.DrawString('IPTV NOVA', $titleFont, $whiteBrush, [float]60, [float]25)

    $plusFont = New-Object System.Drawing.Font('Segoe UI', [float]30, [System.Drawing.FontStyle]::Bold)
    $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($accentR, $accentG, $accentB))
    $g.DrawString('PLUS', $plusFont, $accentBrush, [float]290, [float]25)

    # Subtitle / Section title
    $secFont = New-Object System.Drawing.Font('Segoe UI', [float]40, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($title, $secFont, $whiteBrush, [float]60, [float]150)

    $subFont = New-Object System.Drawing.Font('Segoe UI', [float]20, [System.Drawing.FontStyle]::Regular)
    $grayBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(148, 163, 184))
    $g.DrawString($subtitle, $subFont, $grayBrush, [float]60, [float]220)

    # 4 Content cards
    for ($i = 0; $i -lt 4; $i++) {
        $x = 60 + ($i * 455)
        $y = 300
        $w = 425
        $h = 670
        $cardBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 41, 59))
        $g.FillRectangle($cardBrush, $x, $y, $w, $h)

        $innerBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(51, 65, 85))
        $g.FillRectangle($innerBrush, ($x + 15), ($y + 15), ($w - 30), 510)

        # Draw item title
        $itemFont = New-Object System.Drawing.Font('Segoe UI', [float]18, [System.Drawing.FontStyle]::Bold)
        $g.DrawString(('Contenido HD/4K ' + ($i + 1)), $itemFont, $whiteBrush, [float]($x + 20), [float]($y + 550))

        $tagFont = New-Object System.Drawing.Font('Segoe UI', [float]14, [System.Drawing.FontStyle]::Regular)
        $g.DrawString('Reproductor optimizado para LG webOS', $tagFont, $grayBrush, [float]($x + 20), [float]($y + 590))
    }

    $bmp.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $g.Dispose()
}

Create-Promo 'Panel Principal Intuitivo' 'Acceso rapido a TV en Vivo, Peliculas y Series con soporte Multi-Cuentas' 'C:\Proyectos\TV\platforms\webos\screenshot1_dashboard.png' 59 130 246
Create-Promo 'Guia de Canales en Vivo' 'Categorias organizadas, reproduccion fluida y control parental seguro' 'C:\Proyectos\TV\platforms\webos\screenshot2_livetv.png' 16 185 129
Create-Promo 'Cine y Series VOD' 'Sinopsis, trailers de YouTube y selector de audio y subtitulos' 'C:\Proyectos\TV\platforms\webos\screenshot3_vod.png' 236 72 153

Write-Output 'OK'
