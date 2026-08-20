// ===== 知识库问答 =====

export interface KnowledgeSource {
  file_name: string;
  relative_path?: string;
  source_locator?: string;
  excerpt?: string;
  document_url?: string;
  file_url?: string;
  score?: number;
}

export interface KnowledgeAnswer {
  answer: string;
  sources: KnowledgeSource[];
  reference_materials?: KnowledgeSource[];
  related_questions: string[];
  solution_steps: string[];
  safety_notice: string;
  conversation_id: string;
  message_id?: number;
  answer_mode: 'deep';
  task_type?: string;
  diagnosis?: KnowledgeDiagnosis;
  retrieval?: {
    task_type?: string;
    method?: string;
    source_count?: number;
    exact_fault_match_count?: number;
    scope?: string;
  };
  timing?: {
    retrieval_ms?: number;
    first_token_ms?: number;
    total_ms?: number;
    cache_hit?: boolean;
  };
}

export interface KnowledgeDiagnosis {
  enabled?: boolean;
  title?: string;
  evidence_status?: string;
  safety_level?: string;
  checklist?: string[];
  next_questions?: string[];
  pending_question?: string;
  reply_options?: string[];
  context_applied?: boolean;
  scope?: string;
}

export interface KnowledgeStreamStatus {
  stage: string;
  progress: number;
  text: string;
  task_type?: string;
}

// ===== 诊断相关类型 =====

export interface DiagnosisResult extends KnowledgeAnswer {
  vin: string;
  fault: string;
}

export interface DiagnosisRecord {
  id: string;
  vin: string;
  fault: string;
  result: DiagnosisResult;
  timestamp: number;
}

export interface DiagnosisCheckResponse {
  valid: boolean;
  accompanySymptoms: string[];
  message?: string;
}

// ===== 用户相关类型 =====

export interface UserInfo {
  name: string;
  station: string;
  rating: number;
  phone: string;
  role: string;
}

// ===== 文件知识库相关类型 =====

export interface KnowledgeCategory {
  name: string;
  count: number;
  files: KnowledgeFile[];
}

export interface KnowledgeFile {
  name: string;
  ext: string;
  size: number;
}
