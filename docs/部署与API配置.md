# 部署与API配置

## 1. 架构关系

```text
车诊通 React 前端
        │  /api/search/stream
        ▼
智能知识库后端（默认8009端口）
        ├─ SQLite：文档、切片、VIN、故障码、历史记录
        ├─ Qdrant：文本/多模态知识向量
        ├─ 豆包向量模型：问题向量化
        └─ 深度模型：基于检索证据生成答案
```

前端不直接调用火山方舟，也不需要持有模型Key。

## 2. 前端开发环境

复制配置文件：

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

默认配置：

```dotenv
VITE_API_BASE=/api
VITE_KB_PROXY_TARGET=http://127.0.0.1:8009
```

`vite.config.ts` 会将 `/api` 请求代理到 `VITE_KB_PROXY_TARGET`。

## 3. 知识库后端模型配置

以下变量应配置在后端 `.env`，示例只提供占位符：

```dotenv
# 深度生成模型
ARK_DEEP_API_KEY=<填写深度模型API Key>
ARK_DEEP_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_DEEP_MODEL=<填写模型接入点或模型名称>
ARK_DEEP_USE_FAST=0

# 如果后端仍保留快速通道，可配置；车诊通前端不会请求fast模式
ARK_FAST_API_KEY=<填写快速模型API Key>
ARK_FAST_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_FAST_MODEL=<填写模型接入点或模型名称>

# 豆包多模态向量模型
DOUBAO_EMBEDDING_API_KEY=<填写向量模型API Key>
DOUBAO_EMBEDDING_URL=https://ark.cn-beijing.volces.com/api/plan/v3/embeddings/multimodal
DOUBAO_EMBEDDING_MODEL=doubao-embedding-vision-250615
DOUBAO_EMBEDDING_DIMENSIONS=2048
```

真实密钥请使用单独加密渠道发送，不能提交到GitHub。本机交付目录会额外生成 `同事交付_API配置_含密钥.md`，该文件已被 `.gitignore` 排除。

## 4. 深度问答请求

请求：

```http
POST /api/search/stream
Content-Type: application/json
```

示例：

```json
{
  "question": "JH6车辆动力不足怎么检查和处理？",
  "intent": "symptom",
  "task_type": "symptom_diagnosis",
  "vehicle_series": "JH6",
  "scene": "修",
  "answer_target": "full",
  "answer_mode": "deep",
  "use_agent": true,
  "include_images": false
}
```

响应格式为逐行JSON（NDJSON）：

- `status`：分类、检索、证据和生成进度。
- `meta`：会话、检索数量和耗时。
- `delta`：分析结论的流式正文。
- `done`：完整答案、处理步骤、诊断引导、相关问题、安全提示和全部资料链接。
- `error`：请求失败原因。

## 5. 生产环境Nginx示例

```nginx
server {
    listen 80;
    server_name example.internal;
    root /opt/chezhengtong/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8009/api/;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_read_timeout 180s;
    }
}
```

必须关闭 `/api/search/stream` 的代理缓冲，否则浏览器会在生成结束后一次性收到全部文字，失去流式效果。

## 6. 验证方法

1. 打开 `http://后端地址/api/health`，确认 `status` 为 `ok`。
2. 确认 `retrieval.qdrant.ready` 为 `true`。
3. 打开 `/smart-repair`，输入 `SPN647是什么故障？`。
4. 确认页面先显示分类确认，再流式输出完整回答。
5. 展开参考资料，确认【资料x】和“定位原文”均可打开对应PDF页。

