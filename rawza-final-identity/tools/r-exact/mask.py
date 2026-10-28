# Coverage (0..1) of the gold letter in the reference image, with the orange annotation line removed.
#   cd tools/r-exact && python3 mask.py && KE=6 python3 build.py && F=0.85 node outline.cjs strokes.json shape.json && python3 cmp.py && node export.cjs
from PIL import Image; import numpy as np; from scipy import ndimage as nd
im=np.asarray(Image.open('../../sierlijke-r-exact/bron/referentie.png').convert('RGB')).astype(float)
bg=np.array([41,23,13.]); gold=np.array([237,189,118.])
d=gold-bg; t=np.clip(((im-bg)@d)/(d@d),0,1)
orange=(im[...,0]-im[...,1]>55)&(im[...,1]-im[...,2]>30)&(im[...,0]>100)
orange=nd.binary_dilation(orange,iterations=1)
a=t.copy(); known=~orange
for _ in range(60):  # diffuse known alpha into the orange line
    s=nd.uniform_filter(np.where(known,a,0),3); w=nd.uniform_filter(known.astype(float),3)
    a=np.where(known,a,np.where(w>0,s/np.maximum(w,1e-6),a))
np.save('alpha.npy',a)
lab,n=nd.label(a>0.45)
for i in range(1,n+1):
    ys,xs=np.where(lab==i)
    if len(ys)>3: print(i,len(ys),xs.min(),xs.max(),ys.min(),ys.max())
np.save('lab.npy',lab)
