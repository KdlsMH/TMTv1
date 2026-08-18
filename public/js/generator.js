/**
 * Agentic Motivation Generator Engine (Korean Version)
 * Grounded in Self-Determination Theory (SDT) and HCI Korea 2025 Research
 * Synthesizes intrinsic motivational interventions based on crowdsourcing task details in Korean.
 * Features an integrated Task Description Copilot for Requesters.
 */

const TaskTypeRegistry = globalThis.TaskTypeConfig
  || (typeof require === "function" ? require("./task-types.js") : null);

class AgenticMotivationGenerator {
  constructor() {
    // 한국어 테마 매핑 및 이론 기반 보강 단어군
    this.categoryMappings = {
      medical: {
        themeName: "의료 연구 및 병변 판독 (Medical Research & Diagnostics)",
        socialImpact: "환자의 고귀한 생명을 수호하고 질병 조기 진단 인공지능 기술의 임상적 신뢰도를 극대화하는 데 기여",
        competenceHighlight: "당신의 정밀한 시각 검증은 고도로 숙련된 전문가처럼 표준 알고리즘이 놓치기 쉬운 미세한 조직 음영을 교정하는 최후의 진단 도구입니다.",
        keywords: ["암", "세포", "의료", "스캔", "mri", "종양", "건강", "의사", "병원", "환자", "임상", "질병", "cancer", "cell", "medical", "scan", "mri", "tumor", "health"]
      },
      moderation: {
        themeName: "온라인 공간 보호 및 모더레이션 (Content Moderation)",
        socialImpact: "익명의 가학적 폭언 and 악성 콘텐츠로부터 무고한 아동과 청소년 및 수천 명의 커뮤니티 유저들을 안전하게 보호",
        competenceHighlight: "기계적 필터링 봇은 인간의 미묘한 감정선과 언어적 정서를 완전히 판단할 수 없습니다. 오직 당신의 세심한 가치관과 공감이 유일한 방어선입니다.",
        keywords: ["악플", "모더레이션", "필터", "커뮤니티", "안전", "보호", "신고", "비하", "부적절", "toxic", "moderation", "filter", "distressing", "safety", "protect", "report", "abuse"]
      },
      autonomous: {
        themeName: "자율주행 주행 인식 제어 (Autonomous Road Safety)",
        socialImpact: "자율주행 차량 모델의 안전성을 확보하여 보행자 충돌을 방지하고 우리 모두를 위한 안전한 거리를 구현",
        competenceHighlight: "당신이 보여주는 고도의 경계심과 지형 판단은 주행 오작동이나 미인식 오류를 방어하여 탑승자의 안전을 결정하는 가장 중요한 조타수입니다.",
        keywords: ["자동차", "도로", "보행자", "교통", "자율주행", "사고", "차선", "car", "road", "vehicle", "pedestrian", "traffic", "driving", "sensor", "collision"]
      },
      translation: {
        themeName: "다국어 번역 및 문화 연결 (Translation & Localization)",
        socialImpact: "서로 다른 언어와 정서를 유기적으로 엮어내어 글로벌 교류와 공동체 간 소통 장벽을 낮추고 평화적 유대감을 확대",
        competenceHighlight: "단어의 직역에 불과한 번역 알고리즘은 표현의 정수를 살리지 못합니다. 오직 문장을 살아 숨 쉬게 하는 것은 당신의 정밀한 문화적 통찰력입니다.",
        keywords: ["번역", "언어", "문화", "영어", "한국어", "text", "speech", "translate", "language", "localization"]
      },
      general: {
        themeName: "차세대 AI 성능 강화 개발 (Advanced AI Development)",
        socialImpact: "인간의 가치관과 철학에 부합하도록 정렬된 안전하고 신뢰할 수 있는 인간 친화적 차세대 인공지능 모델 학습의 주춧돌을 구성",
        competenceHighlight: "아무리 훌륭한 초거대 AI라도 그 시작은 오직 인간이 정제한 참값(Ground-Truth) 데이터입니다. 당신의 꼼꼼한 어노테이션이 모델의 등급을 규정합니다.",
        keywords: ["인공지능", "머신러닝", "데이터", "레이블", "어노테이션", "학습", "ai", "machine learning", "dataset", "train", "label", "annotation"]
      }
    };
  }

  /**
   * Requester 템플릿 초안 생성 (한국어)
   */
  generateTaskDraft(rawKeywords, category) {
    const keywords = rawKeywords.trim() || "데이터 분류";
    
    // 키워드 이름 포맷
    const titleTitle = keywords;
    const categoryInfo = this.categoryMappings[category] || this.categoryMappings.general;
    
    let draftTitle = titleTitle;
    let draftDescription = "";

    if (category === "medical") {
      draftDescription = `### 작업 개요
우리는 "${titleTitle}" 관련 학습 데이터를 구축하고 있습니다. 목표는 제공된 이미지나 자료에서 "${titleTitle}" 관련 비정상적인 특징이나 이상 병변을 세밀하게 판독하고 정확히 분류하는 것입니다.

### ?? 상세 가이드라인 & 분류 수칙
1. 제공된 시각자료를 최대한 신중하게 검토하십시오. 미세한 질감 차이나 음영 변화, 특정 영역을 세밀히 관찰하십시오.
2. 분석 대상의 내부 형상을 파악하여 가장 올바르고 정교한 분류 옵션을 선택해 주십시오.
3. 정보의 왜곡이 심하거나 확실하게 식별할 수 없을 경우, 억지로 판단하지 마시고 '판독 불가'를 제출하거나 건너뛰어 주십시오.

### ??? 신중도 서약
이 프로젝트에 기여해주시는 귀하의 판단력은 인공지능 모델의 성능을 결정하는 가장 핵심적인 지표가 됩니다. 귀하가 부여하는 레이블 하나하나에 담긴 소중한 안목에 깊이 감사드립니다.`;
    } else if (category === "autonomous") {
      draftDescription = `### 작업 개요
우리는 "${titleTitle}" 인식을 위한 스마트 인공지능 모델 학습용 데이터 세트를 정제하고 있습니다. 목표는 시각 피드 속에서 "${titleTitle}" 대상의 위험 요소나 주행 상황을 판단하고 정확하게 식별하는 것입니다.

### ?? 상세 가이드라인 & 분류 수칙
1. 하이라이트 영역 또는 캔버스 중앙의 대상을 주의 깊게 관찰하십시오.
2. 타겟 지점 내부의 속성(주변 위험 요인, 장애물, 차량 배향 상태 등)을 판별하십시오.
3. 타겟 지점이 비어 있거나 정상 도로 환경인 경우 '장애물 없음'을 클릭하십시오.

### ??? 신중도 서약
귀하의 성실하고 차분한 어노테이션 기여에 진심으로 감사드립니다. 작업 중에는 조급함 없이 편안한 페이스를 유지하며 꼼꼼하게 판단해 주시기 바랍니다. 귀하의 집중력이 보다 안전한 내일을 만드는 초석이 됩니다.`;
    } else if (category === "moderation") {
      draftDescription = `### 작업 개요
우리는 안전하고 올바른 공간을 수호하기 위해 "${titleTitle}" 모더레이션 검증 프로젝트를 진행하고 있습니다. 목표는 제공된 텍스트 및 게시글에서 "${titleTitle}" 유해 수위나 위반 사항을 정확히 검출하는 것입니다.

### ?? 상세 가이드라인 & 분류 수칙
1. 유저 텍스트 및 관련 피드백 내용의 감정 수위와 규정 위반 여부를 차분히 분석하십시오.
2. 해당 자료가 "${titleTitle}" 기준에 따라 위반 사항(폭언, 비하, 광고 도배 등)에 해당하는지 아니면 정상 콘텐츠인지 판단해 주십시오.
3. 단순 어조 차이나 가벼운 유희성 표현은 위반이 아니므로, 규정된 유해 수준의 정서적 악의성에 집중해 주십시오.

### ??? 신중도 서약
자동 필터링 모델이 잡아내기 힘든 인간의 미묘한 정서와 상처를 보살피는 것은 오직 작업자님의 세심한 주의와 도덕성입니다. 건강한 커뮤니티 장벽을 세워주시는 소중한 공헌에 대단히 감사드립니다.`;
    } else {
      draftDescription = `### 작업 개요
우리는 "${titleTitle}" 모델 학습의 토대가 되는 데이터 품질을 향상하기 위한 중요 프로젝트를 진행하고 있습니다. 목표는 캔버스 요소를 면밀히 관찰하여 "${titleTitle}" 속성을 분류하는 것입니다.

### ?? 상세 가이드라인 & 분류 수칙
1. 화면 중앙의 타겟 도형 및 배치 상태를 자세히 확인하십시오.
2. 타겟의 기하학적 형태, 대칭 유무, 또는 회전각 등을 종합적으로 판단하여 가장 올바른 옵션을 누르십시오.
3. 최종 제출을 확정하기 전에 선택한 지표가 올바른지 다시 한번 편안히 살펴보십시오.

### ??? 신중도 서약
인공지능의 지능은 전적으로 작업자분들이 정제해주시는 고품질 데이터 가치에 정비례합니다. 귀하가 발휘해 주시는 지혜와 성실함에 늘 깊이 감사드립니다.`;
    }

    return {
      title: draftTitle,
      description: draftDescription,
      reward: category === "medical" ? "2.50" : (category === "autonomous" ? "1.80" : "1.20")
    };
  }

