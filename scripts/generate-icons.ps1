Add-Type -AssemblyName System.Drawing

function Create-AppIcon($width, $height, $outPath, $isSplash) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

    $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
    $c1 = [System.Drawing.Color]::FromArgb(255, 8, 13, 26)
    $c2 = [System.Drawing.Color]::FromArgb(255, 14, 22, 43)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 45.0
    $g.FillRectangle($brush, $rect)

    if ($isSplash) {
        $fontTitle = New-Object System.Drawing.Font "Segoe UI", [float]56, [System.Drawing.FontStyle]::Bold
        $fontSub = New-Object System.Drawing.Font "Segoe UI", [float]22, [System.Drawing.FontStyle]::Regular
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

        $cyanBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
        $slateBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))

        $g.DrawString("IPTV NOVA PLUS", $fontTitle, $cyanBrush, ($width / 2), ($height / 2 - 30), $sf)
        $g.DrawString("CARGANDO...", $fontSub, $slateBrush, ($width / 2), ($height / 2 + 50), $sf)
    } else {
        $innerRect = New-Object System.Drawing.Rectangle ([int]($width * 0.1)), ([int]($height * 0.1)), ([int]($width * 0.8)), ([int]($height * 0.8))
        $iconBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $innerRect, ([System.Drawing.Color]::FromArgb(255, 6, 182, 212)), ([System.Drawing.Color]::FromArgb(255, 59, 130, 246)), 45.0
        $g.FillEllipse($iconBrush, $innerRect)

        $fontSize = [float]($height * 0.35)
        $font = New-Object System.Drawing.Font "Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
        $g.DrawString("NP", $font, $whiteBrush, ($width / 2), ($height / 2), $sf)
    }

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outPath ($width x $height)"
}

Create-AppIcon 80 80 "platforms/webos/icon.png" $false
Create-AppIcon 130 130 "platforms/webos/largeIcon.png" $false
Create-AppIcon 1920 1080 "platforms/webos/splash.png" $true

Create-AppIcon 117 117 "platforms/tizen/icon.png" $false
