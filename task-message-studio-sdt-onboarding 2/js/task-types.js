/**
 * Shared Task Type registry.
 * Task Type describes the work experience a task may create for a Worker;
 * it does not replace the task category or the Worker interface type.
 */
(function attachTaskTypeConfig(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.TaskTypeConfig = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createTaskTypeConfig() {
  const TASK_TYPES = {
    emotionally_demanding: {
      key: "emotionally_demanding",
      label: "Emotionally Demanding Tasks",
      shortLabel: "Emotionally Demanding",
      description: "Worker가 불쾌하거나 정서적으로 부담되는 콘텐츠를 반복적으로 판단해야 하는 작업",
      exampleSummary: "Harmful content moderation · Toxic comment classification",
      examples: ["Harmful content moderation", "Toxic comment classification", "Disturbing content review"],
      characteristics: [
        { key: "emotional_burden", label: "Emotional burden" },
        { key: "psychological_fatigue", label: "Psychological fatigue" },
        { key: "repeated_exposure", label: "Repeated exposure" }
      ],
      preferredSDT: ["relatedness", "autonomy"],
      preferredFrames: ["Relatedness/Appreciation", "Autonomy support"],
      psychologicalType: "정서적 부담 작업",
      burden: "정서적 소진, 감정 피로, 반복 노출 부담",
      purpose: "참여와 수고를 인정하면서 작업 속도와 판단에 대한 통제감 지원",
      recommendationReason: "부정적이거나 유해할 수 있는 콘텐츠를 반복해서 확인하므로 정서적 부담과 심리적 피로가 발생할 가능성이 있습니다.",
      keywords: ["유해", "혐오", "욕설", "공격", "괴롭힘", "위협", "악플", "모더레이션", "toxic", "harmful", "hate", "abuse", "harassment", "moderation"],
      categoryHints: ["moderation"],
      reviewReasons: {
        autonomy: "정서적으로 부담될 수 있어 Worker가 속도와 휴식을 스스로 조절할 수 있다는 안내가 필요합니다.",
        competence: "모호한 내용을 기준에 따라 판단하는 역량을 과장 없이 인정할 필요가 있습니다.",
        relatedness: "불편한 내용을 다루는 참여와 수고를 인정하고 정서적 거리를 확보하도록 돕는 것이 중요합니다."
      }
    },
    high_responsibility: {
      key: "high_responsibility",
      label: "High-Responsibility Tasks",
      shortLabel: "High-Responsibility",
      description: "Worker의 판단 정확도가 중요한 결과와 연결될 수 있는 작업",
      exampleSummary: "Synthetic medical · Safety-critical verification",
      examples: ["Medical data review", "Safety-critical classification", "High-stakes verification"],
      characteristics: [
        { key: "high_responsibility", label: "High responsibility" },
        { key: "accuracy_pressure", label: "Accuracy pressure" },
        { key: "decision_burden", label: "Decision burden" }
      ],
      preferredSDT: ["competence", "autonomy"],
      preferredFrames: ["Competence", "Autonomy support"],
      psychologicalType: "책임 요구 작업",
      burden: "정확도 압박, 판단 부담, 결과에 대한 책임감",
      purpose: "신중한 판단 능력을 인정하되 과도한 성과 압박이나 책임감은 완화",
      recommendationReason: "정확한 검수가 연구·안전 관련 정보 품질과 연결되므로 판단 부담과 정확도 압박이 발생할 수 있습니다.",
      keywords: ["의료", "경고", "알레르기", "안전", "검증", "검수", "고위험", "진단", "medical", "alert", "allergy", "safety", "critical", "verification"],
      categoryHints: ["medical", "medical_alert", "autonomous"],
      reviewReasons: {
        autonomy: "성과 압박보다 확인 가능한 근거와 자신의 판단 속도에 따라 결정할 수 있도록 지원해야 합니다.",
        competence: "판단 부담이 큰 작업이므로 Worker의 신중한 판단 능력을 인정하는 것이 중요합니다.",
        relatedness: "개별 판단이 연구·안전 데이터 품질과 어떻게 연결되는지 과장 없이 설명할 필요가 있습니다."
      }
    },
    repetitive_cognitive: {
      key: "repetitive_cognitive",
      label: "Repetitive Cognitive Tasks",
      shortLabel: "Repetitive Cognitive",
      description: "단순하지만 반복적인 판단과 집중이 지속적으로 필요한 작업",
      exampleSummary: "OCR · Image labeling · Data categorization",
      examples: ["OCR verification", "Image labeling", "Data categorization", "Transcription verification"],
      characteristics: [
        { key: "repetition", label: "Repetition" },
        { key: "attention_fatigue", label: "Attention fatigue" },
        { key: "low_task_variety", label: "Low task variety" }
      ],
      preferredSDT: ["competence", "relatedness"],
      preferredFrames: ["Competence", "Meaningfulness/Relatedness"],
      psychologicalType: "반복 인지 작업",
      burden: "반복, 주의 피로, 낮은 과업 다양성",
      purpose: "일관된 판단 능력과 반복 기여가 데이터 품질에 갖는 의미 지원",
      recommendationReason: "유사한 항목에 같은 기준을 반복 적용해야 하므로 집중력 저하와 반복 작업 피로가 발생할 수 있습니다.",
      keywords: ["ocr", "영수증", "전사", "라벨", "레이블", "어노테이션", "반복", "분류", "대조", "match", "mismatch", "transcription", "labeling"],
      categoryHints: ["ocr"],
      reviewReasons: {
        autonomy: "반복 피로가 예상되므로 작업량과 휴식 주기를 조절할 수 있다는 선택권이 중요합니다.",
        competence: "같은 기준을 꾸준히 적용하는 Worker의 정확성과 수행 가능성을 북돋울 필요가 있습니다.",
        relatedness: "반복적으로 제공한 판단이 전체 데이터 품질에 미치는 영향을 알려 참여 의미를 유지합니다."
      }
    },
    socially_meaningful: {
      key: "socially_meaningful",
      label: "Socially Meaningful Tasks",
      shortLabel: "Socially Meaningful",
      description: "Worker가 수행한 결과가 공공 서비스, 의료, 접근성 등 사회적 가치와 연결되는 작업",
      exampleSummary: "Public service · Accessibility · Healthcare quality",
      examples: ["Public service data verification", "Accessibility data review", "Healthcare information quality review"],
      characteristics: [
        { key: "social_contribution", label: "Social contribution" },
        { key: "meaningfulness", label: "Meaningfulness" },
        { key: "impact", label: "Impact" }
      ],
      preferredSDT: ["relatedness", "competence"],
      preferredFrames: ["Meaningfulness/Relatedness", "Competence"],
      psychologicalType: "사회적 의미 작업",
      burden: "사회적 기여의 맥락이 보이지 않거나 의무감으로 바뀔 가능성",
      purpose: "결과가 누구에게 어떻게 활용되는지 과장 없이 연결하고 판단 역량 인정",
      recommendationReason: "검수 결과가 공공 정보나 접근성 데이터 품질과 연결되므로 기여의 활용 맥락을 이해하는 것이 중요합니다.",
      keywords: ["공공", "접근성", "장애", "복지", "사회", "공익", "공공시설", "accessibility", "public service", "welfare", "community"],
      categoryHints: ["accessibility"],
      reviewReasons: {
        autonomy: "사회적 의미가 의무감이나 압박으로 바뀌지 않도록 선택권과 편한 작업 속도를 보장해야 합니다.",
        competence: "사회적 목적을 데이터 품질로 연결하는 Worker의 판단 역량을 인정할 필요가 있습니다.",
        relatedness: "작업 결과가 다른 사람과 사회에 미치는 의미를 과장 없이 전달하는 것이 중요합니다."
      }
    },
    general_low_risk: {
      key: "general_low_risk",
      label: "General Low-Risk Tasks",
      shortLabel: "General Low-Risk",
      description: "정서적 부담이나 높은 책임이 거의 없는 일반적인 Crowd Task",
      exampleSummary: "Simple survey · Preference · Product categorization",
      examples: ["Simple survey", "Basic preference classification", "Simple product categorization"],
      characteristics: [
        { key: "low_emotional_burden", label: "Low emotional burden" },
        { key: "low_responsibility", label: "Low responsibility" },
        { key: "simple_interaction", label: "Simple interaction" }
      ],
      preferredSDT: ["autonomy", "competence"],
      preferredFrames: ["Autonomy support", "Competence"],
      psychologicalType: "일반 저위험 작업",
      burden: "낮은 몰입도와 가벼운 참여 동기",
      purpose: "과도한 의미 부여 없이 선택권과 기본적인 수행 가능성만 간결하게 지원",
      recommendationReason: "간단한 선호 선택으로 정서적 부담과 결과 책임이 낮아 가벼운 Motivation Support가 적합합니다.",
      keywords: ["설문", "선호", "상품", "이미지 a", "이미지 b", "survey", "preference", "product", "simple"],
      categoryHints: ["preference", "general"],
      reviewReasons: {
        autonomy: "부담 없이 자신의 선호와 판단에 따라 참여할 수 있음을 알려 가벼운 통제감을 제공합니다.",
        competence: "간단한 기준을 충분히 수행할 수 있다는 명확한 단서와 신뢰를 제공할 필요가 있습니다.",
        relatedness: "응답이 활용되는 맥락은 짧게 설명하되 과도한 사회적 의미를 부여하지 않습니다."
      }
    }
  };

  const TYPE_ALIASES = {
    "Responsibility-Critical Tasks": "high_responsibility",
    "General Low-Stakes Tasks": "general_low_risk",
    "General Low-Risk Tasks": "general_low_risk"
  };

  const normalizeTaskTypeKey = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (TASK_TYPES[raw]) return raw;
    if (TYPE_ALIASES[raw]) return TYPE_ALIASES[raw];
    return Object.keys(TASK_TYPES).find(key => TASK_TYPES[key].label === raw) || "";
  };

  const getTaskType = (value) => TASK_TYPES[normalizeTaskTypeKey(value)] || null;

  const scoreTaskTypes = (input = {}) => {
    const source = [input.title, input.description, input.objective, input.socialImpact, input.workerContext]
      .map(value => String(value || "").toLowerCase())
      .join(" ");
    const category = String(input.category || "").toLowerCase();
    const scores = {};

    Object.values(TASK_TYPES).forEach(type => {
      let score = 0;
      const matches = [];
      type.keywords.forEach(keyword => {
        if (source.includes(keyword.toLowerCase())) {
          score += 3;
          matches.push(keyword);
        }
      });
      if (type.categoryHints.includes(category)) score += category === "general" ? 1 : 7;
      scores[type.key] = { key: type.key, label: type.label, score, matches };
    });

    const repetitionCount = Number(input.workload?.repetitionCount || 0);
    if (input.fatigueLevel === "high") scores.repetitive_cognitive.score += 3;
    else if (input.fatigueLevel === "medium") scores.repetitive_cognitive.score += 1;
    if (repetitionCount >= 8) scores.repetitive_cognitive.score += 2;
    if (input.riskLevel === "high") {
      scores.emotionally_demanding.score += category === "moderation" ? 4 : 1;
      scores.high_responsibility.score += category !== "moderation" ? 2 : 0;
    }
    if (input.workload?.sensitiveData === "high") scores.high_responsibility.score += 2;
    if (String(input.socialImpact || "").trim()) scores.socially_meaningful.score += 1;

    return Object.values(scores).sort((a, b) => b.score - a.score);
  };

  const recommendTaskType = (input = {}) => {
    const ranked = scoreTaskTypes(input);
    const best = ranked[0]?.score > 0 ? ranked[0] : { key: "general_low_risk", score: 0, matches: [] };
    const type = TASK_TYPES[best.key];
    return {
      key: type.key,
      label: type.label,
      reason: type.recommendationReason,
      characteristics: type.characteristics,
      confidence: Math.min(0.98, 0.58 + Math.min(best.score, 10) * 0.04),
      ranked
    };
  };

  const frameForNeed = (need, taskTypeKey) => {
    if (need === "autonomy") return "Autonomy support";
    if (need === "competence") return "Competence";
    return taskTypeKey === "emotionally_demanding" ? "Relatedness/Appreciation" : "Meaningfulness/Relatedness";
  };

  const analyzeSDTNeeds = (input = {}) => {
    const type = getTaskType(input.taskType) || TASK_TYPES[recommendTaskType(input).key];
    const scores = { autonomy: 0, competence: 0, relatedness: 0 };
    type.preferredSDT.forEach((need, index) => { scores[need] += index === 0 ? 6 : 4; });

    if (input.riskLevel === "high") {
      scores.autonomy += 2;
      scores.relatedness += 2;
    }
    if (input.fatigueLevel === "high") scores.autonomy += 2;
    if (Number(input.workload?.repetitionCount || 0) >= 8) scores.competence += 1;
    if (["high", "extreme"].includes(input.workload?.complexity)) scores.competence += 2;
    if (String(input.socialImpact || "").trim()) scores.relatedness += 1;
    if (input.workload?.criteriaClarity === "unclear") scores.autonomy += 1;

    const order = Object.keys(scores).sort((a, b) => {
      if (scores[b] !== scores[a]) return scores[b] - scores[a];
      return type.preferredSDT.indexOf(a) - type.preferredSDT.indexOf(b);
    });
    const needs = order.slice(0, 2);
    return {
      needs,
      frames: needs.map(need => frameForNeed(need, type.key)),
      scores,
      taskType: type.key,
      taskTypeLabel: type.label
    };
  };

  return {
    TASK_TYPES,
    normalizeTaskTypeKey,
    getTaskType,
    scoreTaskTypes,
    recommendTaskType,
    analyzeSDTNeeds
  };
});
