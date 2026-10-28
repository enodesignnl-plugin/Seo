# Second pass: one shared size and baseline for A W Z A (as typeset), per letter only the
# horizontal stretch and the x position are fitted.   python3 fitword2.py FONT WGHT EM BASE
import sys, json, numpy as np
from scipy import optimize as op
from fitword import *
ff,w,em,base=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]),float(sys.argv[4])
letters=[('A',(373,537,620,757)),('W',(530,742,620,757)),('Z',(755,875,620,757)),('A',(893,1057,620,757))]
out=[]; tot=0
for ch,box in letters:
    T,off=letter_target(box); g,org=master(ff,ch,w)
    prev=json.load(open('fit_Corm_500.json'))
    p0=[p for p in prev if p['ch']==ch][0 if box[0]<800 else -1]
    f=lambda p: -iou(place(g,org,em,p[0],p[1],base,T.shape,off),T)
    r=op.minimize(f,[p0['stretch'],p0['x']],method='Nelder-Mead',options={'xatol':0.005,'fatol':1e-6})
    out.append(dict(ch=ch,stretch=round(r.x[0],4),x=round(r.x[1],3),iou=round(-r.fun,4))); tot+=-r.fun
print(json.dumps(out), 'mean', round(tot/4,4))
json.dump(dict(font=ff,wght=w,em=em,baseline=base,letters=out),open('word_fit.json','w'),indent=1)
