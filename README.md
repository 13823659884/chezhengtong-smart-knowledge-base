# 车诊通智能维修知识库与智能诊断前端

本项目是车诊通 React 前端的知识库接入版本，仅改造以下两个能力：

- **智能维修知识库**：问题分类确认、深度模型流式问答、连续追问、完整资料引用和PDF页码定位。
- **智能诊断**：输入 VIN/底盘号和故障码或故障现象，输出分析结论、处理步骤、引导诊断、安全提示及相关问题。

其他车诊通页面保持原有实现。模型密钥、向量模型和知识库数据均由后端管理，浏览器端不保存任何API Key。

## 技术栈

- React 18
- TypeScript
- Vite 5
- Tailwind CSS
- Zustand
- React Router

## 运行要求

- Node.js 18 或更高版本
- npm 9 或更高版本
- 已启动的智能知识库后端，默认地址为 `http://127.0.0.1:8009`

## 本地启动

```bash
npm install
copy .env.example .env.local
npm run dev
```

访问：

- 智能维修知识库：`http://127.0.0.1:3000/smart-repair`
- 智能诊断：`http://127.0.0.1:3000/smart-diagnosis`

## 前端配置

`.env.local`：

```dotenv
VITE_API_BASE=/api
VITE_KB_PROXY_TARGET=http://127.0.0.1:8009
```

- `VITE_API_BASE`：浏览器调用的API前缀。
- `VITE_KB_PROXY_TARGET`：Vite开发服务器代理的知识库后端地址。
- 修改环境变量后需要重启 `npm run dev`。

## 后端接口要求

前端依赖以下接口：

| 接口 | 方法 | 用途 |
|---|---|---|
| `/api/health` | GET | 检查知识库、Qdrant和模型状态 |
| `/api/search/stream` | POST | NDJSON流式检索与深度回答 |
| `/api/source/file` | GET | 打开原始资料并定位PDF页码 |
| `/api/feedback` | POST | 保存用户评价 |
| `/api/vin` | GET | 查询VIN车辆信息 |

所有知识问答请求固定发送：

```json
{
  "answer_mode": "deep",
  "use_agent": true,
  "include_images": false
}
```

详细配置见 [docs/部署与API配置.md](docs/部署与API配置.md)。

## 生产构建

```bash
npm run build
```

构建产物位于 `dist/`。生产环境建议让 Nginx 将 `/api/` 转发到知识库后端，并将其他路径回退到 `index.html`。

## 安全要求

- 禁止将真实API Key写入 React 源码或任何 `VITE_` 环境变量。
- 禁止提交后端 `.env`、本地知识库、Qdrant目录和含真实密钥的交付文件。
- 如密钥曾进入Git历史，应立即在模型平台作废并重新生成。

