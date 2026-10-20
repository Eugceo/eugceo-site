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
let B={livraisonFR:12.99,livraisonDOM:16.99,acomptePct:40};

async function load(){
  const [a,b,c]=await Promise.allSettled([sb.from("site_contenu").select("id,data"),sb.rpc("catalogue_public"),sb.rpc("reglages_boutique")]);
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
      <span class="tag${dispo(p)?" ok":""}" style="align-self:flex-start">${dispo(p)?"Disponible · expédiée sous 48 h":"Sur commande · 15 à 30 jours"}</span>
      <h1 style="font-size:clamp(34px,4.4vw,52px)">${esc(t)}</h1>
      <p class="price">${pr!=null?eur(pr):"Prix sur demande"}</p>
      ${s.description?`<div class="prose" style="color:var(--muted)">${paras(s.description)}</div>`:""}
      ${specs.length?`<dl class="specs">${specs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`:""}
      <div class="actions">${pr!=null?`<button type="button" class="btn" data-add="${esc(p.id)}">${dispo(p)?"Ajouter au panier":`Commander · acompte ${Number(B.acomptePct)||40} %`}</button><a class="btn ghost" href="#reserver" data-scroll="reserver">Une question ?</a>`:`<a class="btn" href="#reserver" data-scroll="reserver">${dispo(p)?"Réserver cette création":"La commander"}</a>`}</div>
      ${pr!=null&&!dispo(p)?`<p class="note-s" style="margin:0">Sur commande : ${Number(B.acomptePct)||40} % à la commande (${eur2(pr*(Number(B.acomptePct)||40)/100)}), le solde avant l'expédition.</p>`:""}
      ${notes.length?`<div class="notes">${notes.map(n=>`<p><b>${esc(n.titre)}</b>${esc(n.texte)}</p>`).join("")}</div>`:""}
    </div>
  </section>
  <section class="sec" id="reserver"><div class="formcard">
    <h3>${pr!=null?"Une question sur cette création ?":dispo(p)?"Réserver cette création":"Commander cette création"}</h3>
    <p>${pr!=null?"Écris-nous : taille de bonnet, rendu, délai… Nous te répondons sous 48 heures ouvrées.":"Laisse-nous tes coordonnées : nous te recontactons sous 48 heures ouvrées pour confirmer, répondre à tes questions et organiser le paiement et l'envoi. Rien n'est débité à cette étape."}</p>
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


/* ---------- devis (lien personnel) ---------- */
const dfr=x=>{if(!x)return"";const[y,m,d]=String(x).slice(0,10).split("-");return d+"/"+m+"/"+y};
const eur2=v=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(Number(v)||0);
async function loadDevis(token){
  main.innerHTML=`<section class="wrap pagehead"><p class="eyebrow">Devis</p><h1>Chargement…</h1></section>`;
  const{data,error}=await sb.rpc("devis_public",{p_token:token});
  if(error||!data){main.innerHTML=`<section class="wrap pagehead"><p class="eyebrow">Devis</p><h1>Ce devis est introuvable</h1><p class="lead">Le lien est peut-être incomplet. Écris-nous à <a href="mailto:contact@eugceo.fr">contact@eugceo.fr</a>.</p></section>`;return}
  main.innerHTML=vDevis(data,token);
}
function vDevis(d,token){
  const s=d.societe||{};const lignes=d.lignes||[];const n=v=>Number(String(v??"").replace(",","."))||0;
  const tot=n(d.total)||lignes.reduce((t,l)=>t+n(l.qte||1)*n(l.prix),0)-n(d.remise)+n(d.port);
  const expire=d.statut==="Envoyé"&&d.validite&&d.validite<new Date().toISOString().slice(0,10);
  let action="";
  if(d.statut==="Accepté")action=`<p class="msg">Devis accepté le ${dfr(d.accepteLe)}${d.acceptePar?" par "+esc(String(d.acceptePar).replace(/\.$/,"")):""}. Merci !${d.acomptePaye?` Acompte de ${eur2(d.acomptePaye.montant)} reçu le ${dfr(d.acomptePaye.le)} : ta création est lancée.`:n(d.acompte)?"":" Nous revenons vers toi très vite pour la suite."}</p>${!d.acomptePaye&&n(d.acompte)?`<div class="actions" style="margin-top:20px"><button type="button" class="btn" data-payer-acompte="${esc(token)}">Payer l'acompte · ${eur2(d.acompte)}</button></div><p class="note-s">Paiement sécurisé par carte bancaire, Apple Pay ou Google Pay.</p><div data-out-ac aria-live="polite"></div>`:""}`;
  else if(d.statut==="Refusé"||d.statut==="Annulé")action=`<p class="msg">Ce devis n'est plus valable. Écris-nous si tu souhaites un nouveau devis.</p>`;
  else if(expire)action=`<p class="msg">Ce devis a expiré le ${dfr(d.validite)}. Écris-nous pour en recevoir un nouveau.</p>`;
  else action=`<form class="form" id="dvAccept" data-token="${esc(token)}" novalidate style="max-width:560px">
    <div class="fld full"><label for="f_dvnom">Ton nom et prénom</label><input id="f_dvnom" name="nom" maxlength="120" autocomplete="name" value="${esc(d.client||"")}"></div>
    <label class="consent full"><input type="checkbox" name="ok"><span>J'ai lu ce devis et je l'accepte (bon pour accord)${n(d.acompte)?`, avec un acompte de ${eur2(d.acompte)} à verser`:""}. J'ai pris connaissance des <a href="#/cgv" target="_blank">conditions générales de vente</a>.</span></label>
    <div class="full"><button class="btn" type="submit">J'accepte le devis</button></div><div class="full" data-out aria-live="polite"></div></form>`;
  return`<section class="wrap pagehead" style="padding-bottom:24px"><p class="eyebrow">Devis ${esc(d.numero||"")}</p><h1>Ton devis</h1><p class="lead">Établi le ${dfr(d.date)} pour ${esc(d.client||"")}, valable jusqu'au ${dfr(d.validite)}.</p></section>
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
  ${d.statut==="Envoyé"?`<p class="note-s">Une question avant d'accepter ? <a href="#/contact">Écris-nous</a>.</p>`:""}</section>`;
}
async function accepterDevis(f){
  const out=f.querySelector("[data-out]");const nom=f.elements.nom.value.trim();const show=(t,e)=>{out.innerHTML=`<p class="msg${e?" err":""}">${esc(t)}</p>`};
  if(nom.length<2)return show("Indique ton nom et prénom.",1);
  if(!f.elements.ok.checked)return show("Coche la case pour confirmer ton accord.",1);
  const btn=f.querySelector("button");btn.disabled=true;
  const{data,error}=await sb.rpc("accepter_devis",{p_token:f.dataset.token,p_nom:nom});btn.disabled=false;
  if(error)return show("L'envoi n'a pas fonctionné. Réessaie dans un instant.",1);
  if(data==="ok"||data==="deja")return loadDevis(f.dataset.token);
  show(data==="expire"?"Ce devis a expiré. Écris-nous pour en recevoir un nouveau.":"Ce devis ne peut plus être accepté. Écris-nous.",1);
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
  if(!L.length)return`<section class="wrap pagehead"><p class="eyebrow">Panier</p><h1>Ton panier est vide</h1><div class="actions" style="margin-top:28px"><a class="btn" href="#/creations">Voir les créations</a></div></section>`;
  const liv=store.get("eug_liv")||"fr";const port=liv==="fr"?Number(B.livraisonFR):liv==="dom"?Number(B.livraisonDOM):0;
  const sous=L.reduce((t,l)=>t+l.maintenant,0);const pct=Number(B.acomptePct)||40;const hasCmd=L.some(l=>!l.stock);
  const reste=L.filter(l=>!l.stock).reduce((t,l)=>t+(l.prix-l.ac)*l.qte,0);
  return`<section class="wrap pagehead" style="padding-bottom:24px"><p class="eyebrow">Panier</p><h1>Ta commande</h1></section>
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
      <option value="retrait"${liv==="retrait"?" selected":""}>Retrait sur rendez-vous à Paris · gratuit</option></select></div>
    ${field("nom","Nom et prénom","text",{req:1,ac:"name"})}${field("email","E-mail","email",{req:1,ac:"email"})}
    ${field("telephone","Téléphone","tel",{ac:"tel",max:30})}
    <div class="cart-total full">
      <div><span>Créations</span><b>${eur2(sous)}</b></div>
      <div><span>Livraison</span><b>${port?eur2(port):"gratuite"}</b></div>
      <div class="big"><span>À payer aujourd'hui</span><b>${eur2(sous+port)}</b></div>
      ${hasCmd?`<p class="note-s" style="margin:0">Reste à payer avant l'expédition des créations sur commande : ${eur2(reste)}. Nous t'enverrons un lien de paiement.</p>`:""}
    </div>
    <label class="consent full"><input type="checkbox" name="cgv"><span>J'ai lu et j'accepte les <a href="#/cgv" target="_blank">conditions générales de vente</a>, notamment le délai et les conditions de rétractation.</span></label>
    <div class="full"><button class="btn" type="submit">Payer ${eur2(sous+port)}</button></div>
    <p class="note-s full" style="margin:0">Paiement sécurisé par carte bancaire, Apple Pay ou Google Pay. Les pièces disponibles sont réservées pour toi pendant le paiement.</p>
    <div class="full" data-out aria-live="polite"></div>
  </form></section>`;
}
async function payer(f){
  const out=f.querySelector("[data-out]");const show=(t,e)=>{out.innerHTML=`<p class="msg${e?" err":""}">${esc(t)}</p>`};
  const v=n=>String(f.elements[n]?f.elements[n].value:"").trim();
  if(v("nom").length<2)return show("Indique ton nom et prénom.",1);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email")))return show("Indique une adresse e-mail valide : ta confirmation y sera envoyée.",1);
  if(!f.elements.cgv.checked)return show("Coche la case pour accepter les conditions générales de vente.",1);
  const btn=f.querySelector("button[type=submit]");btn.disabled=true;show("Redirection vers le paiement sécurisé…");
  try{
    const{data,error}=await sb.functions.invoke("paiement-creer",{body:{type:"commande",items:cartGet(),livraison:v("livraison"),client:{nom:v("nom"),email:v("email"),telephone:v("telephone")},cgv:true}});
    let d=data;if(error){try{d=await error.context.json()}catch(_){d={}}}
    if(d&&d.url){store.set("eug_client",{nom:v("nom"),email:v("email"),telephone:v("telephone")});location.href=d.url;return}
    btn.disabled=false;
    if(d&&d.error==="non_configure")return show("Le paiement en ligne n'est pas encore ouvert. Écris-nous depuis la fiche de la création (« Une question ? ») : nous te recontactons pour la commande.",1);
    if(d&&d.error==="indisponible"){await load();render(true);return show("Une création de ton panier vient d'être réservée par une autre cliente. Vérifie ton panier.",1)}
    show("Le paiement n'a pas pu démarrer. Réessaie dans un instant ou écris-nous.",1);
  }catch(_){btn.disabled=false;show("Le paiement n'a pas pu démarrer. Réessaie dans un instant.",1)}
}
function vMerci(q){
  const solde=/solde=1/.test(q||"");if(!solde)cartSet([]);
  return`<section class="wrap pagehead"><p class="eyebrow">Merci</p><h1>${solde?"Solde reçu":"Ta commande est confirmée"}</h1>
  <div class="lead prose"><p>${solde?"Merci, ton paiement est bien reçu. Ta création part très vite : nous t'envoyons le suivi dès l'expédition.":"Merci pour ta confiance. Ton paiement est bien reçu et un e-mail de confirmation vient de partir. Nous préparons ta création et revenons vers toi très vite."}</p></div>
  <div class="actions" style="margin-top:28px"><a class="btn" href="#/creations">Continuer la visite</a></div></section>`;
}

async function payerAcompte(b){
  b.disabled=true;const out=document.querySelector("[data-out-ac]");
  const{data,error}=await sb.functions.invoke("paiement-creer",{body:{type:"devis",token:b.dataset.payerAcompte}});
  let d=data;if(error){try{d=await error.context.json()}catch(_){d={}}}
  if(d&&d.url){location.href=d.url;return}
  b.disabled=false;if(out)out.innerHTML=`<p class="msg err">${d&&d.error==="non_configure"?"Le paiement en ligne n'est pas encore ouvert : nous te contactons pour régler l'acompte.":d&&d.error==="deja"?"Cet acompte est déjà payé.":"Le paiement n'a pas pu démarrer. Réessaie dans un instant."}</p>`;
}
const ROUTES={"":vAccueil,creations:vCreations,prestations:vPrestations,rendezvous:vRdv,maison:vMaison,entretien:vEntretien,contact:vContact,legal:()=>vLegal("legal"),cgv:()=>vLegal("cgv"),panier:vPanier,confidentialite:()=>vLegal("confidentialite")};
const TITLES={panier:"Panier",merci:"Merci",cgv:"Conditions générales de vente",creations:"Créations",prestations:"Prestations",rendezvous:"Rendez-vous",maison:"La Maison",entretien:"Entretien",contact:"Contact",legal:"Mentions légales",confidentialite:"Confidentialité"};
let lastRoute=null;
function render(keepScroll){
  const full=decodeURIComponent(location.hash.replace(/^#\/?/,""));const q=full.includes("?")?full.slice(full.indexOf("?")+1):"";const h=full.split("?")[0];const [r,arg]=h.split("/");
  if(r==="reserver")return;
  document.title=TITLES[r]?TITLES[r]+" · EUGCEO":"EUGCEO · Maison de perruques";
  if(r==="devis"){document.title="Ton devis · EUGCEO";if(lastRoute!=="devis/"+arg){lastRoute="devis/"+arg;window.scrollTo(0,0);loadDevis(arg||"")}footer();return}
  main.innerHTML=r==="creation"?vCreation(arg):r==="merci"?vMerci(q):(ROUTES[r]||vAccueil)();
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
  const ad=e.target.closest("[data-add]");if(ad){cartAdd(ad.dataset.add);return}
  const cq=e.target.closest("[data-cq]");if(cq){const c=cartGet();const it=c.find(x=>x.id===cq.dataset.id);const p=P.find(x=>x.id===cq.dataset.id);if(it&&p){it.qte=Math.max(1,Math.min(Number(p.disponible)||1,it.qte+Number(cq.dataset.cq)))}cartSet(c);render(true);return}
  const cr=e.target.closest("[data-crm]");if(cr){cartSet(cartGet().filter(x=>x.id!==cr.dataset.crm));render(true);return}
  const pa=e.target.closest("[data-payer-acompte]");if(pa){payerAcompte(pa);return}
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
  const cf=e.target.closest("#cartForm");if(cf){e.preventDefault();payer(cf)}});
document.addEventListener("change",e=>{if(e.target.id==="f_liv"){store.set("eug_liv",e.target.value);const f=e.target.closest("form");const keep={};["nom","email","telephone"].forEach(k=>keep[k]=f.elements[k].value);render(true);const g=document.getElementById("cartForm");if(g)["nom","email","telephone"].forEach(k=>g.elements[k].value=keep[k])}});

cartBadge();
render();
load().then(()=>{if(!document.activeElement||!document.activeElement.closest("form"))render(true)});
})();
