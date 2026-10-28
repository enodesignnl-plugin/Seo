# Side-by-side sheet: the reference, the new vector, and the vector's outline over the reference.
import json, subprocess, os
from PIL import Image, ImageDraw, ImageFont
HERE=os.path.dirname(os.path.abspath(__file__)); D=os.path.join(HERE,'..','..','sierlijke-r-exact')
d=json.load(open(os.path.join(HERE,'shape.json')))['d']; S=4; W,H=307*S,342*S
def render(name, body):
    svg=os.path.join(HERE,name+'.svg'); png=svg[:-4]+'.png'
    open(svg,'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3070 3420" width="{W}" height="{H}">{body}</svg>')
    subprocess.run(['inkscape',svg,'-o',png,'-w',str(W)],capture_output=True); im=Image.open(png).convert('RGBA'); os.remove(svg); os.remove(png); return im
vec=render('_fill',f'<rect width="3070" height="3420" fill="#29170D"/><path fill="#EDBD76" d="{d}"/>')
line=render('_line',f'<path fill="none" stroke="#3FE0FF" stroke-width="5" d="{d}"/>')
src=Image.open(os.path.join(D,'bron','referentie.png')).convert('RGBA').resize((W,H),Image.BICUBIC)
crop=(30*S,20*S,307*S,290*S)
panels=[(src,'Referentie (jouw afbeelding)'),(vec,'Vector (nieuw)'),(Image.alpha_composite(src,line),'Vectorcontour over de referentie')]
pw,ph=crop[2]-crop[0],crop[3]-crop[1]; out=Image.new('RGB',(pw*3+80,ph+90),(245,240,232)); dr=ImageDraw.Draw(out)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',30)
for i,(p,t) in enumerate(panels):
    out.paste(p.crop(crop).convert('RGB'),(20+i*(pw+20),70)); dr.text((20+i*(pw+20),20),t,fill=(42,26,18),font=f)
out.save(os.path.join(D,'RAWZA_Sierlijke_R_Exact_Vergelijking.png'))
