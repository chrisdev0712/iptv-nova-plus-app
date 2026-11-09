Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\chris\.gemini\antigravity\brain\d2c8dbb2-cf7e-4fae-a0b7-c72d5c51925a\iptv_nova_plus_app_icon_1793544466833.jpg'
$img = [System.Drawing.Image]::FromFile($src)

function Save-Resized($sourceImg, $w, $h, $destPath) {
    $bmp = [System.Drawing.Bitmap]::new($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($sourceImg, 0, 0, $w, $h)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $g.Dispose()
    Write-Output "Saved: $destPath ($w x $h)"
}

# Samsung Store requires 512x512 PNG
Save-Resized $img 512 512 'C:\Proyectos\TV\platforms\tizen\icon_512x512.png'
# Tizen config.xml icon
Save-Resized $img 117 117 'C:\Proyectos\TV\platforms\tizen\icon.png'

$img.Dispose()
Write-Output 'SAMSUNG_ICONS_OK'

