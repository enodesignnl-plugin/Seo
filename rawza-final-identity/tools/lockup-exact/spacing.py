# Optical gaps between A W Z A: per row of the cap band, the white distance between the facing
# letter edges, each edge limited to a quarter cap height inside its own letter's side, averaged.   python3 spacing.py [W_dx Z_dx]
import sys, json, numpy as np
from fitword import *
F=json.load(open('word_fit.json')); em,base=F['em'],F['baseline']; cap=135.0
def masks(xs):
    out=[]
    for L,x in zip(F['letters'],xs):
        g,org=master(F['font'],L['ch'],F['wght'])
        out.append(place(g,org,em,L['stretch'],x,base,(160,1300),(0,base-cap-10)))
    return out
def edge(m,side):
    rows=[]
    for r in m:
        idx=np.where(r>0.5)[0]
        rows.append(np.nan if len(idx)==0 else (idx.max()+1 if side=='r' else idx.min()))
    return np.array(rows,float)
def gaps(xs):
    ms=masks(xs); band=slice(10,10+int(cap)); res=[]
    for a,b in zip(ms[:-1],ms[1:]):
        ra=edge(a[band],'r'); lb=edge(b[band],'l'); D=cap/4
        ra=np.fmax(np.nan_to_num(ra,nan=-1e9),np.nanmax(ra)-D); lb=np.fmin(np.nan_to_num(lb,nan=1e9),np.nanmin(lb)+D)
        res.append((lb-ra).mean())
    return np.array(res)
if __name__=='__main__':
    xs=[L['x'] for L in F['letters']]
    print('reference gaps', np.round(gaps(xs),2))
    # equalise: first and last A stay, W and Z move
    from scipy import optimize as op
    def f(p): g=gaps([xs[0],p[0],p[1],xs[3]]); return ((g-g.mean())**2).sum()
    r=op.minimize(f,[xs[1],xs[2]],method='Nelder-Mead',options={'xatol':0.005,'fatol':1e-7}); xs=[xs[0],*r.x,xs[3]]
    g=gaps(xs); print('equal gaps', np.round(g,2), 'x', np.round(xs,3))
    json.dump(xs,open('word_x.json','w'))
