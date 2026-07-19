import { Bookmark, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { classics } from "../data/classics/classics";

const FAVORITES_KEY = "bencao-neijing-classic-favorites";

export function ClassicsPage() {
  const [query, setQuery] = useState("");
  const [book, setBook] = useState("全部");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[]; } catch { return []; }
  });
  const entries = useMemo(() => classics
    .filter((entry) => entry.reviewStatus === "approved" && entry.sourceStatus === "verified")
    .filter((entry) => book === "全部" || entry.book === book)
    .filter((entry) => `${entry.book}${entry.section}${entry.chapter}${entry.originalText}${entry.modernSummary}${entry.tags.join("")}`.toLowerCase().includes(query.toLowerCase())), [book, query]);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  return (
    <div className="content-page">
      <div className="page-intro"><span className="kicker">經典資料庫</span><h1>原文與現代整理，清楚分開</h1><p>正式模式只顯示已核對篇章、保存來源並標記為 approved 的小量內容。</p></div>
      <div className="search-panel">
        <label><span className="sr-only">搜尋經典內容</span><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋篇章、原文或主題" /></label>
        <div className="filter-row" role="group" aria-label="經典分類">{["全部", "黃帝內經", "本草綱目"].map((item) => <button key={item} type="button" className={book === item ? "active" : ""} onClick={() => setBook(item)}>{item}</button>)}</div>
      </div>
      <p className="result-count" aria-live="polite">找到 {entries.length} 項內容</p>
      <div className="classic-list">
        {entries.map((entry) => (
          <article key={entry.id} className="classic-card">
            <div className="classic-meta"><span>{entry.book}</span><span>{entry.section}・{entry.chapter}</span><button type="button" aria-label={favorites.includes(entry.id) ? "取消收藏" : "收藏此項"} aria-pressed={favorites.includes(entry.id)} onClick={() => toggleFavorite(entry.id)}><Bookmark fill={favorites.includes(entry.id) ? "currentColor" : "none"} /></button></div>
            <div className="classic-columns"><div><span className="column-label">古籍原文</span><blockquote>{entry.originalText}</blockquote></div><div><span className="column-label">繁體中文整理</span><p>{entry.modernSummary}</p></div></div>
            <div className="tag-row">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <a href={entry.sourceUrl} target="_blank" rel="noreferrer">查看來源與完整篇章</a>
          </article>
        ))}
        {entries.length === 0 && <div className="empty-state"><h2>沒有相符內容</h2><p>可嘗試移除分類或使用較短的關鍵字。</p></div>}
      </div>
    </div>
  );
}
