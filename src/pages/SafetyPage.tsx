import { ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OptionList } from "../components/OptionList";
import { getVisibleSafetyQuestions } from "../data/safety/safetyQuestions";
import { assessSafety } from "../engine/safetyEngine";
import { useAppState } from "../state/AppState";

export function SafetyPage() {
  const { state, setSafetyAnswer } = useAppState();
  const visibleQuestions = useMemo(() => getVisibleSafetyQuestions(state.safetyAnswers), [state.safetyAnswers]);
  const [step, setStep] = useState(() => {
    const initialQuestions = getVisibleSafetyQuestions(state.safetyAnswers);
    const firstMissing = initialQuestions.findIndex((item) => !(state.safetyAnswers[item.id]?.length));
    return firstMissing < 0 ? initialQuestions.length - 1 : firstMissing;
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (step >= visibleQuestions.length) setStep(Math.max(0, visibleQuestions.length - 1));
  }, [step, visibleQuestions.length]);

  const question = visibleQuestions[Math.min(step, visibleQuestions.length - 1)];
  const selected = state.safetyAnswers[question.id] ?? [];
  const percent = Math.round(((step + 1) / visibleQuestions.length) * 100);
  const safety = useMemo(() => assessSafety(state.safetyAnswers), [state.safetyAnswers]);

  const select = (ids: string[]) => {
    setError("");
    setSafetyAnswer(question.id, ids);
    if (question.id === "emergency" && ids.some((id) => id !== "emergency_none")) navigate("/emergency", { replace: true });
  };

  const next = () => {
    if (!selected.length) return setError("請選擇一項答案才可繼續。");
    if (step < visibleQuestions.length - 1) return setStep(step + 1);
    const assessment = assessSafety(state.safetyAnswers);
    if (assessment.level === 0) return navigate("/emergency", { replace: true });
    navigate("/questionnaire");
  };

  return (
    <div className="question-page">
      <div className="progress-meta"><span>安全篩查</span><span>{step + 1} / {visibleQuestions.length}</span></div>
      <div className="progress-track" role="progressbar" aria-label="安全篩查進度" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div>
      <section className="question-card">
        <div className="question-icon"><ShieldAlert aria-hidden="true" /></div>
        <span className="kicker">安全資料不會參與體質計分</span>
        <h1>{question.prompt}</h1>
        {question.multiple && <p className="selection-note">可多選；選擇「以上皆無」或「不確定」會清除其他選項。</p>}
        <OptionList legend={question.prompt} options={question.options} selected={selected} multiple={question.multiple} onChange={select} describedBy={error ? "safety-error" : undefined} />
        {error && <p id="safety-error" className="error-message" role="alert">{error}</p>}
      </section>
      <div className="question-actions">
        <button className="button ghost" type="button" onClick={() => step > 0 ? setStep(step - 1) : navigate("/consent")}><ArrowLeft size={18} />上一步</button>
        <button className="button primary" type="button" onClick={next}>{step === visibleQuestions.length - 1 ? "完成安全篩查" : "下一步"}<ArrowRight size={18} /></button>
      </div>
      {safety.level > 0 && visibleQuestions.every((item) => state.safetyAnswers[item.id]?.length) && <p className="form-hint">目前建議安全級別會在結果頁清楚說明。</p>}
    </div>
  );
}
