import { Bookmark, ClipboardCopy, Database, Search } from "lucide-react";
import MiniSearch from "minisearch";
import { useEffect, useMemo, useState } from "react";
import { classics } from "../data/classics/classics";
import type { KnowledgeCatalog, KnowledgeEntry, KnowledgeSearchDocument } from "../data/knowledge/types";

const FAVORITES_KEY = "bencao-neijing-classic-favorites";
const knowledgeUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//u, "")}`;

type SearchIndexPayload = { schemaVersion: number; generatedAt: string; documents: KnowledgeSearchDocument[] };

export function ClassicsPage() {
  const [query, setQuery] = useState("");
  const [book, setBook] = useState("全部");
  const [chapter, setChapter] = useState("全部");
  const [herb, setHerb] = useState("全部");
  const [formula, setFormula] = useState("全部");
  const [pattern, setPattern] = useState("全部");
  const [textMode, setTextMode] = useState<"traditional" | "simplified">("traditional");
  const [catalog, setCatalog] = useState<KnowledgeCatalog | null>(null);
  const [indexDocuments, setIndexDocuments] = useState<KnowledgeSearchDocument[]>([]);
  const [loadedEntries, setLoadedEntries] = useState<Record<string, KnowledgeEntry>>({});
  const [loadingEntryId, setLoadingEntryId] = useState<string>();
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[]; } catch { return []; }
  });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(knowledgeUrl("knowledge/catalog.json"), { signal: controller.signal }).then((response) => {
        if (!response.ok) throw new Error(`catalog HTTP ${response.status}`);
        return response.json() as Promise<KnowledgeCatalog>;
      }),
      fetch(knowledgeUrl("knowledge/indexes/search-index.json"), { signal: controller.signal }).then((response) => {
        if (!response.ok) throw new Error(`index HTTP ${response.status}`);
        return response.json() as Promise<SearchIndexPayload>;
      })
    ]).then(([nextCatalog, index]) => {
      setCatalog(nextCatalog);
      setIndexDocuments(index.documents);
      setLoadState("ready");
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setLoadError(error instanceof Error ? error.message : "未知載入錯誤");
      setLoadState("error");
    });
    return () => controller.abort();
  }, []);

  const miniSearch = useMemo(() => {
    const search = new MiniSearch<KnowledgeSearchDocument>({
      fields: ["bookTitle", "chapter", "section", "preview", "topics", "herbs", "formulas", "patterns"],
      storeFields: ["id"]
    });
    search.addAll(indexDocuments);
    return search;
  }, [indexDocuments]);

  const generatedEntries = useMemo(() => {
    const matchedIds = query.trim()
      ? new Set(miniSearch.search(query.trim(), { prefix: true, fuzzy: 0.2 }).map((result) => String(result.id)))
      : null;
    return indexDocuments
      .filter((entry) => !matchedIds || matchedIds.has(entry.id))
      .filter((entry) => book === "全部" || entry.bookTitle === book)
      .filter((entry) => chapter === "全部" || entry.chapter === chapter)
      .filter((entry) => herb === "全部" || entry.herbs.includes(herb))
      .filter((entry) => formula === "全部" || entry.formulas.includes(formula))
      .filter((entry) => pattern === "全部" || entry.patterns.includes(pattern))
      .slice(0, 50);
  }, [book, chapter, formula, herb, indexDocuments, miniSearch, pattern, query]);

  const legacyEntries = useMemo(() => classics
    .filter((entry) => entry.reviewStatus === "approved" && entry.sourceStatus === "verified")
    .filter((entry) => book === "全部" || entry.book === book)
    .filter((entry) => chapter === "全部" || entry.chapter === chapter)
    .filter((entry) => `${entry.book}${entry.section}${entry.chapter}${entry.originalText}${entry.modernSummary}${entry.tags.join("")}`.toLowerCase().includes(query.toLowerCase())), [book, chapter, query]);

  const books = useMemo(() => [...new Set(["黃帝內經", "本草綱目", ...(catalog?.documents.map((item) => item.bookTitle) ?? [])])], [catalog]);
  const chapters = useMemo(() => [...new Set([...(classics.map((entry) => entry.chapter).filter((value): value is string => Boolean(value))), ...indexDocuments.map((entry) => entry.chapter).filter((value): value is string => Boolean(value))])], [indexDocuments]);
  const herbs = useMemo(() => [...new Set(indexDocuments.flatMap((entry) => entry.herbs))], [indexDocuments]);
  const formulas = useMemo(() => [...new Set(indexDocuments.flatMap((entry) => entry.formulas))], [indexDocuments]);
  const patterns = useMemo(() => [...new Set(indexDocuments.flatMap((entry) => entry.patterns))], [indexDocuments]);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  const loadFullEntry = async (item: KnowledgeSearchDocument) => {
    if (loadedEntries[item.id]) return;
    setLoadingEntryId(item.id);
    setLoadError("");
    try {
      const response = await fetch(knowledgeUrl(item.chunkPath));
      if (!response.ok) throw new Error(`全文 HTTP ${response.status}`);
      const chunk = await response.json() as KnowledgeEntry[];
      setLoadedEntries((current) => ({ ...current, ...Object.fromEntries(chunk.map((entry) => [entry.id, entry])) }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "全文載入失敗");
    } finally {
      setLoadingEntryId(undefined);
    }
  };

  const copyCitation = async (entry: KnowledgeEntry) => {
    const citation = `${entry.bookTitle}${entry.chapter ? `・${entry.chapter}` : ""}，PDF 第 ${entry.pageStart}${entry.pageEnd !== entry.pageStart ? `–${entry.pageEnd}` : ""} 頁，來源檔：${entry.sourceFileName}，SHA-256：${entry.sourceFileHash}`;
    await navigator.clipboard.writeText(citation);
  };

  return (
    <div className="content-page">
      <div className="page-intro"><span className="kicker">經典資料庫</span><h1>繁體轉寫與簡體底本，來源逐段可追溯</h1><p>Production 只載入版權允許、publishable 且 approved 的內容。搜尋索引先載入短預覽，選取結果後才載入該書的內容分塊。</p></div>
      <div className="search-panel knowledge-search-panel">
        <label><span className="sr-only">全文搜尋經典內容</span><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="全文搜尋、篇章、藥材、方劑或證候" /></label>
        <div className="knowledge-filters">
          <label>書名<select value={book} onChange={(event) => setBook(event.target.value)}><option>全部</option>{books.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>篇章<select value={chapter} onChange={(event) => setChapter(event.target.value)}><option>全部</option>{chapters.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>藥材<select value={herb} onChange={(event) => setHerb(event.target.value)}><option>全部</option>{herbs.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>方劑<select value={formula} onChange={(event) => setFormula(event.target.value)}><option>全部</option>{formulas.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>體質／證候<select value={pattern} onChange={(event) => setPattern(event.target.value)}><option>全部</option>{patterns.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="filter-row" role="group" aria-label="文字顯示版本"><button type="button" className={textMode === "traditional" ? "active" : ""} onClick={() => setTextMode("traditional")}>繁體轉寫</button><button type="button" className={textMode === "simplified" ? "active" : ""} onClick={() => setTextMode("simplified")}>簡體底本</button></div>
      </div>
      {loadState === "loading" && <div className="notice" role="status"><Database aria-hidden="true" /><p>正在載入輕量搜尋索引……</p></div>}
      {loadState === "error" && <div className="notice warning" role="alert"><p>大型知識索引未能載入：{loadError}。下方已核對的小型經典資料仍可使用。</p></div>}
      <p className="result-count" aria-live="polite">找到 {legacyEntries.length + generatedEntries.length} 項內容{generatedEntries.length === 50 ? "（大型索引只先顯示首 50 項，請加入篩選）" : ""}</p>
      <div className="classic-list">
        {generatedEntries.map((item) => {
          const entry = loadedEntries[item.id];
          return <article key={item.id} className="classic-card knowledge-card">
            <div className="classic-meta"><span>{item.bookTitle}</span><span>{item.chapter ?? item.section ?? "篇章待人工整理"}・PDF 第 {item.pageStart} 頁</span><button type="button" aria-label={favorites.includes(item.id) ? "取消收藏" : "收藏此項"} aria-pressed={favorites.includes(item.id)} onClick={() => toggleFavorite(item.id)}><Bookmark fill={favorites.includes(item.id) ? "currentColor" : "none"} /></button></div>
            <p>{entry ? (textMode === "traditional" ? entry.textTraditional : entry.originalTextSimplified) : item.preview}</p>
            <div className="tag-row"><span>{item.extractionMethod === "ocr" ? "OCR" : "文字層"}</span><span>{item.reviewStatus}</span><span>{item.sourceStatus}</span>{item.herbs.map((tag) => <span key={tag}>{tag}</span>)}{item.formulas.map((tag) => <span key={tag}>{tag}</span>)}{item.patterns.map((tag) => <span key={tag}>{tag}</span>)}</div>
            {!entry ? <button className="button ghost" type="button" disabled={loadingEntryId === item.id} onClick={() => void loadFullEntry(item)}>{loadingEntryId === item.id ? "載入中……" : "載入完整內容與來源"}</button> : <div className="source-detail"><p><strong>PDF來源：</strong>{entry.sourceFileName}・第 {entry.pageStart} 頁</p><p><strong>擷取／轉換：</strong>{entry.extractionMethod}・{entry.conversionProfile}・轉換覆核：{entry.conversionReviewed ? "已覆核" : "未覆核"}</p><button className="icon-button" type="button" onClick={() => void copyCitation(entry)}><ClipboardCopy size={17} />複製引用資料</button></div>}
          </article>;
        })}
        {legacyEntries.map((entry) => (
          <article key={entry.id} className="classic-card">
            <div className="classic-meta"><span>{entry.book}</span><span>{entry.section}・{entry.chapter}</span><button type="button" aria-label={favorites.includes(entry.id) ? "取消收藏" : "收藏此項"} aria-pressed={favorites.includes(entry.id)} onClick={() => toggleFavorite(entry.id)}><Bookmark fill={favorites.includes(entry.id) ? "currentColor" : "none"} /></button></div>
            <div className="classic-columns"><div><span className="column-label">古籍原文</span><blockquote>{entry.originalText}</blockquote></div><div><span className="column-label">繁體中文整理</span><p>{entry.modernSummary}</p></div></div>
            <div className="tag-row">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <a href={entry.sourceUrl} target="_blank" rel="noreferrer">查看來源與完整篇章</a>
          </article>
        ))}
        {legacyEntries.length + generatedEntries.length === 0 && <div className="empty-state"><h2>沒有相符內容</h2><p>可嘗試移除分類或使用較短的關鍵字。版權不明或尚未批准的 PDF 條目不會出現在 Production。</p></div>}
      </div>
    </div>
  );
}
