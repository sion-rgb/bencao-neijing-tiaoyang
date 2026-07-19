import { APP_CONFIG } from "../config/app";
import { disclaimerParagraphs } from "../content/disclaimer";

export function GuidelinesPage() {
  return (
    <div className="content-page legal-page">
      <div className="page-intro"><span className="kicker">使用須知與保障條款</span><h1>了解工具可做與不可做的事</h1><p>版本 {APP_CONFIG.version}・最後更新：{APP_CONFIG.lastUpdated}</p></div>
      <section><h2>用途與限制</h2>{disclaimerParagraphs.slice(0, 3).map((text) => <p key={text}>{text}</p>)}</section>
      <section><h2>用藥與選材安全</h2>{disclaimerParagraphs.slice(3, 6).map((text) => <p key={text}>{text}</p>)}</section>
      <section className="warning-section"><h2>緊急警號</h2><p>{disclaimerParagraphs[6]}</p><ul><li>胸口劇痛或明顯壓迫感</li><li>呼吸困難、昏厥或意識混亂</li><li>突然單側無力、大量出血、嘔血或黑便</li><li>持續嚴重腹痛或不斷嘔吐、無法飲水</li></ul></section>
      <section><h2>中醫概念的界線</h2><p>體質分析只以傳統中醫理論整理。中醫的「肝、心、脾、肺、腎」與氣血津液等概念，不直接等同西醫器官、生化指標或疾病名稱。安全篩查資料只控制建議級別，不參與體質計分。</p></section>
      <section><h2>責任範圍</h2><p>{disclaimerParagraphs[7]}</p></section>
    </div>
  );
}
