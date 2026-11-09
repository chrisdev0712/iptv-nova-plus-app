from PIL import Image, ImageDraw, ImageFont
import os

# Pure solid background: #0F172A -> RGB (15, 23, 42)
BG_COLOR = (15, 23, 42)

def create_lg_icon(size, out_path):
    img = Image.new("RGB", (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    scale = size / 400.0
    
    # TV Frame
    tv_x1 = int(90 * scale)
    tv_y1 = int(50 * scale)
    tv_x2 = int(310 * scale)
    tv_y2 = int(195 * scale)
    
    # Draw TV outer border (Cyan)
    border_w = max(2, int(5 * scale))
    draw.rectangle([tv_x1, tv_y1, tv_x2, tv_y2], fill=(26, 36, 60), outline=(56, 189, 248), width=border_w)
    
    # TV Inner Screen
    sc_pad = int(14 * scale)
    draw.rectangle([tv_x1 + sc_pad, tv_y1 + sc_pad, tv_x2 - sc_pad, tv_y2 - sc_pad], fill=(10, 18, 35))
    
    # Play Triangle inside screen
    p1 = (int(185 * scale), int(95 * scale))
    p2 = (int(185 * scale), int(150 * scale))
    p3 = (int(235 * scale), int(122 * scale))
    draw.polygon([p1, p2, p3], fill=(56, 189, 248))
    
    # TV Stand
    stand_w = max(2, int(5 * scale))
    s_y1 = tv_y2
    s_y2 = int(215 * scale)
    draw.line([(int(185 * scale), s_y1), (int(185 * scale), s_y2)], fill=(56, 189, 248), width=stand_w)
    draw.line([(int(215 * scale), s_y1), (int(215 * scale), s_y2)], fill=(56, 189, 248), width=stand_w)
    draw.line([(int(155 * scale), s_y2), (int(245 * scale), s_y2)], fill=(56, 189, 248), width=stand_w)
    
    # Try loading Arial or default font
    try:
        font_title = ImageFont.truetype("arialbd.ttf", int(30 * scale))
        font_plus = ImageFont.truetype("arialbd.ttf", int(32 * scale))
        font_sub = ImageFont.truetype("arialbd.ttf", int(11 * scale))
    except:
        font_title = font_plus = font_sub = ImageFont.load_default()
    
    if size >= 130:
        # Title "IPTV NOVA"
        draw.text((int(200 * scale), int(235 * scale)), "IPTV NOVA", fill=(255, 255, 255), font=font_title, anchor="mm")
        
        # Rainbow PLUS
        # Draw each letter with its color
        y_plus = int(285 * scale)
        draw.text((int(140 * scale), y_plus), "P", fill=(244, 63, 94), font=font_plus, anchor="mm")
        draw.text((int(175 * scale), y_plus), "L", fill=(250, 204, 21), font=font_plus, anchor="mm")
        draw.text((int(205 * scale), y_plus), "U", fill=(52, 211, 153), font=font_plus, anchor="mm")
        draw.text((int(240 * scale), y_plus), "S", fill=(192, 132, 252), font=font_plus, anchor="mm")
        
        if size >= 400:
            draw.text((int(200 * scale), int(345 * scale)), "SMART TV PLAYER", fill=(148, 163, 184), font=font_sub, anchor="mm")
            
    img.save(out_path, format="PNG")
    print(f"Saved {out_path} ({size}x{size}) - Mode: {img.mode}")

create_lg_icon(400, r'C:\Proyectos\TV\platforms\webos\icon_400x400.png')
create_lg_icon(80, r'C:\Proyectos\TV\platforms\webos\icon.png')
create_lg_icon(130, r'C:\Proyectos\TV\platforms\webos\largeIcon.png')

