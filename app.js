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
const MONO='<svg class="ecm" aria-hidden="true"><use href="#ec"/></svg>';
const TRESSE='<svg viewBox="0 0 2400 56" preserveAspectRatio="xMinYMid slice" aria-hidden="true"><g fill="none" stroke="#c8c1ba" stroke-width="1.4" opacity=".8"><path d="M0 28 C40 4 80 4 120 28 S200 52 240 28 S320 4 360 28 S440 52 480 28 S560 4 600 28 S680 52 720 28 S800 4 840 28 S920 52 960 28 S1040 4 1080 28 S1160 52 1200 28 S1280 4 1320 28 S1400 52 1440 28 S1520 4 1560 28 S1640 52 1680 28 S1760 4 1800 28 S1880 52 1920 28 S2000 4 2040 28 S2120 52 2160 28 S2240 4 2280 28 S2360 52 2400 28 S2480 4 2520 28"/><path d="M0 28 C40 52 80 52 120 28 S200 4 240 28 S320 52 360 28 S440 4 480 28 S560 52 600 28 S680 4 720 28 S800 52 840 28 S920 4 960 28 S1040 52 1080 28 S1160 4 1200 28 S1280 52 1320 28 S1400 4 1440 28 S1520 52 1560 28 S1640 4 1680 28 S1760 52 1800 28 S1880 4 1920 28 S2000 52 2040 28 S2120 4 2160 28 S2240 52 2280 28 S2360 4 2400 28 S2480 52 2520 28"/></g></svg>';
const eur=v=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:Number(v)%1?2:0}).format(Number(v));

const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(_){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
let C=Object.assign({},window.EUG_DEFAUT||{},store.get("eug_contenu")||{});
let P=store.get("eug_catalogue")||[];
let ready=false;
let B={livraisonFR:12.99,livraisonDOM:16.99,acomptePct:40};
try{const u=new URLSearchParams(location.search).get("apercu");if(u){store.set("eug_apercu",u);history.replaceState(null,"",location.pathname+location.hash)}}catch(_){}
let AP=store.get("eug_apercu");let apOk=!!AP;
const ferme=()=>!!(C.attente&&C.attente.ouvert===false)&&!apOk;
const OUVERT_TJ=["legal","cgv","confidentialite","devis","merci","entretien"];

async function load(){
  const [a,b,c,d]=await Promise.allSettled([sb.from("site_contenu").select("id,data"),AP?sb.rpc("catalogue_apercu",{p_code:AP}):sb.rpc("catalogue_public"),sb.rpc("reglages_boutique"),AP?sb.rpc("apercu_ok",{p_code:AP}):Promise.resolve({data:false})]);
  if(AP&&d.status==="fulfilled"&&!d.value.error){apOk=d.value.data===true;if(!apOk){AP=null;try{localStorage.removeItem("eug_apercu")}catch(_){}}}
  if(c.status==="fulfilled"&&!c.value.error&&c.value.data)B=Object.assign(B,c.value.data);
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
    fields.push(field("disponibilites","Vos disponibilités","text",{ph:"ex. samedi matin, mardi après 18 h",max:300}));
  }
  fields.push(field("email","E-mail","email",{ac:"email"}),field("telephone","Téléphone","tel",{ac:"tel",max:30}));
  fields.push(field("message",kind==="commande"?"Votre message (taille de bonnet, questions…)":"Message","textarea",{full:1,req:kind==="contact"}));
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
  if(v("site_web"))return show("Merci, votre demande est bien envoyée.");
  const nom=v("nom"),email=v("email"),tel=v("telephone"),msg=v("message");
  if(nom.length<2)return show("Indiquez votre nom.",1);
  if(!email&&!tel)return show("Laissez au moins un e-mail ou un numéro de téléphone pour que nous puissions vous répondre.",1);
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return show("L'adresse e-mail semble incomplète.",1);
  if(tel&&tel.replace(/\D/g,"").length<9)return show("Le numéro de téléphone semble incomplet.",1);
  if(f.dataset.kind==="contact"&&msg.length<2)return show("Écrivez votre message.",1);
  if(!f.elements.ok.checked)return show("Cochez la case d'accord pour que nous puissions vous répondre.",1);
  const data={type:f.dataset.kind,nom,email,telephone:tel,message:msg,statut:"Nouvelle",envoyeLe:new Date().toISOString(),page:location.hash};
  if(f.dataset.pid){data.produitId=f.dataset.pid;data.produit=f.dataset.ptitre}
  if(f.dataset.kind==="rdv"){data.prestation=v("prestation");data.disponibilites=v("disponibilites")}
  btn.disabled=true;
  const id=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
  const{error}=await sb.from("demandes").insert({id,data});
  btn.disabled=false;
  if(error)return show("L'envoi n'a pas fonctionné. Réessayez, ou écrivez-nous à "+((C.contact||{}).email||"contact@eugceo.fr")+".",1);
  f.reset();show("Merci "+nom.split(" ")[0]+", votre demande est bien arrivée. Nous vous répondons sous 48 heures ouvrées.");
}

