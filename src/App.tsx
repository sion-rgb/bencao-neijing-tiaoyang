import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ClassicsPage } from "./pages/ClassicsPage";
import { ConsentPage } from "./pages/ConsentPage";
import { EmergencyPage } from "./pages/EmergencyPage";
import { GuidelinesPage } from "./pages/GuidelinesPage";
import { HomePage } from "./pages/HomePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { QuestionnairePage } from "./pages/QuestionnairePage";
import { ResultPage } from "./pages/ResultPage";
import { SafetyPage } from "./pages/SafetyPage";
import { useAppState } from "./state/AppState";

function ConsentGuard({ children }: { children: React.ReactNode }) {
  const { state } = useAppState();
  return state.consent ? children : <Navigate to="/consent" replace />;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/safety" element={<ConsentGuard><SafetyPage /></ConsentGuard>} />
        <Route path="/questionnaire" element={<ConsentGuard><QuestionnairePage /></ConsentGuard>} />
        <Route path="/result" element={<ConsentGuard><ResultPage /></ConsentGuard>} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/classics" element={<ClassicsPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
