# Rebuild the reference R as clean strokes: rough spine -> recentred on the image's coverage ->
# width = integral of coverage across the stroke -> smoothed centre line and width -> outline.
import numpy as np, json; from scipy import ndimage as nd
a=np.load('alpha.npy'); lab=np.load('lab.npy')
# the letter: everything of the faint coverage connected to the R (its hairline ends are fainter
# than the threshold used for lab)
lab2,_=nd.label(a>0.1); a=np.where(nd.binary_dilation(lab2==lab2[152,150],iterations=1),a,0)
def samp(pts):  # bilinear sampling, pts (...,2) as x,y
    return nd.map_coordinates(a,[pts[...,1],pts[...,0]],order=1,mode='constant')
def catmull(P,step=0.4):
    P=np.array(P,float); P=np.vstack([2*P[0]-P[1],P,2*P[-1]-P[-2]]); out=[]
    for i in range(1,len(P)-2):
        p0,p1,p2,p3=P[i-1:i+3]
        for t in np.linspace(0,1,40,endpoint=False):
            out.append(0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t**3))
    out.append(P[-2]); return resample(np.array(out),step)
def resample(c,step=0.4):
    L=np.r_[0,np.cumsum(np.hypot(*np.diff(c,axis=0).T))]; s=np.arange(0,L[-1],step)
    return np.c_[np.interp(s,L,c[:,0]),np.interp(s,L,c[:,1])]
def normals(c):
    g=np.gradient(c,axis=0); g=nd.gaussian_filter1d(g,4,axis=0); g/=np.hypot(*g.T)[:,None]
    return np.c_[-g[:,1],g[:,0]]
def measure(c,R):
    n=normals(c); s=np.arange(-R,R+1e-9,0.1)
    pts=c[:,None,:]+s[None,:,None]*n[:,None,:]; v=samp(pts)
    w=np.zeros(len(c)); off=np.zeros(len(c))
    for i in range(len(c)):
        row=v[i]; on=row>0.06; k0=len(s)//2
        # the run of coverage that contains (or is nearest to) the centre
        idx=np.where(on)[0]
        if len(idx)==0: continue
        k=idx[np.argmin(abs(idx-k0))]; lo=k; hi=k
        while lo>0 and on[lo-1]: lo-=1
        while hi<len(s)-1 and on[hi+1]: hi+=1
        r=row[lo:hi+1]; ss=s[lo:hi+1]; w[i]=r.sum()*0.1; off[i]=(r*ss).sum()*0.1/max(w[i],1e-6)
    return w,off,n
def fit(spine,R=14,iters=5,sig=6,step=0.4,fix=()):
    c=catmull(spine,step)
    for it in range(iters):
        w,off,n=measure(c,R)
        for (x0,y0,x1,y1) in fix: m=(c[:,0]>=x0)&(c[:,0]<=x1)&(c[:,1]>=y0)&(c[:,1]<=y1); off[m]=0
        for (x0,y0,x1,y1) in fix: m=(c[:,0]>=x0)&(c[:,0]<=x1)&(c[:,1]>=y0)&(c[:,1]<=y1); off[m]=0
        off=np.where(w>0.08,off,0); off=nd.gaussian_filter1d(off,sig/step,mode='nearest')
        c=resample(c+off[:,None]*n,step)
    w,off,n=measure(c,R); return c,w,n
def _zone(c,t0,t1):
    t=np.linspace(0,1,len(c)); return (t>=t0)&(t<=t1)
def interp_zones(w,c,zones):
    t=np.linspace(0,1,len(c)); w=w.copy()
    for (t0,t1) in zones:
        m=(t>=t0)&(t<=t1); keep=~m
        w[m]=np.interp(t[m],t[keep],w[keep])
    return w
