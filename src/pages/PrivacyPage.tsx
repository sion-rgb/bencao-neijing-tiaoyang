import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_CONFIG } from "../config/app";
import { useAppState } from "../state/AppState";
import { exportResult } from "../utils/storage";

export function PrivacyPage() {
  const { state, clearEverything } = useAppState();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const clear = () => {
    if (!window.confirm("這會刪除本工具在瀏覽器內的問卷、結果與收藏，而且不能復原。確定繼續？")) return;
    clearEverything();
    setMessage("所有本機資料已刪除。即將返回首頁。");
    window.setTimeout(() => navigate("/"), 1000);
  };
  return (
    <div className="content-page privacy-page">
      <div className="page-intro"><span className="kicker">私隱與資料控制</span><h1>資料留在你的瀏覽器</h1><p>不建立帳戶、不上傳、不追蹤身份。</p></div>
      <section className="privacy-hero"><ShieldCheck aria-hidden="true" /><div><h2>本機儲存</h2><p>問卷答案、進度與收藏只保存在此裝置的 localStorage。本網站沒有後端，不收集姓名、身份證、電話、電郵、精確地址或 IP 紀錄，也沒有分析追蹤、廣告 Cookie 或第三方醫療連線。</p></div></section>
      <div className="privacy-grid"><article><h2>儲存甚麼</h2><ul><li>首次使用確認</li><li>安全篩查選項</li><li>體質問卷答案與目前進度</li><li>經典收藏</li><li>資料結構版本號 {APP_CONFIG.storageVersion}</li></ul></article><article><h2>不儲存甚麼</h2><ul><li>姓名或身份資料</li><li>裝置識別碼</li><li>聯絡資料或精確地址</li><li>伺服器端健康紀錄</li><li>跨網站追蹤資料</li></ul></article></div>
      <section className="data-actions"><h2>你的資料控制</h2><div><button type="button" className="button secondary" onClick={() => exportResult({ app: APP_CONFIG.name, exportedAt: new Date().toISOString(), data: state })}><Download size={18} />匯出我的本機資料</button><button type="button" className="button danger" onClick={clear}><Trash2 size={18} />刪除我的所有資料</button></div><p>匯出檔不包含裝置識別碼。資料版本不兼容時，本工具會安全清除舊狀態，而不嘗試上傳或合併。</p>{message && <p className="success-message" role="status">{message}</p>}</section>
    </div>
  );
}
