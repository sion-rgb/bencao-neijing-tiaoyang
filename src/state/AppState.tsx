import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AnswerMap, StoredState } from "../types";
import { clearAllLocalData, EMPTY_STATE, loadState, saveState } from "../utils/storage";

type AppStateContextValue = {
  state: StoredState;
  setConsent: (value: boolean) => void;
  setSafetyAnswer: (questionId: string, optionIds: string[]) => void;
  setQuestionnaireAnswer: (questionId: string, optionIds: string[]) => void;
  setCurrentStep: (value: number) => void;
  resetQuestionnaire: () => void;
  clearEverything: () => void;
  replaceAnswers: (answers: AnswerMap) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setConsent = useCallback((consent: boolean) => setState((current) => ({ ...current, consent })), []);
  const setSafetyAnswer = useCallback((questionId: string, optionIds: string[]) => setState((current) => ({ ...current, safetyAnswers: { ...current.safetyAnswers, [questionId]: optionIds } })), []);
  const setQuestionnaireAnswer = useCallback((questionId: string, optionIds: string[]) => setState((current) => ({ ...current, questionnaireAnswers: { ...current.questionnaireAnswers, [questionId]: optionIds } })), []);
  const setCurrentStep = useCallback((currentStep: number) => setState((current) => current.currentStep === currentStep ? current : ({ ...current, currentStep })), []);
  const resetQuestionnaire = useCallback(() => setState((current) => ({ ...current, questionnaireAnswers: {}, currentStep: 0 })), []);
  const clearEverything = useCallback(() => {
      clearAllLocalData();
      setState({ ...EMPTY_STATE });
    }, []);
  const replaceAnswers = useCallback((questionnaireAnswers: AnswerMap) => setState((current) => ({ ...current, questionnaireAnswers })), []);

  const value = useMemo<AppStateContextValue>(() => ({ state, setConsent, setSafetyAnswer, setQuestionnaireAnswer, setCurrentStep, resetQuestionnaire, clearEverything, replaceAnswers }), [state, setConsent, setSafetyAnswer, setQuestionnaireAnswer, setCurrentStep, resetQuestionnaire, clearEverything, replaceAnswers]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used within AppStateProvider");
  return value;
}
