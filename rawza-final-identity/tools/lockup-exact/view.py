# render path json (reference px units) at scale over region, side by side with the reference
import json,subprocess,sys,numpy as np
from PIL import Image
f,x0,y0,x1,y1,S,out=sys.argv[1],*map(float,sys.argv[2:7]),sys.argv[7]
d=json.load(open(f))['d']; W=int((x1-x0)*S); H=int((y1-y0)*S)
open('_v.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {x1-x0} {y1-y0}" width="{W}" height="{H}"><rect x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}" fill="#29170D"/><path fill="#EDBD76" d="{d}"/></svg>')
subprocess.run(['inkscape','_v.svg','-o','_v.png','-w',str(W)],capture_output=True)
v=Image.open('_v.png').convert('RGB'); r=Image.open('referentie.jpg').crop((int(x0),int(y0),int(x1),int(y1))).resize((W,H),Image.LANCZOS)
o=Image.new('RGB',(W*2+10,H),'white'); o.paste(r,(0,0)); o.paste(v,(W+10,0)); o.save(out)
