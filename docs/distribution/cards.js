'use strict';
(async () => {
  const status = document.getElementById('status');
  const container = document.getElementById('articles');
  try {
    const response = await fetch('articles.json', {cache: 'no-cache'});
    if (!response.ok) throw new Error('load');
    const data = await response.json();
    if (data.schema_version !== 1 || !Array.isArray(data.articles)) throw new Error('format');
    for (const card of data.articles) {
      if (!/^https:\/\/note\.com\/[A-Za-z0-9_]+\/n\/[A-Za-z0-9]+$/.test(card.note_url)) continue;
      if (!/^media\/BK-\d{4,}-[a-f0-9]{16}\.jpg$/.test(card.image)) continue;
      const article = document.createElement('article');
      const link = document.createElement('a');
      link.href = card.note_url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const image = document.createElement('img');
      image.src = card.image; image.alt = ''; image.loading = 'lazy';
      const label = document.createElement('p');
      label.textContent = `${card.category || '読みもの'} · ${String(card.published_at).slice(0,10)}`;
      const title = document.createElement('h2'); title.textContent = card.title;
      const more = document.createElement('span'); more.className = 'read'; more.textContent = 'noteで読む →';
      link.append(image, label, title, more); article.append(link); container.append(article);
    }
    status.textContent = container.children.length ? '' : '公開確認済みの記事はまだありません。';
  } catch (_) {
    status.textContent = '記事を読み込めませんでした。しばらくしてから再度お試しください。';
  }
})();
