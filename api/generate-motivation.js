const DEFAULT_UPSTAGE_API_URL = "https://api.upstage.ai/v1/chat/completions";
const DEFAULT_OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-5.6-luna";
const TaskTypeConfig = require("../public/js/task-types.js");

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

const clean = (value) => String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();

const json = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const summarizeUpstageError = (status, rawText) => {
  const fallback = rawText ? rawText.slice(0, 500) : "No response body.";
  try {
    const parsed = JSON.parse(rawText);
    return `Upstage API error ${status}: ${parsed.error?.message || parsed.message || parsed.detail || fallback}`;
  } catch {
    return `Upstage API error ${status}: ${fallback}`;
  }
};

const summarizeOpenAIError = (status, rawText) => {
  const fallback = rawText ? rawText.slice(0, 500) : "No response body.";
  try {
    const parsed = JSON.parse(rawText);
    return `OpenAI API error ${status}: ${parsed.error?.message || parsed.message || fallback}`;
  } catch {
    return `OpenAI API error ${status}: ${fallback}`;
  }
};

const extractOpenAIText = (transport) => {
  if (typeof transport?.output_text === "string" && transport.output_text.trim()) {
    return transport.output_text;
  }
  for (const output of transport?.output || []) {
    for (const content of output?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
};

const resolveGenerationSelection = (payload) => {
  const taskType = TaskTypeConfig.getTaskType(payload.taskType)
    || TaskTypeConfig.TASK_TYPES[TaskTypeConfig.DEFAULT_TASK_TYPE];
  const sdtAnalysis = TaskTypeConfig.analyzeSDTNeeds({ ...payload, taskType: taskType.key });
  const surveySelection = TaskTypeConfig.getStrategySelection(taskType.key);
  const selectedFrames = sdtAnalysis.frames.slice(0, 2);
  return {
    taskType,
    sdtAnalysis,
    surveySelection,
    selectedFrames,
    coreStrategy: selectedFrames[0] || "",
    supportingStrategy: selectedFrames[1] || ""
  };
};

const buildMessages = (payload) => {
  const {
    taskType,
    selectedFrames,
    coreStrategy,
    supportingStrategy,
    surveySelection
  } = resolveGenerationSelection(payload);
  return [
  {
    role: "system",
    content: [
      "당신은 크라우드소싱 작업자에게 전달할 한국어 안내 메시지를 작성하는 UX 라이터입니다.",
      "Task Type에 고정 매핑된 Autonomy, Competence, Relatedness 전략을 사용하되 Worker용 문장에는 전략 이름을 직접 드러내지 마세요.",
      "작업 시작 전 후보 3개, 작업 완료 후 후보 3개, 최종 작업 전/후 문구를 JSON으로만 반환하세요.",
      "beforeOptions와 afterOptions의 각 후보 및 finalBeforeText와 finalAfterText는 반드시 서로 자연스럽게 이어지는 완결된 한국어 4~5문장으로 작성하세요.",
      "3문장 이하 또는 6문장 이상은 허용하지 않으며, 짧은 구절을 마침표로 나누거나 같은 의미를 반복해 문장 수만 맞추지 마세요.",
      "문구는 과장, 압박, 죄책감, 홍보성 표현 없이 차분하고 구체적으로 작성하세요.",
      "후보군에는 Relatedness, Competence, Autonomy 관점을 각각 포함하세요.",
      "finalBeforeText와 finalAfterText에는 아래 Core와 Supporting을 모두 자연스럽게 반영하세요.",
      "Core는 두 최종 메시지의 중심 전략이며, Supporting은 Core를 보완하는 전략입니다. 두 요소를 같은 비중으로 나열하지 마세요.",
      "전략별 고정 키워드를 끼워 넣지 말고, 각 요소의 의미가 문장 전체의 메시지 전략에 드러나게 하세요.",
      `Core strategy (중심 전략): ${coreStrategy}`,
      `Supporting strategy (보완 전략): ${supportingStrategy}`,
      `Survey evidence (N=${TaskTypeConfig.SURVEY_SAMPLE_SIZE}): Core ${coreStrategy} ${surveySelection.corePercentage.toFixed(1)}%, Supporting ${supportingStrategy} ${surveySelection.supportingPercentage.toFixed(1)}%.`,
      "Message length evidence: Medium was preferred by 66.7% (80/120), so both final messages use 4–5 sentences.",
      "selectedFrames는 위 두 값을 같은 순서로 정확히 반환하고 다른 프레임으로 바꾸지 마세요.",
      `확정된 Task Type은 ${taskType.label}입니다. 이는 Worker의 작업 경험 분류이며 인터페이스 종류를 뜻하지 않습니다.`,
      `Figure 기반 고정 전략 우선순위는 ${selectedFrames.join(" + ")}입니다.`,
      "Post-task에는 완료 acknowledgment, 시간이나 노력에 대한 감사, Task Type에 맞는 구체적이고 과장 없는 기여 의미를 모두 포함하세요.",
      "Post-task는 Core + Supporting + 공통적인 감사·기여 구조로 작성하되, 공통 감사가 Core/Supporting 우선순위를 바꾸지 않게 하세요.",
      "JSON을 반환하기 전에 Pre-task와 Post-task 각각을 자체 점검하세요: 완전한 4~5문장, Task Type 일치, Core 중심성, Supporting 보완성, Core > Supporting 비중, 반복 없음, 내부 전략명 비노출, 시점에 맞는 내용. Post-task는 완료 acknowledgment, 시간·노력 감사, Task Type별 기여 의미, 과장 없는 기여 주장도 확인하세요.",
      "어느 조건이라도 맞지 않으면 내부적으로 문장을 수정한 뒤, 수정이 끝난 JSON만 반환하세요.",
      "finalBeforeText는 반드시 다음 문장으로 시작하세요: 안녕하세요, \"" + clean(payload.title) + "\" 작업에 참여해 주셔서 감사합니다."
    ].join("\n")
  },
  {
    role: "user",
    content: [
      "[작업 정보]",
      `작업 제목: ${clean(payload.title)}`,
      `Task Type: ${taskType.label} (${taskType.key})`,
      `Task Type 설명: ${taskType.description}`,
      `Task Type 특성: ${taskType.characteristics.map(item => item.label).join(" · ")}`,
      `Task Type 선택 기준: ${taskType.mappingReason}`,
      `완료 보상: ${clean(payload.reward)}`,
      `작업 지침: ${clean(payload.description)}`,
      `정서적 부담: ${clean(payload.riskLevel)}`,
      `반복/집중 부담: ${clean(payload.fatigueLevel)}`,
      `작업자가 할 일: ${clean(payload.objective)}`,
      `작업의 사회적 기여: ${clean(payload.socialImpact)}`,
      `작업자가 겪을 수 있는 상황: ${clean(payload.workerContext)}`,
      `단일 작업 제한 시간: ${clean(payload.timeLimitMinutes)}분`,
      "",
      "[최종 메시지 설계 기준]",
      `Core strategy: ${coreStrategy}`,
      `Supporting strategy: ${supportingStrategy}`,
      "Pre-task와 Post-task 최종 메시지 모두 Core를 중심으로 전개하고 Supporting을 보완적으로 반영하세요.",
      "Post-task에는 Task Type에 맞는 기여 의미를 구체적으로 설명하세요: Annotation/Classification=정확성·품질·신뢰성, Data Collection/Creation=향후 분석·콘텐츠 구축 자료, Search/Verification=정보 정확성·신뢰성, Evaluation/Comparison=평가·의사결정, Content Moderation=안전하고 신뢰할 수 있는 환경, Surveys/Experiments=연구 결과·사용자 이해.",
      "",
      "[반환 JSON 스키마]",
      JSON.stringify({
        psychologicalFactors: {
          taskType: taskType.key,
          taskTypeLabel: taskType.label,
          taskTypeReason: taskType.mappingReason,
          taskTypeCharacteristics: taskType.characteristics,
          inferredTaskTypes: [{ type: taskType.label, evidence: "metadata evidence", confidence: 0.7 }],
          primaryTaskType: taskType.label,
          primaryPsychologicalType: taskType.psychologicalType,
          psychologicalBurdens: ["작업자가 느낄 수 있는 부담"],
          motivationalFactors: ["동기 부여에 활용할 수 있는 요인"],
          sdtNeeds: selectedFrames.map(frame => frame === "Relatedness" ? "relatedness" : frame.toLowerCase()),
          selectedFrames,
          frameSelectionReason: taskType.mappingReason,
          surveyEvidence: {
            sampleSize: TaskTypeConfig.SURVEY_SAMPLE_SIZE,
            corePercentage: surveySelection.corePercentage,
            supportingPercentage: surveySelection.supportingPercentage,
            messageLength: TaskTypeConfig.MESSAGE_LENGTH_EVIDENCE
          },
          constraintsApplied: ["비압박", "비과장", "구체적 기준 유지"]
        },
        beforeOptions: [
          { label: "관계성/기여 연결", frame: "Relatedness", message: "자연스럽게 이어지는 완결된 4~5문장의 작업 시작 전 후보 문구" },
          { label: "유능감/판단 신뢰", frame: "Competence", message: "자연스럽게 이어지는 완결된 4~5문장의 작업 시작 전 후보 문구" },
          { label: "자율성/선택 존중", frame: "Autonomy", message: "자연스럽게 이어지는 완결된 4~5문장의 작업 시작 전 후보 문구" }
        ],
        afterOptions: [
          { label: "관계성/기여 연결", frame: "Relatedness", message: "자연스럽게 이어지는 완결된 4~5문장의 작업 완료 후 후보 문구" },
          { label: "유능감/수행 신뢰", frame: "Competence", message: "자연스럽게 이어지는 완결된 4~5문장의 작업 완료 후 후보 문구" },
          { label: "자율성/선택 존중", frame: "Autonomy", message: "자연스럽게 이어지는 완결된 4~5문장의 작업 완료 후 후보 문구" }
        ],
        finalBeforeText: "Core > Supporting 비중을 지키는 완결된 4~5문장의 최종 작업 시작 전 문구",
        finalAfterText: "Core > Supporting + 시간·노력 감사 + Task Type별 기여 의미를 포함한 완결된 4~5문장 작업 완료 후 문구",
        structuredPromptSummary: "프롬프트 구조 요약"
      }, null, 2)
    ].join("\n")
  }
  ];
};

const parseModelJson = (content) => {
  const trimmed = String(content || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(candidate.slice(start, end + 1));
    throw new Error("Could not parse model response as JSON.");
  }
};

const normalizeMessageText = (message) => String(message || "").replace(/\s+/g, " ").trim();

const ensureBeforeOpening = (message, title) => {
  const opening = `안녕하세요, "${clean(title)}" 작업에 참여해 주셔서 감사합니다.`;
  const body = normalizeMessageText(message).replace(/^안녕하세요,\s*["“][^"”]+["”]\s*작업에\s*참여해\s*주셔서\s*감사합니다[.!]?\s*/i, "");
  return normalizeMessageText(`${opening} ${body}`);
};

const applyGenerationMetadata = (parsed, payload) => {
  const { taskType, selectedFrames, coreStrategy, supportingStrategy, surveySelection } = resolveGenerationSelection(payload);
  parsed.selectedFrames = selectedFrames;
  parsed.psychologicalFactors = {
    ...(parsed.psychologicalFactors || {}),
    taskType: taskType.key,
    taskTypeLabel: taskType.label,
    taskTypeReason: taskType.mappingReason,
    coreStrategy,
    supportingStrategy,
    selectedFrames,
    surveyEvidence: {
      sampleSize: TaskTypeConfig.SURVEY_SAMPLE_SIZE,
      corePercentage: surveySelection.corePercentage,
      supportingPercentage: surveySelection.supportingPercentage,
      messageLength: TaskTypeConfig.MESSAGE_LENGTH_EVIDENCE
    }
  };
  return parsed;
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });

  const provider = resolveAIProvider();
  const apiKey = provider === "openai"
    ? process.env.OPENAI_API_KEY || ""
    : process.env.UPSTAGE_API_KEY || "";
  if (!apiKey) {
    const variable = provider === "openai" ? "OPENAI_API_KEY" : "UPSTAGE_API_KEY";
    return json(res, 500, { error: `${variable} environment variable is not set.` });
  }

  try {
    const payload = req.body || {};
    if (provider === "openai") {
      const apiUrl = normalizeOpenAIApiUrl(process.env.OPENAI_API_URL);
      const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
      const reasoningEffort = String(process.env.OPENAI_REASONING_EFFORT || "low").trim();
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          input: buildMessages(payload),
          max_output_tokens: 5000,
          reasoning: { effort: reasoningEffort }
        })
      });

      const rawText = await response.text();
      if (!response.ok) throw new Error(summarizeOpenAIError(response.status, rawText));

      const transport = JSON.parse(rawText);
      const content = extractOpenAIText(transport);
      if (!content) throw new Error("OpenAI API response did not include output text.");

      const parsed = applyGenerationMetadata(parseModelJson(content), payload);
      if (parsed.finalBeforeText) parsed.finalBeforeText = ensureBeforeOpening(parsed.finalBeforeText, payload.title);
      if (parsed.finalAfterText) parsed.finalAfterText = normalizeMessageText(parsed.finalAfterText);

      return json(res, 200, {
        provider: "openai",
        model: transport.model || model,
        usage: transport.usage || null,
        ...parsed
      });
    }

    const apiUrl = normalizeUpstageApiUrl(process.env.UPSTAGE_API_URL);
    const model = process.env.UPSTAGE_MODEL || "solar-pro2";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(payload),
        temperature: 0.35,
        max_tokens: 3200,
        stream: false
      })
    });

    const rawText = await response.text();
    if (!response.ok) throw new Error(summarizeUpstageError(response.status, rawText));

    const transport = JSON.parse(rawText);
    const content = transport.choices?.[0]?.message?.content;
    if (!content) throw new Error("Upstage API response did not include message content.");

    const parsed = applyGenerationMetadata(parseModelJson(content), payload);
    if (parsed.finalBeforeText) parsed.finalBeforeText = ensureBeforeOpening(parsed.finalBeforeText, payload.title);
    if (parsed.finalAfterText) parsed.finalAfterText = normalizeMessageText(parsed.finalAfterText);

    json(res, 200, {
      provider: "upstage",
      model: transport.model || model,
      usage: transport.usage || null,
      ...parsed
    });
  } catch (error) {
    json(res, 502, { error: error.message });
  }
};