  /**
   * Requester 가이드라인 구조 고도화 (한국어)
   */
  optimizeDescription(description) {
    if (!description || description.trim().length < 5) {
      return "코파일럿이 최적화할 수 있도록 먼저 텍스트 입력창에 간단한 안내글 초안을 적어주십시오.";
    }

    let rawText = description;
    rawText = rawText.replace(/###\s+/g, "").split("?").join("");

    return `### 작업 개요
${rawText.trim()}

### 상세 가이드라인 & 작업 주의사항
1. 답변을 최종 결정하기 전에 제공된 타겟 이미지와 상태를 차분하고 꼼꼼하게 다시 한번 확인해 주십시오.
2. 작업 진행 중 피로감이 느껴지실 경우, 강박감을 갖지 마시고 편안한 호흡으로 여유 있게 판단하셔도 좋습니다.
3. 기준이 모호하여 판단이 매우 곤란한 요소를 마주치면, 억지로 추측하기보다 선택지 중 가장 보수적인 항목을 선택해 주십시오.

### ??? 크라우드 작업자 행동 강령
우리는 귀하가 지닌 고유한 인지적 가치와 집중력을 높이 평가합니다. 귀하의 한 땀 한 땀 정제된 데이터는 단순 어노테이션을 넘어 미래의 안전하고 똑똑한 인공지능 기술의 기반이 됩니다. 스스로 조율하는 주도적인 페이스 속에서 소중한 기여를 함께 다듬어 주셔서 진심으로 감사드립니다.`;
  }

  /**
   * 작업 맥락을 특허 문서에 설명 가능한 "심리 프레임"으로 변환한다.
   * 이 단계가 단순 LLM 호출과 구분되는 핵심 로직이다.
   */
  assessWorkload(workload = {}, riskLevel = "medium", fatigueLevel = "medium", singleTaskLimitMinutes = 15) {
    const valueScore = (value, map) => map[value] || 0;
    const totalCount = Math.max(0, Number(workload.totalCount || 0));
    const batchSize = Math.max(1, Number(workload.batchSize || 1));
    const repetitions = Math.max(1, Number(workload.repetitionCount || Math.ceil(totalCount / batchSize) || 1));
    const itemMinutes = Math.max(0, Number(workload.itemEstimatedMinutes || 0));
    const totalLimit = Math.max(0, Number(workload.totalTimeLimitMinutes || 0));
    const estimatedTotalMinutes = Math.round(totalCount * itemMinutes * 10) / 10;

    let score = 0;
    score += valueScore(workload.dataType, { text: 3, image: 7, audio: 10, video: 15, mixed: 18 });
    score += valueScore(workload.complexity, { low: 2, medium: 9, high: 16, extreme: 24 });
    score += valueScore(workload.sensitiveData, { none: 0, limited: 9, high: 17 });
    score += valueScore(workload.criteriaClarity, { clear: 0, mixed: 7, unclear: 15 });
    score += valueScore(workload.subjectivity, { low: 0, medium: 7, high: 14 });
    score += valueScore(workload.difficulty, { easy: 0, medium: 5, hard: 11, expert: 17 });
    score += totalCount > 5000 ? 15 : totalCount > 1000 ? 11 : totalCount > 100 ? 7 : 3;
    score += batchSize > 100 ? 10 : batchSize > 30 ? 6 : 2;
    score += repetitions > 50 ? 8 : repetitions > 10 ? 5 : 2;
    score += riskLevel === "high" ? 10 : riskLevel === "medium" ? 5 : 0;
    score += fatigueLevel === "high" ? 10 : fatigueLevel === "medium" ? 5 : 0;
    score = Math.min(100, Math.round(score));

    const warnings = [];
    if (itemMinutes > Number(singleTaskLimitMinutes || 0)) {
      warnings.push(`작업당 예상 ${itemMinutes}분이 단일 작업 제한 ${singleTaskLimitMinutes}분을 초과합니다. 제한을 늘리거나 작업 단위를 줄여 주세요.`);
    }
    if (totalLimit && estimatedTotalMinutes > totalLimit) {
      warnings.push(`전체 예상 ${estimatedTotalMinutes}분이 전체 제한 ${totalLimit}분을 초과합니다. 데이터 수, 작업량 또는 제한 시간을 조정해 주세요.`);
    }
    if (workload.complexity === "extreme" && workload.criteriaClarity === "unclear") {
      warnings.push("복잡도가 매우 높고 판단 기준도 모호합니다. 전문가 검토와 예시 기준을 먼저 추가하는 것을 권장합니다.");
    }
    if (workload.sensitiveData === "high" && !workload.breakFrequencyMinutes) {
      warnings.push("민감정보가 많습니다. 정기 휴식과 접근 권한 안내를 함께 설정해 주세요.");
    }

    const level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
    return {
      score,
      level,
      levelLabel: level === "high" ? "높음" : level === "medium" ? "중간" : "낮음",
      estimatedTotalMinutes,
      singleTaskLimitMinutes: Number(singleTaskLimitMinutes || 0),
      totalTimeLimitMinutes: totalLimit,
      expectedTaskCount: repetitions,
      breakIncluded: workload.breakIncluded || "excluded",
      warnings
    };
  }

  buildPsychologicalProfile(title, category, description, riskLevel, fatigueLevel, objective, socialImpact, workerContext, workload = {}, singleTaskLimitMinutes = 15, taskType = "") {
    const activeProfile = this.categoryMappings[category] || this.categoryMappings.general;

    const safeObjective = this.cleanInput(objective) || this.inferObjective(title, description, activeProfile);
    const safeImpact = this.cleanInput(socialImpact) || activeProfile.socialImpact;
    const safeContext = this.cleanInput(workerContext) || "짧은 시간 안에 여러 항목을 연속적으로 판단해야 하는 온라인 마이크로태스크 환경";
    const taskTypeInput = { title, category, description, riskLevel, fatigueLevel, objective: safeObjective, socialImpact: safeImpact, workerContext: safeContext, workload };
    const taskTypeRecommendation = TaskTypeRegistry.recommendTaskType(taskTypeInput);
    const confirmedTaskTypeKey = TaskTypeRegistry.normalizeTaskTypeKey(taskType) || taskTypeRecommendation.key;
    const confirmedTaskType = TaskTypeRegistry.getTaskType(confirmedTaskTypeKey);
    const inferredTaskTypes = taskTypeRecommendation.ranked
      .filter(item => item.score > 0)
      .slice(0, 3)
      .map((item, index) => ({
        type: item.label,
        evidence: index === 0 ? taskTypeRecommendation.reason : `${item.label} 관련 보조 신호가 작업 정보에서 함께 감지되었습니다.`,
        confidence: index === 0 ? taskTypeRecommendation.confidence : Math.max(0.5, taskTypeRecommendation.confidence - (index * 0.12))
      }));
    if (inferredTaskTypes.length === 0) {
      inferredTaskTypes.push({ type: confirmedTaskType.label, evidence: confirmedTaskType.recommendationReason, confidence: 0.58 });
    }
    const primaryTaskType = confirmedTaskType.label;
    const primaryFrameRule = this.getFrameRule(primaryTaskType);
    const workloadAssessment = this.assessWorkload(workload, riskLevel, fatigueLevel, singleTaskLimitMinutes);

    const burdens = [];
    burdens.push(primaryFrameRule.burden);
    if (riskLevel === "high") burdens.push("정서적 부담 또는 높은 책임감");
    if (riskLevel === "medium") burdens.push("일정 수준의 주의 부담");
    if (fatigueLevel === "high") burdens.push("높은 반복 피로와 시각적 집중 부담");
    if (fatigueLevel === "medium") burdens.push("반복 수행으로 인한 중간 수준의 피로");
    if (safeContext) burdens.push(`작업 특성: ${safeContext}`);
    burdens.push(`데이터 특성과 양을 함께 계산한 예상 부담: ${workloadAssessment.levelLabel} (${workloadAssessment.score}/100)`);

    const opportunities = [];
    opportunities.push(`구체적 작업 목표를 의미화: ${safeObjective}`);
    opportunities.push(`사회적 가치와 연결: ${safeImpact}`);
    opportunities.push(`프레임 적용 목적: ${primaryFrameRule.purpose}`);
    if (fatigueLevel !== "low") opportunities.push("짧은 시간 안에 끝낼 수 있다는 완료 기대감 제공");
    if (riskLevel !== "low") opportunities.push("작업자의 판단 역량을 과장 없이 인정");
    opportunities.push("작업 순서·작업량·휴식 주기·추천 설정을 작업자가 조정할 수 있도록 선택권 제공");

    const sdtAnalysis = TaskTypeRegistry.analyzeSDTNeeds({ ...taskTypeInput, taskType: confirmedTaskTypeKey });
    const selectedFrames = sdtAnalysis.frames;
    const taskTypeReason = confirmedTaskTypeKey === taskTypeRecommendation.key
      ? taskTypeRecommendation.reason
      : `Requester가 ${confirmedTaskType.label}를 최종 Task Type으로 선택했습니다. ${confirmedTaskType.description}이라는 작업 경험 특성을 기준으로 분석합니다.`;

    return {
      title: this.cleanInput(title),
      category,
      theme: activeProfile.themeName,
      riskLevel,
      fatigueLevel,
      objective: safeObjective,
      socialImpact: safeImpact,
      workerContext: safeContext,
      workload,
      workloadAssessment,
      inferredTaskTypes,
      primaryTaskType,
      taskType: confirmedTaskTypeKey,
      taskTypeLabel: confirmedTaskType.label,
      taskTypeReason,
      taskTypeCharacteristics: confirmedTaskType.characteristics,
      taskTypeRecommendation,
      psychologicalBurden: burdens,
      motivationalOpportunity: opportunities,
      selectedFrames,
      frameSelectionReason: this.explainFrameSelection(inferredTaskTypes, selectedFrames, primaryTaskType, sdtAnalysis),
      constraintsApplied: [
        "후보별 한국어 5문장",
        "죄책감 유발 표현 금지",
        "생산성 압박 또는 성과 강요 금지",
        "작업 목표 1회 이상 포함",
        "확정된 Task Type과 workload·risk·context를 함께 분석하여 핵심 SDT 프레임 2개 선택",
        "선택되지 않은 SDT 프레임을 최종 문구에 기계적으로 추가하지 않음",
        "극단값을 임의로 평균화하지 않고 조건 충돌 시 경고와 대안 제시"
      ]
    };
  }

  inferTaskTypes(title, category, description, riskLevel, fatigueLevel, socialImpact = "") {
    const recommendation = TaskTypeRegistry.recommendTaskType({ title, category, description, riskLevel, fatigueLevel, socialImpact });
    return recommendation.ranked
      .filter(item => item.score > 0)
      .slice(0, 3)
      .map((item, index) => ({
        type: item.label,
        evidence: index === 0 ? recommendation.reason : `${item.label} 관련 보조 신호가 함께 감지되었습니다.`,
        confidence: index === 0 ? recommendation.confidence : Math.max(0.5, recommendation.confidence - index * 0.12)
      }));
  }

  selectMotivationalFrames(riskLevel, fatigueLevel, category, inferredTaskTypes = []) {
    const primaryTaskType = this.selectPrimaryTaskType(inferredTaskTypes);
    return [...this.getFrameRule(primaryTaskType).frames];
  }

  selectPrimaryTaskType(inferredTaskTypes = []) {
    const types = inferredTaskTypes.map(item => item.type);
    const configuredLabels = Object.values(TaskTypeRegistry.TASK_TYPES).map(type => type.label);
    return configuredLabels.find(type => types.includes(type)) || TaskTypeRegistry.TASK_TYPES.general_low_risk.label;
  }

  getFrameRule(taskType) {
    const type = TaskTypeRegistry.getTaskType(taskType) || TaskTypeRegistry.TASK_TYPES.general_low_risk;
    return {
      psychologicalType: type.psychologicalType,
      burden: type.burden,
      frames: [...type.preferredFrames],
      frameLabel: type.preferredFrames.map(frame => this.toFrameLabel(frame)).join(" + "),
      purpose: type.purpose,
      taskType: type.key,
      taskTypeLabel: type.label,
      reviewReasons: type.reviewReasons
    };
  }

  toFrameLabel(frame = "") {
    if (/Autonomy/.test(frame)) return "자율성";
    if (/Competence/.test(frame)) return "유능감";
    if (/Appreciation/.test(frame)) return "관계성(감사)";
    return "관계성(의미감)";
  }

  explainFrameSelection(inferredTaskTypes, selectedFrames, primaryTaskType = "", sdtAnalysis = {}) {
    const detectedTypes = inferredTaskTypes.map(item => item.type).join(", ");
    const rule = this.getFrameRule(primaryTaskType || this.selectPrimaryTaskType(inferredTaskTypes));
    const selectedLabel = selectedFrames.map(frame => this.toFrameLabel(frame)).join(" + ");
    return `확정된 Task Type은 ${rule.taskTypeLabel}이며, 함께 감지된 작업 신호는 ${detectedTypes || rule.taskTypeLabel}입니다. Task Type 우선순위만 고정 적용하지 않고 workload·risk·context를 함께 분석해 ${selectedLabel || rule.frameLabel}을 추천했습니다.`;
  }

  getFrameNeed(frame = "") {
    if (/Autonomy|자율/.test(frame)) return "autonomy";
    if (/Competence|유능/.test(frame)) return "competence";
    return "relatedness";
  }

  buildReviewCriteria(profile = {}) {
    const primaryTaskType = profile.primaryTaskType || TaskTypeRegistry.TASK_TYPES.general_low_risk.label;
    const selectedFrames = Array.isArray(profile.selectedFrames) ? profile.selectedFrames : [];
    const allFrames = ["Autonomy support", "Competence", "Meaningfulness/Relatedness"];
    const orderedFrames = [...selectedFrames, ...allFrames]
      .filter((frame, index, frames) => frames.findIndex(item => this.getFrameNeed(item) === this.getFrameNeed(frame)) === index);
    const shouldIncludeOptional = (profile.workloadAssessment?.score || 0) >= 40
      || profile.riskLevel !== "low"
      || profile.fatigueLevel !== "low"
      || (profile.inferredTaskTypes || []).length > 1;
    const visibleFrames = shouldIncludeOptional ? orderedFrames.slice(0, 3) : orderedFrames.slice(0, 2);

    const checks = {
      autonomy: "지나친 명령형이나 성과 압박 없이, 작업자가 판단 속도·휴식·가능한 설정을 선택할 수 있다고 안내하는지 확인합니다.",
      competence: "작업자의 판단 능력과 구체적인 기여를 신뢰하되 정답이나 성과를 과장하지 않는지 확인합니다.",
      relatedness: "참여에 대한 감사와 사회적 의미를 구체적으로 전달하되 죄책감이나 과도한 책임을 유발하지 않는지 확인합니다."
    };
    const labels = {
      autonomy: "자율성",
      competence: "유능감",
      relatedness: /Appreciation/.test(selectedFrames.find(frame => this.getFrameNeed(frame) === "relatedness") || "")
        ? "관계성 · 감사"
        : "관계성 · 의미감"
    };
    const icons = { autonomy: "lucide-sliders-horizontal", competence: "lucide-badge-check", relatedness: "lucide-heart-handshake" };
    const reasons = this.getFrameRule(primaryTaskType).reviewReasons;

    return visibleFrames.map((frame, index) => {
      const need = this.getFrameNeed(frame);
      return {
        need,
        frame,
        label: labels[need],
        icon: icons[need],
        priority: index === 0 ? "core" : index === 1 ? "support" : "optional",
        priorityLabel: index === 0 ? "핵심" : index === 1 ? "보조" : "선택",
        whyNeeded: reasons[need],
        messageCheck: checks[need],
        selected: selectedFrames.some(selected => this.getFrameNeed(selected) === need)
      };
    });
  }

  cleanInput(value) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  inferObjective(title, description, activeProfile) {
    const source = `${title || ""} ${description || ""}`.trim();
    if (!source) return "제공된 항목을 신중하게 검토하고 가장 적절한 라벨을 선택하기";
    return `${source.slice(0, 60)}${source.length > 60 ? "..." : ""} 관련 항목을 신중하게 분류하기`;
  }

  /**
   * LLM에 전달할 구조화 프롬프트를 생성한다.
   * 실제 배포 시 이 문자열을 서버 API로 보내고, 브라우저에는 API key를 두지 않는다.
   */
  buildStructuredPrompt(profile, phase = "both") {
    return `You are a psychological message generation agent for microtask crowdsourcing.

Your goal is to generate a short motivational message that reduces worker dropout during a 10?15 minute task.
Do not generate generic encouragement. First, infer the task's psychological burden and motivational opportunity from the structured input.

Input:
- Task title: ${profile.title}
- Task goal: ${profile.objective}
- Confirmed Task Type: ${profile.taskTypeLabel} (${profile.taskType})
- Task Type selection reason: ${profile.taskTypeReason}
- Task Type characteristics: ${(profile.taskTypeCharacteristics || []).map(item => item.label).join(", ")}
- Task Type role: worker-experience classification, not an interface or HIT type
- Risk level: ${profile.riskLevel}
- Expected fatigue: ${profile.fatigueLevel}
- Social impact: ${profile.socialImpact}
- Worker context: ${profile.workerContext}
- Data type: ${profile.workload.dataType || "not specified"}
- Data complexity: ${profile.workload.complexity || "not specified"}
- Sensitive data: ${profile.workload.sensitiveData || "none"}
- Criteria clarity: ${profile.workload.criteriaClarity || "not specified"}
- Subjectivity: ${profile.workload.subjectivity || "not specified"}
- Total data count: ${profile.workload.totalCount || 0}
- Batch size: ${profile.workload.batchSize || 0}
- Repetition count: ${profile.workload.repetitionCount || 0}
- Estimated minutes per item: ${profile.workload.itemEstimatedMinutes || 0}
- Total time limit: ${profile.workload.totalTimeLimitMinutes || 0}
- Break frequency: ${profile.workload.breakFrequencyMinutes || 0}
- Worker-adjustable options: ${(profile.workload.autonomyOptions || []).join(", ")}
- Calculated workload score: ${profile.workloadAssessment.score}/100 (${profile.workloadAssessment.levelLabel})
- Constraint warnings: ${(profile.workloadAssessment.warnings || []).join(" | ") || "none"}
- Additional task-experience signals: ${profile.inferredTaskTypes.map(item => item.type).join(", ")}
- Primary psychological task type: ${this.getFrameRule(profile.primaryTaskType).psychologicalType}
- Selected motivational framing: ${profile.selectedFrames.join(", ")}
- Generation phase: ${phase}

Step 1. Preserve the task-specific selected frame priority.
- Still generate three before-task candidates: Meaningfulness, Competence, and Autonomy support.
- Each candidate must be exactly 5 complete, naturally connected sentences.
- finalBeforeText has no sentence-count limit.
- finalBeforeText must naturally blend only the candidates matching the selected frames.
- Do not mechanically add an unselected SDT frame to finalBeforeText.

Step 2. Generate a before-task message under these constraints:
- Korean
- Exactly 5 complete sentences for each candidate
- Warm and human, as if a real requester wrote it directly
- Avoid stiff institutional phrasing; do not overuse "-합니다"
- Use natural Korean honorifics such as "-해 주세요", "-괜찮아요", "-도움이 됩니다"
- Use natural connectors such as "그리고", "혹시", "괜찮습니다" where helpful
- Avoid certificate-like phrases such as "핵심 데이터", "기술 발전의 토대", "직접 기여", "진심으로 감사"
- Do not invent label-specific rules that are not in the task guidelines
- The final before-task message must start with: 우선 저희 "${profile.title}" 작업에 참여해주셔서 진심으로 감사합니다.
- No guilt-inducing language
- No productivity pressure
- Mention the concrete task goal once
- Mention social impact only when Meaningfulness / Relatedness is selected
- Acknowledge fatigue or emotional burden only when it matches the selected frames
- Write as one coherent short paragraph, not as disconnected constraint-satisfying sentences
- Do not mention SDT, frame names, category rules, or internal system rules in worker-facing messages
- Make each sentence follow naturally from the previous sentence
- An exclamation mark or one light emoji is allowed, but use at most one per message

Extreme-condition handling:
- Never normalize unusual input values toward an average or silently replace them.
- Treat very high or very low values as valid requirements.
- Check conflicts among time, data volume, complexity, difficulty, and breaks.
- If the requirements are unrealistic, clearly explain why and provide feasible alternatives.
- Use a strong recommendation or warning when worker safety, sensitive data, or impossible timing requires it.
- Present recommendations as editable defaults; the requester and worker may adjust allowed settings.

Step 3. Generate an after-task message candidate:
- Korean
- Exactly 5 complete, naturally connected sentences
- Thank the worker specifically
- Mention the completed contribution
- Avoid excessive praise
- Make the thanks, contribution, and reward feel connected in context
- Close the current task only; do not invite the worker to the next task
- Describe social impact modestly as data quality improvement, not as a direct life-saving result
- Sound like a sincere note from a requester, not a formal certificate

Return JSON only:
{
  "selected_frames": [],
  "before_message": "...",
  "after_message": "..."
}`;
  }

  /**
   * 브라우저 데모용 로컬 생성기.
   * API key 없이도 작동하도록 하되, 문장 생성은 구조화 프롬프트의 제약조건을 따르게 설계했다.
   * 서버에 LLM API를 연결할 경우 이 함수를 callLLMStructuredPrompt()로 대체하면 된다.
   */
  synthesizeLocalMessage(profile, strategy, phase, reward = "1.50") {
    const objective = profile.objective;
    const impact = profile.socialImpact;
    const fatiguePhrase = profile.fatigueLevel === "high"
      ? "집중이 꽤 필요한 작업일 수 있지만"
      : profile.fatigueLevel === "medium"
        ? "반복되는 판단으로 약간의 피로가 있을 수 있지만"
        : "짧고 명확한 흐름으로 진행되는 작업입니다";

    const estimatedMinutes = profile.workloadAssessment.estimatedTotalMinutes;
    const taskLengthPhrase = estimatedMinutes
      ? `전체 예상 소요 시간은 약 ${estimatedMinutes}분입니다`
      : "전체 예상 소요 시간은 입력된 작업량에 따라 달라집니다";
    const autonomyLabels = {
      order: "작업 순서",
      difficulty: "작업 난이도",
      batch: "한 번에 처리할 작업량",
      breaks: "휴식 주기",
      interface: "작업 방식",
      recommendations: "추천 설정",
      conditions: "작업 중 조건"
    };
    const adjustable = (profile.workload.autonomyOptions || [])
      .map(value => autonomyLabels[value])
      .filter(Boolean);
    const autonomyPhrase = adjustable.length
      ? `${adjustable.slice(0, 3).join(", ")}은(는) 직접 조정할 수 있습니다`
      : "추천 설정은 필요에 따라 직접 수정할 수 있습니다";

    if (phase === "before") {
      if (strategy === "meaningfulness") {
        return `참여해 주셔서 감사합니다! 이번 작업에서는 ${objective}를 함께 확인하려고 합니다. 작아 보이는 판단도 모이면 ${impact}에 필요한 데이터를 더 믿을 수 있게 만드는 데 도움이 됩니다. ${fatiguePhrase}, ${taskLengthPhrase}. 그리고 혹시 애매한 항목이 있으면 무리해서 맞히려 하기보다 안내 기준에 맞춰 천천히 골라 주세요.`;
      }
      if (strategy === "competence") {
        return `이 작업은 빠르게 누르는 것보다 천천히 구분해 주시는 눈이 더 중요합니다. ${objective} 과정에서는 사람의 맥락 판단이 데이터 품질을 꽤 많이 좌우하거든요. 그리고 그 데이터는 ${impact}라는 목표에 맞춰 쓰이게 됩니다. ${taskLengthPhrase}이니, 확인 가능한 기준 안에서 편한 속도로 진행해 주세요. 애매한 항목은 안내 기준을 다시 살펴본 뒤 가장 적절하다고 생각하는 쪽을 선택해 주시면 됩니다.`;
      }
      if (strategy === "autonomy") {
        return `시작하기 전에 짧게 안내드릴게요. ${objective}를 하다 보면 애매한 항목이 있을 수 있는데, 그럴 때는 무리해서 추측하지 않아도 괜찮습니다. ${autonomyPhrase}. ${fatiguePhrase}, 본인에게 편한 속도로 진행하고 설정된 주기에 맞춰 쉬어도 괜찮습니다. 이렇게 모인 판단은 ${impact}에 필요한 데이터 품질을 높이는 데 쓰입니다.`;
      }
      return `참여해 주셔서 감사합니다! ${objective} 작업은 ${impact}에 필요한 작은 판단들을 차곡차곡 모으는 과정입니다. ${fatiguePhrase}, ${taskLengthPhrase}. 너무 부담 갖지 마시고, 기준을 보면서 한 항목씩 편하게 선택해 주세요. 판단이 어려운 항목은 무리해서 단정하지 않고 안내된 범위 안에서 골라 주셔도 괜찮습니다.`;
    }

    if (strategy === "quality") {
      return `작업 마무리해 주셔서 감사합니다! 방금 제출해 주신 판단은 ${objective} 관련 데이터를 더 정리된 형태로 만드는 데 반영됩니다. 세심하게 기준을 적용해 주신 덕분에 결과를 안정적으로 검토할 수 있습니다. 그리고 이 데이터는 ${impact}라는 목표에 맞춰 조심스럽게 활용하겠습니다. 승인된 보상금 $${reward}이(가) 기록되었습니다.`;
    }
    if (strategy === "effort") {
      return `끝까지 함께해 주셔서 감사합니다. 반복해서 봐야 하는 항목들을 차분히 살펴봐 주셨습니다. 제출해 주신 응답은 ${objective} 데이터 구성에 반영됩니다. 오늘 남겨주신 판단이 ${impact}에 필요한 데이터 품질로 이어질 수 있도록 잘 활용하겠습니다. 작업은 여기에서 마무리되며 참여해 주신 시간에 다시 한번 감사드립니다.`;
    }
    if (strategy === "autonomy") {
      return `작업을 마무리해 주셔서 감사합니다. 애매한 항목을 무리해서 추측하지 않고 안내 기준 안에서 살펴봐 주신 점이 데이터 정리에 도움이 됩니다. 제출해 주신 판단은 ${objective} 데이터의 안정성을 높이는 데 반영됩니다. 또한 ${impact}에 필요한 검토 자료로 차분히 참고하겠습니다. 참여해 주신 점 다시 한번 감사드립니다.`;
    }
    return `작업을 완료해 주셔서 감사합니다! ${objective}를 끝까지 차분히 살펴봐 주셨습니다. 제출해 주신 응답은 ${impact}에 필요한 데이터 구축 과정에 반영됩니다. 남겨주신 판단은 전체 결과를 점검하고 정리하는 데 도움이 됩니다. 참여해 주신 시간과 수고에 다시 한번 감사드립니다.`;
  }

  /**
   * 선택형 메시지 세트를 만든다. 각 옵션은 같은 템플릿을 반복하는 것이 아니라
   * 서로 다른 심리 프레임을 명시적으로 반영한다.
   */
  generateInterventions(title, category, description, riskLevel, fatigueLevel, objective, socialImpact, workerContext, reward = "1.50", workload = {}, taskType = "") {
    const profile = this.buildPsychologicalProfile(
      title,
      category,
      description,
      riskLevel,
      fatigueLevel,
      objective,
      socialImpact,
      workerContext,
      workload,
      workload.singleTaskLimitMinutes || 15,
      taskType
    );

    const beforeStrategies = ["meaningfulness", "competence", "autonomy"];
    const afterStrategies = ["appreciation", "quality", "autonomy"];

    const beforeOptions = beforeStrategies.map(strategy =>
      this.synthesizeLocalMessage(profile, strategy, "before", reward)
    );
    const afterOptions = afterStrategies.map(strategy =>
      this.synthesizeLocalMessage(profile, strategy, "after", reward)
    );
    const finalMessages = this.synthesizeFinalMessages(profile, beforeOptions, afterOptions, reward);

    return {
      beforeOptions,
      afterOptions,
      beforeLabels: ["의미감/사회적 가치", "유능감/판단 신뢰", "자율성/부담 완화"],
      afterLabels: ["감사/관계성", "기여/유능감", "자율적 마무리"],
      psychologicalFactors: {
        inferredTaskTypes: profile.inferredTaskTypes,
        primaryTaskType: profile.primaryTaskType,
        primaryPsychologicalType: this.getFrameRule(profile.primaryTaskType).psychologicalType,
        taskType: profile.taskType,
        taskTypeLabel: profile.taskTypeLabel,
        taskTypeReason: profile.taskTypeReason,
        taskTypeCharacteristics: profile.taskTypeCharacteristics,
        taskContext: profile.theme,
        psychologicalBurdens: profile.psychologicalBurden,
        motivationalFactors: profile.motivationalOpportunity,
        sdtNeeds: this.framesToSdtNeeds(profile.selectedFrames),
        selectedFrames: profile.selectedFrames,
        reviewCriteria: this.buildReviewCriteria(profile),
        frameSelectionReason: profile.frameSelectionReason,
        constraintsApplied: profile.constraintsApplied,
        workloadAssessment: profile.workloadAssessment
      },
      selectedFrames: profile.selectedFrames,
      taskType: profile.taskType,
      taskTypeLabel: profile.taskTypeLabel,
      taskTypeReason: profile.taskTypeReason,
      reviewCriteria: this.buildReviewCriteria(profile),
      beforeCandidateFrames: ["Meaningfulness/Relatedness", "Competence", "Autonomy support"],
      afterCandidateFrames: ["Relatedness/Appreciation", "Competence", "Autonomy support"],
      primaryTaskType: profile.primaryTaskType,
      psychologicalBurden: profile.psychologicalBurden,
      motivationalOpportunity: profile.motivationalOpportunity,
      structuredPrompt: this.buildStructuredPrompt(profile, "both"),
      theme: profile.theme,
      finalBeforeText: finalMessages.finalBeforeText,
      finalAfterText: finalMessages.finalAfterText
    };
  }

  framesToSdtNeeds(frames = []) {
    const needs = [];
    frames.forEach(frame => {
      if (/Meaningfulness|Relatedness|Appreciation/.test(frame)) needs.push("relatedness");
      if (/Competence/.test(frame)) needs.push("competence");
      if (/Autonomy/.test(frame)) needs.push("autonomy");
    });
    return [...new Set(needs)];
  }

  getBeforeCandidateIndexForFrame(frame = "") {
    if (/Competence|유능/.test(frame)) return 1;
    if (/Autonomy|자율/.test(frame)) return 2;
    return 0;
  }

  getSelectedBeforeCandidateIndexes(selectedFrames = []) {
    const indexes = selectedFrames.map(frame => this.getBeforeCandidateIndexForFrame(frame));
    return [...new Set(indexes)].slice(0, 3);
  }

  stripBeforeOpening(message = "", title = "") {
    const safeTitle = this.cleanInput(title);
    const opening = `우선 저희 "${safeTitle}" 작업에 참여해주셔서 진심으로 감사합니다.`;
    return String(message || "")
      .replace(opening, "")
      .replace(/^참여해\s*주셔서\s*(?:진심으로\s*)?감사합니다[.!]?\s*/i, "")
      .replace(/^감사합니다[.!]?\s*/i, "")
      .replace(/^시작하기\s*전에\s*짧게\s*안내드릴게요[.!]?\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  splitSentences(text = "") {
    return String(text || "")
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?。！？])\s+/)
      .map(sentence => sentence.trim())
      .filter(Boolean);
  }

