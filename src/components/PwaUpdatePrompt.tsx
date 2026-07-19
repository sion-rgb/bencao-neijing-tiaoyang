import { RefreshCw } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaUpdatePrompt() {
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW();
  if (!needRefresh) return null;
  return <div className="pwa-update" role="status"><p>已有新版內容及知識索引可用。重新載入後會改用 v2 快取。</p><button className="button primary" type="button" onClick={() => void updateServiceWorker(true)}><RefreshCw size={17} />重新載入更新</button><button className="button ghost" type="button" onClick={() => setNeedRefresh(false)}>稍後</button></div>;
}
