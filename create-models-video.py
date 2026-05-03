from moviepy import *

W, H = 1280, 720
BG_COLOR = (30, 40, 50)

bg = ColorClip(size=(W, H), color=BG_COLOR).with_duration(5)

title = TextClip(text="Stag.io Database Models", font_size=50, color="white")
title = title.with_position(("center", 50)).with_duration(5)

subtitle = TextClip(text="Entity-Relationship Overview", font_size=28, color=(180, 180, 180))
subtitle = subtitle.with_position(("center", 120)).with_duration(5)

left_data = [
    ("USERS", (33, 150, 243), 200),
    ("STUDENTS", (106, 27, 154), 300),
    ("COMPANIES", (239, 108, 0), 400),
    ("UNIVERSITIES", (100, 100, 180), 500),
]

right_data = [
    ("OFFERS", (0, 131, 143), 200),
    ("APPLICATIONS", (46, 125, 50), 280),
    ("SAVED", (70, 120, 70), 360),
    ("REVIEWS", (198, 40, 40), 440),
    ("NOTIFICATIONS", (120, 80, 60), 520),
    ("AUDIT", (80, 80, 80), 600),
]

left_boxes = [ColorClip(size=(180, 70), color=c).with_position((80, y)).with_duration(5) for _, c, y in left_data]
right_boxes = [ColorClip(size=(180, 60), color=c).with_position((500, y)).with_duration(5) for _, c, y in right_data]

final = CompositeVideoClip([bg, title, subtitle, *left_boxes, *right_boxes]).with_duration(5)

final.write_videofile(
    "C:/Users/User/OneDrive/Documents/GitHub/Stag.io/Stag.io-Models-Video.mp4",
    fps=24,
    codec="libx264",
    audio=False,
    logger=None
)
print("Video created: Stag.io-Models-Video.mp4")