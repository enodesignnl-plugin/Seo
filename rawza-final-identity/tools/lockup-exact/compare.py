# Comparison sheet and overlap per part. The vector is drawn back at the reference position (the
# final centring shift undone). Each part is compared at its best offset: that offset is how far the
# spacing rules moved it, the overlap at that offset is how well the shape itself matches.
import json, subprocess, os, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd
HERE=os.path.dirname(os.path.abspath(__file__)); D=os.path.join(HERE,'..','..','logo-exact')
L=json.load(open(os.path.join(HERE,'lockup.json'))); sx,sy=L['shift']; N=1254
parts={'toren':L['icon'],'R':L['r'],**{f'{l["ch"]}{i}':l['d'] for i,l in enumerate(L['letters'])},'ondertitel':L['desc']}
label={'toren':'toren met bloem','R':'sierlijke R','A0':'A','W1':'W','Z2':'Z','A3':'laatste A','ondertitel':'AFGHAANS RESTAURANT'}
win={'toren':(540,400,720,590),'R':(180,585,455,845),'A0':(360,610,550,765),'W1':(520,610,752,765),'Z2':(745,610,885,765),'A3':(883,610,1066,765),'ondertitel':(420,790,1065,830)}
def render(body,name,S):
    svg=os.path.join(HERE,name+'.svg'); png=svg[:-4]+'.png'
    open(svg,'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {N} {N}" width="{N*S}" height="{N*S}"><g transform="translate({-sx} {-sy})">{body}</g></svg>')
    subprocess.run(['inkscape',svg,'-o',png,'-w',str(N*S)],capture_output=True); im=Image.open(png).convert('RGBA'); os.remove(svg); os.remove(png); return im
# overlap, at half-pixel steps
S=2; t=np.clip(np.load(os.path.join(HERE,'t.npy')),0,1)
A=np.asarray(Image.fromarray((t*255).astype(np.uint8)).resize((N*S,N*S),Image.BICUBIC)).astype(float)/255
lab,_=nd.label(A>0.1); off={}; lines=[]
for k,d in parts.items():
    r=np.asarray(render(f'<path fill="#fff" d="{d}"/>','_m',S))[...,3].astype(float)/255
    x0,y0,x1,y1=[c*S for c in win[k]]; a=A[y0:y1,x0:x1]
    if k=='toren': a=np.clip(a/0.893,0,1)   # the tower is printed in a slightly darker gold
    if k!='ondertitel' and k!='toren':      # only this letter's own coverage (the R tail runs under the A)
        Lw=lab[y0:y1,x0:x1]; Lw=Lw[Lw>0]; a=a*nd.binary_dilation(lab==np.bincount(Lw).argmax(),iterations=2)[y0:y1,x0:x1]
    best=(0,0,0)
    for dy in range(-16,17):
        for dx in range(-16,17):
            b=r[y0-dy:y1-dy,x0-dx:x1-dx]; best=max(best,(np.minimum(a,b).sum()/np.maximum(a,b).sum(),dx/S,dy/S))
    off[k]=best[1:]; lines.append(f'{label[k]:20s} vorm {best[0]*100:.1f}%   verschoven {-best[1]:+.1f} px horizontaal, {-best[2]:+.1f} px verticaal')
open(os.path.join(HERE,'compare.txt'),'w').write('\n'.join(lines)+'\n'); print('\n'.join(lines))
# sheet
S=3
fill=''.join(f'<path fill="#EDBD76" d="{d}"/>' for d in parts.values())
vec=render(f'<rect x="-50" y="-50" width="{N+100}" height="{N+100}" fill="#29170D"/>'+fill,'_fill',S)
line=render(''.join(f'<g transform="translate({off[k][0]} {off[k][1]})"><path fill="none" stroke="#3FE0FF" stroke-width="0.7" d="{d}"/></g>' for k,d in parts.items()),'_line',S)
src=Image.open(os.path.join(HERE,'referentie.jpg')).convert('RGBA').resize((N*S,N*S),Image.BICUBIC)
crop=(175*S,395*S,1075*S,860*S)
pw,ph=crop[2]-crop[0],crop[3]-crop[1]; out=Image.new('RGB',(pw+40,ph*3+3*70+20),(245,240,232)); dr=ImageDraw.Draw(out)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',40)
for i,(p,tt) in enumerate([(src,'Referentie (jouw afbeelding)'),(vec,'Vector (nieuw, afstanden gelijk, toren op zijn plek uit je afbeelding)'),(Image.alpha_composite(src,line),'Vormcontrole: elke vectorvorm als contour op zijn plek in de referentie')]):
    y=20+i*(ph+70); dr.text((20,y),tt,fill=(42,26,18),font=f); out.paste(p.crop(crop).convert('RGB'),(20,y+55))
out.save(os.path.join(D,'RAWZA_Logo_Exact_Vergelijking.png'))
