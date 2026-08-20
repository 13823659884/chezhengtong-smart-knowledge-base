import type {
  DiagnosisCheckResponse,
  DiagnosisResult,
  KnowledgeAnswer,
  KnowledgeStreamStatus,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

interface StreamPayload {
  question: string;
  conversation_id?: string;
  vehicle_id?: string;
  vehicle_series?: string;
  energy_type?: string;
  intent?: string;
  task_type?: string;
  scene?: string;
  answer_target?: string;
}

interface StreamHandlers {
  onStatus?: (status: KnowledgeStreamStatus) => void;
  onDelta?: (text: string) => void;
  onMeta?: (meta: Record<string, unknown>) => void;
}

export interface KnowledgeQueryContext {
  intent: string;
  vehicleSeries: string;
  energyType: string;
  answerTarget: string;
}

interface StreamEvent {
  type: 'status' | 'meta' | 'delta' | 'mode_fallback' | 'error' | 'done';
  text?: string;
  error?: string;
  stage?: string;
  progress?: number;
  task_type?: string;
  data?: KnowledgeAnswer;
  [key: string]: unknown;
}

function errorMessage(value: unknown): string {
  if (value instanceof Error) return value.message;
  return String(value || '请求失败');
}

function normalizeAnswer(data: Partial<KnowledgeAnswer>): KnowledgeAnswer {
  return {
    answer: String(data.answer || ''),
    sources: Array.isArray(data.sources) ? data.sources : [],
    reference_materials: Array.isArray(data.reference_materials) ? data.reference_materials : [],
    related_questions: Array.isArray(data.related_questions) ? data.related_questions.map(String) : [],
    solution_steps: Array.isArray(data.solution_steps) ? data.solution_steps.map(String) : [],
    safety_notice: String(data.safety_notice || ''),
    conversation_id: String(data.conversation_id || ''),
    message_id: data.message_id,
    answer_mode: 'deep',
    task_type: data.task_type,
    diagnosis: data.diagnosis,
    retrieval: data.retrieval,
    timing: data.timing,
  };
}

/**
 * 调用现有知识库的 NDJSON 流式接口。
 * 车诊通端不再暴露模式选择，所有请求固定使用 deep。
 */
export async function streamKnowledgeAnswer(
  payload: StreamPayload,
  handlers: StreamHandlers = {},
): Promise<KnowledgeAnswer> {
  const response = await fetch(`${API_BASE}/search/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      answer_mode: 'deep',
      use_agent: true,
      include_images: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `知识库服务请求失败（HTTP ${response.status}）`);
  }
  if (!response.body) throw new Error('浏览器未收到流式响应');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let finalData: KnowledgeAnswer | null = null;

  const consumeLine = (line: string) => {
    if (!line.trim()) return;
    let event: StreamEvent;
    try {
      event = JSON.parse(line) as StreamEvent;
    } catch {
      return;
    }

    if (event.type === 'status') {
      handlers.onStatus?.({
        stage: String(event.stage || ''),
        progress: Number(event.progress || 0),
        text: String(event.text || ''),
        task_type: event.task_type ? String(event.task_type) : undefined,
      });
    } else if (event.type === 'meta') {
      handlers.onMeta?.(event);
    } else if (event.type === 'delta' && event.text) {
      handlers.onDelta?.(String(event.text));
    } else if (event.type === 'error') {
      throw new Error(String(event.error || event.text || '知识库生成失败'));
    } else if (event.type === 'done' && event.data) {
      finalData = normalizeAnswer(event.data);
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      for (const line of lines) consumeLine(line);
      if (done) break;
    }
    if (buffer.trim()) consumeLine(buffer);
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw new Error(errorMessage(error));
  }

  if (!finalData) throw new Error('知识库响应未完整结束，请重试');
  return finalData;
}

export async function searchKnowledgeBase(
  query: string,
  conversationId: string | undefined,
  handlers: StreamHandlers = {},
  context?: KnowledgeQueryContext,
): Promise<KnowledgeAnswer> {
  const sceneByIntent: Record<string, string> = {
    fault: '修',
    symptom: '修',
    usage: '用',
    maintenance: '养',
    warranty: '保',
  };
  return streamKnowledgeAnswer({
    question: query,
    conversation_id: conversationId,
    intent: context?.intent || 'symptom',
    vehicle_series: context?.vehicleSeries || '',
    scene: sceneByIntent[context?.intent || 'symptom'] || '修',
    answer_target: context?.answerTarget || 'full',
    ...(context?.energyType ? { energy_type: context.energyType } : {}),
  }, handlers);
}

export async function checkDiagnosisInput(
  vin: string,
  fault: string,
): Promise<DiagnosisCheckResponse> {
  if (!vin.trim()) return { valid: false, accompanySymptoms: [], message: '请输入车辆 VIN 或底盘号' };
  if (!fault.trim()) return { valid: false, accompanySymptoms: [], message: '请输入故障现象或故障码' };
  return { valid: true, accompanySymptoms: [] };
}

export async function startDiagnosis(
  vin: string,
  fault: string,
  symptoms: string[],
  handlers: StreamHandlers = {},
): Promise<DiagnosisResult> {
  const symptomText = symptoms.length ? `\n伴随现象：${symptoms.join('、')}` : '';
  const answer = await streamKnowledgeAnswer({
    question: `车辆 ${vin} 出现“${fault}”。请基于知识库进行完整诊断，给出故障含义、可能原因、检查步骤、维修方案和安全注意事项。${symptomText}`,
    vehicle_id: vin,
    intent: 'symptom',
    task_type: /(?:SPN\s*\d+|FMI\s*\d+|\b[PCBU][0-9A-F]{4,7}\b)/i.test(fault)
      ? 'fault_code'
      : 'symptom_diagnosis',
    scene: '修',
    answer_target: 'full',
  }, handlers);

  return { ...answer, vin, fault };
}

export async function submitFeedback(
  result: KnowledgeAnswer,
  rating: 'up' | 'down',
  content = '',
): Promise<void> {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message_id: result.message_id,
      conversation_id: result.conversation_id,
      rating,
      comment: content,
    }),
  });
  if (!response.ok) throw new Error(`反馈提交失败（HTTP ${response.status}）`);
}
