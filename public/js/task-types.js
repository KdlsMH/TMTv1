/**
 * Shared Task Type registry. The requester chooses one type directly and each
 * type uses the fixed strategy order from the supplied analysis figure.
 */
(function attachTaskTypeConfig(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.TaskTypeConfig = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createTaskTypeConfig() {
  const STRATEGY_LABELS = {
    autonomy: "Autonomy",
    competence: "Competence",
    appreciation: "Relatedness"
  };

  // Keep the terminology reported by the survey separate from the labels used
  // by the message-design system. The evidence table preserves the source data.
  const SURVEY_STRATEGY_LABELS = {
    autonomy: "Autonomy",
    competence: "Competence",
    appreciation: "Appreciation"
  };

  const SURVEY_SAMPLE_SIZE = 120;
  const MESSAGE_LENGTH_EVIDENCE = {
    operationalizedLength: "4–5 sentences",
    preferredCategory: "Medium",
    sampleSize: SURVEY_SAMPLE_SIZE,
    responses: {
      short: { count: 17, percentage: 14.2 },
      medium: { count: 80, percentage: 66.7 },
      long: { count: 23, percentage: 19.2 }
    }
  };

  const FRAME_PHASE_KEYWORDS = {
    Autonomy: {
      before: "comfortable pace and choice",
      after: "self-directed effort"
    },
    Competence: {
      before: "careful judgment and accuracy",
      after: "accuracy and careful judgment"
    },
    Relatedness: {
      before: "connection and contribution",
      after: "contribution and shared purpose"
    }
  };

  const TASK_TYPES = {
    annotation_classification: {
      key: "annotation_classification",
      label: "Annotation & Classification",
      shortLabel: "Annotation & Classification",
      description: "이미지·텍스트·오디오·비디오의 항목을 표시하거나 정해진 범주로 분류하는 작업",
      exampleSummary: "Labeling · Object detection · Categorization",
      examples: ["Image or text labeling", "Object detection", "Information categorization"],
      characteristics: [
        { key: "consistent_criteria", label: "Consistent criteria" },
        { key: "repeated_judgment", label: "Repeated judgment" },
        { key: "worker_discretion", label: "Worker discretion" }
      ],
      strategyOrder: ["autonomy", "competence", "appreciation"],
      strategyEvidence: { autonomy: 58.3, competence: 54.2, appreciation: 41.7 },
      psychologicalType: "주석·분류 작업",
      burden: "반복 판단과 모호한 경계에서 생길 수 있는 집중 부담",
      purpose: "판단 방식과 속도를 존중하고 정확하게 분류할 수 있다는 신뢰를 보완적으로 전달",
      mappingReason: "Annotation & Classification에는 Autonomy를 핵심으로, Competence를 보조로 적용합니다.",
      reviewReasons: {
        autonomy: "안내 기준 안에서 Worker가 자신의 판단 방식과 속도를 조절할 수 있음을 분명히 합니다.",
        competence: "일관된 기준을 적용해 분류할 수 있는 Worker의 판단 능력을 신뢰합니다.",
        relatedness: "시간과 기여를 구체적으로 인정하되 과도한 의미를 부여하지 않습니다."
      }
    },
    data_collection_creation: {
      key: "data_collection_creation",
      label: "Data Collection / Creation",
      shortLabel: "Data Collection / Creation",
      description: "데이터를 기록·입력·전사·번역하거나 콘텐츠를 작성하고 편집하는 작업",
      exampleSummary: "Recording · Data entry · Writing & editing",
      examples: ["Audio or video recording", "Transcription or translation", "Writing or AI-assisted editing"],
      characteristics: [
        { key: "production_choices", label: "Production choices" },
        { key: "creative_judgment", label: "Creative judgment" },
        { key: "time_and_effort", label: "Time and effort" }
      ],
      strategyOrder: ["autonomy", "appreciation", "competence"],
      strategyEvidence: { autonomy: 57.9, appreciation: 45.6, competence: 38.6 },
      psychologicalType: "데이터 수집·생성 작업",
      burden: "작성 방식 선택과 결과물을 완성하는 과정에서 생길 수 있는 부담",
      purpose: "자신의 방식으로 수행할 수 있음을 중심에 두고 시간과 노력을 인정",
      mappingReason: "Data Collection / Creation에는 Autonomy를 핵심으로, Relatedness를 보조로 적용합니다.",
      reviewReasons: {
        autonomy: "요구 범위 안에서 Worker가 편한 방식과 순서로 결과물을 만들 수 있음을 안내합니다.",
        competence: "필요한 자료를 만들고 다듬을 수 있는 수행 능력을 차분하게 신뢰합니다.",
        relatedness: "결과물을 만드는 데 들인 시간과 노력을 구체적으로 인정합니다."
      }
    },
    search_verification: {
      key: "search_verification",
      label: "Search / Verification",
      shortLabel: "Search / Verification",
      description: "정보를 찾고 사실·세부 내용을 확인하거나 중복과 형식을 정리하는 작업",
      exampleSummary: "Search · Fact-checking · Data clean-up",
      examples: ["Information search", "Fact-checking", "Duplicate removal or formatting"],
      characteristics: [
        { key: "source_checking", label: "Source checking" },
        { key: "accuracy", label: "Accuracy" },
        { key: "detail_review", label: "Detail review" }
      ],
      strategyOrder: ["competence", "appreciation", "autonomy"],
      strategyEvidence: { competence: 70.3, appreciation: 48.6, autonomy: 37.8 },
      psychologicalType: "검색·검증 작업",
      burden: "여러 출처와 세부 정보를 대조하는 과정에서 생길 수 있는 정확도 부담",
      purpose: "근거를 확인하는 판단 능력을 중심에 두고 세심한 노력과 기여를 인정",
      mappingReason: "Search / Verification에는 Competence를 핵심으로, Relatedness를 보조로 적용합니다.",
      reviewReasons: {
        autonomy: "확인 가능한 근거 안에서 Worker가 판단 순서와 방식을 조절할 수 있게 합니다.",
        competence: "출처를 대조하고 세부 정보를 확인하는 Worker의 수행 능력을 신뢰합니다.",
        relatedness: "정확성을 높이기 위해 들인 시간과 세심한 노력을 인정합니다."
      }
    },
    evaluation_comparison: {
      key: "evaluation_comparison",
      label: "Evaluation / Comparison",
      shortLabel: "Evaluation / Comparison",
      description: "AI 응답, 검색 결과, 제품 또는 서비스를 같은 기준으로 평가하고 비교하는 작업",
      exampleSummary: "AI response rating · Result comparison",
      examples: ["AI response evaluation", "Search result rating", "Product or service comparison"],
      characteristics: [
        { key: "comparative_judgment", label: "Comparative judgment" },
        { key: "criteria_application", label: "Criteria application" },
        { key: "reasoned_choice", label: "Reasoned choice" }
      ],
      strategyOrder: ["competence", "autonomy", "appreciation"],
      strategyEvidence: { competence: 54.0, autonomy: 46.0, appreciation: 41.4 },
      psychologicalType: "평가·비교 작업",
      burden: "비슷한 대안을 같은 기준으로 비교하고 판단해야 하는 부담",
      purpose: "비교 판단 능력을 중심에 두고 Worker의 독립적인 선택을 존중",
      mappingReason: "Evaluation / Comparison에는 Competence를 핵심으로, Autonomy를 보조로 적용합니다.",
      reviewReasons: {
        autonomy: "정답을 강요하기보다 제시된 기준 안에서 Worker의 독립적인 판단을 존중합니다.",
        competence: "차이를 살피고 기준에 따라 평가할 수 있는 Worker의 판단 능력을 신뢰합니다.",
        relatedness: "평가에 들인 시간과 기여를 구체적으로 인정합니다."
      }
    },
    content_moderation: {
      key: "content_moderation",
      label: "Content Moderation",
      shortLabel: "Content Moderation",
      description: "유해하거나 공격적이거나 부적절할 수 있는 콘텐츠를 검토하고 분류하는 작업",
      exampleSummary: "Harmful content · Safety review",
      examples: ["Harmful content review", "Offensive content classification", "Safety policy review"],
      characteristics: [
        { key: "sensitive_content", label: "Sensitive content" },
        { key: "emotional_effort", label: "Emotional effort" },
        { key: "policy_judgment", label: "Policy judgment" }
      ],
      strategyOrder: ["appreciation", "autonomy", "competence"],
      strategyEvidence: { appreciation: 59.1, autonomy: 45.5, competence: 36.4 },
      psychologicalType: "콘텐츠 모더레이션 작업",
      burden: "불편할 수 있는 콘텐츠 노출과 정책 기준 적용에서 생기는 정서적 부담",
      purpose: "부담이 있는 작업에 들인 시간과 노력을 인정하고 속도와 판단에 대한 통제감을 보완",
      mappingReason: "Content Moderation에는 Relatedness를 핵심으로, Autonomy를 보조로 적용합니다.",
      reviewReasons: {
        autonomy: "불편할 때 잠시 멈추거나 안내 기준 안에서 자신의 속도로 판단할 수 있음을 알립니다.",
        competence: "정책 기준을 적용하는 Worker의 판단 능력을 과장 없이 신뢰합니다.",
        relatedness: "부담이 있는 콘텐츠를 검토하는 데 들인 시간과 노력을 분명하게 인정합니다."
      }
    },
    surveys_experiments: {
      key: "surveys_experiments",
      label: "Surveys / Experiments",
      shortLabel: "Surveys / Experiments",
      description: "학술·시장·행동·사용성 연구를 위한 설문이나 온라인 실험에 참여하는 작업",
      exampleSummary: "Surveys · Behavioral studies · Usability",
      examples: ["Academic survey", "Market research", "Behavioral or usability study"],
      characteristics: [
        { key: "participant_input", label: "Participant input" },
        { key: "subjective_response", label: "Subjective response" },
        { key: "research_contribution", label: "Research contribution" }
      ],
      strategyOrder: ["appreciation", "autonomy", "competence"],
      strategyEvidence: { appreciation: 53.8, autonomy: 48.1, competence: 29.2 },
      psychologicalType: "설문·온라인 실험",
      burden: "개인 의견과 시간을 제공하지만 결과 활용 맥락이 바로 보이지 않을 수 있음",
      purpose: "참여자의 시간과 응답 가치를 인정하고 자신의 판단에 따라 응답할 수 있음을 보완",
      mappingReason: "Surveys / Experiments에는 Relatedness를 핵심으로, Autonomy를 보조로 적용합니다.",
      reviewReasons: {
        autonomy: "정답을 유도하지 않고 Worker가 자신의 판단과 경험에 따라 응답할 수 있게 합니다.",
        competence: "질문을 읽고 자신의 경험을 바탕으로 응답할 수 있음을 명확하게 안내합니다.",
        relatedness: "연구에 제공한 시간과 응답의 가치를 구체적으로 인정합니다."
      }
    }
  };

  const DEFAULT_TASK_TYPE = "annotation_classification";

  const normalizeTaskTypeKey = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (TASK_TYPES[raw]) return raw;
    return Object.keys(TASK_TYPES).find(key => TASK_TYPES[key].label === raw || TASK_TYPES[key].shortLabel === raw) || "";
  };

  const getTaskType = (value) => TASK_TYPES[normalizeTaskTypeKey(value)] || null;
  const getStrategyLabel = (value) => STRATEGY_LABELS[String(value || "").toLowerCase()] || "";
  const getFramePhaseKeyword = (frame, phase = "before") => {
    const normalizedFrame = getStrategyLabel(frame) || String(frame || "");
    const normalizedPhase = phase === "after" ? "after" : "before";
    return FRAME_PHASE_KEYWORDS[normalizedFrame]?.[normalizedPhase] || "";
  };

  const getStrategySelection = (taskTypeValue) => {
    const type = getTaskType(taskTypeValue) || TASK_TYPES[DEFAULT_TASK_TYPE];
    const [core, supporting, third] = type.strategyOrder;
    return {
      taskType: type.key,
      taskTypeLabel: type.label,
      coreStrategy: getStrategyLabel(core),
      supportingStrategy: getStrategyLabel(supporting),
      thirdStrategy: getStrategyLabel(third),
      corePercentage: type.strategyEvidence[core],
      supportingPercentage: type.strategyEvidence[supporting],
      thirdPercentage: type.strategyEvidence[third],
      selectedFrames: [getStrategyLabel(core), getStrategyLabel(supporting)]
    };
  };

  const analyzeSDTNeeds = (input = {}) => {
    const type = getTaskType(input.taskType) || TASK_TYPES[DEFAULT_TASK_TYPE];
    const selection = getStrategySelection(type.key);
    return {
      needs: type.strategyOrder.slice(0, 2).map(strategy => strategy === "appreciation" ? "relatedness" : strategy),
      frames: selection.selectedFrames,
      strategyOrder: type.strategyOrder.map(getStrategyLabel),
      coreStrategy: selection.coreStrategy,
      supportingStrategy: selection.supportingStrategy,
      thirdStrategy: selection.thirdStrategy,
      taskType: type.key,
      taskTypeLabel: type.label
    };
  };

  return {
    TASK_TYPES,
    DEFAULT_TASK_TYPE,
    STRATEGY_LABELS,
    SURVEY_STRATEGY_LABELS,
    FRAME_PHASE_KEYWORDS,
    SURVEY_SAMPLE_SIZE,
    MESSAGE_LENGTH_EVIDENCE,
    normalizeTaskTypeKey,
    getTaskType,
    getStrategyLabel,
    getFramePhaseKeyword,
    getStrategySelection,
    analyzeSDTNeeds
  };
});
