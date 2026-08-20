import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DiagnosisResult, DiagnosisRecord } from '@/types';

interface DiagnosisState {
  // 当前诊断
  currentResult: DiagnosisResult | null;
  isChecking: boolean;
  isDiagnosing: boolean;
  checkError: string;
  accompanySymptoms: string[];
  selectedSymptoms: string[];
  thinkingStep: number;
  thinkingVisible: boolean;
  reportVisible: boolean;

  // 历史记录
  history: DiagnosisRecord[];

  // Actions
  setCurrentResult: (result: DiagnosisResult | null) => void;
  setIsChecking: (val: boolean) => void;
  setIsDiagnosing: (val: boolean) => void;
  setCheckError: (msg: string) => void;
  setAccompanySymptoms: (symptoms: string[]) => void;
  toggleSymptom: (symptom: string) => void;
  setThinkingStep: (step: number) => void;
  setThinkingVisible: (val: boolean) => void;
  setReportVisible: (val: boolean) => void;
  addHistoryRecord: (record: DiagnosisRecord) => void;
  resetDiagnosis: () => void;
}

export const useDiagnosisStore = create<DiagnosisState>()(
  persist(
    (set) => ({
      currentResult: null,
      isChecking: false,
      isDiagnosing: false,
      checkError: '',
      accompanySymptoms: [],
      selectedSymptoms: [],
      thinkingStep: -1,
      thinkingVisible: false,
      reportVisible: false,
      history: [],

      setCurrentResult: (result) => set({ currentResult: result }),
      setIsChecking: (val) => set({ isChecking: val }),
      setIsDiagnosing: (val) => set({ isDiagnosing: val }),
      setCheckError: (msg) => set({ checkError: msg }),
      setAccompanySymptoms: (symptoms) => set({ accompanySymptoms: symptoms }),
      toggleSymptom: (symptom) => set((state) => ({
        selectedSymptoms: state.selectedSymptoms.includes(symptom)
          ? state.selectedSymptoms.filter(s => s !== symptom)
          : [...state.selectedSymptoms, symptom],
      })),
      setThinkingStep: (step) => set({ thinkingStep: step }),
      setThinkingVisible: (val) => set({ thinkingVisible: val }),
      setReportVisible: (val) => set({ reportVisible: val }),
      addHistoryRecord: (record) => set((state) => ({
        history: [record, ...state.history].slice(0, 50),
      })),
      resetDiagnosis: () => set({
        currentResult: null,
        isChecking: false,
        isDiagnosing: false,
        checkError: '',
        accompanySymptoms: [],
        selectedSymptoms: [],
        thinkingStep: -1,
        thinkingVisible: false,
        reportVisible: false,
      }),
    }),
    {
      name: 'diagnosis-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentResult: state.currentResult,
        history: state.history,
        selectedSymptoms: state.selectedSymptoms,
      }),
    }
  )
);
