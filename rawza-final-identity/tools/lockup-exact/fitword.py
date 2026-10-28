# Fit Cormorant Garamond (and Montserrat for the descriptor) to the reference letters.
# Per letter: font size (cap height), horizontal stretch and position, scored by coverage IoU.
import numpy as np, sys, json, os
from PIL import Image, ImageFont, ImageDraw
from scipy import ndimage as nd, optimize as op
t=np.clip(np.load('t.npy'),0,1)
lab,_=nd.label(t>0.3)
S=400  # render size (px per em) for the master glyph
def master(ff,ch,w):
    f=ImageFont.truetype(ff,S); f.set_variation_by_axes([w])
    im=Image.new('L',(S*2,S*2),0); ImageDraw.Draw(im).text((S//2,S),ch,font=f,fill=255,anchor='ls')
    return np.asarray(im).astype(float)/255, (S//2,S)   # origin = left side bearing point on baseline
def letter_target(box,pad=10):
    bx0,bx1,by0,by1=box; L=lab[by0:by1,bx0:bx1]; m=nd.binary_dilation(lab==np.bincount(L[L>0]).argmax(),iterations=2)
    ys,xs=np.where(m); x0,x1,y0,y1=xs.min()-pad,xs.max()+pad,ys.min()-pad,ys.max()+pad
    return (t*m)[y0:y1,x0:x1],(x0,y0)
def place(g,org,em,stretch,ox,oy,shape,off):
    # glyph master g (S px/em) -> target window: x' = ox + (x-org)*em/S*stretch, y' = oy + (y-org)*em/S
    k=em/S; M=np.array([[1/(k*stretch),0],[0,1/k]])
    # output pixel centre (i+.5) in window coords -> image coords
    from scipy.ndimage import affine_transform
    sw=(stretch*k); sh=k
    # input coord = org + (out + off + .5 - o)/s - .5
    offs=[org[1]+(off[1]+0.5-oy)/sh-0.5, org[0]+(off[0]+0.5-ox)/sw-0.5]
    # supersample 3x via averaging
    acc=np.zeros(shape)
    for a in (-1/3,0,1/3):
        for b in (-1/3,0,1/3):
            acc+=affine_transform(g,np.diag([1/sh,1/sw]),offset=[offs[0]+a/sh,offs[1]+b/sw],output_shape=shape,order=1)
    return acc/9
def iou(P,T): return np.minimum(P,T).sum()/np.maximum(P,T).sum()
if __name__=='__main__':
    ff=sys.argv[1]; w=float(sys.argv[2])
    letters=[('A',(373,537,620,757)),('W',(530,742,620,757)),('Z',(755,875,620,757)),('A',(893,1057,620,757))]
    out=[]
    for ch,seed in letters:
        T,off=letter_target(seed); g,org=master(ff,ch,w)
        ys,xs=np.where(g>0.5); gx0=xs.min()
        ty,tx=np.where(T>0.5)
        def f(p):
            em,st,ox,oy=p
            return -iou(place(g,org,em,st,ox,oy,T.shape,off),T)
        # initial: cap height 135 -> em; left edge alignment
        f0=ImageFont.truetype(ff,S); 
        em0=135/0.63; ox0=off[0]+tx.min()-(gx0-org[0])*em0/S
        r=op.minimize(f,[em0,1.05,ox0,755.9],method='Nelder-Mead',options={'xatol':0.01,'fatol':1e-5,'maxiter':400})
        out.append(dict(ch=ch,em=r.x[0],stretch=r.x[1],x=r.x[2],y=r.x[3],iou=-r.fun)); print(ch,np.round(r.x,3),round(-r.fun,4),flush=True)
    json.dump(out,open(f'fit_{os.path.basename(ff)[:4]}_{int(w)}.json','w'),indent=1)
