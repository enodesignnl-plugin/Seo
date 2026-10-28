# render the clean shape at the source scale and compare it with the source coverage
import json, subprocess, numpy as np, sys
from PIL import Image
d=json.load(open('shape.json'))['d']; S=4
open('cmp.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3070 3420" width="{307*S}" height="{342*S}"><rect width="3070" height="3420" fill="#000"/><path fill="#fff" d="{d}"/></svg>')
subprocess.run(['inkscape','cmp.svg','-o','cmp.png','-w',str(307*S)],capture_output=True)
r=np.asarray(Image.open('cmp.png').convert('L')).astype(float)/255
a=np.load('alpha.npy'); lab=np.load('lab.npy')
from scipy import ndimage as nd
# the letter: everything of the faint coverage connected to the R (its hairline ends are fainter
# than the threshold used for lab)
lab2,_=nd.label(a>0.1); a=np.where(nd.binary_dilation(lab2==lab2[152,150],iterations=1),a,0)
A=np.asarray(Image.fromarray((a*255).astype(np.uint8)).resize((307*S,342*S),Image.BICUBIC)).astype(float)/255
inter=np.minimum(r,A).sum(); uni=np.maximum(r,A).sum()
print('IoU %.4f'%(inter/uni), 'area src %.0f ours %.0f'%(A.sum()/S/S, r.sum()/S/S))
diff=np.zeros(r.shape+(3,),np.uint8)
diff[...,0]=np.clip((A-r)*255,0,255)  # red: in source, missing in ours
diff[...,1]=np.clip((r-A)*255,0,255)  # green: ours, not in source
diff[...,2]=np.minimum(r,A)*90
Image.fromarray(diff).crop((30*S,25*S,307*S,290*S)).save('diff.png')