  normalizeRequesterTone(sentence = "") {
    return String(sentence || "")
      .replace(/여러분의/g, "살펴봐 주신")
      .replace(/여러분/g, "작업자님")
      .replace(/최선을 다해 선택하시는 것만으로도/g, "안내 기준에 맞춰 가능한 만큼 판단해 주시는 것만으로도")
      .replace(/최선을 다해 선택해 주시면/g, "안내 기준에 맞춰 가능한 만큼 판단해 주시면")
      .replace(/자율주행 시스템의 신뢰성에 큰 도움이 됩니다/g, "자율주행 인식 데이터를 더 안정적으로 다듬는 데 도움이 됩니다")
      .replace(/실제 도로 안전을 개선하는 데 직접 연결됩니다/g, "도로 장면 인식 데이터를 더 조심스럽게 다듬는 데 쓰입니다")
      .replace(/더 많은 생명을 보호할 수 있는 데이터가 됩니다/g, "안전 관련 데이터를 더 신중하게 정리하는 데 도움이 됩니다")
      .replace(/생명을 보호하는/g, "안전과 관련된")
      .replace(/생명을 구하고/g, "의료 데이터를 더 신중하게 다듬고")
      .replace(/직접 연결됩니다/g, "데이터를 다듬는 데 쓰입니다")
      .replace(/직접 연결될 수 있습니다/g, "데이터를 다듬는 데 도움이 될 수 있습니다")
      .replace(/직접 기여합니다/g, "도움이 됩니다")
      .replace(/큰 도움이 됩니다/g, "도움이 됩니다")
      .replace(/중요한 과정입니다/g, "필요한 과정입니다")
      .replace(/흐린 이미지에서도/g, "흐린 이미지가 있어도")
      .replace(/데이터를 더 잘 다듬는 데 도움이 됩니다/g, "전체 결과를 더 안정적으로 정리하는 데 보탬이 됩니다")
      .replace(/^특히\s+/, "")
      .replace(/도움이 되는 바탕이 됩니다/g, "도움이 됩니다")
      .replace(/데이터를 더 잘 다듬는 데 도움이 됩니다/g, "전체 결과를 더 안정적으로 정리하는 데 보탬이 됩니다")
      .replace(/\s+/g, " ")
      .trim();
  }

