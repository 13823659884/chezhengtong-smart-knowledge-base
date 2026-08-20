import { memo, useEffect } from 'react';
import { StatusBar } from '@/components/StatusBar';
import { NavBar } from '@/components/NavBar';
import { KnowledgeAnswer } from '@/components/KnowledgeAnswer';
import { useDiagnosis } from '@/hooks/useDiagnosis';
import { useDiagnosisStore } from '@/stores/diagnosisStore';

const Spinner = memo(function Spinner() {
  return <span className="w-[18px] h-[18px] rounded-full border-2 border-purple/30 border-t-purple animate-spin" />;
});

const CheckIcon = memo(function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
});

const SmartDiagnosis = memo(function SmartDiagnosis() {
  const store = useDiagnosisStore();
  const {
    vin,
    setVin,
    fault,
    setFault,
    canDiagnose,
    handleCheck,
    handleDiagnose,
    toggleSymptom,
    thinkingSteps,
    streamText,
    statusText,
  } = useDiagnosis();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (vin.trim() && fault.trim()) void handleCheck();
      else store.setCheckError('');
    }, 300);
    return () => clearTimeout(timer);
  }, [fault, handleCheck, store, vin]);

  return (
    <div className="min-h-screen bg-bg pb-6">
      <StatusBar />
      <NavBar
        title="智能诊断"
        subtitle="VIN + 故障码/故障现象，知识库深度诊断"
        showBack
        backTo="/knowledge"
      />

      <div className="px-3 pt-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-pink flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/>
                <circle cx="12" cy="12" r="3" fill="#fff" stroke="none"/>
              </svg>
            </div>
            <div>
              <span className="text-base font-semibold text-text-primary">车辆智能诊断</span>
              <p className="text-[11px] text-text-muted">固定使用知识库深度模型</p>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              车辆 VIN 或后八位 / 底盘号 <span className="text-danger">*</span>
            </label>
            <div className="flex items-center gap-2 bg-input-bg rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 text-text-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/>
                <line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/>
              </svg>
              <input
                value={vin}
                onChange={event => setVin(event.target.value)}
                placeholder="如 LFW5RXDL6TAA28788 / TAA28788"
                className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              故障现象或故障码 <span className="text-danger">*</span>
            </label>
            <div className="flex items-start gap-2 bg-input-bg rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <textarea
                value={fault}
                onChange={event => setFault(event.target.value)}
                placeholder="如 SPN647 FMI4 / 加速无力 / 空调不制冷"
                rows={3}
                className="min-w-0 flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
              />
            </div>
          </div>

          {store.accompanySymptoms.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-text-secondary mb-1.5">伴随故障现象（可选）：</p>
              <div className="flex flex-wrap gap-2">
                {store.accompanySymptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      store.selectedSymptoms.includes(symptom) ? 'bg-purple text-white' : 'bg-blue-tag text-blue-text'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          )}

          {store.checkError && <p className="text-xs text-danger mb-3">{store.checkError}</p>}

          <button
            onClick={() => void handleDiagnose()}
            disabled={!canDiagnose}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium text-white ${
              canDiagnose ? 'bg-purple active:opacity-90' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {store.isDiagnosing ? <Spinner /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/>
              </svg>
            )}
            {store.isDiagnosing ? '正在诊断' : '开始智能诊断'}
          </button>
        </div>

        {store.thinkingVisible && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-base font-semibold text-purple">诊断进度</span>
              {store.isDiagnosing && <span className="text-[11px] text-text-muted">{statusText}</span>}
            </div>
            <div className="space-y-3">
              {thinkingSteps.map((step, index) => {
                const done = store.thinkingStep > index || (!store.isDiagnosing && store.reportVisible);
                const current = store.isDiagnosing && store.thinkingStep === index;
                return (
                  <div key={step} className={`flex items-start gap-2.5 ${store.thinkingStep >= index || done ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {done ? <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center"><CheckIcon /></span>
                        : current ? <Spinner /> : <span className="w-5 h-5 rounded-full border border-gray-300" />}
                    </div>
                    <span className={`text-[13px] leading-5 ${done || current ? 'text-purple' : 'text-text-secondary'}`}>{step}</span>
                  </div>
                );
              })}
            </div>

            {streamText && store.isDiagnosing && (
              <div className="mt-4 border-t border-border-color pt-3">
                <p className="text-xs font-semibold text-text-primary mb-2">正在生成诊断报告</p>
                <p className="text-sm leading-7 whitespace-pre-wrap text-text-primary">{streamText}</p>
              </div>
            )}
          </div>
        )}

        {store.reportVisible && store.currentResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-pink flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">知识库诊断报告</h2>
                <p className="text-[11px] text-text-muted">车辆：{store.currentResult.vin}　问题：{store.currentResult.fault}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple">
              <KnowledgeAnswer data={store.currentResult} onQuestion={question => setFault(question)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default SmartDiagnosis;
