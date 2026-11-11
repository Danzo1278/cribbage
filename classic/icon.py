from PIL import Image,ImageDraw
N=32
def hx(c):c=c.lstrip('#');return tuple(int(c[i:i+2],16) for i in (0,2,4))+(255,)
OL='#1a1c2c'
def draw(full=True):
    im=Image.new('RGBA',(N,N),hx('#1f6b4a'));d=ImageDraw.Draw(im)
    R=lambda x0,y0,x1,y1,c:d.rectangle([x0,y0,x1,y1],fill=hx(c))
    P=lambda pts,c:[im.putpixel(q,hx(c)) for q in pts]
    # felt texture
    for y in range(0,N,4):
        for x in range((y//4)%2*2,N,4):im.putpixel((x,y),hx('#257a55'))
    # card back (behind, up-left)
    R(4,3,15,19,OL);R(5,4,14,18,'#b13e53');R(6,5,13,17,'#d4566b')
    for y in range(5,18):
        for x in range(6,14):
            if (x+y)%3==0:im.putpixel((x,y),hx('#8a2a3e'))
    R(6,5,13,5,'#e98a94')
    # front card
    R(10,5,25,22,OL);R(11,6,24,21,'#f4f4f4');R(11,20,24,21,'#c2c3c7')
    red='#b13e53'
    # corner hearts
    def heart(x,y):P([(x,y),(x+2,y)],red);R(x,y+1,x+2,y+1,red);P([(x+1,y+2)],red)
    heart(12,7)
    # big red 5
    R(16,8,22,9,red);R(16,10,17,12,red);R(16,12,21,13,red);R(21,13,22,17,red);R(16,17,21,18,red);R(15,16,16,17,red)
    # board
    R(2,22,29,28,OL);R(3,23,28,27,'#d9a066');R(3,23,28,23,'#eec39a');R(3,27,28,27,'#b8743e')
    for x in range(5,28,3):
        im.putpixel((x,25),hx('#5a3a22'))
    # pegs
    for x0,c,hi in((5,'#4aa3df','#a6e0ff'),(26,'#e0534a','#f5a097')):
        R(x0,16,x0+3,22,OL);R(x0+1,17,x0+2,21,c);im.putpixel((x0+1,17),hx(hi))
    return im
im=draw()
def out(size,mask=False):
    base=im
    if mask:
        # keep everything inside the safe zone: shrink art to ~80% on a full felt background
        bg=Image.new('RGBA',(N*5,N*5),hx('#1f6b4a'));d=ImageDraw.Draw(bg)
        for y in range(0,N*5,20):
            for x in range((y//20)%2*10,N*5,20):d.rectangle([x,y,x+4,y+4],fill=hx('#257a55'))
        art=im.resize((112,112),Image.NEAREST);bg.alpha_composite(art,(24,24));return bg.resize((size,size),Image.NEAREST)
    return base.resize((size,size),Image.NEAREST)
D='/home/claude/cribbage/classic/'
out(512).save(D+'icon-512.png');out(192).save(D+'icon-192.png');out(180).save(D+'icon-180.png');out(64).save(D+'favicon.png');out(512,True).save(D+'icon-maskable-512.png')
# preview: big, phone-size, and side by side with the full game's icon
pv=Image.new('RGBA',(512*2+40+180,512),(240,240,240,255));pv.paste(Image.open('/home/claude/cribbage/icon-512.png'),(0,0));pv.paste(out(512),(552,0))
pv.paste(out(60).resize((60,60)),(552+512+40,40));pv.paste(Image.open('/home/claude/cribbage/icon-512.png').resize((60,60)),(552+512+40,120))
pv.save('/home/claude/icon/preview.png')