  isBoilerplateFinalSentence(sentence = "") {
    return /^(제공된 가이드라인에 따라 신중하게 판단해 주시면 됩니다\.?|시작하기 전에|감사합니다)/.test(sentence.trim());
  }

  withConnector(sentence = "", connector = "") {
    const trimmed = sentence.trim();
    if (!trimmed) return "";
    if (/^(그리고|그래서|다만|혹시|이렇게|또한|이때)\s/.test(trimmed)) return trimmed;
    return `${connector}${trimmed}`;
  }

  composeFinalBeforeFromCandidates(title, selectedFrames = [], beforeOptions = [], fallbackText = "") {
    const safeTitle = this.cleanInput(title);
    const opening = `우선 저희 "${safeTitle}" 작업에 참여해주셔서 진심으로 감사합니다.`;
    const selectedIndexes = this.getSelectedBeforeCandidateIndexes(selectedFrames);
    const selectedBodies = selectedIndexes
      .map(index => this.stripBeforeOpening(beforeOptions[index], safeTitle))
      .filter(Boolean);

    if (selectedBodies.length === 0) {
      return fallbackText || opening;
    }

    const seen = new Set();
    const sentences = [];
    selectedBodies.forEach(body => {
      this.splitSentences(body).forEach(sentence => {
        const normalized = this.normalizeRequesterTone(sentence);
        if (!normalized || this.isBoilerplateFinalSentence(normalized) || seen.has(normalized)) return;
        seen.add(normalized);
        sentences.push(normalized);
      });
    });

    const used = new Set();
    const pick = (predicate) => {
      const sentence = sentences.find(item => !used.has(item) && predicate(item));
      if (sentence) used.add(sentence);
      return sentence || "";
    };

    const intro = pick(item => /이번 작업|이 작업|작업은|작업에서는/.test(item))
      || pick(item => /확인|분류/.test(item))
      || sentences[0]
      || "";
    const impact = pick(item => /데이터|자율주행|도로|안전|커뮤니티|의료|접근성|품질/.test(item));
    const guidance = pick(item => /애매|무리|기준|천천히|속도|괜찮|흐린|불편|가능한 만큼/.test(item));
    const competence = pick(item => /세심|신중|차분|판단|살펴|다듬/.test(item));

    const finalSentences = [opening];
    if (intro) finalSentences.push(intro);
    if (impact) finalSentences.push(this.withConnector(impact, "그리고 "));
    if (guidance) finalSentences.push(this.withConnector(guidance, /^(흐린|애매)/.test(guidance) ? "혹시 " : "다만 "));
    if (competence) finalSentences.push(this.withConnector(competence, "이렇게 "));

    sentences
      .filter(sentence => !used.has(sentence))
      .slice(0, Math.max(0, 5 - finalSentences.length))
      .forEach((sentence) => {
        finalSentences.push(this.withConnector(sentence, "그리고 "));
      });

    return finalSentences.join(" ").replace(/\s+/g, " ").trim();
  }

