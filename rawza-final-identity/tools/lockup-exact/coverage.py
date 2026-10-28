# Coverage (0..1) of the gold artwork in the reference: each pixel projected onto the line from
# the background brown to the gold.
import numpy as np; from PIL import Image
im=np.asarray(Image.open('referentie.jpg').convert('RGB')).astype(float)
bg=np.array([41,23,13.]); gold=np.array([237,189,118.]); d=gold-bg
np.save('t.npy',np.clip(((im-bg)@d)/(d@d),0,1.3))
