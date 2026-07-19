import { ArrowLeft, ArrowRight, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OptionList } from "../components/OptionList";
import { constitutionQuestions } from "../data/questions/constitutionQuestions";
import { assessSafety } from "../engine/safetyEngine";
import { useAppState } from "../state/AppState";

const categoryLabels: Record<string, string> = { body: "體型與身體感受", energy: "精神與疲勞", sweat: "出汗", digestion: "消化", sleep: "睡眠", headSkinLimbs: "頭面、皮膚及四肢", tongue: "舌象選填" };

export function QuestionnairePage() {
  const { state, setQuestionnaireAnswer, setCurrentStep, resetQuestionnaire } = useAppState();
  const [step, setStep] = useState(Math.min(state.currentStep, constitutionQuestions.length - 1));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const question = constitutionQuestions[step];
  const selected = state.questionnaireAnswers[question.id] ?? [];
  const answered = constitutionQuestions.filter((item) => (state.questionnaireAnswers[item.id]?.length ?? 0) > 0).length;
  const percent = Math.round((answered / constitutionQuestions.length) * 100);

  useEffect(() => setCurrentStep(step), [step, setCurrentStep]);
  useEffect(() => {
    if (assessSafety(state.safetyAnswers).level === 0) navigate("/emergency", { replace: true });
  }, [navigate, state.safetyAnswers]);

  const next = () => {
    if (question.required && !selected.length) return setError("這一題需要回答；如不確定，請選擇最接近的選項。");
    setError("");
    if (step < constitutionQuestions.length - 1) return setStep(step + 1);
    navigate("/result");
  };

  const restart = () => {
    if (!window.confirm("確定清除目前體質問卷並重新開始？安全篩查會保留。")) return;
    resetQuestionnaire();
    setStep(0);
  };

  return (
    <div className="question-page">
      <div className="progress-meta"><span>{categoryLabels[question.category]}</span><span>已完成 {percent}%</span></div>
      <div className="progress-track" role="progressbar" aria-label="體質問卷進度" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div>
      <div className="question-toolbar">
        <span>第 {step + 1} / {constitutionQuestions.length} 題</span>
        <button type="button" className="text-button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }}><Save size={16} />{saved ? "已儲存在本機" : "暫存進度"}</button>
        <button type="button" className="text-button danger-text" onClick={restart}><RotateCcw size={16} />重新開始</button>
      </div>
      <section className="question-card">
        <span className="kicker">{question.required ? "單選" : "選填・可跳過"}</span>
        <h1>{question.prompt}</h1>
        {question.helpText && <p id="question-help" className="selection-note">{question.helpText}</p>}
        <OptionList legend={question.prompt} options={question.options.map((item) => ({ id: item.optionId, label: item.label }))} selected={selected} multiple={question.multiple} onChange={(ids) => { setError(""); setQuestionnaireAnswer(question.id, ids); }} describedBy={[question.helpText ? "question-help" : "", error ? "question-error" : ""].filter(Boolean).join(" ") || undefined} />
        {error && <p id="question-error" className="error-message" role="alert">{error}</p>}
      </section>
      <div className="question-actions">
        <button className="button ghost" type="button" onClick={() => step > 0 ? setStep(step - 1) : navigate("/safety")}><ArrowLeft size={18} />上一步</button>
        <button className="button primary" type="button" onClick={next}>{step === constitutionQuestions.length - 1 ? "查看分析結果" : "下一步"}<ArrowRight size={18} /></button>
      </div>
      {!question.required && !selected.length && step < constitutionQuestions.length - 1 && <button className="skip-link" type="button" onClick={() => setStep(step + 1)}>跳過這題</button>}
    </div>
  );
}