  polishAfterMessage(message = "") {
    const polished = String(message || "")
      .replace(/소중한 시간을 내어\s*/g, "")
      .replace(/진심으로 감사드립니다/g, "감사합니다")
      .replace(/작업을 완료해 주셔서 감사합니다/g, "작업을 끝까지 진행해 주셔서 감사합니다")
      .replace(/정서적으로 부담스러웠을 수 있는 작업임에도\s*(?:편안한|편한|본인에게 편한|본인의)\s*속도로\s*참여해 주셔서(?: 특히)? 감사(?:드립니다|합니다)\.?/g, "정서적으로 부담스러울 수 있는 작업에 참여해 주신 점 다시 한번 감사드립니다.")
      .replace(/(?:편안한|편한|본인에게 편한|본인의)\s*속도로\s*참여해 주셔서(?: 특히)? 감사(?:드립니다|합니다)\.?/g, "참여해 주신 점 다시 한번 감사드립니다.")
      .replace(/본인의 속도로 판단해 주신 점도 데이터에는 중요한 신호가 됩니다\.?/g, "안내 기준 안에서 살펴봐 주신 점이 데이터 정리에 도움이 됩니다.")
      .replace(/이번 결과가 자율주행 시스템의 위험 인식 성능을 높이는 데 도움이 될 것입니다/g, "이번 결과는 자율주행 시스템의 위험 인식 데이터를 점검할 때 참고하겠습니다")
      .replace(/자율주행 시스템의 위험 인식 성능을 높이는 데 도움이 될 것입니다/g, "자율주행 시스템의 위험 인식 데이터를 점검할 때 참고하겠습니다")
      .replace(/보행자 보호를 위한 데이터 품질 개선에 기여하셨습니다/g, "보행자 보호와 관련된 데이터 품질을 더 차분히 다듬는 데 도움이 됩니다")
      .replace(/기여하셨습니다/g, "도움이 됩니다")
      .replace(/기여해 주셔서 감사합니다/g, "함께해 주셔서 감사합니다")
      .replace(/직접 기여(?:하실 수 있습니다|합니다|할 것입니다)?/g, "도움이 됩니다")
      .replace(/직접 연결됩니다/g, "데이터를 다듬는 데 쓰입니다")
      .replace(/직접 연결될 수 있습니다/g, "데이터를 다듬는 데 도움이 될 수 있습니다")
      .replace(/생명을 보호하는/g, "안전과 관련된")
      .replace(/더 많은 생명을 보호할 수 있는 데이터가 됩니다/g, "안전 관련 데이터를 더 신중하게 정리하는 데 도움이 됩니다")
      .replace(/핵심 데이터/g, "중요한 데이터")
      .replace(/기술 발전의 토대/g, "데이터를 더 좋게 만드는 바탕")
      .replace(/큰 도움이 됩니다/g, "도움이 됩니다")
      .replace(/도움이 많이 되었습니다/g, "도움이 되었습니다")
      .replace(/이 작업은 여기서 잘 마무리되었습니다\.?/g, "")
      .replace(/[^.!?。]*다음 작업[^.!?。]*[.!?。]?/g, "")
      .replace(/\s+([.!?。])/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    return polished || "작업을 끝까지 진행해 주셔서 감사합니다. 제출해 주신 판단은 결과를 정리하는 데 잘 참고하겠습니다.";
  }

  synthesizeFinalMessages(profile, beforeOptions = [], afterOptions = [], reward = "1.50") {
    const objective = profile.objective;
    const impact = profile.socialImpact;
    let fallbackBeforeText = "";

    if (profile.taskType === "emotionally_demanding") {
      fallbackBeforeText = `이번 작업은 ${objective}를 안내 기준에 맞춰 확인하는 일입니다. 다루는 내용이 불편하게 느껴질 수 있으니, 잠시 호흡을 두고 본인의 속도에 맞춰 진행해 주세요. 애매한 항목은 무리해서 맞히려 하기보다 안내 기준 안에서 가능한 만큼만 판단해 주셔도 괜찮습니다.`;
    } else if (profile.taskType === "high_responsibility") {
      fallbackBeforeText = `이번 작업은 ${objective}를 차분하고 정확하게 살펴보는 일입니다. 이런 판단은 ${impact}에 맞닿아 있어, 기준을 세심하게 적용하는 능력이 특히 중요합니다. 빠르게 처리하기보다 확인 가능한 근거를 중심으로 안정적으로 판단해 주세요.`;
    } else if (profile.taskType === "repetitive_cognitive") {
      fallbackBeforeText = `이번 작업은 ${objective}를 같은 기준으로 반복해서 확인하는 일입니다. 항목이 비슷하게 이어져 지루함이나 피로가 생길 수 있으니, 본인의 속도에 맞춰 차분히 진행해 주세요. 한 항목씩 기준을 꾸준히 적용해 주시는 판단이 결과를 안정적으로 만드는 데 도움이 됩니다.`;
    } else if (profile.taskType === "socially_meaningful") {
      fallbackBeforeText = `이번 작업은 ${objective}를 통해 ${impact}에 필요한 판단을 정리하는 일입니다. 작게 보이는 선택도 사회적으로 필요한 데이터를 더 분명하게 만드는 과정에 포함됩니다. 기준을 세심하게 적용해 주시는 판단이 참여의 가치를 잘 살려 줍니다.`;
    } else {
      fallbackBeforeText = `이번 작업은 ${objective}를 가볍게 확인해 주시면 되는 일입니다. 부담을 크게 느끼실 필요 없이, 본인의 속도에 맞춰 안내 기준대로 골라 주세요. 참여해 주신 시간과 응답은 전체 결과를 정리하는 데 차분히 반영하겠습니다.`;
    }

    return {
      finalBeforeText: this.composeFinalBeforeFromCandidates(
        profile.title,
        profile.selectedFrames,
        beforeOptions,
        `우선 저희 "${profile.title}" 작업에 참여해주셔서 진심으로 감사합니다. ${fallbackBeforeText}`
      ),
      finalAfterText: this.polishAfterMessage(`작업을 끝까지 진행해 주셔서 감사합니다. 제출해 주신 판단은 ${objective} 관련 데이터를 정리할 때 차분히 참고하겠습니다. 덕분에 ${impact}라는 목표에 맞춰 결과를 조금 더 안정적으로 점검할 수 있습니다. 승인된 보상금 $${reward}이(가) 기록되었습니다. 참여해 주신 점 다시 한번 감사드립니다.`)
    };
  }

  /**
   * 에이전트 심리 프레임 분석 로그.
   * 사용자에게는 내부 chain-of-thought가 아니라, 특허 문서에 설명 가능한 처리 단계만 보여준다.
   */
  async generateThoughtsLog(title, category, description, riskLevel, fatigueLevel, objective, socialImpact, workerContext, workload = {}, callback, taskType = "") {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const profile = this.buildPsychologicalProfile(title, category, description, riskLevel, fatigueLevel, objective, socialImpact, workerContext, workload, workload.singleTaskLimitMinutes || 15, taskType);

    callback(`[시스템] 마이크로태스크 이탈 방지를 위한 맥락 기반 메시지 생성 절차를 시작합니다.`, "system");
    await sleep(250);

    callback(`[1단계: 작업 맥락 추출] 작업명, 목표, 위험도, 피로도, 사회적 가치, 작업 수행 특성을 구조화했습니다.`, "process");
    callback(`  - 확정 Task Type: ${profile.taskTypeLabel}`, "process");
    callback(`  - 선택 이유: ${profile.taskTypeReason}`, "process");
    callback(`  - 작업 목표: ${profile.objective}`, "process");
    callback(`  - 사회적 가치: ${profile.socialImpact}`, "process");
    callback(`  - 작업 수행 특성: ${profile.workerContext}`, "process");
    await sleep(300);

    callback(`[2단계: 심리 부담 추정] 다음 부담 요인을 감지했습니다.`, "process");
    profile.psychologicalBurden.forEach(item => callback(`  - ${item}`, "process"));
    profile.workloadAssessment.warnings.forEach(item => callback(`  - 조건 경고: ${item}`, "warning"));
    await sleep(300);

    callback(`[3단계: 동기 기회 추출] 작업 이탈 방지를 위해 활용 가능한 동기 요인을 정리했습니다.`, "process");
    profile.motivationalOpportunity.forEach(item => callback(`  - ${item}`, "process"));
    await sleep(300);

    callback(`[4단계: 균형 프레임 구성] 자율성 + 유능감 + 관계성 관점을 각각 포함합니다.`, "process");
    await sleep(300);

    callback(`[5단계: 생성 제약조건 적용] 후보별 5문장, 비과장, 비죄책감, 비압박, 구체 목표 1회, 사회적 가치 1회, 완료 가능성 포함 조건을 적용합니다.`, "process");
    await sleep(300);

    callback(`[완료] 작업 전/후 메시지 후보와 LLM 연동용 구조화 프롬프트가 생성되었습니다.`, "success");
  }
}
