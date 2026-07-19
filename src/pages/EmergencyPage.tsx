import { ArrowLeft, PhoneCall, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function EmergencyPage() {
  return (
    <div className="emergency-page" role="alert">
      <div className="emergency-symbol"><TriangleAlert size={42} aria-hidden="true" /></div>
      <span className="kicker">問卷已停止</span>
      <h1>請立即尋求緊急協助</h1>
      <p className="emergency-lead">本工具不適用於處理目前情況，請立即聯絡當地緊急服務或合資格醫護人員。</p>
      <div className="emergency-note"><PhoneCall aria-hidden="true" /><p>如你身處香港，請致電 <strong>999</strong>；如在其他地區，請聯絡當地緊急服務。不要等待本工具提供分析。</p></div>
      <p>我們不會生成體質結果，也不會提供食療、中藥或代茶飲建議。請勿用中醫體質解釋或延誤處理目前的緊急症狀。</p>
      <Link className="button emergency-button" to="/"><ArrowLeft size={18} />返回首頁</Link>
    </div>
  );
}
