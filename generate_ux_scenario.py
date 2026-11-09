import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_ux_scenario():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Colors
    c_red = RGBColor(197, 17, 98)       # LG Red
    c_dark = RGBColor(30, 41, 59)
    c_light = RGBColor(241, 245, 249)
    c_gray = RGBColor(100, 116, 139)
    c_black = RGBColor(15, 23, 42)
    c_white = RGBColor(255, 255, 255)

    def add_header(slide, title_text, slide_no):
        # Top banner
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8), Inches(0.5))
        p = tb.text_frame.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = c_dark

        # LG Badge
        badge = slide.shapes.add_textbox(Inches(10.5), Inches(0.35), Inches(2.2), Inches(0.5))
        bp = badge.text_frame.paragraphs[0]
        bp.text = "LG Seller Lounge"
        bp.font.size = Pt(16)
        bp.font.bold = True
        bp.font.color.rgb = c_red
        bp.alignment = PP_ALIGN.RIGHT

        # LGE Internal Use Only
        sub_badge = slide.shapes.add_textbox(Inches(4.5), Inches(0.1), Inches(4), Inches(0.3))
        sbp = sub_badge.text_frame.paragraphs[0]
        sbp.text = "LGE Internal Use Only"
        sbp.font.size = Pt(11)
        sbp.font.color.rgb = c_gray
        sbp.alignment = PP_ALIGN.CENTER

        # Footer page number
        ft = slide.shapes.add_textbox(Inches(6.0), Inches(7.1), Inches(1.3), Inches(0.3))
        fp = ft.text_frame.paragraphs[0]
        fp.text = str(slide_no)
        fp.font.size = Pt(11)
        fp.font.color.rgb = c_gray
        fp.alignment = PP_ALIGN.CENTER

    # ----------------------------------------------------
    # SLIDE 1: COVER
    # ----------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    # LG logo & text
    b1 = s1.shapes.add_textbox(Inches(10.5), Inches(0.4), Inches(2.2), Inches(0.5))
    p = b1.text_frame.paragraphs[0]
    p.text = "LG Seller Lounge"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = c_red

    sub1 = s1.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(6), Inches(0.4))
    sub1.text_frame.paragraphs[0].text = "UX Scenario Document File Version 4.4"
    sub1.text_frame.paragraphs[0].font.size = Pt(14)
    sub1.text_frame.paragraphs[0].font.color.rgb = c_gray

    # App Title
    title_box = s1.shapes.add_textbox(Inches(1.5), Inches(2.4), Inches(10.3), Inches(1.5))
    tp = title_box.text_frame.paragraphs[0]
    tp.text = "IPTV Nova Plus"
    tp.font.size = Pt(46)
    tp.font.bold = True
    tp.font.color.rgb = c_dark
    tp.alignment = PP_ALIGN.CENTER

    sub_tp = title_box.text_frame.add_paragraph()
    sub_tp.text = "Smart TV Media Player Application (webOS)"
    sub_tp.font.size = Pt(18)
    sub_tp.font.color.rgb = c_gray
    sub_tp.alignment = PP_ALIGN.CENTER

    # Info Table bottom right
    table_shape = s1.shapes.add_table(3, 2, Inches(6.5), Inches(4.5), Inches(6.0), Inches(2.2))
    table = table_shape.table
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(3.8)

    rows_data = [
        ("Submission Date", "2026 / 11 / 02"),
        ("App Ver.", "1.0.2"),
        ("App Developer", "Name: Christian Montano\nE-mail: christian.montano.0712@gmail.com")
    ]
    for idx, (label, val) in enumerate(rows_data):
        c0 = table.cell(idx, 0)
        c0.text = label
        c0.fill.solid()
        c0.fill.fore_color.rgb = RGBColor(226, 232, 240)
        c0.text_frame.paragraphs[0].font.bold = True
        c0.text_frame.paragraphs[0].font.size = Pt(13)
        c0.text_frame.paragraphs[0].font.color.rgb = c_dark

        c1 = table.cell(idx, 1)
        c1.text = val
        c1.fill.solid()
        c1.fill.fore_color.rgb = RGBColor(248, 250, 252)
        c1.text_frame.paragraphs[0].font.size = Pt(13)
        c1.text_frame.paragraphs[0].font.color.rgb = c_black

    # ----------------------------------------------------
    # SLIDE 2: TABLE OF CONTENTS
    # ----------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Table of Contents", 2)

    toc_box = s2.shapes.add_textbox(Inches(3.2), Inches(1.8), Inches(7.0), Inches(4.8))
    tf = toc_box.text_frame
    items = [
        "1. Basic Information",
        "2. Document History",
        "3. Page Description (Guideline)",
        "4. Detailed Login Information & Test Accounts",
        "5. Main Page Description (Dashboard)",
        "6. Sub Page Description (Live TV & VOD Movies/Series)",
        "7. Paid Content (Not Applicable)",
        "8. In-App Ad (Not Applicable)",
        "9. Appendix (QA Notes & Magic Remote Controls)"
    ]
    for it in items:
        p = tf.add_paragraph()
        p.text = it
        p.font.size = Pt(16)
        p.font.color.rgb = c_dark
        p.space_after = Pt(12)

    # ----------------------------------------------------
    # SLIDE 3: 1. BASIC INFORMATION
    # ----------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "1. Basic Information", 3)

    t3_shape = s3.shapes.add_table(12, 3, Inches(0.8), Inches(1.2), Inches(11.7), Inches(5.5))
    t3 = t3_shape.table
    t3.columns[0].width = Inches(2.5)
    t3.columns[1].width = Inches(4.5)
    t3.columns[2].width = Inches(4.7)

    header_cols = ["Category / Items", "Input (By Developer)", "Example / Standards"]
    for i, hc in enumerate(header_cols):
        cell = t3.cell(0, i)
        cell.text = hc
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(51, 65, 85)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = c_white

    basic_rows = [
        ("App Title", "IPTV Nova Plus", "Media Player Application"),
        ("Category", "Entertainment", "Entertainment / Life"),
        ("File Type", "Web (webOS IPK)", "Web / Native App"),
        ("Optimized Resolution", "1920*1080 (Full HD / UHD)", "1920*1080"),
        ("Service Area Information", "Global (All Available Countries)", "Global / Selected Regions"),
        ("App Service Language", "English, Spanish", "English, Spanish"),
        ("Geo-IP Block", "No", "Yes / No"),
        ("SDK Version", "webOS 3.0 to webOS 24", "webOS 3.0+"),
        ("In-App Ad", "Not Applicable (No Ads)", "Banner / AVOD / None"),
        ("Paid Content", "Not Applicable (Free Standalone App)", "Transaction / Subscription / None"),
        ("Sound", "Audio Tracks & Live Video Streams", "BGM / Sound Effect / Stream Audio")
    ]
    for idx, (cat, val, ex) in enumerate(basic_rows, start=1):
        c0 = t3.cell(idx, 0)
        c0.text = cat
        c0.text_frame.paragraphs[0].font.bold = True
        c0.text_frame.paragraphs[0].font.size = Pt(11)

        c1 = t3.cell(idx, 1)
        c1.text = val
        c1.text_frame.paragraphs[0].font.size = Pt(11)
        c1.text_frame.paragraphs[0].font.color.rgb = RGBColor(3, 105, 161)

        c2 = t3.cell(idx, 2)
        c2.text = ex
        c2.text_frame.paragraphs[0].font.size = Pt(11)
        c2.text_frame.paragraphs[0].font.color.rgb = c_gray

    # ----------------------------------------------------
    # SLIDE 4: 2. DOCUMENT HISTORY
    # ----------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "2. Document History", 4)

    t4_shape = s4.shapes.add_table(3, 5, Inches(0.8), Inches(1.5), Inches(11.7), Inches(1.8))
    t4 = t4_shape.table
    t4.columns[0].width = Inches(1.0)
    t4.columns[1].width = Inches(2.2)
    t4.columns[2].width = Inches(1.8)
    t4.columns[3].width = Inches(3.2)
    t4.columns[4].width = Inches(3.5)

    headers4 = ["No.", "Sent Date", "Version", "File Name", "Contents"]
    for i, h in enumerate(headers4):
        cell = t4.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(51, 65, 85)
        cell.text_frame.paragraphs[0].font.bold = True
        cell.text_frame.paragraphs[0].font.size = Pt(12)
        cell.text_frame.paragraphs[0].font.color.rgb = c_white

    hist_data = [
        ("1", "02.11.2026", "1.0.0", "UX Scenario IPTV Nova Plus", "Initial submission draft"),
        ("2", "02.11.2026", "1.0.2", "UX Scenario IPTV Nova Plus", "Official QA submission with Demo Mode & Hi-Res Icons")
    ]
    for idx, row in enumerate(hist_data, start=1):
        for col_idx, text_val in enumerate(row):
            c = t4.cell(idx, col_idx)
            c.text = text_val
            c.text_frame.paragraphs[0].font.size = Pt(11)

    # ----------------------------------------------------
    # SLIDE 5: 3. PAGE DESCRIPTION (GUIDELINE)
    # ----------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "3. Page Description (Navigation Guidelines)", 5)

    box5 = s5.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(10.9), Inches(5.0))
    tf5 = box5.text_frame
    tf5.word_wrap = True

    g_points = [
        ("LG Magic Remote & TV D-Pad Controls:", "The app features full spatial 4-way D-Pad navigation (Up, Down, Left, Right) with clear visual focus borders on all interactive elements."),
        ("OK Button (Enter):", "Selects channels, opens categories, triggers video playback, and confirms modal dialogs."),
        ("BACK Button:", "Returns to the previous screen (from Player to Dashboard, from Dashboard to Account Manager). Handles LG webOS history API cleanly without exiting unexpectedly."),
        ("Multi-Account Management:", "Users can register multiple Xtream Codes playlists and switch between profiles effortlessly."),
        ("One-Click Demo Environment:", "For rapid QA evaluation, the app provides a 'Probar en MODO DEMO' button requiring no external servers or complex configuration.")
    ]
    for title, desc in g_points:
        p1 = tf5.add_paragraph()
        p1.text = "• " + title
        p1.font.bold = True
        p1.font.size = Pt(14)
        p1.font.color.rgb = RGBColor(2, 132, 199)
        p1.space_after = Pt(3)

        p2 = tf5.add_paragraph()
        p2.text = "   " + desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = c_dark
        p2.space_after = Pt(14)

    # ----------------------------------------------------
    # SLIDE 6: 4. DETAILED LOGIN INFORMATION
    # ----------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "4. Detailed Login Information & Test Account", 6)

    # Insert screenshot
    login_img_path = r'C:\Proyectos\TV\platforms\webos\screenshot_login_ux.png'
    if os.path.exists(login_img_path):
        s6.shapes.add_picture(login_img_path, Inches(0.8), Inches(1.4), width=Inches(6.8), height=Inches(3.8))

    # Description Table on Right
    t6_shape = s6.shapes.add_table(5, 2, Inches(7.8), Inches(1.4), Inches(4.7), Inches(2.5))
    t6 = t6_shape.table
    t6.columns[0].width = Inches(0.8)
    t6.columns[1].width = Inches(3.9)

    t6_items = [
        ("1", "Input field: Usuario (Username)"),
        ("2", "Input field: Contraseña (Password)"),
        ("3", "Input field: URL del Servidor / Host"),
        ("4", "One-Click: 'Probar en MODO DEMO' (Test Mode)")
    ]
    for idx, (num, desc) in enumerate(t6_items):
        c0 = t6.cell(idx, 0)
        c0.text = num
        c0.fill.solid()
        c0.fill.fore_color.rgb = c_red
        p = c0.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.color.rgb = c_white
        p.alignment = PP_ALIGN.CENTER

        c1 = t6.cell(idx, 1)
        c1.text = desc
        c1.text_frame.paragraphs[0].font.size = Pt(11)

    # Test Account Box below
    test_box = s6.shapes.add_textbox(Inches(7.8), Inches(4.2), Inches(4.7), Inches(2.6))
    tt_f = test_box.text_frame
    tp = tt_f.paragraphs[0]
    tp.text = "TEST CREDENTIALS FOR LG QA:"
    tp.font.bold = True
    tp.font.size = Pt(13)
    tp.font.color.rgb = c_dark

    p = tt_f.add_paragraph()
    p.text = "• Method A (Recommended): Simply click the button 'Probar en MODO DEMO' [4] to log in instantly with legal test streams.\n• Method B (Manual Input):\n   User: demo\n   Password: demo\n   Server: demo"
    p.font.size = Pt(11)
    p.font.color.rgb = c_black

    # ----------------------------------------------------
    # SLIDE 7: 5. MAIN PAGE DESCRIPTION (DASHBOARD)
    # ----------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "5. Main Page Description (Dashboard)", 7)

    dash_img = r'C:\Proyectos\TV\platforms\webos\screenshot1.png'
    if os.path.exists(dash_img):
        s7.shapes.add_picture(dash_img, Inches(0.8), Inches(1.4), width=Inches(7.2), height=Inches(4.0))

    t7_shape = s7.shapes.add_table(6, 2, Inches(8.3), Inches(1.4), Inches(4.2), Inches(3.8))
    t7 = t7_shape.table
    t7.columns[0].width = Inches(0.6)
    t7.columns[1].width = Inches(3.6)

    t7_items = [
        ("1", "App Logo & Active User Profile / Expiration Date"),
        ("2", "LIVE TV Card: Access live television channels"),
        ("3", "MOVIES Card: Browse VOD film catalog & YouTube trailers"),
        ("4", "SERIES Card: Browse seasons and episodes"),
        ("5", "Quick Access Bar: Favorites, Profile, Change Account, Settings"),
        ("6", "Parental Control: PIN protected (+18) content (Default: 0000)")
    ]
    for idx, (num, desc) in enumerate(t7_items):
        c0 = t7.cell(idx, 0)
        c0.text = num
        c0.fill.solid()
        c0.fill.fore_color.rgb = RGBColor(2, 132, 199)
        c0.text_frame.paragraphs[0].font.bold = True
        c0.text_frame.paragraphs[0].font.color.rgb = c_white
        c0.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        c1 = t7.cell(idx, 1)
        c1.text = desc
        c1.text_frame.paragraphs[0].font.size = Pt(11)

    # ----------------------------------------------------
    # SLIDE 8: 6. SUB PAGE DESCRIPTION (LIVE TV)
    # ----------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "6. Sub Page Description (Live TV Channels)", 8)

    live_img = r'C:\Proyectos\TV\platforms\webos\screenshot2.png'
    if os.path.exists(live_img):
        s8.shapes.add_picture(live_img, Inches(0.8), Inches(1.4), width=Inches(7.2), height=Inches(4.0))

    t8_shape = s8.shapes.add_table(5, 2, Inches(8.3), Inches(1.4), Inches(4.2), Inches(3.5))
    t8 = t8_shape.table
    t8.columns[0].width = Inches(0.6)
    t8.columns[1].width = Inches(3.6)

    t8_items = [
        ("1", "Category Sidebar: Sports, News, Movies, Kids, etc."),
        ("2", "Channel List: Real-time channel list with active selection"),
        ("3", "Built-in Player Preview: High-definition HLS/MPEG-TS video"),
        ("4", "Player Gear Menu: Switch audio language, subtitles & aspect ratio"),
        ("5", "Favorites: One-click favorite channel bookmarking")
    ]
    for idx, (num, desc) in enumerate(t8_items):
        c0 = t8.cell(idx, 0)
        c0.text = num
        c0.fill.solid()
        c0.fill.fore_color.rgb = RGBColor(16, 185, 129)
        c0.text_frame.paragraphs[0].font.bold = True
        c0.text_frame.paragraphs[0].font.color.rgb = c_white
        c0.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        c1 = t8.cell(idx, 1)
        c1.text = desc
        c1.text_frame.paragraphs[0].font.size = Pt(11)

    # ----------------------------------------------------
    # SLIDE 9: 6. SUB PAGE DESCRIPTION (VOD MOVIES & SERIES)
    # ----------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "6. Sub Page Description (VOD Movies & Series)", 9)

    vod_img = r'C:\Proyectos\TV\platforms\webos\screenshot3.png'
    if os.path.exists(vod_img):
        s9.shapes.add_picture(vod_img, Inches(0.8), Inches(1.4), width=Inches(7.2), height=Inches(4.0))

    t9_shape = s9.shapes.add_table(5, 2, Inches(8.3), Inches(1.4), Inches(4.2), Inches(3.5))
    t9 = t9_shape.table
    t9.columns[0].width = Inches(0.6)
    t9.columns[1].width = Inches(3.6)

    t9_items = [
        ("1", "VOD Catalog Grid: High-res movie posters and series covers"),
        ("2", "Movie Synopsis: Detailed plot summary, release year, genre"),
        ("3", "Official Trailers: Plays YouTube trailers directly on TV"),
        ("4", "Playback Controls: Play Movie, resume playback, track selection"),
        ("5", "Parental Lock: PIN prompt before opening adult categories")
    ]
    for idx, (num, desc) in enumerate(t9_items):
        c0 = t9.cell(idx, 0)
        c0.text = num
        c0.fill.solid()
        c0.fill.fore_color.rgb = RGBColor(236, 72, 153)
        c0.text_frame.paragraphs[0].font.bold = True
        c0.text_frame.paragraphs[0].font.color.rgb = c_white
        c0.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        c1 = t9.cell(idx, 1)
        c1.text = desc
        c1.text_frame.paragraphs[0].font.size = Pt(11)

    # ----------------------------------------------------
    # SLIDE 10: 7. PAID CONTENT (NOT APPLICABLE)
    # ----------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "7. Paid Content (Not Applicable)", 10)

    b10 = s10.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.3), Inches(3.5))
    p10 = b10.text_frame.paragraphs[0]
    p10.text = "NOT APPLICABLE (NO PAID CONTENT)"
    p10.font.bold = True
    p10.font.size = Pt(28)
    p10.font.color.rgb = RGBColor(16, 185, 129)
    p10.alignment = PP_ALIGN.CENTER

    sub10 = b10.text_frame.add_paragraph()
    sub10.text = "• IPTV Nova Plus is completely FREE of charge.\n• There is NO in-app purchasing mechanism, NO webOS Pay integration, and NO paid subscriptions.\n• The application is purely a client media player for playlists provided voluntarily by the user."
    sub10.font.size = Pt(16)
    sub10.font.color.rgb = c_dark
    sub10.space_before = Pt(24)

    # ----------------------------------------------------
    # SLIDE 11: 8. IN-APP AD (NOT APPLICABLE)
    # ----------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "8. In-App Ad (Not Applicable)", 11)

    b11 = s11.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.3), Inches(3.5))
    p11 = b11.text_frame.paragraphs[0]
    p11.text = "NOT APPLICABLE (NO IN-APP ADS)"
    p11.font.bold = True
    p11.font.size = Pt(28)
    p11.font.color.rgb = RGBColor(16, 185, 129)
    p11.alignment = PP_ALIGN.CENTER

    sub11 = b11.text_frame.add_paragraph()
    sub11.text = "• The application does NOT contain any banner advertisements.\n• The application does NOT contain any video ads (AVOD) or popups.\n• No third-party ad networks or tracking SDKs are utilized."
    sub11.font.size = Pt(16)
    sub11.font.color.rgb = c_dark
    sub11.space_before = Pt(24)

    # ----------------------------------------------------
    # SLIDE 12: [APPENDIX] NOTES FOR LG QA
    # ----------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, "[Appendix] Notes for LG QA Reviewers", 12)

    b12 = s12.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.3), Inches(5.2))
    tf12 = b12.text_frame

    notes = [
        ("1. Fast Track Testing (Demo Mode):", "On initial app launch, click 'Probar en MODO DEMO' at the bottom of the account screen. This instantly loads standard test streams (HLS 1080p legal content) allowing immediate verification of video, audio tracks, and UI navigation without external network constraints."),
        ("2. Parental Control Verification:", "Adult / XXX categories are locked by default. The default PIN code is 0000. It can be changed in the Settings screen."),
        ("3. Remote Control Compatibility:", "The application fully adheres to LG webOS Smart TV guidelines: spatial D-Pad navigation, OK button triggers, and standard TV Back key returns to the previous view without abrupt exit."),
        ("4. Zero Personal Data Collection:", "Account credentials and favorites are stored strictly in HTML5 LocalStorage on the TV. No user data is transmitted to third-party tracking servers."),
        ("5. Developer Contact:", "Developer: Christian Montano | Email: christian.montano.0712@gmail.com | Thank you for reviewing IPTV Nova Plus.")
    ]
    for header_t, body_t in notes:
        p1 = tf12.add_paragraph()
        p1.text = header_t
        p1.font.bold = True
        p1.font.size = Pt(13)
        p1.font.color.rgb = c_red
        p1.space_after = Pt(2)

        p2 = tf12.add_paragraph()
        p2.text = body_t
        p2.font.size = Pt(12)
        p2.font.color.rgb = c_dark
        p2.space_after = Pt(12)

    # Save
    out_dir = r'C:\Proyectos\TV\docs'
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'IPTV_Nova_Plus_UX_Scenario.pptx')
    prs.save(out_path)
    print("SUCCESS_PPTX_GENERATED:", out_path)

if __name__ == '__main__':
    create_ux_scenario()

