import { useCallback, useState } from 'react';
import { useDiagnosisStore } from '@/stores/diagnosisStore';
import { checkDiagnosisInput, startDiagnosis } from '@/api';
import { createSmoothTextRenderer, formatCompleteStreamingAnswer } from '@/utils/smoothStream';

const THINKING_STEPS = [
  '识别车辆档案（VIN / 底盘号）',
  '分析故障现象或故障码',
  '生成问题向量并检索知识库',
  '融合关键词、向量与结构化故障资料',
  '深度模型生成诊断结论',
  '整理维修步骤与参考资料',
];

const STAGE_STEP: Record<string, number> = {
  context: 0,
  classification: 1,
  retrieval: 2,
  evidence: 3,
  generation: 4,
};

export function useDiagnosis() {
  const store = useDiagnosisStore();
  const [vin, setVin] = useState('');
  const [fault, setFault] = useState('');
  const [streamText, setStreamText] = useState('');
  const [statusText, setStatusText] = useState('');

  const handleCheck = useCallback(async () => {
    if (!vin.trim() || !fault.trim()) {
      store.setCheckError('');
      return;
    }
    store.setIsChecking(true);
    store.setCheckError('');
    try {
      const result = await checkDiagnosisInput(vin, fault);
      if (!result.valid) store.setCheckError(result.message || '请检查输入内容');
    } catch {
      store.setCheckError('输入校验失败，请稍后重试');
    } finally {
      store.setIsChecking(false);
    }
  }, [fault, store, vin]);

  const handleDiagnose = useCallback(async () => {
    if (!vin.trim() || !fault.trim()) return;
    const selectedSymptoms = [...store.selectedSymptoms];
    store.resetDiagnosis();
    store.setIsDiagnosing(true);
    store.setThinkingVisible(true);
    store.setThinkingStep(0);
    setStreamText('');
    setStatusText('正在连接知识库');

    const renderer = createSmoothTextRenderer(setStreamText);

    try {
      const result = await startDiagnosis(vin.trim(), fault.trim(), selectedSymptoms, {
        onStatus: status => {
          setStatusText(status.text);
          const step = STAGE_STEP[status.stage];
          if (step !== undefined) store.setThinkingStep(step);
        },
        onDelta: delta => renderer.push(delta),
      });
      setStatusText('正在整理处理步骤、引导诊断和相关问题');
      await renderer.finish(formatCompleteStreamingAnswer(result));
      store.setCurrentResult(result);
      store.setReportVisible(true);
      store.setThinkingStep(THINKING_STEPS.length);
      store.addHistoryRecord({
        id: `${Date.now()}`,
        vin: vin.trim(),
        fault: fault.trim(),
        result,
        timestamp: Date.now(),
      });
      setStatusText('诊断完成');
    } catch (error) {
      renderer.stop();
      store.setCheckError(error instanceof Error ? error.message : '诊断失败，请稍后重试');
    } finally {
      store.setIsDiagnosing(false);
    }
  }, [fault, store, vin]);

  const toggleSymptom = useCallback((symptom: string) => {
    store.toggleSymptom(symptom);
  }, [store]);

  const canDiagnose = vin.trim().length > 0 && fault.trim().length > 0 && !store.isDiagnosing;

  return {
    vin,
    setVin,
    fault,
    setFault,
    canDiagnose,
    handleCheck,
    handleDiagnose,
    toggleSymptom,
    thinkingSteps: THINKING_STEPS,
    streamText,
    statusText,
  };
}
