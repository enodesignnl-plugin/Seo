# The reference R as four smooth strokes fitted to the image (source pixels).
import sys, os, json; sys.path.insert(0,'.')
from fit import *
from scipy.interpolate import LSQUnivariateSpline as LSQ
KC=float(os.environ.get('KC','25')); KW=float(os.environ.get('KW','22')); KE=float(os.environ.get('KE','4'))
SP={
 # entry hairline, bowl, and its return as the hairline bar through the stem
 'bowl':[(42,49),(60,44),(80,40),(110,37),(140,37),(170,41),(195,52),(210,68),(218,90),(216,110),(205,128),(188,141),(168,148),(145,151),(125,151.6),(100,151.8),(80,151.6),(62,151.2),(50,151)],
 'stem':[(128,64),(120,80),(110,103),(100,130),(92,158),(84,185),(77,207),(71,224),(68,234)],
 'leg':[(99,154.6),(102,155.0),(105,155.6),(108,156.4),(110,157.1),(112,157.7),(116,158.8),(130,165),(150,175),(175,195),(200,216),(222,236),(242,253),(260,265),(278,272),(296,275),(306,276)],
}
R={'bowl':16,'stem':12,'leg':10}
# where another stroke (or the annotation line) disturbs the measurement, the width is bridged
BOX={'bowl':[(66,140,113,160)],'stem':[(80,145,110,160)],'leg':[(266,262,286,280)]}
FIX={'leg':[(0,0,116,999)],'bowl':[(66,140,113,160)]}
# measured by hand from the image: the leg leaving the stem as a hairline under the bar
LEGSTART=([99,102,105,108,110,112,116],[1.6,1.9,2.1,2.4,2.7,2.9,3.2])
res={}
for k,sp in SP.items():
    c,w,n=fit(sp,R=R[k],sig=5,fix=FIX.get(k,()))
    for (x0,y0,x1,y1) in BOX.get(k,[]):
        m=(c[:,0]>=x0)&(c[:,0]<=x1)&(c[:,1]>=y0)&(c[:,1]<=y1)
        if m.any(): w[m]=np.interp(np.where(m)[0],np.where(~m)[0],w[~m])
    if k=='leg':
        m=c[:,0]<=116; w[m]=np.interp(c[m,0],*LEGSTART)
    on=np.where(w>0.12)[0]; c,w=c[on[0]:on[-1]+1],w[on[0]:on[-1]+1]
    # smooth models: centre line and squared width as least-squares cubic splines (the squared
    # width is smooth both for a pointed taper and for a round end)
    s=np.r_[0,np.cumsum(np.hypot(*np.diff(c,axis=0).T))]
    kn=lambda d: np.linspace(0,s[-1],max(2,int(s[-1]/d))+1)[1:-1]
    # width knots: every KE px within 12 px of a tip, every KW px elsewhere
    kw=[]; x=KE
    while x<s[-1]-KE: kw.append(x); x+=KE if min(x,s[-1]-x)<12 else KW
    kw=np.array(kw); kw=kw[(kw>0.5)&(kw<s[-1]-0.5)]
    fx=LSQ(s,c[:,0],kn(KC)); fy=LSQ(s,c[:,1],kn(KC)); f2=LSQ(s,w**2,kw)
    ss=np.arange(0,s[-1]+1e-9,0.25); c=np.c_[fx(ss),fy(ss)]; w=np.sqrt(np.maximum(f2(ss),0))
    # pointed tips: a straight taper over the last TP px (the image is too coarse to say more)
    sl=ss; TP=5.0
    for end in ('start','end') if k!='stem' else ('start',):
        d=sl if end=='start' else sl[-1]-sl; m=d<TP; j=np.argmin(abs(d-TP)); w[m]=w[j]*d[m]/TP
    w[0]=w[-1]=0
    g=np.c_[fx.derivative()(ss),fy.derivative()(ss)]; g/=np.hypot(*g.T)[:,None]; n=np.c_[-g[:,1],g[:,0]]
    if k=='stem':  # round foot: continue the squared width on its last slope down to zero
        q=w**2; j=len(q)-1-int(3/0.25); q=q[:j+1]; c,n=c[:j+1],n[:j+1]
        sl=(q[-1]-q[-1-8])/(8*0.25); m=int(np.ceil(-q[-1]/sl/0.25)); g=(c[-1]-c[-2])/0.25
        ext=np.arange(1,m+1)*0.25; q=np.r_[q,np.maximum(q[-1]+sl*ext,0)]
        c=np.vstack([c,c[-1]+ext[:,None]*g]); n=np.vstack([n,np.repeat(n[-1:],m,0)]); w=np.sqrt(q); w[-1]=0
    res[k]=dict(c=c.tolist(),w=w.tolist(),n=n.tolist(),cap=[0,0])
    print(k,len(c),'w max %.1f'%w.max(),'start',c[0].round(1),'end',c[-1].round(1))
json.dump(res,open('strokes.json','w'))
