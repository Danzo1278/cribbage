# Builds "Cribbage Classic" (regular cribbage only) from the main game file.
import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src).read()
def rep(a,b,n=1):
    global s
    c=s.count(a);assert c==n,(c,a[:90]);s=s.replace(a,b)
rep('<title>Cribbage</title>','<title>Cribbage Classic</title>')
# own save slot, so stats/settings don't mix with the full game on the same site
rep("localStorage.getItem('crib')","localStorage.getItem('crib-classic')")
rep("localStorage.setItem('crib'","localStorage.setItem('crib-classic'")
# home screen: no Adventure, no Collection, no gem counter
rep("""<button class="pill" id="t2"><span>${IC('rogue')}</span>${RUN?'Continue adventure':'Adventure'}</button><button class="pill" id="t5"><span>${IC('coll')}</span>Collection</button>""","")
rep("""<span class="gemc">${IC('gem')}${S.gems||0}</span></div><div class="hlogo">""","""</div><div class="hlogo">""")
rep("$('t2').onclick=","if($('t2'))$('t2').onclick=")
rep("$('t5').onclick=()=>openColl();","")
# settings: no Collection button; every table theme unlocked
rep('<button class="gb" id="cu">Collection</button>','')
rep("$('cu').onclick=()=>{$('shs').hidden=true;openColl()};","")
rep("const owns=(t,id)=>{","const owns=(t,id)=>true,owns0=(t,id)=>{")
# no gems
rep("function gems(n){S.gems=(S.gems||0)+n;saveS();return n}","function gems(n){return 0}")
# stats: drop adventure + gem rows
rep("+r('rogue','Adventures completed',S.runsWon||0)+r('battle','Most battles in a run',S.bestRun||0)+r('gem','Gems',S.gems||0)","")
# how to play: no relic talk
rep("<p>Tap Hint for a suggestion. In a roguelike run, hints unlock with the Mentor's Notebook relic.</p>","<p>Tap Hint for a suggestion.</p>")
# the hidden "new run" button does nothing
rep("$('rn').onclick=()=>{","$('rn').onclick=()=>{return;")
# the menu logo says Classic
rep('<div class="ribbon hrib">First to 121 wins</div>','<div class="ribbon hrib">Classic · First to 121 wins</div>')
open(dst,'w').write(s);print('built',dst,len(s))
