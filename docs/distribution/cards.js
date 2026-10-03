'use strict';
const BKCards = (() => {
  const categories = {all:'すべて',ai:'AI活用',work:'Excel・仕事術',pc:'PC・スマホ',money:'お金・投資',life:'生活改善',other:'その他'};
  const rules = {ai:/\bAI\b|ChatGPT|Claude|生成AI|プロンプト|GPT-/i,work:/Excel|エクセル|会議|議事録|仕事術|タスク|時短/i,pc:/Windows|Chrome|スマホ|パソコン|iPhone|Android|Acrobat|セキュリティ/i,money:/NISA|投資|株式|ETF|金利|為替|円安|確定申告|リボ払い|家計|米国債|年金/i,life:/防災|片付け|掃除|収納|洗濯|暮らし|節電|持ち物/i};
  function category(card) {
    const explicit = String(card.category || '').trim();
    const known = Object.keys(categories).find(k => k !== 'all' && (k === explicit || categories[k] === explicit));
    if (known) return known;
    if (explicit && explicit !== '読みもの') return 'other';
    const hits = Object.keys(rules).filter(k => rules[k].test(card.title));
    return hits.length === 1 ? hits[0] : 'other';
  }
  function normalize(data) {
    if (!data || data.schema_version !== 1 || !Array.isArray(data.articles)) throw new Error('format');
    const seen = new Set();
    return data.articles.filter(c => c && typeof c.title === 'string' && typeof c.note_url === 'string' && /^https:\/\/note\.com\/[A-Za-z0-9_]+\/n\/[A-Za-z0-9]+$/.test(c.note_url)).map(c => ({...c, group:category(c), timestamp:Date.parse(c.published_at) || 0, image:typeof c.image === 'string' && /^media\/BK-\d{4,}-[a-f0-9]{16}\.jpg$/.test(c.image) ? c.image : null})).sort((a,b) => b.timestamp-a.timestamp).filter(c => {if(seen.has(c.note_url)) return false; seen.add(c.note_url); return true;});
  }
  function options(search) {
    const p = new URLSearchParams(search);
    const mode = ['home','embed','text'].includes(p.get('mode')) ? p.get('mode') : 'full';
    const selected = Object.prototype.hasOwnProperty.call(categories,p.get('category')) ? p.get('category') : 'all';
    return {mode,selected,compact:mode==='home'||mode==='embed',images:mode!=='text' && mode!=='home' && p.get('images')!=='0'};
  }
  return {categories, category, normalize, options};
})();
if (typeof module !== 'undefined') module.exports = BKCards;
if (typeof document !== 'undefined') (async () => {
  const o = BKCards.options(location.search);
  document.body.classList.toggle('compact',o.compact);
  const status=document.getElementById('status'), container=document.getElementById('articles'), more=document.getElementById('more'), filters=document.getElementById('filters');
  const heading=document.getElementById('heading');
  heading.textContent=o.compact?'最新のnote記事':o.selected==='all'?'記事を探す':BKCards.categories[o.selected];
  document.title=heading.textContent+'｜便利工房ラボ';
  const full=document.getElementById('full');
  full.href='./'+(o.selected==='all'?'':'?category='+o.selected);
  if(o.compact) { document.getElementById('intro').hidden=true; filters.hidden=true; }
  else {
    for(const [key,label] of Object.entries(BKCards.categories)) {
      const a=document.createElement('a'); a.href='?category='+key+(o.images?'':'&images=0'); a.textContent=label;
      if(key===o.selected) a.setAttribute('aria-current','page'); filters.append(a);
    }
  }
  const toggle=document.getElementById('image-toggle');
  toggle.hidden=o.compact; toggle.href='?category='+o.selected+(o.images?'&images=0':''); toggle.textContent=o.images?'画像なしで軽く読む':'画像付きで読む';
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),12000);
  try {
    const response=await fetch('articles.json',{cache:'no-cache',signal:controller.signal});
    if(!response.ok) throw new Error('load');
    const all=BKCards.normalize(await response.json());
    const cards=all.filter(c=>o.selected==='all'||c.group===o.selected);
    let shown=0; const batch=o.compact?3:6;
    function append() {
      const end=Math.min(shown+batch,cards.length);
      for(const card of cards.slice(shown,end)) {
        const article=document.createElement('article'), link=document.createElement('a'), copy=document.createElement('div');
        link.href=card.note_url; link.target='_blank'; link.rel='noopener noreferrer'; copy.className='copy';
        if(o.images && card.image) {const img=document.createElement('img'); img.src=card.image; img.alt=''; img.loading='lazy'; img.decoding='async'; img.width=480; img.height=270; img.addEventListener('error',()=>img.remove(),{once:true}); link.append(img);}
        const meta=document.createElement('p'); meta.className='meta'; meta.textContent=BKCards.categories[card.group]+(card.timestamp?' · '+new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(card.timestamp)):'');
        const title=document.createElement('h2'); title.textContent=card.title;
        const read=document.createElement('span'); read.className='read'; read.textContent='noteで読む →';
        copy.append(meta,title,read); link.append(copy); article.append(link); container.append(article);
      }
      shown=end; more.hidden=o.compact||shown>=cards.length;
      status.textContent=cards.length ? (o.compact?'':cards.length+'件中 '+shown+'件を表示') : 'このカテゴリの記事はまだありません。「すべて」からご覧ください。';
    }
    more.addEventListener('click',()=>{const first=container.children.length; append(); container.children[first]?.querySelector('a')?.focus();});
    append();
  } catch (_) {status.textContent='記事を読み込めませんでした。下の「noteの全記事」からご覧ください。';}
  finally {clearTimeout(timeout);}
})();
