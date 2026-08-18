const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");
const TaskTypeConfig = require("./js/task-types.js");

const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";
const DEFAULT_UPSTAGE_API_URL = "https://api.upstage.ai/v1/chat/completions";
const DEFAULT_OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-5.6-luna";
const DATA_DIR = path.join(ROOT_DIR, "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const TASK_TYPE_LABELS = Object.values(TaskTypeConfig.TASK_TYPES).map(type => type.label).join(" | ");

const resolveTaskType = (payload = {}) => {
  const recommendation = TaskTypeConfig.recommendTaskType(payload);
  return TaskTypeConfig.getTaskType(payload.taskType) || TaskTypeConfig.getTaskType(recommendation.key);
};

const normalizeUpstageApiUrl = (value) => {
  const trimmed = String(value || DEFAULT_UPSTAGE_API_URL).trim().replace(/\/+$/, "");
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed;
  if (/\/v\d+(?:\/solar)?$/i.test(trimmed)) return trimmed + "/chat/completions";
  return trimmed;
};

const normalizeOpenAIApiUrl = (value) => {
  const trimmed = String(value || DEFAULT_OPENAI_API_URL).trim().replace(/\/+$/, "");
  if (/\/responses$/i.test(trimmed)) return trimmed;
  if (/\/v\d+$/i.test(trimmed)) return trimmed + "/responses";
  return trimmed;
};

const resolveAIProvider = () => {
  const configured = String(process.env.AI_PROVIDER || "").trim().toLowerCase();
  if (["openai", "upstage"].includes(configured)) return configured;
  return process.env.OPENAI_API_KEY ? "openai" : "upstage";
};

const UPSTAGE_API_URL = normalizeUpstageApiUrl(process.env.UPSTAGE_API_URL);
const UPSTAGE_MODEL = process.env.UPSTAGE_MODEL || "solar-pro2";
const UPSTAGE_API_KEY = process.env.UPSTAGE_API_KEY || "";
const UPSTAGE_TIMEOUT_MS = Number(process.env.UPSTAGE_TIMEOUT_MS || 120000);
const OPENAI_API_URL = normalizeOpenAIApiUrl(process.env.OPENAI_API_URL);
const OPENAI_MODEL = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_REASONING_EFFORT = process.env.OPENAI_REASONING_EFFORT || "low";
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 120000);
const AI_PROVIDER = resolveAIProvider();
const SDT_REFERENCE = fs.readFileSync(path.join(ROOT_DIR, "docs", "sdt_reference.md"), "utf8");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

const jsonResponse = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
};

const ensureDataFile = (filePath, fallback) => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf8");
};

const readJSONFile = (filePath, fallback) => {
  ensureDataFile(filePath, fallback);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
};

const writeJSONFile = (filePath, data) => {
  ensureDataFile(filePath, Array.isArray(data) ? [] : {});
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const readRequestBody = (req) => new Promise((resolve, reject) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 40_000_000) {
      reject(new Error("Request body is too large."));
      req.destroy();
    }
  });
  req.on("end", () => {
    try {
      resolve(body ? JSON.parse(body) : {});
    } catch {
      reject(new Error("Invalid JSON body."));
    }
  });
  req.on("error", reject);
});

const clean = (value) => String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();

const summarizeUpstageError = (status, rawText) => {
  const fallback = rawText ? rawText.slice(0, 500) : "No response body.";
  try {
    const parsed = JSON.parse(rawText);
    const message = parsed.error?.message || parsed.message || parsed.detail || fallback;
    return "Upstage API error " + status + ": " + message;
  } catch {
    return "Upstage API error " + status + ": " + fallback;
  }
};

const summarizeOpenAIError = (status, rawText) => {
  const fallback = rawText ? rawText.slice(0, 500) : "No response body.";
  try {
    const parsed = JSON.parse(rawText);
    return "OpenAI API error " + status + ": " + (parsed.error?.message || parsed.message || fallback);
  } catch {
    return "OpenAI API error " + status + ": " + fallback;
  }
};

