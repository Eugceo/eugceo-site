/* EUGCEO · site public. Contenus et créations lus dans la base de l'app de gestion. */
(function(){
"use strict";
const SUPA="https://tlqllrtgyluglkoxhiqx.supabase.co";
const KEY="sb_publishable_Xv3ztZMMZWPzuIGq0dj_Kg_A1MqH0kb";
const sb=window.supabase.createClient(SUPA,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const $=s=>document.querySelector(s);
const main=$("#main");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const paras=t=>String(t||"").split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${esc(x).replace(/\n/g,"<br>")}</p>`).join("");
const media=p=>p?`${SUPA}/storage/v1/object/public/site/${p.split("/").map(encodeURIComponent).join("/")}`:"";
const isVid=p=>/^videos\//.test(p||"");
const MONO='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4.5C74 3.8 96.2 24 95.4 50.6 94.7 75 74.6 96 49.2 95.3 24.8 94.8 4.6 74.2 5.2 49.4 5.9 25.6 26.4 5.1 50 4.5Z" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="50" y="62" text-anchor="middle" font-family="Cormorant,Georgia,serif" font-size="34" fill="currentColor">EC</text></svg>';
const TRESSE='<svg viewBox="0 0 2400 56" preserveAspectRatio="xMinYMid slice" aria-hidden="true"><g fill="none" stroke="#c8c1ba" stroke-width="1.4" opacity=".8"><path d="M0 28 C40 4 80 4 120 28 S200 52 240 28 S320 4 360 28 S440 52 480 28 S560 4 600 28 S680 52 720 28 S800 4 840 28 S920 52 960 28 S1040 4 1080 28 S1160 52 1200 28 S1280 4 1320 28 S1400 52 1440 28 S1520 4 1560 28 S1640 52 1680 28 S1760 4 1800 28 S1880 52 1920 28 S2000 4 2040 28 S2120 52 2160 28 S2240 4 2280 28 S2360 52 2400 28 S2480 4 2520 28"/><path d="M0 28 C40 52 80 52 120 28 S200 4 240 28 S320 52 360 28 S440 4 480 28 S560 52 600 28 S680 4 720 28 S800 52 840 28 S920 4 960 28 S1040 52 1080 28 S1160 4 1200 28 S1280 52 1320 28 S1400 4 1440 28 S1520 52 1560 28 S1640 4 1680 28 S1760 52 1800 28 S1880 4 1920 28 S2000 52 2040 28 S2120 4 2160 28 S2240 52 2280 28 S2360 4 2400 28 S2480 52 2520 28"/></g></svg>';
const eur=v=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:Number(v)%1?2:0}).format(Number(v));

const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(_){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
let C=Object.assign({},window.EUG_DEFAUT||{},store.get("eug_contenu")||{});
let P=store.get("eug_catalogue")||[];
let ready=false;

async function load(){
  const [a,b]=await Promise.allSettled([sb.from("site_contenu").select("id,data"),sb.rpc("catalogue_public")]);
  if(a.status==="fulfilled"&&!a.value.error&&a.value.data){const o={};a.value.data.forEach(r=>{o[r.id]=r.data});C=Object.assign({},window.EUG_DEFAUT||{},o);store.set("eug_contenu",o)}
  if(b.status==="fulfilled"&&!b.value.error&&b.value.data){P=b.value.data;store.set("eug_catalogue",P)}
  ready=true;
}

/* ---------- créations ---------- */
function titre(p){const s=p.site||{};if(s.titre)return s.titre;return[p.modele,p.longueur?p.longueur+"″":"",p.couleur&&p.couleur!=="Noir Naturel"?p.couleur:""].filter(Boolean).join(" · ")||"Création EUGCEO"}
function dispo(p){const s=p.site||{};if(s.mode==="commande")return false;return Number(p.disponible)>0}
function prix(p){const v=(p.site||{}).prix;return v===""||v==null||isNaN(Number(v))?null:Number(v)}
function photos(p){const s=p.site||{};return(Array.isArray(s.photos)?s.photos:[]).filter(Boolean)}
function densite(p){const d=Number(String(p.densite).replace(",","."));if(!d)return"";return Math.round(d<10?d*100:d)+" %"}
function card(p){
  const ph=photos(p)[0];const pr=prix(p);
  return`<a class="card" href="#/creation/${encodeURIComponent(p.id)}">
    <div class="pic">${ph?`<img src="${esc(media(ph))}" alt="${esc(titre(p))}" loading="lazy">`:`<div class="ph"></div>`}<span class="tag${dispo(p)?" ok":""}">${dispo(p)?"Disponible":"Sur commande"}</span></div>
    <h3>${esc(titre(p))}</h3>
    <div class="meta"><span>${esc([p.construction,p.lace_taille].filter(Boolean).join(" · "))}</span><span class="price">${pr!=null?eur(pr):"Prix sur demande"}</span></div>
  </a>`;
}

/* ---------- formulaires ---------- */
function field(name,label,type,opts){opts=opts||{};
  const req=opts.req?" required":"";const full=opts.full?" full":"";const ac=opts.ac?` autocomplete="${opts.ac}"`:"";
  if(type==="textarea")return`<div class="fld${full}"><label for="f_${name}">${label}</label><textarea id="f_${name}" name="${name}" maxlength="2000"${req}></textarea></div>`;
  if(type==="select")return`<div class="fld${full}"><label for="f_${name}">${label}</label><select id="f_${name}" name="${name}"${req}>${opts.list.map(o=>`<option${o===opts.val?" selected":""}>${esc(o)}</option>`).join("")}</select></div>`;
  return`<div class="fld${full}"><label for="f_${name}">${label}</label><input id="f_${name}" name="${name}" type="${type}" maxlength="${opts.max||120}"${ac}${req}${opts.ph?` placeholder="${esc(opts.ph)}"`:""}></div>`;
}
function form(kind,extra){
  const fields=[field("nom","Nom et prénom","text",{req:1,ac:"name"})];
  if(kind==="rdv"){
    const prest=((C.prestations||{}).sections||[]).map(s=>s.titre).filter(Boolean);
    fields.push(field("prestation","Prestation","select",{list:[...prest,"Essayage","Autre"]}));
    fields.push(field("disponibilites","Tes disponibilités","text",{ph:"ex. samedi matin, mardi après 18 h",max:300}));
  }
  fields.push(field("email","E-mail","email",{ac:"email"}),field("telephone","Téléphone","tel",{ac:"tel",max:30}));
  fields.push(field("message",kind==="commande"?"Ton message (taille de bonnet, questions…)":"Message","textarea",{full:1,req:kind==="contact"}));
  return`<form class="form" data-kind="${kind}"${extra?` data-pid="${esc(extra.id)}" data-ptitre="${esc(extra.titre)}"`:""} novalidate>
    ${fields.join("")}
    <div class="hp" aria-hidden="true"><label>Ne pas remplir<input name="site_web" tabindex="-1" autocomplete="off"></label></div>
    <label class="consent full"><input type="checkbox" name="ok" required><span>J'accepte qu'EUGCEO utilise ces informations pour me répondre. Voir la page <a href="#/confidentialite">Confidentialité</a>.</span></label>
    <div class="full"><button class="btn" type="submit">${kind==="commande"?"Envoyer ma demande":kind==="rdv"?"Demander un rendez-vous":"Envoyer"}</button></div>
    <div class="full" data-out aria-live="polite"></div>
  </form>`;
}
async function submit(f){
  const out=f.querySelector("[data-out]");const btn=f.querySelector("button[type=submit]");
  const v=n=>{const e=f.elements[n];return e?String(e.value||"").trim():""};
  const show=(t,err)=>{out.innerHTML=`<p class="msg${err?" err":""}">${esc(t)}</p>`};
  if(v("site_web"))return show("Merci, ta demande est bien envoyée.");
  const nom=v("nom"),email=v("email"),tel=v("telephone"),msg=v("message");
  if(nom.length<2)return show("Indique ton nom.",1);
  if(!email&&!tel)return show("Laisse au moins un e-mail ou un numéro de téléphone pour qu'on puisse te répondre.",1);
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return show("L'adresse e-mail semble incomplète.",1);
  if(tel&&tel.replace(/\D/g,"").length<9)return show("Le numéro de téléphone semble incomplet.",1);
  if(f.dataset.kind==="contact"&&msg.length<2)return show("Écris ton message.",1);
  if(!f.elements.ok.checked)return show("Coche la case d'accord pour qu'on puisse te répondre.",1);
  const data={type:f.dataset.kind,nom,email,telephone:tel,message:msg,statut:"Nouvelle",envoyeLe:new Date().toISOString(),page:location.hash};
  if(f.dataset.pid){data.produitId=f.dataset.pid;data.produit=f.dataset.ptitre}
  if(f.dataset.kind==="rdv"){data.prestation=v("prestation");data.disponibilites=v("disponibilites")}
  btn.disabled=true;
  const id=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
  const{error}=await sb.from("demandes").insert({id,data});
  btn.disabled=false;
  if(error)return show("L'envoi n'a pas fonctionné. Réessaie, ou écris-nous à "+((C.contact||{}).email||"contact@eugceo.fr")+".",1);
  f.reset();show("Merci "+nom.split(" ")[0]+", ta demande est bien arrivée. Nous te répondons sous 48 heures ouvrées.");
}

/* ---------- pages ---------- */
function pageHead(c,eyebrow){return`<section class="wrap pagehead">${eyebrow?`<p class="eyebrow">${esc(eyebrow)}</p>`:""}<h1>${esc(c.titre||"")}</h1>${c.texte?`<div class="lead prose">${paras(c.texte)}</div>`:""}</section>`}
function visual(c,cls){
  if(c.video)return`<div class="media ${cls||""}"><video src="${esc(media(c.video))}" autoplay muted loop playsinline${c.image?` poster="${esc(media(c.image))}"`:""}></video></div>`;
  if(c.image)return`<div class="media ${cls||""}"><img src="${esc(media(c.image))}" alt="" loading="lazy"></div>`;
  return`<div class="ph wide ${cls||""}"></div>`;
}
function blocks(list){return list&&list.length?`<div class="blocks">${list.map(s=>`<div class="block">${s.titre?`<h3>${esc(s.titre)}</h3>`:""}<p>${esc(s.texte)}</p></div>`).join("")}</div>`:""}

function vAccueil(){
  const c=C.accueil||{};const sec=c.sections||[];
  const sel=P.filter(p=>photos(p).length).concat(P.filter(p=>!photos(p).length)).slice(0,3);
  const pr=C.prestations||{};const m=C.maison||{};
  const heroMedia=c.video?`<video src="${esc(media(c.video))}" autoplay muted loop playsinline${c.image?` poster="${esc(media(c.image))}"`:""}></video>`:c.image?`<img src="${esc(media(c.image))}" alt="">`:`<div class="wm">${MONO}</div>`;
  return`<section class="hero"><div class="hero-txt fade">
    ${c.surTitre?`<p class="eyebrow">${esc(c.surTitre)}</p>`:""}<h1>${esc(c.titre||"")}</h1>${c.texte?`<p>${esc(c.texte)}</p>`:""}
    <div class="actions"><a class="btn light" href="#/creations">${esc(c.boutons||"Voir les créations")}</a><a class="btn line" href="#/rendezvous">Prendre rendez-vous</a></div>
  </div><div class="hero-pic">${heroMedia}</div></section>
  <div class="tresse" aria-hidden="true">${TRESSE}</div>
  ${sec.length?`<section class="sec"><div class="wrap"><div class="pillars">${sec.map((s,i)=>`<div class="pillar"><span class="n">${["I","II","III","IV","V","VI"][i]||i+1}</span><h3>${esc(s.titre)}</h3><p>${esc(s.texte)}</p></div>`).join("")}</div></div></section>`:""}
  <section class="sec"><div class="wrap">
    <div class="head"><div><p class="eyebrow">Les créations</p><h2>Préparées une à une</h2></div><a class="more" href="#/creations">Tout voir</a></div>
    ${sel.length?`<div class="grid">${sel.map(card).join("")}</div>`:`<p class="lead">Les créations arrivent très bientôt. En attendant, <a href="#/contact">écris-nous</a> : nous te présentons les pièces disponibles.</p>`}
  </div></section>
  <section class="sec band nomargin"><div class="wrap split">
    <div>${visual(m,"dark")}</div>
    <div style="display:flex;flex-direction:column;gap:22px"><p class="eyebrow">${esc(m.titre||"La Maison")}</p><h2>Une maison, une main</h2><div class="lead prose">${paras(m.texte)}</div><div><a class="btn line" href="#/maison">Découvrir la Maison</a></div></div>
  </div></section>
  <section class="sec" style="padding-top:clamp(56px,9vw,120px)"><div class="wrap">
    <div class="head"><div><p class="eyebrow">${esc(pr.titre||"Prestations")}</p><h2>Pose, entretien, transformation</h2></div><a class="more" href="#/prestations">Les prestations</a></div>
    <div class="offer">${(pr.sections||[]).slice(0,3).map(s=>`<div><h3>${esc(s.titre)}</h3><p>${esc(s.texte)}</p></div>`).join("")}</div>
    <div class="actions" style="margin-top:36px"><a class="btn" href="#/rendezvous">Prendre rendez-vous</a></div>
  </div></section>`;
}
let filtre="toutes";
function vCreations(){
  const c=C.creations||{};
  const list=P.filter(p=>filtre==="toutes"||(filtre==="dispo"?dispo(p):!dispo(p)));
  return`${pageHead(c,"Collection")}
  <section class="wrap">
    <div class="filters" role="group" aria-label="Filtrer">${[["toutes","Toutes"],["dispo","Disponibles"],["commande","Sur commande"]].map(([k,l])=>`<button data-f="${k}" aria-pressed="${filtre===k}">${l}</button>`).join("")}</div>
    ${list.length?`<div class="grid">${list.map(card).join("")}</div>`:`<p class="empty">${P.length?"Aucune création dans cette catégorie pour le moment.":"Les créations arrivent très bientôt. Écris-nous pour connaître les pièces disponibles."}</p>`}
  </section>
  ${(c.sections||[]).length?`<section class="sec"><div class="wrap">${blocks(c.sections)}</div></section>`:""}`;
}
function vCreation(id){
  const p=P.find(x=>x.id===id);
  if(!p)return`<section class="wrap pagehead"><p class="eyebrow">Créations</p><h1>Cette création n'est plus en ligne</h1><p class="lead">Elle a peut-être trouvé preneuse. Découvre les autres pièces.</p><div class="actions" style="margin-top:28px"><a class="btn" href="#/creations">Voir les créations</a></div></section>`;
  const s=p.site||{};const ph=photos(p);const items=ph.concat(s.video?[s.video]:[]);const pr=prix(p);const t=titre(p);
  const specs=[["Modèle",p.modele],["Type",p.construction],["Lace",[p.lace_taille,p.lace_qualite].filter(Boolean).join(" · ")],["Longueur",p.longueur?p.longueur+" pouces":""],["Densité",densite(p)],["Cheveux",p.cheveux],["Couleur",p.couleur]].filter(x=>x[1]);
  const notes=(C.creations||{}).sections||[];
  const mainItem=it=>isVid(it)?`<video src="${esc(media(it))}" controls playsinline muted></video>`:`<img src="${esc(media(it))}" alt="${esc(t)}">`;
  document.title=t+" · EUGCEO";
  return`<div class="wrap"><p class="crumbs"><a href="#/creations">Créations</a> · ${esc(t)}</p>
  <section class="product">
    <div>
      <div class="gal-main" id="galMain">${items.length?mainItem(items[0]):`<div class="ph wide" style="aspect-ratio:auto;height:100%"></div>`}</div>
      ${items.length>1?`<div class="gal-thumbs">${items.map((it,i)=>`<button type="button" data-g="${i}" aria-current="${i===0}" aria-label="${isVid(it)?"Vidéo":"Photo "+(i+1)}">${isVid(it)?`<video src="${esc(media(it))}" muted playsinline preload="metadata"></video><span class="play">▶</span>`:`<img src="${esc(media(it))}" alt="" loading="lazy">`}</button>`).join("")}</div>`:""}
    </div>
    <div class="info">
      <span class="tag${dispo(p)?" ok":""}" style="align-self:flex-start">${dispo(p)?"Disponible · expédiée sous 48 h":"Sur commande · environ 2 semaines"}</span>
      <h1 style="font-size:clamp(34px,4.4vw,52px)">${esc(t)}</h1>
      <p class="price">${pr!=null?eur(pr):"Prix sur demande"}</p>
      ${s.description?`<div class="prose" style="color:var(--muted)">${paras(s.description)}</div>`:""}
      ${specs.length?`<dl class="specs">${specs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`:""}
      <div class="actions"><a class="btn" href="#reserver" data-scroll="reserver">${dispo(p)?"Réserver cette création":"La commander"}</a></div>
      ${notes.length?`<div class="notes">${notes.map(n=>`<p><b>${esc(n.titre)}</b>${esc(n.texte)}</p>`).join("")}</div>`:""}
    </div>
  </section>
  <section class="sec" id="reserver"><div class="formcard">
    <h3>${dispo(p)?"Réserver cette création":"Commander cette création"}</h3>
    <p>Laisse-nous tes coordonnées : nous te recontactons sous 48 heures ouvrées pour confirmer, répondre à tes questions et organiser le paiement et l'envoi. Rien n'est débité à cette étape.</p>
    ${form("commande",{id:p.id,titre:t})}
  </div></section></div>`;
}
function vPrestations(){
  const c=C.prestations||{};
  return`${pageHead(c,"Savoir-faire")}
  <section class="wrap"><div class="offer">${(c.sections||[]).map(s=>`<div><h3>${esc(s.titre)}</h3><p>${esc(s.texte)}</p></div>`).join("")}</div>
  <div class="actions" style="margin-top:40px"><a class="btn" href="#/rendezvous">Prendre rendez-vous</a><a class="btn ghost" href="#/contact">Poser une question</a></div></section>
  ${c.image||c.video?`<section class="sec"><div class="wrap">${visual(c)}</div></section>`:""}`;
}
function vRdv(){
  const c=C.rendezvous||{};
  return`${pageHead(c,"Rendez-vous")}
  <section class="wrap"><div class="formcard">${form("rdv")}</div></section>
  ${blocks(c.sections)?`<section class="sec"><div class="wrap">${blocks(c.sections)}</div></section>`:""}`;
}
function vMaison(){
  const c=C.maison||{};
  return`<section class="wrap pagehead split" style="align-items:end"><div><p class="eyebrow">Notre histoire</p><h1>${esc(c.titre||"")}</h1><div class="lead prose">${paras(c.texte)}</div></div><div>${visual(c)}</div></section>
  ${(c.sections||[]).length?`<section class="sec"><div class="wrap">${blocks(c.sections)}</div></section>`:""}
  <section class="wrap"><div class="actions"><a class="btn" href="#/creations">Voir les créations</a></div></section>`;
}
function vEntretien(){
  const c=C.entretien||{};
  return`${pageHead(c,"Conseils")}
  <section class="wrap"><div class="acc">${(c.sections||[]).map((s,i)=>`<details${i===0?" open":""}><summary>${esc(s.titre)}</summary><div class="body">${esc(s.texte)}</div></details>`).join("")}</div>
  <div class="actions" style="margin-top:40px"><a class="btn ghost" href="#/rendezvous">Remise en forme : prendre rendez-vous</a></div></section>`;
}
function vContact(){
  const c=C.contact||{};const tel=(c.telephone||"").replace(/\s/g,"");
  return`<section class="wrap pagehead split" style="align-items:start">
    <div><p class="eyebrow">Écris-nous</p><h1>${esc(c.titre||"Contact")}</h1><div class="lead prose">${paras(c.texte)}</div>
      <div class="contact-lines">${c.email?`<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`:""}${c.telephone?`<a href="tel:${esc(tel.replace(/^0/,"+33"))}">${esc(c.telephone)}</a>`:""}</div></div>
    <div class="formcard">${form("contact")}</div>
  </section>`;
}
function vLegal(k){const c=C[k]||{};return`${pageHead(c)}<section class="wrap legal">${blocks(c.sections)}</section>`}

const ROUTES={"":vAccueil,creations:vCreations,prestations:vPrestations,rendezvous:vRdv,maison:vMaison,entretien:vEntretien,contact:vContact,legal:()=>vLegal("legal"),confidentialite:()=>vLegal("confidentialite")};
const TITLES={creations:"Créations",prestations:"Prestations",rendezvous:"Rendez-vous",maison:"La Maison",entretien:"Entretien",contact:"Contact",legal:"Mentions légales",confidentialite:"Confidentialité"};
let lastRoute=null;
function render(keepScroll){
  const h=decodeURIComponent(location.hash.replace(/^#\/?/,""));const [r,arg]=h.split("/");
  if(r==="reserver")return;
  document.title=TITLES[r]?TITLES[r]+" · EUGCEO":"EUGCEO · Maison de perruques";
  main.innerHTML=r==="creation"?vCreation(arg):(ROUTES[r]||vAccueil)();
  main.classList.toggle("nomargin",false);
  document.querySelectorAll(".nav a").forEach(a=>{const t=a.getAttribute("href").replace("#/","");a.toggleAttribute("aria-current",false);if(t&&(t===r||(r==="creation"&&t==="creations")))a.setAttribute("aria-current","page")});
  const route=r+"/"+(arg||"");
  if(!keepScroll&&route!==lastRoute){window.scrollTo(0,0);if(lastRoute!==null)main.focus({preventScroll:true})}
  lastRoute=route;
  footer();
}
function footer(){const c=C.contact||{};const tel=(c.telephone||"").replace(/\s/g,"");
  $("#ftContact").innerHTML=`${c.email?`<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`:""}${c.telephone?`<a href="tel:${esc(tel.replace(/^0/,"+33"))}">${esc(c.telephone)}</a>`:""}<a href="#/rendezvous">Prendre rendez-vous</a>`;
  $("#yr").textContent=new Date().getFullYear()}

/* ---------- événements ---------- */
const nav=$("#nav"),burger=$("#burger");
function menu(open){nav.classList.toggle("open",open);burger.setAttribute("aria-expanded",String(open));burger.setAttribute("aria-label",open?"Fermer le menu":"Ouvrir le menu");document.body.style.overflow=open?"hidden":""}
burger.addEventListener("click",()=>menu(!nav.classList.contains("open")));
nav.addEventListener("click",e=>{if(e.target.closest("a"))menu(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&nav.classList.contains("open")){menu(false);burger.focus()}});
window.addEventListener("hashchange",()=>render());
window.addEventListener("scroll",()=>$("#hd").classList.toggle("scrolled",scrollY>8),{passive:true});
document.addEventListener("click",e=>{
  const f=e.target.closest("[data-f]");if(f){filtre=f.dataset.f;render(true);return}
  const g=e.target.closest("[data-g]");
  if(g){const h=decodeURIComponent(location.hash.replace(/^#\/?/,"")).split("/");const p=P.find(x=>x.id===h[1]);if(!p)return;
    const s=p.site||{};const items=photos(p).concat(s.video?[s.video]:[]);const it=items[Number(g.dataset.g)];
    $("#galMain").innerHTML=isVid(it)?`<video src="${esc(media(it))}" controls autoplay playsinline muted></video>`:`<img src="${esc(media(it))}" alt="${esc(titre(p))}">`;
    document.querySelectorAll(".gal-thumbs button").forEach(b=>b.setAttribute("aria-current",String(b===g)));return}
  const sc=e.target.closest("[data-scroll]");if(sc){e.preventDefault();const t=document.getElementById(sc.dataset.scroll);if(t){t.scrollIntoView({behavior:"smooth"});const i=t.querySelector("input");if(i)setTimeout(()=>i.focus({preventScroll:true}),500)}}
});
document.addEventListener("submit",e=>{const f=e.target.closest("form[data-kind]");if(f){e.preventDefault();submit(f)}});

render();
load().then(()=>{if(!document.activeElement||!document.activeElement.closest("form"))render(true)});
})();
