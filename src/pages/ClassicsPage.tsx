import { Bookmark, ChevronLeft, ChevronRight, ClipboardCopy, Database, Search } from "lucide-react";
import MiniSearch from "minisearch";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { classics } from "../data/classics/classics";
import type { KnowledgeCatalog, KnowledgeEntry, KnowledgeSearchDocument } from "../data/knowledge/types";

const FAVORITES_KEY = "bencao-neijing-classic-favorites";
const knowledgeUrl = (value: string) => `${import.meta.env.BASE_URL}${value.replace(/^\//u, "")}`;
const all = "全部";

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const terms = query.trim().split(/\s+/u).filter(Boolean);
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"));
  if (!escaped.length) return <>{text}</>;
  const pattern = new RegExp(`(${escaped.join("|")})`, "giu");
  return <>{text.split(pattern).map((part, index) => terms.some((term) => part.toLowerCase() === term.toLowerCase()) ? <mark key={`${part}-${index}`}>{part}</mark> : <Fragment key={`${part}-${index}`}>{part}</Fragment>)}</>;
}

export function ClassicsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ book: all, volume: all, chapter: all, herb: all, formula: all, pattern: all, organ: all, qiBloodFluid: all, coldHeat: all, deficiencyExcess: all });
  const [textMode, setTextMode] = useState<"traditional" | "simplified">("traditional");
  const [catalog, setCatalog] = useState<KnowledgeCatalog | null>(null);
  const [indexDocuments, setIndexDocuments] = useState<KnowledgeSearchDocument[]>([]);
  const [loadedEntries, setLoadedEntries] = useState<Record<string, KnowledgeEntry>>({});
  const [activeEntryId, setActiveEntryId] = useState<string>();
  const [loadingEntryId, setLoadingEntryId] = useState<string>();
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const detailRef = useRef<HTMLElement>(null);
  const [favorites, setFavorites] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[]; } catch { return []; } });

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const catalogResponse = await fetch(knowledgeUrl("knowledge/catalog.json"), { signal: controller.signal, cache: "no-cache" });
        if (!catalogResponse.ok) throw new Error(`catalog HTTP ${catalogResponse.status}`);
        const nextCatalog = await catalogResponse.json() as KnowledgeCatalog;
        if (nextCatalog.schemaVersion !== 2 || nextCatalog.documents.length < 10) throw new Error("Production catalog 不完整或版本過舊");
        const indexResponse = await fetch(knowledgeUrl(nextCatalog.searchIndexPath), { signal: controller.signal });
        if (!indexResponse.ok) throw new Error(`index HTTP ${indexResponse.status}`);
        const index = await indexResponse.json() as { documents: KnowledgeSearchDocument[] };
        if (!index.documents.length) throw new Error("Production 搜尋索引為空");
        setCatalog(nextCatalog); setIndexDocuments(index.documents); setLoadState("ready");
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "未知載入錯誤"); setLoadState("error");
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const miniSearch = useMemo(() => {
    const search = new MiniSearch<KnowledgeSearchDocument>({ fields: ["bookTitle", "volume", "chapter", "section", "preview", "topics", "herbs", "formulas", "patterns", "organs", "qiBloodFluids", "coldHeat", "deficiencyExcess"], storeFields: ["id"] });
    search.addAll(indexDocuments); return search;
  }, [indexDocuments]);
  const results = useMemo(() => {
    const ids = query.trim() ? new Set(miniSearch.search(query.trim(), { prefix: true, fuzzy: 0.15 }).map((result) => String(result.id))) : null;
    return indexDocuments.filter((entry) => !ids || ids.has(entry.id))
      .filter((entry) => filters.book === all || entry.bookTitle === filters.book)
      .filter((entry) => filters.volume === all || entry.volume === filters.volume)
      .filter((entry) => filters.chapter === all || entry.chapter === filters.chapter)
      .filter((entry) => filters.herb === all || entry.herbs.includes(filters.herb))
      .filter((entry) => filters.formula === all || entry.formulas.includes(filters.formula))
      .filter((entry) => filters.pattern === all || entry.patterns.includes(filters.pattern))
      .filter((entry) => filters.organ === all || entry.organs.includes(filters.organ))
      .filter((entry) => filters.qiBloodFluid === all || entry.qiBloodFluids.includes(filters.qiBloodFluid))
      .filter((entry) => filters.coldHeat === all || entry.coldHeat.includes(filters.coldHeat))
      .filter((entry) => filters.deficiencyExcess === all || entry.deficiencyExcess.includes(filters.deficiencyExcess)).slice(0, 80);
  }, [filters, indexDocuments, miniSearch, query]);
  const values = useMemo(() => ({
    books: catalog?.documents.map((item) => item.bookTitle) ?? [], volumes: [...new Set(indexDocuments.flatMap((item) => item.volume ? [item.volume] : []))], chapters: [...new Set(indexDocuments.flatMap((item) => item.chapter ? [item.chapter] : []))],
    herbs: [...new Set(indexDocuments.flatMap((item) => item.herbs))], formulas: [...new Set(indexDocuments.flatMap((item) => item.formulas))], patterns: [...new Set(indexDocuments.flatMap((item) => item.patterns))],
    organs: [...new Set(indexDocuments.flatMap((item) => item.organs))], qiBloodFluids: [...new Set(indexDocuments.flatMap((item) => item.qiBloodFluids))], coldHeat: [...new Set(indexDocuments.flatMap((item) => item.coldHeat))], deficiencyExcess: [...new Set(indexDocuments.flatMap((item) => item.deficiencyExcess))]
  }), [catalog, indexDocuments]);
  const activeEntry = activeEntryId ? loadedEntries[activeEntryId] : undefined;
  const activeIndex = results.findIndex((item) => item.id === activeEntryId);
  const updateFilter = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const toggleFavorite = (id: string) => { const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]; setFavorites(next); localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); };
  const loadFullEntry = async (item: KnowledgeSearchDocument) => {
    setActiveEntryId(item.id);
    if (!loadedEntries[item.id]) {
      setLoadingEntryId(item.id); setLoadError("");
      try { const response = await fetch(knowledgeUrl(item.chunkPath)); if (!response.ok) throw new Error(`全文 HTTP ${response.status}`); const chunk = await response.json() as KnowledgeEntry[]; setLoadedEntries((current) => ({ ...current, ...Object.fromEntries(chunk.map((entry) => [entry.id, entry])) })); }
      catch (error) { setLoadError(error instanceof Error ? error.message : "全文載入失敗"); }
      finally { setLoadingEntryId(undefined); }
    }
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const copyCitation = async (entry: KnowledgeEntry) => navigator.clipboard.writeText(`${entry.bookTitle}${entry.volume ? `・${entry.volume}` : ""}${entry.chapter ? `・${entry.chapter}` : ""}，PDF 第 ${entry.pageStart}${entry.pageEnd !== entry.pageStart ? `–${entry.pageEnd}` : ""} 頁，${entry.sourceFileName}，SHA-256 ${entry.sourceFileHash}`);
  const goRelative = (offset: number) => { const item = results[activeIndex + offset]; if (item) void loadFullEntry(item); };

  const select = (label: string, key: keyof typeof filters, options: string[]) => <label>{label}<select value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}><option>{all}</option>{options.map((item) => <option key={item}>{item}</option>)}</select></label>;
  return <div className="content-page classics-v2">
    <div className="page-intro"><span className="kicker">經典資料庫 v2</span><h1>10 書公有領域古籍文字，逐段可追溯</h1><p>Production 只顯示已從 PDF 明確分離、通過權利與內容閘門的古籍文字；掃描檔、白話譯文、現代導言、註釋及現代啟示不公開。</p></div>
    {catalog && <><section className="knowledge-metrics" aria-label="知識庫統計"><div><strong>{catalog.documents.length}</strong><span>本書</span></div><div><strong>{catalog.documents.reduce((sum, item) => sum + item.entryCount, 0).toLocaleString()}</strong><span>原文條目</span></div><div><strong>{values.herbs.length}</strong><span>藥材標籤</span></div><div><strong>{values.formulas.length}</strong><span>古方索引</span></div></section><section className="book-grid" aria-label="書籍列表">{catalog.documents.map((document) => <button type="button" key={document.documentId} className={filters.book === document.bookTitle ? "book-card active" : "book-card"} onClick={() => updateFilter("book", filters.book === document.bookTitle ? all : document.bookTitle)}><strong>{document.bookTitle}</strong><span>{document.entryCount.toLocaleString()} 條・{document.chapters.length} 篇章</span></button>)}</section></>}
    <div className="search-panel knowledge-search-panel"><label><span className="sr-only">全文搜尋經典內容</span><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="全文搜尋、篇章、藥材、方劑或證候" /></label><div className="knowledge-filters">
      {select("書名", "book", values.books)}{select("卷／部", "volume", values.volumes)}{select("篇章", "chapter", values.chapters)}{select("藥材", "herb", values.herbs)}{select("方劑", "formula", values.formulas)}{select("體質／證候", "pattern", values.patterns)}{select("臟腑", "organ", values.organs)}{select("氣血津液", "qiBloodFluid", values.qiBloodFluids)}{select("寒熱", "coldHeat", values.coldHeat)}{select("虛實", "deficiencyExcess", values.deficiencyExcess)}
    </div><div className="filter-row" role="group" aria-label="文字顯示版本"><button type="button" className={textMode === "traditional" ? "active" : ""} onClick={() => setTextMode("traditional")}>繁體轉寫</button><button type="button" className={textMode === "simplified" ? "active" : ""} onClick={() => setTextMode("simplified")}>簡體底本</button><button type="button" onClick={() => { setQuery(""); setFilters({ book: all, volume: all, chapter: all, herb: all, formula: all, pattern: all, organ: all, qiBloodFluid: all, coldHeat: all, deficiencyExcess: all }); }}>清除篩選</button></div></div>
    {loadState === "loading" && <div className="notice" role="status"><Database aria-hidden="true" /><p>正在載入 10 書輕量搜尋索引……</p></div>}
    {loadState === "error" && <div className="notice warning" role="alert"><p>Production 知識庫載入失敗：{loadError}。系統沒有以小型硬編碼內容冒充完整資料庫，請重新整理或稍後再試。</p></div>}
    {loadState === "error" && import.meta.env.DEV && <section data-testid="legacy-dev-fallback" className="notice warning"><div><strong>DEV 測試用 legacy fallback（非 Production）</strong>{classics.map((entry) => <p key={entry.id}>{entry.book}・{entry.chapter}：{entry.originalText}</p>)}</div></section>}
    {activeEntryId && <article ref={detailRef} className="feature-card knowledge-detail" tabIndex={-1}>{loadingEntryId === activeEntryId && <p role="status">正在載入完整段落……</p>}{activeEntry && <><div className="classic-meta"><span>{activeEntry.bookTitle}{activeEntry.volume ? `・${activeEntry.volume}` : ""}</span><span>{activeEntry.chapter ?? activeEntry.section}・PDF 第 {activeEntry.pageStart}{activeEntry.pageEnd !== activeEntry.pageStart ? `–${activeEntry.pageEnd}` : ""} 頁</span></div><h2>{activeEntry.section ?? activeEntry.chapter ?? "完整原文段落"}</h2><blockquote><Highlight text={textMode === "traditional" ? activeEntry.textTraditional : activeEntry.originalTextSimplified} query={query} /></blockquote><div className="source-detail"><p><strong>PDF 來源：</strong>{activeEntry.sourceFileName}</p><p><strong>SHA-256：</strong><code>{activeEntry.sourceFileHash}</code></p><p><strong>擷取／轉換：</strong>文字層・opencc-s2hk・轉寫已覆核・approved</p><button className="icon-button" type="button" onClick={() => void copyCitation(activeEntry)}><ClipboardCopy size={17} />複製引用資料</button></div><div className="detail-navigation"><button type="button" disabled={activeIndex <= 0} onClick={() => goRelative(-1)}><ChevronLeft />上一條</button><button type="button" disabled={activeIndex < 0 || activeIndex >= results.length - 1} onClick={() => goRelative(1)}>下一條<ChevronRight /></button></div></>}</article>}
    {loadState === "ready" && <><p className="result-count" aria-live="polite">找到 {results.length}{results.length === 80 ? "+" : ""} 項（先顯示最多 80 項；加入篩選可縮小範圍）</p><div className="classic-list">{results.map((item) => <article key={item.id} className="classic-card knowledge-card"><div className="classic-meta"><span>{item.bookTitle}</span><span>{item.volume ? `${item.volume}・` : ""}{item.chapter ?? item.section ?? "原文段落"}・PDF 第 {item.pageStart}{item.pageEnd !== item.pageStart ? `–${item.pageEnd}` : ""} 頁</span><button type="button" aria-label={favorites.includes(item.id) ? "取消收藏" : "收藏此項"} aria-pressed={favorites.includes(item.id)} onClick={() => toggleFavorite(item.id)}><Bookmark fill={favorites.includes(item.id) ? "currentColor" : "none"} /></button></div><p><Highlight text={item.preview} query={query} /></p><div className="tag-row"><span>文字層</span><span>approved</span>{[...item.herbs, ...item.formulas, ...item.patterns, ...item.organs].slice(0, 8).map((tag) => <span key={tag}>{tag}</span>)}</div><button className="button ghost" type="button" onClick={() => void loadFullEntry(item)}>查看完整段落與來源</button></article>)}{!results.length && <div className="empty-state"><h2>沒有相符內容</h2><p>可移除部分篩選或縮短關鍵字。</p></div>}</div></>}
  </div>;
}
