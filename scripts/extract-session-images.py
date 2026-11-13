"""Extract selected real session frames. Run locally with OpenCV and Pillow; not part of the site build."""
from pathlib import Path
import json
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'images' / 'sessions'
OUT.mkdir(parents=True, exist_ok=True)
SELECTIONS = [
    ('presentation', 'communication', 2.0, 'A learner practising a presentation in a classroom'),
    ('interview-practice', 'interview', 96.0, 'Learners and a facilitator taking part in interview practice'),
    ('conversation', 'workshop', 17.0, 'Two participants practising a conversation in a classroom'),
    ('classroom-activity', 'workshop', 11.0, 'Learners working on a written classroom activity'),
    ('peer-learning', 'interview', 65.0, 'Participants sharing ideas during a classroom session'),
    ('group-session', 'group', 20.0, 'Participants gathered for an interactive group learning session'),
]
manifest=[]
for name, source, seconds, alt in SELECTIONS:
    cap=cv2.VideoCapture(str(ROOT/'media'/'training'/(source+'.mp4')))
    cap.set(cv2.CAP_PROP_POS_MSEC, seconds*1000)
    ok, frame=cap.read();cap.release()
    if not ok: raise RuntimeError(f'Cannot read {source} at {seconds}')
    gray=cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
    rows=(gray.mean(axis=1)>5).nonzero()[0];cols=(gray.mean(axis=0)>5).nonzero()[0]
    frame=frame[rows[0]:rows[-1]+1,cols[0]:cols[-1]+1]
    photo=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB))
    photo.save(OUT/(name+'.webp'),quality=88,method=6)
    manifest.append(dict(name=name,source=source+'.mp4',seconds=seconds,width=photo.width,height=photo.height,alt=alt))
(OUT/'provenance.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')

# A social-sharing card using the same real frames; no generated people or photos.
canvas=Image.new('RGB',(1200,630),'#0f1d3a');d=ImageDraw.Draw(canvas)
font_dir=Path('C:/Windows/Fonts')
def font(size,bold=False): return ImageFont.truetype(str(font_dir/('segoeuib.ttf' if bold else 'segoeui.ttf')),size)
d.rectangle((0,0,12,630),fill='#e8822a')
d.text((62,60),'AKALUs Global',font=font(43,True),fill='white')
d.text((65,125),'YOUR TIMELESS PARTNERS',font=font(16),fill='#e8a36a')
for y,line in [(230,'Career guidance.'),(295,'Confidence.'),(360,'What comes next.')]:d.text((62,y),line,font=font(42,True),fill='white' if y!=295 else '#ed9b59')
d.text((65,506),'Personalized support for learners and teams',font=font(18),fill='#bdc9db')
d.text((65,553),'Jaipur, Rajasthan · AKALUs Global',font=font(17),fill='#bdc9db')
for name,box in [('presentation',(670,55,880,575)),('interview-practice',(898,55,1150,306)),('classroom-activity',(898,324,1150,575))]:
    photo=Image.open(OUT/(name+'.webp'))
    photo=ImageOps.fit(photo,(box[2]-box[0],box[3]-box[1]),method=Image.Resampling.LANCZOS)
    canvas.paste(photo,box[:2])
(ROOT/'images'/'social').mkdir(exist_ok=True)
canvas.save(ROOT/'images'/'social'/'akalus-global.jpg',quality=90,optimize=True)
print(json.dumps(manifest,indent=2))
