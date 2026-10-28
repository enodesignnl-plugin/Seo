# Fit Montserrat to the descriptor: shared size and baseline, per letter x position; weight scan.
import sys, json, numpy as np
from scipy import optimize as op
from fitword import *
ff=sys.argv[1]
xs=[427,466,496,534,568,603,642,678,731,766,797,827,857,895,932,964,1002,1037]
xe=[452,483,517,554,592,628,662,696,750,783,815,846,881,915,951,988,1023,1056]
text='AFGHAANSRESTAURANT'
def run(w,em,base,refine=False):
    res=[];tot=0
    for ch,a,b in zip(text,xs,xe):
        T,off=letter_target((a,b+1,796,824),pad=4); g,org=master(ff,ch,w)
        gy,gx=np.where(g>0.5); ty,tx=np.where(T>0.5)
        x0=off[0]+tx.min()-(gx.min()-org[0])*em/S
        f=lambda p: -iou(place(g,org,em,1.0,p[0],base,T.shape,off),T)
        r=op.minimize(f,[x0],method='Nelder-Mead',options={'xatol':0.01,'fatol':1e-6})
        res.append(dict(ch=ch,x=round(r.x[0],3),iou=round(-r.fun,4))); tot+=-r.fun
    return res,tot/len(text)
if __name__=='__main__':
    for w in map(float,sys.argv[2].split(',')):
        for em in map(float,sys.argv[3].split(',')):
            for base in map(float,sys.argv[4].split(',')):
                res,m=run(w,em,base); print(w,em,base,round(m,4),flush=True)
                if len(sys.argv)>5: json.dump(dict(font=ff,wght=w,em=em,baseline=base,letters=res),open('desc_fit.json','w'),indent=1)