/* ---------- page d'attente ---------- */
function vAttente(){const a=C.attente||{};
  return`<section class="hero attente"><div class="hero-txt fade">
    ${a.surTitre?`<p class="eyebrow">${esc(a.surTitre)}</p>`:""}<h1>${esc(a.titre||"La Maison ouvre bientôt")}</h1>
    <div class="at-txt">${paras(a.texte)}</div>
    <form class="form at-form" id="attForm" novalidate>
      ${field("nom","Prénom","text",{req:1,ac:"given-name",max:60})}${field("email","E-mail","email",{req:1,ac:"email"})}
      <div class="hp" aria-hidden="true"><label>Ne pas remplir<input name="site_web" tabindex="-1" autocomplete="off"></label></div>
      <label class="consent full"><input type="checkbox" name="ok"><span>J'accepte de recevoir l'e-mail d'ouverture d'EUGCEO. Une seule annonce, puis plus rien sans votre accord. Voir <a href="#/confidentialite">Confidentialité</a>.</span></label>
      <div class="full"><button class="btn light" type="submit">Être prévenue de l'ouverture</button></div>
      <div class="full" data-out aria-live="polite"></div>
    </form>
  </div><div class="hero-pic">${a.image?`<img src="${esc(media(a.image))}" alt="">`:`<div class="wm">${MONO}</div>`}</div></section>`;
}
async function inscrire(f){
  const out=f.querySelector("[data-out]");const show=(t,e)=>{out.innerHTML=`<p class="msg${e?" err":""}">${esc(t)}</p>`};
  const v=n=>String(f.elements[n]?f.elements[n].value:"").trim();
  if(v("site_web"))return show("Merci, c'est noté.");
  const nom=v("nom"),email=v("email");
  if(nom.length<2)return show("Indiquez votre prénom.",1);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return show("L'adresse e-mail semble incomplète.",1);
  if(!f.elements.ok.checked)return show("Cochez la case pour recevoir l'e-mail d'ouverture.",1);
  const btn=f.querySelector("button[type=submit]");btn.disabled=true;
  const id=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
  const{error}=await sb.from("demandes").insert({id,data:{type:"liste",nom,email,consentement:true,statut:"Nouvelle",envoyeLe:new Date().toISOString(),page:"attente"}});
  btn.disabled=false;
  if(error)return show("L'inscription n'a pas fonctionné. Réessayez dans un instant.",1);
  f.reset();show("Merci "+nom.split(" ")[0]+", c'est noté. Vous serez prévenue dès l'ouverture.");
}

/* ---------- pages ---------- */
function pageHead(c,eyebrow){return`<section class="wrap pagehead">${eyebrow?`<p class="eyebrow">${esc(eyebrow)}</p>`:""}<h1>${esc(c.titre||"")}</h1>${c.texte?`<div class="lead prose">${paras(c.texte)}</div>`:""}</section>`}
function visual(c,cls){
  if(c.video)return`<div class="media ${cls||""}"><video src="${esc(media(c.video))}" autoplay muted loop playsinline${c.image?` poster="${esc(media(c.image))}"`:""}></video></div>`;
  if(c.image)return`<div class="media ${cls||""}"><img src="${esc(media(c.image))}" alt="" loading="lazy"></div>`;
  return`<div class="ph wide ${cls||""}"></div>`;
}
function blocks(list){return list&&list.length?`<div class="blocks">${list.map(s=>`<div class="block">${s.titre?`<h3>${esc(s.titre)}</h3>`:""}<p>${esc(s.texte)}</p></div>`).join("")}</div>`:""}

function devise(t){t=String(t||"");const k=t.indexOf("CEO");if(k<0)return`<h1 class="devise"><span class="l2 l2s">${esc(t)}</span></h1>`;
  return`<h1 class="devise">${t.slice(0,k).trim()?`<span class="l1">${esc(t.slice(0,k).trim())}</span>`:""}<span class="l2">CEO</span>${t.slice(k+3).trim()?`<span class="l3">${esc(t.slice(k+3).trim())}</span>`:""}</h1>`}
