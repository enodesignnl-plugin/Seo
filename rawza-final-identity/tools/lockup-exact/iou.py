# IoU of a path json against the reference coverage, restricted to a window (and optional mask comp)
import json,subprocess,sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
f,x0,y0,x1,y1=sys.argv[1],*map(int,sys.argv[2:6]); S=4
d=json.load(open(f))['d']; W=(x1-x0)*S; H=(y1-y0)*S
open('_i.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {x1-x0} {y1-y0}" width="{W}" height="{H}"><rect x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}" fill="#000"/><path fill="#fff" d="{d}"/></svg>')
subprocess.run(['inkscape','_i.svg','-o','_i.png','-w',str(W)],capture_output=True)
r=np.asarray(Image.open('_i.png').convert('L')).astype(float)/255
t=np.clip(np.load('t.npy'),0,1)[y0:y1,x0:x1]
if len(sys.argv)>6:  # keep only coverage connected to a seed pixel
    sx,sy=map(int,sys.argv[6].split(',')); lab,_=nd.label(t>0.1); t=np.where(nd.binary_dilation(lab==lab[sy-y0,sx-x0],iterations=1),t,0)
A=np.asarray(Image.fromarray((t*255).astype(np.uint8)).resize((W,H),Image.BICUBIC)).astype(float)/255
print('IoU %.4f'%(np.minimum(r,A).sum()/np.maximum(r,A).sum()))
