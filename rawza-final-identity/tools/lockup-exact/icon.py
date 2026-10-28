# The tower-and-flower icon: coverage, mirror axis, symmetrised and smoothed bitmap for potrace.
import numpy as np; from PIL import Image; from scipy import ndimage as nd
t=np.clip(np.load('t.npy'),0,1.3)
X0,X1,Y0,Y1=540,718,400,590
a=t[Y0:Y1,X0:X1]
lab,n=nd.label(a>0.3); keep=np.zeros_like(a,bool)
for i in range(1,n+1):
    if (lab==i).sum()>50: keep|=lab==i
a=np.where(nd.binary_dilation(keep,iterations=2),a,0)
# normalise: icon gold is darker; interior value
hi=np.percentile(a[a>0.5],60); print('interior t',hi); a=np.clip(a/hi,0,1)
# axis search at 1/10 px
U=10; A=np.asarray(Image.fromarray((a*255).astype(np.uint8)).resize((a.shape[1]*U,a.shape[0]*U),Image.BICUBIC)).astype(float)/255
best=None
for c in np.arange(80,100,0.1):
    cu=int(round(c*U)); w=min(cu,A.shape[1]-cu)-5
    L=A[:,cu-w:cu]; R=A[:,cu:cu+w][:,::-1]; e=np.abs(L-R).mean()
    if best is None or e<best[0]: best=(e,c)
print('axis',best, 'abs x', X0+best[1])
c=best[1]; cu=int(round(c*U)); w=min(cu,A.shape[1]-cu)-5
L=A[:,cu-w:cu]; R=A[:,cu:cu+w][:,::-1]; S=(L+R)/2
S=nd.gaussian_filter(S,U*0.35)
img=np.concatenate([S,S[:,::-1]],1)
ys,xs=np.where(img>0.5); print('sym bbox px', xs.min()/U, xs.max()/U, ys.min()/U+Y0, ys.max()/U+Y0)
Image.fromarray(((img<0.5)*255).astype(np.uint8)).save('icon_bw.pbm')
import json; json.dump([X0+c-w/U, Y0, U], open('icon_meta.json','w')); print('AXIS', X0+c)