function vAccueil(){
  const c=C.accueil||{};const sec=c.sections||[];
  const sel=P.filter(p=>photos(p).length).concat(P.filter(p=>!photos(p).length)).slice(0,8);
  const pr=C.prestations||{};const cr=C.creations||{};
  const heroMedia=c.video?`<video src="${esc(media(c.video))}" autoplay muted loop playsinline${c.image?` poster="${esc(media(c.image))}"`:""}></video>`:c.image?`<img src="${esc(media(c.image))}" alt="">`:`<div class="une-vide">${MONO}</div>`;
  const tuile=(o,lien,titreT,lienT)=>`<div class="bloc rv"><a class="cadre" href="${lien}" aria-label="${esc(titreT)}">${o.video?`<video src="${esc(media(o.video))}" autoplay muted loop playsinline></video>`:o.image?`<img src="${esc(media(o.image))}" alt="" loading="lazy">`:`<div class="vide">${MONO}</div>`}</a><h3>${esc(titreT)}</h3><a class="lien" href="${lien}">${esc(lienT)}</a></div>`;
  return`<section class="une${c.image||c.video?" avec":""}">${heroMedia}<div class="une-txt">
    ${c.surTitre?`<p class="sur">${esc(c.surTitre)}</p>`:""}${devise(c.titre||"")}
    <a class="lien" href="#/creations">${esc(c.boutons||"Découvrir les créations")}</a>
  </div><div class="defile" aria-hidden="true"></div></section>
  <section class="wrap phrase">
    <h2 class="rv">Pas juste une création,<br><em>une EUGCEO&#8239;!</em></h2>
    <div class="trait rv"></div>
    ${c.texte?`<p class="rv">${esc(c.texte)}</p>`:""}
    <a class="lien rv" href="#/maison">La Maison</a>
  </section>
  <section class="diptyque">
    ${tuile(cr,"#/creations","Les créations","Découvrir")}
    ${tuile(pr,"#/prestations","Pose et remise en forme","Les prestations")}
  </section>
  <section class="rang">
    <div class="wrap tete rv"><div><p class="sur">Les créations</p><h2>Préparées une à une</h2></div><a class="lien" href="#/creations">Tout voir</a></div>
    ${sel.length?`<div class="piste rv" id="piste">${sel.map(card).join("")}</div>`:`<div class="wrap"><p class="lead rv">Les créations arrivent très bientôt. En attendant, <a href="#/contact">écrivez-nous</a> : nous vous présentons les pièces disponibles.</p></div>`}
  </section>
  ${sec.length?`<section class="wrap trois">${sec.map(x=>`<div class="rv"><h3>${esc(x.titre)}</h3><p>${esc(x.texte)}</p></div>`).join("")}</section>`:""}
  <section class="appel"><div class="wrap"><p class="sur rv">Pose, essayage, remise en forme</p><h2 class="rv">Prendre rendez-vous</h2><a class="btn rv" href="#/rendezvous">Envoyer une demande</a></div></section>`;
}
let filtre="toutes";
function vCreations(){
  const c=C.creations||{};
  const list=P.filter(p=>filtre==="toutes"||(filtre==="dispo"?dispo(p):!dispo(p)));
  return`${pageHead(c,"Collection")}
  <section class="wrap">
    <div class="filters" role="group" aria-label="Filtrer">${[["toutes","Toutes"],["dispo","Disponibles"],["commande","Sur commande"]].map(([k,l])=>`<button data-f="${k}" aria-pressed="${filtre===k}">${l}</button>`).join("")}</div>
    ${list.length?`<div class="grid">${list.map(card).join("")}</div>`:`<p class="empty">${P.length?"Aucune création dans cette catégorie pour le moment.":"Les créations arrivent très bientôt. Écrivez-nous pour connaître les pièces disponibles."}</p>`}
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
      <span class="tag${dispo(p)?" ok":""}" style="align-self:flex-start">${dispo(p)?"Disponible · expédiée sous 48 h":"Sur commande · 15 à 30 jours"}</span>
      <h1 style="font-size:clamp(34px,4.4vw,52px)">${esc(t)}</h1>
      <p class="price">${pr!=null?eur(pr):"Prix sur demande"}</p>${pr!=null&&estBundle(p)&&Number(B.lotRemise)>0?`<p class="muted" style="margin-top:-6px">−${eur2(B.lotRemise)} par lot de ${Number(B.lotTaille)||3} bundles, appliqué dans le panier</p>`:""}
      ${s.description?`<div class="prose" style="color:var(--muted)">${paras(s.description)}</div>`:""}
      ${specs.length?`<dl class="specs">${specs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`:""}
      <div class="actions">${pr!=null?`<button type="button" class="btn" data-add="${esc(p.id)}">${dispo(p)?"Ajouter au panier":`Commander · acompte ${Number(B.acomptePct)||40} %`}</button><a class="btn ghost" href="#reserver" data-scroll="reserver">Une question ?</a>`:`<a class="btn" href="#reserver" data-scroll="reserver">${dispo(p)?"Réserver cette création":"La commander"}</a>`}</div>
      ${pr!=null&&!dispo(p)?`<p class="note-s" style="margin:0">Sur commande : ${Number(B.acomptePct)||40} % à la commande (${eur2(pr*(Number(B.acomptePct)||40)/100)}), le solde avant l'expédition.</p>`:""}
      ${notes.length?`<div class="notes">${notes.map(n=>`<p><b>${esc(n.titre)}</b>${esc(n.texte)}</p>`).join("")}</div>`:""}
    </div>
  </section>
  <section class="sec" id="reserver"><div class="formcard">
    <h3>${pr!=null?"Une question sur cette création ?":dispo(p)?"Réserver cette création":"Commander cette création"}</h3>
    <p>${pr!=null?"Écrivez-nous : taille de bonnet, rendu, délai… Nous vous répondons sous 48 heures ouvrées.":"Laissez-nous vos coordonnées : nous vous recontactons sous 48 heures ouvrées pour confirmer, répondre à vos questions et organiser le paiement et l'envoi. Rien n'est débité à cette étape."}</p>
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
  const aMedia=!!(c.image||c.video);
  return`${aMedia?`<section class="wrap pagehead split" style="align-items:end"><div><p class="eyebrow">Notre histoire</p><h1>${esc(c.titre||"")}</h1><div class="lead prose">${paras(c.texte)}</div></div><div>${visual(c)}</div></section>`:`<section class="wrap pagehead"><p class="eyebrow">Notre histoire</p><h1>${esc(c.titre||"")}</h1><div class="lead prose">${paras(c.texte)}</div></section>`}
  ${(c.sections||[]).length?`<section class="sec"><div class="wrap">${blocks(c.sections)}</div></section>`:""}
  <section class="wrap"><div class="actions"${aMedia?"":' style="justify-content:center"'}><a class="btn" href="#/creations">Voir les créations</a></div></section>`;
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
    <div><p class="eyebrow">Écrivez-nous</p><h1>${esc(c.titre||"Contact")}</h1><div class="lead prose">${paras(c.texte)}</div>
      <div class="contact-lines">${c.email?`<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`:""}${c.telephone?`<a href="tel:${esc(tel.replace(/^0/,"+33"))}">${esc(c.telephone)}</a>`:""}</div></div>
    <div class="formcard">${form("contact")}</div>
  </section>`;
}
function vLegal(k){const c=C[k]||{};return`${pageHead(c)}<section class="wrap legal">${blocks(c.sections)}</section>`}


/* ---------- devis (lien personnel) ---------- */
const dfr=x=>{if(!x)return"";const[y,m,d]=String(x).slice(0,10).split("-");return d+"/"+m+"/"+y};
const eur2=v=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(Number(v)||0);
async function loadDevis(token){
  main.innerHTML=`<section class="wrap pagehead"><p class="eyebrow">Devis</p><h1>Chargement…</h1></section>`;
  const{data,error}=await sb.rpc("devis_public",{p_token:token});
  if(error||!data){main.innerHTML=`<section class="wrap pagehead"><p class="eyebrow">Devis</p><h1>Ce devis est introuvable</h1><p class="lead">Le lien est peut-être incomplet. Écrivez-nous à <a href="mailto:contact@eugceo.fr">contact@eugceo.fr</a>.</p></section>`;return}
  main.innerHTML=vDevis(data,token);
}
function vDevis(d,token){
  const s=d.societe||{};const lignes=d.lignes||[];const n=v=>Number(String(v??"").replace(",","."))||0;
  const tot=n(d.total)||lignes.reduce((t,l)=>t+n(l.qte||1)*n(l.prix),0)-n(d.remise)+n(d.port);
  const expire=d.statut==="Envoyé"&&d.validite&&d.validite<new Date().toISOString().slice(0,10);
  let action="";
  if(d.statut==="Accepté")action=`<p class="msg">Devis accepté le ${dfr(d.accepteLe)}${d.acceptePar?" par "+esc(String(d.acceptePar).replace(/\.$/,"")):""}. Merci !${d.acomptePaye?` Acompte de ${eur2(d.acomptePaye.montant)} reçu le ${dfr(d.acomptePaye.le)} : votre création est lancée.`:n(d.acompte)?"":" Nous revenons vers vous très vite pour la suite."}</p>${!d.acomptePaye&&n(d.acompte)?`<div class="actions" style="margin-top:20px"><button type="button" class="btn" data-payer-acompte="${esc(token)}">Payer l'acompte · ${eur2(d.acompte)}</button></div><p class="note-s">Paiement sécurisé par carte bancaire, Apple Pay ou Google Pay.</p><div data-out-ac aria-live="polite"></div>`:""}`;
  else if(d.statut==="Refusé"||d.statut==="Annulé")action=`<p class="msg">Ce devis n'est plus valable. Écrivez-nous si vous souhaitez un nouveau devis.</p>`;
  else if(expire)action=`<p class="msg">Ce devis a expiré le ${dfr(d.validite)}. Écrivez-nous pour en recevoir un nouveau.</p>`;
  else action=`<form class="form" id="dvAccept" data-token="${esc(token)}" novalidate style="max-width:560px">
    <div class="fld full"><label for="f_dvnom">Votre nom et prénom</label><input id="f_dvnom" name="nom" maxlength="120" autocomplete="name" value="${esc(d.client||"")}"></div>
    <label class="consent full"><input type="checkbox" name="ok"><span>J'ai lu ce devis et je l'accepte (bon pour accord)${n(d.acompte)?`, avec un acompte de ${eur2(d.acompte)} à verser`:""}. J'ai pris connaissance des <a href="#/cgv" target="_blank">conditions générales de vente</a>.</span></label>
    <div class="full"><button class="btn" type="submit">J'accepte le devis</button></div><div class="full" data-out aria-live="polite"></div></form>`;
  return`<section class="wrap pagehead" style="padding-bottom:24px"><p class="eyebrow">Devis ${esc(d.numero||"")}</p><h1>Votre devis</h1><p class="lead">Établi le ${dfr(d.date)} pour ${esc(d.client||"")}, valable jusqu'au ${dfr(d.validite)}.</p></section>
  <section class="wrap"><div class="devis">
    <div class="dv-head"><div><b>${esc(s.denomination||"EUGCEO")}</b><br><span>${esc(s.forme||"")}${s.capital?" au capital de "+eur2(s.capital):""}<br>${esc(s.adresse||"")} ${esc(s.cpVille||"")}<br>SIREN ${esc(s.siren||"")}${s.villeRcs?" · RCS "+esc(s.villeRcs):""}</span></div><div class="r"><b>Devis ${esc(d.numero||"")}</b><br><span>${dfr(d.date)}</span></div></div>
    ${d.objet?`<p><b>Objet :</b> ${esc(d.objet)}</p>`:""}
    <table class="dv-tbl"><thead><tr><th>Désignation</th><th class="r">Qté</th><th class="r">Prix</th><th class="r">Montant</th></tr></thead><tbody>
    ${lignes.map(l=>`<tr><td>${esc(l.libelle)}</td><td class="r">${esc(l.qte||1)}</td><td class="r">${eur2(l.prix)}</td><td class="r">${eur2(n(l.qte||1)*n(l.prix))}</td></tr>`).join("")}
    ${n(d.remise)?`<tr><td>Remise</td><td></td><td></td><td class="r">− ${eur2(d.remise)}</td></tr>`:""}${n(d.port)?`<tr><td>Livraison</td><td></td><td></td><td class="r">${eur2(d.port)}</td></tr>`:""}
    </tbody><tfoot><tr><td colspan="3" class="r"><b>Total</b></td><td class="r"><b>${eur2(tot)}</b></td></tr>${n(d.acompte)?`<tr><td colspan="3" class="r">Acompte à la commande</td><td class="r">${eur2(d.acompte)}</td></tr>`:""}</tfoot></table>
    <div class="dv-foot">${d.delai?`<p>Délai : ${esc(d.delai)}</p>`:""}${d.conditions?`<p>${esc(d.conditions)}</p>`:""}${s.tva==="Oui"?"":"<p>TVA non applicable, article 293 B du CGI.</p>"}</div>
  </div>
  <div style="margin-top:32px">${action}</div>
  ${d.statut==="Envoyé"?`<p class="note-s">Une question avant d'accepter ? <a href="#/contact">Écrivez-nous</a>.</p>`:""}</section>`;
}
async function accepterDevis(f){
  const out=f.querySelector("[data-out]");const nom=f.elements.nom.value.trim();const show=(t,e)=>{out.innerHTML=`<p class="msg${e?" err":""}">${esc(t)}</p>`};
  if(nom.length<2)return show("Indiquez votre nom et prénom.",1);
  if(!f.elements.ok.checked)return show("Cochez la case pour confirmer votre accord.",1);
  const btn=f.querySelector("button");btn.disabled=true;
  const{data,error}=await sb.rpc("accepter_devis",{p_token:f.dataset.token,p_nom:nom});btn.disabled=false;
  if(error)return show("L'envoi n'a pas fonctionné. Réessayez dans un instant.",1);
  if(data==="ok"||data==="deja")return loadDevis(f.dataset.token);
  show(data==="expire"?"Ce devis a expiré. Écrivez-nous pour en recevoir un nouveau.":"Ce devis ne peut plus être accepté. Écrivez-nous.",1);
}

/* ---------- panier ---------- */
let mem=null;
function cartGet(){const c=store.get("eug_panier");return Array.isArray(c)?c:(mem||[])}
function cartSet(c){mem=c;store.set("eug_panier",c);cartBadge()}
function cartCount(){return cartGet().reduce((t,x)=>t+(x.qte||1),0)}
function cartBadge(){const n=cartCount();document.querySelectorAll("[data-cart-count]").forEach(e=>{e.textContent=n?"("+n+")":"";})}
function cartAdd(id){const c=cartGet();const p=P.find(x=>x.id===id);if(!p)return;const it=c.find(x=>x.id===id);const max=dispo(p)?Math.max(1,Number(p.disponible)||1):1;
  if(it){if(it.qte<max)it.qte++}else c.push({id,qte:1});cartSet(c);location.hash="#/panier"}
function lignePanier(it){const p=P.find(x=>x.id===it.id);if(!p)return null;const pr=prix(p);if(pr==null)return null;const st=dispo(p)&&Number(p.disponible)>=it.qte;
  const pct=Number(B.acomptePct)||40;const ac=Math.round(pr*pct)/100;return{p,qte:it.qte,prix:pr,stock:st,maintenant:st?pr*it.qte:ac*it.qte,ac}}
function vPanier(){
  const c=cartGet();const L=c.map(lignePanier).filter(Boolean);
  if(L.length!==c.length)cartSet(c.filter(it=>L.some(l=>l.p.id===it.id)));
  if(!L.length)return`<section class="wrap pagehead"><p class="eyebrow">Panier</p><h1>Votre panier est vide</h1><div class="actions" style="margin-top:28px"><a class="btn" href="#/creations">Voir les créations</a></div></section>`;
  const liv=store.get("eug_liv")||"fr";const port=liv==="fr"?Number(B.livraisonFR):liv==="dom"?Number(B.livraisonDOM):0;
  const sous=L.reduce((t,l)=>t+l.maintenant,0);const pct=Number(B.acomptePct)||40;const hasCmd=L.some(l=>!l.stock);
  const reste=L.filter(l=>!l.stock).reduce((t,l)=>t+(l.prix-l.ac)*l.qte,0);
  return`<section class="wrap pagehead" style="padding-bottom:24px"><p class="eyebrow">Panier</p><h1>Votre commande</h1></section>
  <section class="wrap"><div class="cart">
    ${L.map(l=>{const ph=photos(l.p)[0];return`<div class="cart-row">
      <a class="cart-pic" href="#/creation/${encodeURIComponent(l.p.id)}">${ph?`<img src="${esc(media(ph))}" alt="">`:`<div class="ph" style="aspect-ratio:auto;height:100%"></div>`}</a>
      <div class="cart-info"><a href="#/creation/${encodeURIComponent(l.p.id)}"><b>${esc(titre(l.p))}</b></a>
        <span>${l.stock?"Disponible · expédiée sous 48 h":`Sur commande · 15 à 30 jours · acompte de ${pct} % aujourd'hui, solde de ${eur2(l.prix-l.ac)} avant l'expédition`}</span>
        <span class="cart-qty">${l.stock&&Number(l.p.disponible)>1?`<button type="button" data-cq="-1" data-id="${esc(l.p.id)}" aria-label="Moins">−</button><b>${l.qte}</b><button type="button" data-cq="1" data-id="${esc(l.p.id)}" aria-label="Plus">+</button>`:`Quantité : ${l.qte}`} · <button type="button" class="lnk" data-crm="${esc(l.p.id)}">Retirer</button></span></div>
      <div class="cart-price">${l.stock?eur2(l.maintenant):`<span class="muted">${eur2(l.prix*l.qte)}</span><br>${eur2(l.maintenant)} aujourd'hui`}</div></div>`}).join("")}
  </div>
  <form class="form" id="cartForm" novalidate style="margin-top:40px;max-width:none">
    <div class="fld full"><label for="f_liv">Livraison</label><select id="f_liv" name="livraison">
      <option value="fr"${liv==="fr"?" selected":""}>France métropolitaine · ${eur2(B.livraisonFR)}</option>
      <option value="dom"${liv==="dom"?" selected":""}>Outre-mer (Guadeloupe, Martinique, Guyane, La Réunion, Mayotte) · ${eur2(B.livraisonDOM)}</option>
      <option value="retrait"${liv==="retrait"?" selected":""}>Retrait sur rendez-vous à Rennes · gratuit</option></select></div>
    ${liv==="retrait"?`<p class="note-s full" style="margin:-6px 0 0;color:#9b7c2e">Retrait en main propre uniquement, sur rendez-vous à Rennes : rien ne vous sera envoyé par la poste. Pour être livrée, choisissez une livraison ci-dessus.</p>`:""}
    ${field("nom","Nom et prénom","text",{req:1,ac:"name"})}${field("email","E-mail","email",{req:1,ac:"email"})}
    ${field("telephone","Téléphone","tel",{ac:"tel",max:30})}
    <div class="full promo"><button type="button" class="promo-q" data-promo-toggle aria-expanded="false">Vous avez un code promotionnel ?</button>
      <div class="promo-box" data-promo hidden><div class="fld"><label for="f_code">Code promotionnel</label><input id="f_code" name="code" autocomplete="off" autocapitalize="characters" maxlength="20" style="text-transform:uppercase" placeholder="Votre code"></div>
      <div data-code-out aria-live="polite"></div></div></div>
    <div class="cart-total full">
      <div><span>Créations</span><b>${eur2(sous)}</b></div>
      <div data-remise hidden><span data-remise-l>Parrainage</span><b data-remise-v></b></div>
      <div><span>Livraison</span><b>${port?eur2(port):"gratuite"}</b></div>
      <div class="big"><span>À payer aujourd'hui</span><b data-apayer>${eur2(sous+port)}</b></div>
      ${hasCmd?`<p class="note-s" style="margin:0">Reste à payer avant l'expédition des créations sur commande : <span data-reste>${eur2(reste)}</span>. Nous vous enverrons un lien de paiement.</p>`:""}
    </div>
    <label class="consent full"><input type="checkbox" name="cgv"><span>J'ai lu et j'accepte les <a href="#/cgv" target="_blank">conditions générales de vente</a>, notamment le délai et les conditions de rétractation.</span></label>
    <div class="full"><button class="btn" type="submit" data-payer>Payer ${eur2(sous+port)}</button></div>
    <p class="note-s full" style="margin:0">Paiement sécurisé par carte bancaire, Apple Pay ou Google Pay. Les pièces disponibles sont réservées pour vous pendant le paiement.</p>
    <div class="full" data-out aria-live="polite"></div>
  </form></section>`;
}
async function payer(f){
  const out=f.querySelector("[data-out]");const show=(t,e)=>{out.innerHTML=`<p class="msg${e?" err":""}">${esc(t)}</p>`};
  const v=n=>String(f.elements[n]?f.elements[n].value:"").trim();
  if(v("nom").length<2)return show("Indiquez votre nom et prénom.",1);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email")))return show("Indiquez une adresse e-mail valide : votre confirmation y sera envoyée.",1);
  if(!f.elements.cgv.checked)return show("Cochez la case pour accepter les conditions générales de vente.",1);
  const btn=f.querySelector("button[type=submit]");btn.disabled=true;show("Redirection vers le paiement sécurisé…");
  try{
    const{data,error}=await sb.functions.invoke("paiement-creer",{body:{type:"commande",apercu:AP||"",items:cartGet(),livraison:v("livraison"),client:{nom:v("nom"),email:v("email"),telephone:v("telephone")},code:v("code").toUpperCase(),cagnotte:!!(f.elements.cagnotte&&f.elements.cagnotte.checked),cgv:true}});
    let d=data;if(error){try{d=await error.context.json()}catch(_){d={}}}
    if(d&&d.url){store.set("eug_client",{nom:v("nom"),email:v("email"),telephone:v("telephone")});location.href=d.url;return}
    btn.disabled=false;
    if(d&&d.error==="ferme")return show("La boutique en ligne n'est pas encore ouverte.",1);
    const CE={code_inconnu:"Ce code n'existe pas. Vérifiez-le ou laissez la case vide.",code_perso:"C'est votre propre code : il est fait pour les personnes que vous recommandez. Vous pouvez en revanche utiliser votre cagnotte (case à cocher).",code_deja:"Un code d'ambassadrice ne s'utilise qu'une fois par cliente, et vous en avez déjà profité.",cagnotte_plancher:"Votre cagnotte ne peut pas s'appliquer à cette commande. Écrivez-nous, nous trouverons une solution.",code_min:"Ce code s'applique à partir de "+eur2(d&&d.min||150)+" d'achat.",cagnotte_autre:"La cagnotte ne peut être utilisée que par la titulaire du code (même e-mail ou même téléphone).",cagnotte_vide:"Votre cagnotte est vide pour l'instant.",offert:"Votre cagnotte couvre toute la commande : écrivez-nous, nous préparons votre création offerte avec vous."};
    if(d&&CE[d.error])return show(CE[d.error],1);
    if(d&&d.error==="non_configure")return show("Le paiement en ligne n'est pas encore ouvert. Écrivez-nous depuis la fiche de la création (« Une question ? ») : nous vous recontactons pour la commande.",1);
    if(d&&d.error==="indisponible"){await load();render(true);return show("Une création de votre panier vient d'être réservée par une autre cliente. Vérifiez votre panier.",1)}
    show("Le paiement n'a pas pu démarrer. Réessayez dans un instant ou écrivez-nous.",1);
  }catch(_){btn.disabled=false;show("Le paiement n'a pas pu démarrer. Réessayez dans un instant.",1)}
}
/* code de parrainage dans le panier */
let codeEtat=null,codeT=null,codeFete=null;
/* quelques confettis dorés, discrets, quand un code fonctionne */
function confettis(el){
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const box=document.createElement("div");box.className="confettis";box.setAttribute("aria-hidden","true");
  const tons=["#C4A046","#D9BC6A","#A8883A","#E8D9A8"];
  for(let i=0;i<26;i++){const c=document.createElement("i");const x=(Math.random()*2-1)*140,y=-(40+Math.random()*70),r=Math.random()*540-270;
    c.style.cssText=`--x:${x}px;--y:${y}px;--r:${r}deg;background:${tons[i%4]};left:${30+Math.random()*40}%;animation-delay:${Math.random()*.12}s;width:${4+Math.random()*4}px;height:${2+Math.random()*3}px`;box.appendChild(c)}
  el.style.position="relative";el.appendChild(box);setTimeout(()=>box.remove(),1900);
}
function estBundle(p){return/^Bundle/.test(p&&p.construction||"")}
function totauxPanier(f){
  const L=cartGet().map(lignePanier).filter(Boolean);const liv=store.get("eug_liv")||"fr";const port=liv==="fr"?Number(B.livraisonFR):liv==="dom"?Number(B.livraisonDOM):0;
  const pct=Number(B.acomptePct)||40;const brut=L.reduce((t,l)=>t+l.prix*l.qte,0);const r=x=>Math.round(x*100)/100;
  let rate=0,lib="";const e=codeEtat;const cag=f.elements.cagnotte&&f.elements.cagnotte.checked;
  if(e&&e.valide&&!e.proprio&&!e.deja&&brut>=Number(e.min)){rate=Number(e.remise)/100;lib="Code "+e.code+" −"+e.remise+" %"}
  if(e&&e.valide&&e.proprio&&cag&&Number(e.solde)>0){rate=Math.min(Number(e.solde),brut)/brut;lib="Votre cagnotte"}
  /* remise par lot de bundles : un seul avantage, on garde le plus intéressant */
  const nbB=L.reduce((t,l)=>t+(estBundle(l.p)?l.qte:0),0);const lotT=Number(B.lotTaille)||3;const lotTot=Number(B.lotRemise)>0?Math.floor(nbB/lotT)*Number(B.lotRemise):0;
  const remL=L.map(l=>rate?l.prix*l.qte*rate:0);
  if(lotTot>0&&lotTot>remL.reduce((a,x)=>a+x,0)){L.forEach((l,i)=>remL[i]=estBundle(l.p)?lotTot*l.qte/nbB:0);lib="Lot de "+lotT+" bundles";if(e&&e.valide&&!e.proprio)lib+=" (plus avantageux que le code)"}
  const plein=L.reduce((t,l)=>t+l.maintenant,0);
  const net=L.reduce((t,l,i)=>{const pu=r(l.prix-remL[i]/l.qte);return t+(l.stock?pu:r(pu*pct/100))*l.qte},0);
  rate=remL.some(x=>x>0)?1:0;
  const rr=f.querySelector("[data-remise]");rr.hidden=!rate;f.querySelector("[data-remise-l]").textContent=lib;f.querySelector("[data-remise-v]").textContent="− "+eur2(plein-net);
  const rs=f.querySelector("[data-reste]");if(rs)rs.textContent=eur2(L.reduce((t,l,i)=>{if(l.stock)return t;const pu=r(l.prix-remL[i]/l.qte);return t+(pu-r(pu*pct/100))*l.qte},0));
  f.querySelector("[data-apayer]").textContent=eur2(net+port);f.querySelector("[data-payer]").textContent="Payer "+eur2(net+port);
}
async function verifCode(f){
  const out=f.querySelector("[data-code-out]");const code=String(f.elements.code.value||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  const keepCag=f.elements.cagnotte&&f.elements.cagnotte.checked;
  if(!code){codeEtat=null;out.innerHTML="";totauxPanier(f);return}
  let e=null;try{const{data}=await sb.rpc("code_verifier",{p_code:code,p_email:f.elements.email.value.trim(),p_nom:f.elements.nom.value.trim(),p_tel:f.elements.telephone.value.trim()});e=data}catch(_){}
  if(String(f.elements.code.value||"").toUpperCase().replace(/[^A-Z0-9]/g,"")!==code)return;
  codeEtat=e;const brut=cartGet().map(lignePanier).filter(Boolean).reduce((t,l)=>t+l.prix*l.qte,0);
  if(!e)out.innerHTML="";
  else if(!e.valide)out.innerHTML=`<p class="msg err">Aucune offre ne correspond à ce code.</p>`;
  else if(e.proprio)out.innerHTML=Number(e.solde)>0?`<label class="consent"><input type="checkbox" name="cagnotte"${keepCag?" checked":""}><span>C'est votre code. Utiliser votre cagnotte de <b>${eur2(e.solde)}</b> sur cette commande. Le montant exact est calculé au paiement ; ce qui n'est pas utilisé est gardé pour la prochaine fois.</span></label>`:`<p class="msg">C'est votre code : il est fait pour les personnes que vous recommandez. Votre cagnotte est vide pour l'instant.</p>`;
  else if(e.deja)out.innerHTML=`<p class="msg err">Ce code ne s'utilise qu'une fois par cliente, et vous en avez déjà profité.</p>`;
  else if(brut>=Number(e.min)){out.innerHTML=`<p class="promo-ok"><span>Code ${esc(e.code)} appliqué</span><b>−${e.remise} % sur vos créations</b></p>`;if(codeFete!==e.code){codeFete=e.code;confettis(out)}}
  else out.innerHTML=`<p class="msg err">Ce code s'applique à partir de ${eur2(e.min)} d'achat.</p>`;
  if(!(e&&e.valide&&!e.proprio&&!e.deja&&brut>=Number(e.min)))codeFete=null;
  totauxPanier(f);
}
function vMerci(q){
  const solde=/solde=1/.test(q||"");if(!solde)cartSet([]);
  return`<section class="wrap pagehead"><p class="eyebrow">Merci</p><h1>${solde?"Solde reçu":"Votre commande est confirmée"}</h1>
  <div class="lead prose"><p>${solde?"Merci, votre paiement est bien reçu. Votre création part très vite : nous vous envoyons le suivi dès l'expédition.":"Merci pour votre confiance. Votre paiement est bien reçu et un e-mail de confirmation vient de partir. Nous préparons votre création et revenons vers vous très vite."}</p></div>
  <div class="actions" style="margin-top:28px"><a class="btn" href="#/creations">Continuer la visite</a></div></section>`;
}
async function payerAcompte(b){
  b.disabled=true;const out=document.querySelector("[data-out-ac]");
  const{data,error}=await sb.functions.invoke("paiement-creer",{body:{type:"devis",token:b.dataset.payerAcompte}});
  let d=data;if(error){try{d=await error.context.json()}catch(_){d={}}}
  if(d&&d.url){location.href=d.url;return}
  b.disabled=false;if(out)out.innerHTML=`<p class="msg err">${d&&d.error==="non_configure"?"Le paiement en ligne n'est pas encore ouvert : nous vous contactons pour régler l'acompte.":d&&d.error==="deja"?"Cet acompte est déjà payé.":"Le paiement n'a pas pu démarrer. Réessayez dans un instant."}</p>`;
}
const ROUTES={"":vAccueil,creations:vCreations,prestations:vPrestations,rendezvous:vRdv,maison:vMaison,entretien:vEntretien,contact:vContact,legal:()=>vLegal("legal"),cgv:()=>vLegal("cgv"),panier:vPanier,confidentialite:()=>vLegal("confidentialite")};
const TITLES={panier:"Panier",merci:"Merci",cgv:"Conditions générales de vente",creations:"Créations",prestations:"Prestations",rendezvous:"Rendez-vous",maison:"La Maison",entretien:"Entretien",contact:"Contact",legal:"Mentions légales",confidentialite:"Confidentialité"};
let lastRoute=null;
function render(keepScroll){
  const full=decodeURIComponent(location.hash.replace(/^#\/?/,""));const q=full.includes("?")?full.slice(full.indexOf("?")+1):"";const h=full.split("?")[0];const [r,arg]=h.split("/");
  if(r==="reserver")return;
  document.title=TITLES[r]?TITLES[r]+" · EUGCEO":"EUGCEO · Maison de créations capillaires";
  const att=ferme()&&!OUVERT_TJ.includes(r);
  document.body.classList.toggle("attente",ferme());
  document.body.classList.toggle("apercu",apOk&&!!(C.attente&&C.attente.ouvert===false));
  if(att){document.title="EUGCEO · Bientôt";main.innerHTML=vAttente();document.body.dataset.r="attente";lastRoute="attente";footer();return}
  if(r==="devis"){document.title="Votre devis · EUGCEO";if(lastRoute!=="devis/"+arg){lastRoute="devis/"+arg;window.scrollTo(0,0);loadDevis(arg||"")}footer();return}
  main.innerHTML=r==="creation"?vCreation(arg):r==="merci"?vMerci(q):(ROUTES[r]||vAccueil)();
  if(r==="panier"){codeEtat=null;const g=document.getElementById("cartForm");if(g)totauxPanier(g)}
  document.body.dataset.r=(r==="creation"||ROUTES[r]||r==="merci")?(r||"accueil"):"accueil";armer();
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
function menu(open){nav.classList.toggle("open",open);document.body.classList.toggle("menu-ouvert",open);const tx=burger.querySelector(".txt");if(tx)tx.textContent=open?"Fermer":"Menu";burger.setAttribute("aria-expanded",String(open));burger.setAttribute("aria-label",open?"Fermer le menu":"Ouvrir le menu");document.body.style.overflow=open?"hidden":""}
burger.addEventListener("click",()=>menu(!nav.classList.contains("open")));
nav.addEventListener("click",e=>{if(e.target.closest("a"))menu(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&nav.classList.contains("open")){menu(false);burger.focus()}});
const voile=$("#voile");let enCours=null;
const calme=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
window.addEventListener("hashchange",()=>{
  const r=location.hash.replace(/^#\/?/,"").split(/[/?]/)[0];
  if(r==="reserver"||calme()||!voile){render();return}
  clearTimeout(enCours);voile.className="voile monte";
  enCours=setTimeout(()=>{render();voile.className="voile part";enCours=setTimeout(()=>{voile.className="voile"},720)},520);
});
/* apparitions au défilement */
const obs="IntersectionObserver" in window?new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("vu");obs.unobserve(en.target)}}),{rootMargin:"0px 0px -8% 0px"}):null;
function armer(){document.documentElement.classList.add("js");main.querySelectorAll(".rv").forEach(el=>{if(!obs||el.getBoundingClientRect().top<innerHeight*.95)el.classList.add("vu");else obs.observe(el)})}
/* rangée de créations : glisser à la souris */
let tire=null;
document.addEventListener("pointerdown",e=>{const p=e.target.closest(".piste");if(!p||e.pointerType!=="mouse")return;tire={p,x:e.clientX,s:p.scrollLeft,m:false};p.classList.add("tire")});
addEventListener("pointermove",e=>{if(!tire)return;const d=e.clientX-tire.x;if(Math.abs(d)>4)tire.m=true;tire.p.scrollLeft=tire.s-d});
addEventListener("pointerup",()=>{if(!tire)return;tire.p.classList.remove("tire");const m=tire.m;setTimeout(()=>{tire=null},0)});
document.addEventListener("click",e=>{if(tire&&tire.m&&e.target.closest(".piste")){e.preventDefault();e.stopPropagation()}},true);
/* ouverture */
(function(){const it=$("#intro");if(!it)return;let vu=false;try{vu=sessionStorage.getItem("eug_intro")==="1";sessionStorage.setItem("eug_intro","1")}catch(_){}
  if(vu||calme()){it.remove();return}setTimeout(()=>it.classList.add("fini"),2800);setTimeout(()=>it.remove(),3800)})();
window.addEventListener("scroll",()=>$("#hd").classList.toggle("scrolled",scrollY>40),{passive:true});
document.addEventListener("click",e=>{
  const ad=e.target.closest("[data-add]");if(ad){cartAdd(ad.dataset.add);return}
  const cq=e.target.closest("[data-cq]");if(cq){const c=cartGet();const it=c.find(x=>x.id===cq.dataset.id);const p=P.find(x=>x.id===cq.dataset.id);if(it&&p){it.qte=Math.max(1,Math.min(Number(p.disponible)||1,it.qte+Number(cq.dataset.cq)))}cartSet(c);render(true);return}
  const cr=e.target.closest("[data-crm]");if(cr){cartSet(cartGet().filter(x=>x.id!==cr.dataset.crm));render(true);return}
  const pa=e.target.closest("[data-payer-acompte]");if(pa){payerAcompte(pa);return}
  const pt=e.target.closest("[data-promo-toggle]");if(pt){const bx=pt.parentNode.querySelector("[data-promo]");const o=bx.hidden;bx.hidden=!o;pt.setAttribute("aria-expanded",String(o));if(o){const i=bx.querySelector("input");if(i)i.focus()}return}
  const f=e.target.closest("[data-f]");if(f){filtre=f.dataset.f;render(true);return}
  const g=e.target.closest("[data-g]");
  if(g){const h=decodeURIComponent(location.hash.replace(/^#\/?/,"")).split("/");const p=P.find(x=>x.id===h[1]);if(!p)return;
    const s=p.site||{};const items=photos(p).concat(s.video?[s.video]:[]);const it=items[Number(g.dataset.g)];
    $("#galMain").innerHTML=isVid(it)?`<video src="${esc(media(it))}" controls autoplay playsinline muted></video>`:`<img src="${esc(media(it))}" alt="${esc(titre(p))}">`;
    document.querySelectorAll(".gal-thumbs button").forEach(b=>b.setAttribute("aria-current",String(b===g)));return}
  const sc=e.target.closest("[data-scroll]");if(sc){e.preventDefault();const t=document.getElementById(sc.dataset.scroll);if(t){t.scrollIntoView({behavior:"smooth"});const i=t.querySelector("input");if(i)setTimeout(()=>i.focus({preventScroll:true}),500)}}
});
document.addEventListener("submit",e=>{const f=e.target.closest("form[data-kind]");if(f){e.preventDefault();submit(f);return}
  const g=e.target.closest("#dvAccept");if(g){e.preventDefault();accepterDevis(g);return}
  const af=e.target.closest("#attForm");if(af){e.preventDefault();inscrire(af);return}
  const cf=e.target.closest("#cartForm");if(cf){e.preventDefault();payer(cf)}});
document.addEventListener("change",e=>{if(e.target.id==="f_liv"){store.set("eug_liv",e.target.value);const f=e.target.closest("form");const keep={};["nom","email","telephone","code"].forEach(k=>keep[k]=f.elements[k].value);const cg=!!(f.elements.cagnotte&&f.elements.cagnotte.checked);render(true);const g=document.getElementById("cartForm");if(g){["nom","email","telephone","code"].forEach(k=>g.elements[k].value=keep[k]);if(keep.code){const bx=g.querySelector("[data-promo]");if(bx)bx.hidden=false}if(keep.code)verifCode(g).then(()=>{if(cg&&g.elements.cagnotte){g.elements.cagnotte.checked=true;totauxPanier(g)}})}}
  if(e.target.name==="cagnotte"&&e.target.closest("#cartForm"))totauxPanier(e.target.closest("#cartForm"))});
document.addEventListener("input",e=>{const f=e.target.closest("#cartForm");if(f&&["code","email","nom","telephone"].includes(e.target.name)&&(e.target.name==="code"||f.elements.code.value)){clearTimeout(codeT);codeT=setTimeout(()=>verifCode(f),450)}});

cartBadge();
if(store.get("eug_contenu"))render();
load().then(()=>{if(!document.activeElement||!document.activeElement.closest("form"))render(true)});
})();
