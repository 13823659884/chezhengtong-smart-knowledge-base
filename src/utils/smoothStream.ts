import type { KnowledgeAnswer } from '@/types';

export interface SmoothTextRenderer {
  push: (text: string) => void;
  finish: (finalText?: string) => Promise<void>;
  stop: () => void;
}

/** 将 done 事件中的结构化字段串成连续可播放文本，避免正文结束后整块跳出。 */
export function formatCompleteStreamingAnswer(data: KnowledgeAnswer): string {
  const sections = [data.answer.trim()];
  if (data.solution_steps.length) {
    sections.push(`检查与处理步骤\n${data.solution_steps.map((item, index) => `${index + 1}. ${item}`).join('\n')}`);
  }
  const diagnosis = data.diagnosis;
  if (diagnosis?.checklist?.length || diagnosis?.pending_question) {
    const guide = [
      diagnosis.title || '引导诊断',
      ...(diagnosis.checklist || []).map((item, index) => `${index + 1}. ${item}`),
      diagnosis.pending_question ? `下一步请确认：${diagnosis.pending_question}` : '',
    ].filter(Boolean);
    sections.push(`引导诊断\n${guide.join('\n')}`);
  }
  if (data.safety_notice) sections.push(`安全提示\n${data.safety_notice}`);
  if (data.related_questions.length) {
    sections.push(`相关问题\n${data.related_questions.map((item, index) => `${index + 1}. ${item}`).join('\n')}`);
  }
  return sections.filter(Boolean).join('\n\n');
}

/**
 * 将网络返回的不规则文本块放入缓冲区，以接近桌面端的节奏渐进绘制。
 * 积压较多时会适度追赶，积压较少时逐字输出，避免中途停住后突然整段跳出。
 */
export function createSmoothTextRenderer(onPaint: (text: string) => void): SmoothTextRenderer {
  let shown = '';
  let pending = '';
  let timer = 0;
  let stopped = false;
  let finishing = false;
  let finishResolve: (() => void) | null = null;

  const schedule = () => {
    if (!timer && !stopped) timer = window.setTimeout(paint, 24);
  };

  const paint = () => {
    timer = 0;
    if (stopped) return;
    if (pending) {
      // 保持小步匀速；即使上游一次送达数百字，也不做整段追赶。
      const take = pending.length > 600 ? 4 : pending.length > 240 ? 3 : pending.length > 80 ? 2 : 1;
      shown += pending.slice(0, take);
      pending = pending.slice(take);
      onPaint(shown);
    }
    if (pending) schedule();
    else if (finishing && finishResolve) {
      const resolve = finishResolve;
      finishResolve = null;
      resolve();
    }
  };

  return {
    push(text: string) {
      if (!stopped && text) {
        pending += text;
        schedule();
      }
    },
    finish(finalText = '') {
      finishing = true;
      if (finalText) {
        const current = shown + pending;
        const stableCurrent = current.trimEnd();
        if (finalText.startsWith(shown)) pending = finalText.slice(shown.length);
        else if (stableCurrent && finalText.startsWith(stableCurrent)) {
          // 流式正文有时会比解析后的 answer 多一两个结尾换行；保留已显示
          // 的正文，只从结构化后续部分继续，避免把分析结论从头播放一遍。
          shown = stableCurrent;
          pending = finalText.slice(stableCurrent.length);
          onPaint(shown);
        }
        else if (!current.startsWith(finalText)) {
          let common = 0;
          const limit = Math.min(current.length, finalText.length);
          while (common < limit && current[common] === finalText[common]) common += 1;
          if (common >= 40) {
            shown = finalText.slice(0, common);
            pending = finalText.slice(common);
            onPaint(shown);
          } else {
            shown = '';
            pending = finalText;
          }
        } else {
          pending = finalText.slice(shown.length);
        }
      }
      if (!pending) return Promise.resolve();
      schedule();
      return new Promise<void>(resolve => { finishResolve = resolve; });
    },
    stop() {
      stopped = true;
      if (timer) window.clearTimeout(timer);
      timer = 0;
      finishResolve?.();
      finishResolve = null;
    },
  };
}
