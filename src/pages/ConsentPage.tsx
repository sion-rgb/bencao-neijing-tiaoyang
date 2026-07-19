import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { disclaimerParagraphs } from "../content/disclaimer";
import { useAppState } from "../state/AppState";

export function ConsentPage() {
  const { state, setConsent } = useAppState();
  const [checked, setChecked] = useState(state.consent);
  const navigate = useNavigate();
  const proceed = () => {
    if (!checked) return;
    setConsent(true);
    navigate("/safety");
  };
  return (
    <div className="narrow-page">
      <div className="page-intro"><span className="kicker">首次使用確認</span><h1>先確認工具的界線</h1><p>約一分鐘閱讀。你的確認只保存在本機。</p></div>
      <section className="card consent-card">
        <ShieldCheck size={28} aria-hidden="true" />
        <h2>這是一個教育工具</h2>
        {disclaimerParagraphs.slice(0, 4).map((text) => <p key={text}>{text}</p>)}
      </section>
      <label className="consent-check">
        <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
        <span>我明白本工具不是醫療診斷、治療或處方，亦不會以結果自行停藥、減藥或延誤求醫。</span>
      </label>
      <button className="button primary full" type="button" disabled={!checked} onClick={proceed}>確認並進入安全篩查 <ArrowRight size={18} /></button>
      {!checked && <p className="form-hint" aria-live="polite">請先勾選確認，才可繼續。</p>}
    </div>
  );
}