const extractOpenAIText = (data) => {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text;
  for (const output of data?.output || []) {
    for (const content of output?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
};

const buildMetadataBlock = (payload) => {
  const taskType = resolveTaskType(payload);
  const fields = {
    "\uC791\uC5C5 \uC81C\uBAA9": payload.title,
    "\uC644\uB8CC \uBCF4\uC0C1": payload.reward,
    "\uC791\uC5C5 \uC9C0\uCE68/\uC0C1\uC138 \uC124\uBA85": payload.description,
    "\uC815\uC11C\uC801 \uBD80\uB2F4": payload.riskLevel,
    "\uBC18\uBCF5/\uC9D1\uC911 \uBD80\uB2F4": payload.fatigueLevel,
    "\uC791\uC5C5\uC790\uAC00 \uD560 \uC77C": payload.objective,
    "\uC791\uC5C5\uC758 \uC0AC\uD68C\uC801 \uAE30\uC5EC": payload.socialImpact,
    "\uC791\uC5C5\uC790\uAC00 \uACAA\uC744 \uC218 \uC788\uB294 \uC0C1\uD669": payload.workerContext,
    "Task Type": taskType.label,
    "Task Type key": taskType.key,
    "Task Type description": taskType.description,
    "Task Type characteristics": taskType.characteristics.map(item => item.label).join(" · "),
    "Task Type selection reason": payload.taskTypeReason || taskType.recommendationReason,
    "Data type": payload.workload?.dataType,
    "Data complexity": payload.workload?.complexity,
    "Sensitive data": payload.workload?.sensitiveData,
    "Criteria clarity": payload.workload?.criteriaClarity,
    "Subjectivity": payload.workload?.subjectivity,
    "Total data count": payload.workload?.totalCount,
    "Batch size": payload.workload?.batchSize,
    "Repetition count": payload.workload?.repetitionCount,
    "Estimated minutes per item": payload.workload?.itemEstimatedMinutes,
    "Single task time limit": payload.workload?.singleTaskLimitMinutes,
    "Total time limit": payload.workload?.totalTimeLimitMinutes,
    "Break included": payload.workload?.breakIncluded,
    "Worker-adjustable options": (payload.workload?.autonomyOptions || []).join(", ")
  };

  return Object.entries(fields)
    .map(([key, value]) => "- " + key + ": " + (clean(value) || "(\uBBF8\uC785\uB825)"))
    .join("\n");
};

const initialOutputSchema = [
  "{",
  "  \"psychologicalFactors\": {",
  "    \"taskType\": \"emotionally_demanding | high_responsibility | repetitive_cognitive | socially_meaningful | general_low_risk\",",
  "    \"taskTypeLabel\": \"" + TASK_TYPE_LABELS + "\",",
  "    \"taskTypeReason\": \"Requester confirmation and analysis reason\",",
  "    \"taskTypeCharacteristics\": [{ \"key\": \"characteristic_key\", \"label\": \"Characteristic label\" }],",
  "    \"inferredTaskTypes\": [",
  "      { \"type\": \"" + TASK_TYPE_LABELS + "\", \"evidence\": \"metadata evidence\", \"confidence\": 0.0 }",
  "    ],",
  "    \"primaryTaskType\": \"" + TASK_TYPE_LABELS + "\",",
  "    \"primaryPsychologicalType\": \"\uC815\uC11C\uC801\uC73C\uB85C \uBD80\uB2F4\uB418\uB294 \uC791\uC5C5 | \uCC45\uC784\uC774 \uC911\uC694\uD55C \uC791\uC5C5 | \uBC18\uBCF5 \uC778\uC9C0 \uC791\uC5C5 | \uC0AC\uD68C\uC801\uC73C\uB85C \uC758\uBBF8 \uC788\uB294 \uC791\uC5C5 | \uC77C\uBC18 \uC800\uC704\uD5D8 \uC791\uC5C5\",",
  "    \"psychologicalBurdens\": [\"\uC791\uC5C5\uC790\uAC00 \uB290\uB084 \uC218 \uC788\uB294 \uBD80\uB2F4\"],",
  "    \"motivationalFactors\": [\"\uB3D9\uAE30 \uBD80\uC5EC\uC5D0 \uD65C\uC6A9\uD560 \uC218 \uC788\uB294 \uC694\uC778\"],",
  "    \"sdtNeeds\": [\"competence\", \"relatedness\"],",
  "    \"selectedFrames\": [\"Competence\", \"Meaningfulness/Relatedness\"],",
  "    \"frameSelectionReason\": \"\uC791\uC5C5 \uD2B9\uC131\uACFC \uBD80\uB2F4\uC744 \uACE0\uB824\uD574 \uAD00\uACC4\uC131 + \uC720\uB2A5\uAC10 \uC870\uD569\uC774 \uC801\uC808\uD55C \uBB38\uAD6C\uB97C \uB9CC\uB4E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.\",",
  "    \"constraintsApplied\": [\"\uBE44\uC555\uBC15\", \"\uBE44\uACFC\uC7A5\", \"\uAD6C\uCCB4\uC801 \uAE30\uC900 \uC720\uC9C0\"]",
  "  },",
  "  \"beforeOptions\": [",
  "    { \"label\": \"\uC758\uBBF8\uAC10/\uAD00\uACC4\uC131\", \"frame\": \"Meaningfulness / Relatedness\", \"message\": \"\uC644\uACB0\uB41C 5\uBB38\uC7A5\uC758 \uC791\uC5C5 \uC2DC\uC791 \uC804 \uD6C4\uBCF4 \uBB38\uAD6C\" },",
  "    { \"label\": \"\uC720\uB2A5\uAC10/\uD310\uB2E8 \uC2E0\uB8B0\", \"frame\": \"Competence\", \"message\": \"\uC644\uACB0\uB41C 5\uBB38\uC7A5\uC758 \uC791\uC5C5 \uC2DC\uC791 \uC804 \uD6C4\uBCF4 \uBB38\uAD6C\" },",
  "    { \"label\": \"\uC790\uC728\uC131/\uBD80\uB2F4 \uC644\uD654\", \"frame\": \"Autonomy support\", \"message\": \"\uC644\uACB0\uB41C 5\uBB38\uC7A5\uC758 \uC791\uC5C5 \uC2DC\uC791 \uC804 \uD6C4\uBCF4 \uBB38\uAD6C\" }",
  "  ],",
  "  \"afterOptions\": [",
  "    { \"label\": \"\uAC10\uC0AC/\uAD00\uACC4\uC131\", \"frame\": \"Relatedness / Appreciation\", \"message\": \"\uC644\uACB0\uB41C 5\uBB38\uC7A5\uC758 \uC791\uC5C5 \uC644\uB8CC \uD6C4 \uD6C4\uBCF4 \uBB38\uAD6C\" },",
  "    { \"label\": \"\uAE30\uC5EC/\uC720\uB2A5\uAC10\", \"frame\": \"Competence\", \"message\": \"\uC644\uACB0\uB41C 5\uBB38\uC7A5\uC758 \uC791\uC5C5 \uC644\uB8CC \uD6C4 \uD6C4\uBCF4 \uBB38\uAD6C\" },",
  "    { \"label\": \"\uC790\uC728\uC801 \uB9C8\uBB34\uB9AC\", \"frame\": \"Autonomy support\", \"message\": \"\uC644\uACB0\uB41C 5\uBB38\uC7A5\uC758 \uC791\uC5C5 \uC644\uB8CC \uD6C4 \uD6C4\uBCF4 \uBB38\uAD6C\" }",
  "  ],",
  "  \"finalBeforeText\": \"\uD6C4\uBCF4 2\uAC1C\uB97C \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uC885\uD569\uD55C \uCD5C\uC885 \uC791\uC5C5 \uC2DC\uC791 \uC804 \uBB38\uAD6C\",",
  "  \"finalAfterText\": \"\uD6C4\uBCF4 3\uAC1C\uB97C \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uC885\uD569\uD55C \uCD5C\uC885 \uC791\uC5C5 \uC644\uB8CC \uD6C4 \uBB38\uAD6C\",",
  "  \"structuredPromptSummary\": \"\uD504\uB86C\uD504\uD2B8 \uAD6C\uC870 \uC694\uC57D\"",
  "}"
].join("\n");

const buildInitialMessages = (payload) => [
  {
    role: "system",
    content: [
      "\uB2F9\uC2E0\uC740 \uD06C\uB77C\uC6B0\uB4DC\uC18C\uC2F1 \uC791\uC5C5\uC790\uC5D0\uAC8C \uC804\uB2EC\uD560 \uC548\uB0B4 \uBA54\uC2DC\uC9C0\uB97C \uC791\uC131\uD558\uB294 UX \uB77C\uC774\uD130\uC785\uB2C8\uB2E4.",
      "\uC790\uAE30\uACB0\uC815\uC131\uC774\uB860(SDT)\uC758 \uAD00\uACC4\uC131, \uC720\uB2A5\uAC10, \uC790\uC728\uC131\uC744 \uCC38\uACE0\uD558\uB418 \uD654\uBA74\uC5D0 \uC774\uB860 \uC6A9\uC5B4\uB97C \uC9C1\uC811 \uB4DC\uB7EC\uB0B4\uC9C0 \uB9C8\uC138\uC694.",
      "Task Type은 Worker가 경험할 심리적 작업 특성의 상위 분류이며 인터페이스 종류를 뜻하지 않습니다.",
      "Requester가 확정한 Task Type은 " + resolveTaskType(payload).label + "입니다. workload, risk, context와 함께 SDT 우선순위를 분석하세요.",
      "Requester\uAC00 \uC785\uB825\uD55C \uC791\uC5C5 \uC815\uBCF4\uC640 PDF \uAE30\uBC18 \uADDC\uCE59\uC744 \uBC14\uD0D5\uC73C\uB85C \uC791\uC5C5 \uD2B9\uC131\uC744 \uCD94\uB860\uD558\uACE0, \uC791\uC5C5 \uC2DC\uC791 \uC804 \uD6C4\uBCF4 3\uAC1C\uC640 \uC791\uC5C5 \uC644\uB8CC \uD6C4 \uD6C4\uBCF4 3\uAC1C\uB97C \uB9CC\uB4DC\uC138\uC694.",
      "\uD6C4\uBCF4 \uBB38\uAD6C\uB294 \uAC01\uAC01 \uD55C\uAD6D\uC5B4 5\uBB38\uC7A5\uC73C\uB85C \uC791\uC131\uD558\uACE0, \uC8C4\uCC45\uAC10\u00B7\uC555\uBC15\u00B7\uACFC\uC7A5\u00B7\uD64D\uBCF4\uC131 \uD45C\uD604\uC744 \uD53C\uD558\uC138\uC694.",
      "beforeOptions와 afterOptions의 각 후보 message는 반드시 서로 자연스럽게 이어지는 완결된 한국어 5문장으로 작성하세요. 짧은 구절을 마침표로 나누어 문장 수만 맞추지 마세요.",
      "최종 작업 시작 전 문구는 selectedFrames에 선택된 핵심 후보만 우선순위대로 자연스럽게 종합하세요. 선택되지 않은 프레임을 기계적으로 추가하지 마세요.",
      "\uC0AC\uC6A9\uC790 \uC785\uB825\uAC12\uC774 \uC77C\uBC18\uC801\uC778 \uBC94\uC704\uB97C \uBC97\uC5B4\uB098\uB354\uB77C\uB3C4 \uC784\uC758\uB85C \uC911\uAC04\uAC12\uC73C\uB85C \uC870\uC815\uD558\uC9C0 \uB9C8\uC138\uC694. \uC2DC\uAC04, \uB370\uC774\uD130 \uC591, \uB09C\uC774\uB3C4 \uAC04 \uCDA9\uB3CC\uC774\uB098 \uD604\uC2E4\uC801 \uC218\uD589 \uBD88\uAC00\uB2A5\uC131\uC774 \uC788\uC73C\uBA74 \uC774\uC720, \uACBD\uACE0, \uB300\uC548\uC744 \uBA85\uD655\uD788 \uC81C\uC2DC\uD558\uC138\uC694.",
      "\uCD5C\uC885 \uC791\uC5C5 \uC644\uB8CC \uD6C4 \uBB38\uAD6C\uB294 \uBC29\uAE08 \uC644\uB8CC\uD55C \uC791\uC5C5\uC5D0 \uB300\uD55C \uAC10\uC0AC\uC640 \uACB0\uACFC \uD65C\uC6A9 \uB9E5\uB77D\uB9CC \uCC28\uBD84\uD558\uAC8C \uB2F4\uACE0, \uCD94\uAC00 \uCC38\uC5EC\uB97C \uAD8C\uC720\uD558\uC9C0 \uB9C8\uC138\uC694.",
      "\uC791\uC5C5\uC790\uC5D0\uAC8C \uC9C1\uC811 \uB9D0\uD558\uB294 \uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uC874\uB313\uB9D0\uC744 \uC0AC\uC6A9\uD558\uC138\uC694. \uBCF4\uACE0\uC11C\uCCB4, \uC778\uC99D\uC11C\uCCB4, \uACFC\uC7A5\uB41C \uACF5\uC775 \uBB38\uAD6C\uB294 \uD53C\uD558\uC138\uC694.",
      "finalBeforeText\uB294 \uBC18\uB4DC\uC2DC \uB2E4\uC74C \uBB38\uC7A5\uC73C\uB85C \uC2DC\uC791\uD558\uC138\uC694: \uC548\uB155\uD558\uC138\uC694, \"\uC791\uC5C5 \uC81C\uBAA9\" \uC791\uC5C5\uC5D0 \uCC38\uC5EC\uD574 \uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4.",
      "\uBC18\uB4DC\uC2DC JSON \uAC1D\uCCB4\uB9CC \uBC18\uD658\uD558\uC138\uC694. Markdown \uCF54\uB4DC\uBE14\uB85D, \uC124\uBA85\uBB38, \uC8FC\uC11D\uC740 \uD3EC\uD568\uD558\uC9C0 \uB9C8\uC138\uC694."
    ].join("\n")
  },
  {
    role: "user",
    content: [
      "[PDF \uAE30\uBC18 \uADDC\uCE59]",
      SDT_REFERENCE,
      "",
      "[Requester \uC785\uB825 \uBA54\uD0C0\uB370\uC774\uD130]",
      buildMetadataBlock(payload),
      "",
      "[\uC791\uC131 \uADDC\uCE59]",
      "1. \uC791\uC5C5 \uBA54\uD0C0\uB370\uC774\uD130\uC5D0\uC11C \uC791\uC5C5 \uC720\uD615, \uBD80\uB2F4, \uB3D9\uAE30 \uC694\uC778, SDT \uC695\uAD6C\uB97C \uBA3C\uC800 \uCD94\uB860\uD558\uC138\uC694.",
      "2. Requester가 확정한 Task Type을 유지하고, workload·risk·context·심리 부담을 함께 분석하여 핵심 SDT 프레임을 선택하세요.",
      "3. selectedFrames는 대표 작업 유형의 우선순위를 보존한 2개의 핵심 프레임을 반환하세요. 세 요소를 기계적으로 모두 선택하지 마세요.",
      "4. \uC791\uC5C5 \uC2DC\uC791 \uC804 \uD6C4\uBCF4 3\uAC1C\uB294 \uAC01\uAC01 \uC758\uBBF8\uAC10/\uAD00\uACC4\uC131, \uC720\uB2A5\uAC10, \uC790\uC728\uC131/\uBD80\uB2F4 \uC644\uD654\uB97C \uBD84\uBA85\uD788 \uBC18\uC601\uD558\uC138\uC694.",
      "5. \uC791\uC5C5 \uC644\uB8CC \uD6C4 \uD6C4\uBCF4 3\uAC1C\uB294 \uAC10\uC0AC, \uAE30\uC5EC, \uC790\uC728\uC801 \uB9C8\uBB34\uB9AC \uAD00\uC810\uC744 \uCC28\uBD84\uD558\uAC8C \uBC18\uC601\uD558\uC138\uC694.",
      "5-1. 작업 시작 전 후보 3개와 작업 완료 후 후보 3개는 각각 정확히 5개의 완결된 문장으로 작성하세요.",
      "6. \uCD5C\uC885 \uBB38\uAD6C\uC5D0\uB294 \uC791\uC5C5\uC790\uAC00 \uC2E4\uC81C\uB85C \uB530\uB77C \uD560 \uC218 \uC788\uB294 \uAE30\uC900\uACFC \uC548\uC2EC\uAC10\uC744 \uB2F4\uB418, \uC131\uACFC\uB97C \uACFC\uC7A5\uD558\uC9C0 \uB9C8\uC138\uC694.",
      "7. finalAfterText\uB294 \uC644\uB8CC\uB41C \uC791\uC5C5\uC5D0 \uB300\uD55C \uAC10\uC0AC\uB85C \uB9C8\uBB34\uB9AC\uD558\uC138\uC694.",
      "8. finalBeforeText\uC758 \uCCAB \uBB38\uC7A5\uC740 \uBC18\uB4DC\uC2DC \uB2E4\uC74C \uBB38\uC7A5\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4: \uC548\uB155\uD558\uC138\uC694, \"" + clean(payload.title) + "\" \uC791\uC5C5\uC5D0 \uCC38\uC5EC\uD574 \uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4.",
      "",
      "[\uCD9C\uB825 JSON \uC2A4\uD0A4\uB9C8]",
      initialOutputSchema
    ].join("\n")
  }
];

const callUpstage = async (messages, temperature = 0.35, maxTokens = 3200) => {
  if (!UPSTAGE_API_KEY) {
    throw new Error("UPSTAGE_API_KEY environment variable is not set.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTAGE_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(UPSTAGE_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: "Bearer " + UPSTAGE_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: UPSTAGE_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Upstage API timed out after " + Math.round(UPSTAGE_TIMEOUT_MS / 1000) + " seconds.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(summarizeUpstageError(response.status, rawText));
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("Upstage API returned a non-JSON transport response.");
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Upstage API response did not include message content.");
  }

  return {
    content,
    usage: data.usage || null,
    model: data.model || UPSTAGE_MODEL
  };
};

const callOpenAI = async (messages, maxTokens = 5000) => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(OPENAI_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: messages,
        max_output_tokens: maxTokens,
        reasoning: { effort: OPENAI_REASONING_EFFORT }
      })
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("OpenAI API timed out after " + Math.round(OPENAI_TIMEOUT_MS / 1000) + " seconds.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const rawText = await response.text();
  if (!response.ok) throw new Error(summarizeOpenAIError(response.status, rawText));

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("OpenAI API returned a non-JSON transport response.");
  }

  const content = extractOpenAIText(data);
  if (!content) throw new Error("OpenAI API response did not include output text.");

  return {
    content,
    usage: data.usage || null,
    model: data.model || OPENAI_MODEL
  };
};

const callAI = (messages) => AI_PROVIDER === "openai"
  ? callOpenAI(messages)
  : callUpstage(messages);

const parseModelJson = (content) => {
  const trimmed = String(content || "").trim();
  const fenced = trimmed.match(/\x60\x60\x60(?:json)?\s*([\s\S]*?)\s*\x60\x60\x60/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("Could not parse model response as JSON.");
  }
};

const normalizeMessageText = (message) => String(message || "")
  .replace(/\s+/g, " ")
  .replace(/\s+([.!?\u3002])/g, "$1")
  .trim();

const stripDuplicateOpening = (message) => normalizeMessageText(message)
  .replace(/^\uC548\uB155\uD558\uC138\uC694,\s*["\u201C][^"\u201D]+["\u201D]\s*\uC791\uC5C5\uC5D0\s*\uCC38\uC5EC\uD574\s*\uC8FC\uC154\uC11C\s*\uAC10\uC0AC\uD569\uB2C8\uB2E4[.!]?\s*/i, "")
  .replace(/^\uCC38\uC5EC\uD574\s*\uC8FC\uC154\uC11C\s*\uAC10\uC0AC\uD569\uB2C8\uB2E4[.!]?\s*/i, "");

const ensureBeforeOpening = (message, title) => {
  const opening = "\uC548\uB155\uD558\uC138\uC694, \"" + clean(title) + "\" \uC791\uC5C5\uC5D0 \uCC38\uC5EC\uD574 \uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4.";
  const body = stripDuplicateOpening(message);
  return normalizeMessageText(opening + " " + body);
};

const normalizeOption = (option, title, phase) => {
  if (typeof option === "string") {
    return phase === "before" ? ensureBeforeOpening(option, title) : normalizeMessageText(option);
  }

  const message = phase === "before"
    ? ensureBeforeOpening(option?.message || option?.text || "", title)
    : normalizeMessageText(option?.message || option?.text || "");

  return {
    ...option,
    message
  };
};

const softenWorkerMessages = (payload) => {
  const next = { ...payload };
  const title = next.requestTitle || "";

  if (next.finalBeforeText) next.finalBeforeText = ensureBeforeOpening(next.finalBeforeText, title);
  if (next.finalAfterText) next.finalAfterText = normalizeMessageText(next.finalAfterText);
  if (Array.isArray(next.beforeOptions)) {
    next.beforeOptions = next.beforeOptions.map(option => normalizeOption(option, title, "before"));
  }
  if (Array.isArray(next.afterOptions)) {
    next.afterOptions = next.afterOptions.map(option => normalizeOption(option, title, "after"));
  }

  return next;
};

const handleGenerate = async (req, res) => {
  try {
    const payload = await readRequestBody(req);
    if (!clean(payload.title) || !clean(payload.description)) {
      jsonResponse(res, 400, { error: "title and description are required." });
      return;
    }

    const completion = await callAI(buildInitialMessages(payload));
    const parsed = softenWorkerMessages({
      ...parseModelJson(completion.content),
      requestTitle: payload.title
    });
    delete parsed.requestTitle;

    jsonResponse(res, 200, {
      provider: AI_PROVIDER,
      model: completion.model,
      usage: completion.usage,
      ...parsed
    });
  } catch (error) {
    jsonResponse(res, 502, { error: error.message });
  }
};

const handleSaveTask = async (req, res) => {
  try {
    const payload = await readRequestBody(req);
    const task = payload.task || payload;
    if (!task || !task.id) {
      jsonResponse(res, 400, { error: "Task id is required." });
      return;
    }
    const tasks = readJSONFile(TASKS_FILE, {});
    tasks[task.id] = {
      ...task,
      savedAt: new Date().toISOString()
    };
    writeJSONFile(TASKS_FILE, tasks);
    jsonResponse(res, 200, { ok: true, task: tasks[task.id] });
  } catch (error) {
    jsonResponse(res, 500, { error: error.message });
  }
};

const handleGetTask = (req, res, taskId) => {
  const tasks = readJSONFile(TASKS_FILE, {});
  const task = tasks[taskId];
  if (!task) {
    jsonResponse(res, 404, { error: "Task not found." });
    return;
  }
  jsonResponse(res, 200, { task });
};

const handleSaveResult = async (req, res) => {
  try {
    const payload = await readRequestBody(req);
    const record = payload.record || payload;
    const results = readJSONFile(RESULTS_FILE, []);
    results.push({
      ...record,
      savedAt: new Date().toISOString()
    });
    writeJSONFile(RESULTS_FILE, results);
    jsonResponse(res, 200, { ok: true });
  } catch (error) {
    jsonResponse(res, 500, { error: error.message });
  }
};

const handleGetResults = (res) => {
  const results = readJSONFile(RESULTS_FILE, []);
  jsonResponse(res, 200, { results });
};

const normalizeSessionRecord = (existing = {}, incoming = {}) => {
  const session = { ...existing, ...incoming };
  const attemptedItems = Math.max(0, Number(session.attemptedItems || 0));
  const scoredItems = session.scoredItems == null ? attemptedItems : Math.max(0, Number(session.scoredItems || 0));
  const correctItems = Math.max(0, Number(session.correctItems || 0));
  const startedAt = session.startedAt || session.taskStartedAt || null;
  const startMs = Date.parse(startedAt || "");
  const endMs = Date.parse(session.completedAt || "");
  const validStatuses = new Set(["opened", "started", "completed", "abandoned"]);
  session.status = validStatuses.has(session.status) ? session.status : "opened";
  session.attemptedItems = attemptedItems;
  session.scoredItems = scoredItems;
  session.correctItems = correctItems;
  session.taskAccuracy = scoredItems ? correctItems / scoredItems : null;
  session.taskAccuracyPercent = scoredItems ? (correctItems / scoredItems) * 100 : null;
  session.completionTimeMs = Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs ? endMs - startMs : null;
  session.completionTimeSeconds = session.completionTimeMs === null ? null : session.completionTimeMs / 1000;
  session.updatedAt = new Date().toISOString();
  return session;
};

const calculateSessionMetrics = (sessions = []) => {
  const started = sessions.filter(session => session.startedAt || session.taskStartedAt || ["started", "completed", "abandoned"].includes(session.status));
  const completed = started.filter(session => session.status === "completed");
  const attemptedItems = started.reduce((sum, session) => sum + Number(session.attemptedItems || 0), 0);
  const scoredItems = started.reduce((sum, session) => sum + Number(session.scoredItems ?? session.attemptedItems ?? 0), 0);
  const correctItems = started.reduce((sum, session) => sum + Number(session.correctItems || 0), 0);
  const completionTimes = completed.map(session => Number(session.completionTimeMs)).filter(Number.isFinite);
  const dropoutSessions = started.length - completed.length;
  return {
    startedSessions: started.length,
    completedSessions: completed.length,
    dropoutSessions,
    dropoutRate: started.length ? dropoutSessions / started.length : null,
    attemptedItems,
    scoredItems,
    correctItems,
    taskAccuracy: scoredItems ? correctItems / scoredItems : null,
    averageCompletionTimeMs: completionTimes.length ? completionTimes.reduce((sum, value) => sum + value, 0) / completionTimes.length : null
  };
};

const handleCreateSession = async (req, res) => {
  try {
    const payload = await readRequestBody(req);
    const incoming = payload.session || payload;
    if (!incoming?.sessionId) return jsonResponse(res, 400, { error: "sessionId is required." });
    const sessions = readJSONFile(SESSIONS_FILE, []);
    const index = sessions.findIndex(session => session.sessionId === incoming.sessionId);
    const record = normalizeSessionRecord(index >= 0 ? sessions[index] : {}, incoming);
    if (index >= 0) sessions[index] = record;
    else sessions.push(record);
    writeJSONFile(SESSIONS_FILE, sessions);
    return jsonResponse(res, 200, { ok: true, session: record });
  } catch (error) {
    return jsonResponse(res, 500, { error: error.message });
  }
};

const handleUpdateSession = async (req, res, sessionId) => {
  try {
    const payload = await readRequestBody(req);
    const incoming = payload.session || payload;
    if (!sessionId || !incoming?.sessionId || incoming.sessionId !== sessionId) {
      return jsonResponse(res, 400, { error: "A matching sessionId is required." });
    }
    const sessions = readJSONFile(SESSIONS_FILE, []);
    const index = sessions.findIndex(session => session.sessionId === sessionId);
    const record = normalizeSessionRecord(index >= 0 ? sessions[index] : {}, incoming);
    if (index >= 0) sessions[index] = record;
    else sessions.push(record);
    writeJSONFile(SESSIONS_FILE, sessions);
    return jsonResponse(res, 200, { ok: true, session: record });
  } catch (error) {
    return jsonResponse(res, 500, { error: error.message });
  }
};

const handleGetSessions = (res, taskId = "") => {
  const sessions = readJSONFile(SESSIONS_FILE, []);
  const filtered = taskId ? sessions.filter(session => session.taskId === taskId) : sessions;
  jsonResponse(res, 200, { sessions: filtered, metrics: calculateSessionMetrics(filtered) });
};

const serveStatic = (req, res, pathname) => {
  const relativePath = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
  const filePath = path.normalize(path.join(ROOT_DIR, relativePath));
  const rootWithSep = ROOT_DIR.endsWith(path.sep) ? ROOT_DIR : ROOT_DIR + path.sep;

  if (!(filePath === ROOT_DIR || filePath.startsWith(rootWithSep))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });
    res.end(data);
  });
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, "http://" + (req.headers.host || "localhost"));

  if (req.method === "GET" && requestUrl.pathname === "/api/health") {
    jsonResponse(res, 200, {
      ok: true,
      provider: AI_PROVIDER,
      hasApiKey: AI_PROVIDER === "openai" ? Boolean(OPENAI_API_KEY) : Boolean(UPSTAGE_API_KEY),
      model: AI_PROVIDER === "openai" ? OPENAI_MODEL : UPSTAGE_MODEL,
      endpoint: AI_PROVIDER === "openai" ? OPENAI_API_URL : UPSTAGE_API_URL,
      timeoutMs: AI_PROVIDER === "openai" ? OPENAI_TIMEOUT_MS : UPSTAGE_TIMEOUT_MS
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/generate-motivation") {
    await handleGenerate(req, res);
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/tasks") {
    await handleSaveTask(req, res);
    return;
  }

  if (req.method === "GET" && requestUrl.pathname.startsWith("/api/tasks/")) {
    const taskId = decodeURIComponent(requestUrl.pathname.replace("/api/tasks/", ""));
    handleGetTask(req, res, taskId);
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/results") {
    await handleSaveResult(req, res);
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/results") {
    handleGetResults(res);
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/sessions") {
    await handleCreateSession(req, res);
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/sessions") {
    handleGetSessions(res, requestUrl.searchParams.get("taskId") || "");
    return;
  }

  if (["PATCH", "POST"].includes(req.method) && requestUrl.pathname.startsWith("/api/sessions/")) {
    const sessionId = decodeURIComponent(requestUrl.pathname.replace("/api/sessions/", ""));
    await handleUpdateSession(req, res, sessionId);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res, requestUrl.pathname);
    return;
  }

  jsonResponse(res, 405, { error: "Method not allowed." });
});

server.listen(PORT, HOST, () => {
  console.log("AgenticMotivation server running at http://" + HOST + ":" + PORT);
  console.log("AI provider: " + AI_PROVIDER);
  console.log("AI model: " + (AI_PROVIDER === "openai" ? OPENAI_MODEL : UPSTAGE_MODEL));
  console.log("AI endpoint: " + (AI_PROVIDER === "openai" ? OPENAI_API_URL : UPSTAGE_API_URL));
  console.log("AI API key loaded: " + ((AI_PROVIDER === "openai" ? OPENAI_API_KEY : UPSTAGE_API_KEY) ? "yes" : "no"));
});
