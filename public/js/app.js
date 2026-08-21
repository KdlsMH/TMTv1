/**
 * Agentic Crowdsourcing App Controller (Korean Localized Version)
 * Manages view routing, local state, interactive SVGs, 3-Option psychological selectors,
 * Ground-Truth correction loop, Intrinsic motivation survey (NASA-TLX removed), and JSON results export.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize AI Generator
  const aiGenerator = new AgenticMotivationGenerator();

  // App State
  let currentTask = null;
  let activeWorkerTask = null;

  // Real-time local draft persistence helper
  const saveDraftToStorage = () => {
    if (!currentTask) return;
    const tasks = JSON.parse(localStorage.getItem("agentic_tasks")) || {};
    const draftTask = {
      ...currentTask,
      id: currentTask.id || "task-draft",
      createdAt: currentTask.createdAt || new Date().toISOString()
    };
    tasks[draftTask.id] = draftTask;
    try {
      localStorage.setItem("agentic_tasks", JSON.stringify(tasks));
    } catch {
      showToast("브라우저 임시 저장에 실패했습니다. 배포 저장을 이용해 주세요.");
    }
  };
  let workerSession = {
    sessionId: null,
    taskId: null,
    status: "opened",
    progress: 0,
    totalItems: 10,
    timerSeconds: 900,
    timerInterval: null,
    timerSpeed: 1,
    selectedOption: null,
    category: "general",
    openedAt: null,
    taskStartedAt: null,
    startedAt: null,
    completedAt: null,
    lastSeenAt: null,
    itemStartedAt: null,
    attemptedItems: 0,
    scoredItems: 0,
    correctItems: 0,
    responses: []
  };

  // Seeding initial default task in localStorage for instant demonstration
  const seedDefaultTask = () => {
    const tasks = JSON.parse(localStorage.getItem("agentic_tasks")) || {};
    // Overwrite default seed task to keep it fresh and perfectly matched
    const defaultTask = {
      id: "task-seed-101",
      title: "폐 X-Ray 영상 판독을 통한 종양 의심 병변 진단",
      category: "medical",
      reward: "2.50",
      timeLimitMinutes: "15",
      description: `### ?? 작업 개요
우리는 "폐 X-Ray 영상 판독" 관련 학습 데이터를 구축하고 있습니다. 목표는 제공된 흉부 방사선 사진에서 종양 의심 조직이나 이상 병변을 세밀하게 판독하고 정확히 분류하는 것입니다.

### ?? 상세 가이드라인 & 분류 수칙
1. 제공된 X-ray 스캔 이미지를 최대한 신중하게 검토하십시오. 미세하게 분포하는 조직의 이상 음영이나 불규칙한 밀도 차이를 관찰하십시오.
2. 분석 대상의 내부 형상을 파악하여 가장 올바르고 정교한 분류 옵션(정상, 이상 발견, 판독 불가)을 선택해 주십시오.
3. 이미지의 왜곡이 심하거나 확실하게 식별할 수 없을 경우, 무리하게 추측하지 말고 선택지 중 가장 보수적인 항목을 선택하십시오.

### ??? 신중도 서약
이 프로젝트에 참여함으로써 귀하는 작업에 온전히 집중할 것을 동의합니다. 귀하가 부여하는 레이블 하나하나에 담긴 소중한 안목이 의료용 진단 알고리즘의 보건 정확성을 제고하고 환자의 귀중한 생명을 지키는 안전망이 됩니다. 감사합니다!`,
      beforeText: "환영합니다! 오늘 저희와 함께 소중한 어노테이션 연구에 참여해 주셔서 진심으로 감사드립니다. 귀하께서 수행하실 이번 업무는 단순한 클릭 작업이 아닙니다. 이 작업은 즉각적으로 폐 X-ray 스캔 이미지에서 폐 종양 의심 이상 병변의 세밀한 형상을 정밀하게 판독함으로써, 궁극적으로 환자의 고귀한 생명을 수호하고 질병 조기 진단 인공지능 기술의 임상적 신뢰도를 극대화하는 데 기여하는 핵심적인 기여 활동입니다. 반복적인 템포 속에서 소외감을 느끼실 수 있으나, 귀하의 세심한 시각이 엮어내는 참값 데이터는 우리 사회의 보이지 않는 안전망이자 생명을 보호하는 소중한 연결고리가 될 것입니다. 높은 책임감을 갖고 동참해 주시는 귀하의 공헌에 진심으로 경의를 표합니다.",
      afterText: "경이로운 기여를 완성하셨습니다! 귀하의 소중한 참여로 모든 주석 레이블링 과정이 전격 완수되었습니다. 귀하가 부지런히 심어주신 엄밀한 판단 조각들은 정밀하게 구조화되어, 마침내 의료 연구 및 병변 판독 영역을 한 단계 앞당기는 가장 핵심적인 초석으로 남게 되었습니다. 기술의 안전성과 진보를 위해 함께 힘써 주신 작업자님께 온 마음을 담아 뜨거운 감사를 올립니다. 귀하의 성실한 공헌으로 승인된 보상금 $2.50은(는) 안전하게 확인되어 귀하의 계정으로 즉시 지급 승인 처리 완료되었습니다. 수고 많으셨습니다!",
      theme: "의료 연구 및 병변 판독 (Medical Research & Diagnostics)",
      createdAt: new Date().toISOString(),
      riskLevel: "medium",
      fatigueLevel: "medium",
      objective: "폐 X-ray 스캔 이미지에서 폐 종양 의심 이상 병변의 세밀한 형상을 파악하기",
      socialImpact: "환자의 생명을 구하고 의료용 진단 알고리즘의 보건 정확성을 제고하기",
      workerContext: "장시간 피로가 누적된 상태에서 모니터를 응시하며 미세 조직 판독에 집중하는 원격 작업 환경"
    };
    tasks[defaultTask.id] = defaultTask;
    localStorage.setItem("agentic_tasks", JSON.stringify(tasks));
  };

  // Do not seed a realistic-looking result. The requester starts from a true empty state.
  const storedTasksAtStart = JSON.parse(localStorage.getItem("agentic_tasks") || "{}");
  if (storedTasksAtStart["task-seed-101"]) {
    delete storedTasksAtStart["task-seed-101"];
    localStorage.setItem("agentic_tasks", JSON.stringify(storedTasksAtStart));
  }

  // DOM Elements - General Router
  const requesterView = document.getElementById("requester-view");
  const workerView = document.getElementById("worker-view");
  const navTabRequester = document.getElementById("nav-tab-requester");
  const navTabWorker = document.getElementById("nav-tab-worker");

  // DOM Elements - Requester Form
  const taskForm = document.getElementById("task-form");
  const btnGenerate = document.getElementById("btn-generate");
  const btnPublish = document.getElementById("btn-publish");
  const btnResetForm = document.getElementById("btn-reset-form");
  const formCompletionText = document.getElementById("form-completion-text");
  const formCompletionFill = document.getElementById("form-completion-fill");

  const taskTitleBox = document.getElementById("task-title");
  const taskRewardBox = document.getElementById("task-reward");
  const taskTimeLimitBox = document.getElementById("task-time-limit");
  const taskDescBox = document.getElementById("task-desc");
  const taskRiskLevelSelect = document.getElementById("task-risk-level");
  const taskFatigueLevelSelect = document.getElementById("task-fatigue-level");
  const taskObjectiveBox = document.getElementById("task-objective");
  const taskSocialImpactBox = document.getElementById("task-social-impact");
  const taskWorkerContextBox = document.getElementById("task-worker-context");
  const taskTypeOptions = document.getElementById("task-type-options");
  const recommendedTaskTypeLabel = document.getElementById("recommended-task-type-label");
  const recommendedTaskTypeReason = document.getElementById("recommended-task-type-reason");
  const btnApplyTaskTypeRecommendation = document.getElementById("btn-apply-task-type-recommendation");
  const exampleHelpButtons = [...document.querySelectorAll(".example-help-btn")];
  const exampleTaskPresets = document.getElementById("example-task-presets");
  const platformOverview = document.getElementById("platform-overview");
  const whyMotivation = document.getElementById("why-motivation");
  const whySdt = document.getElementById("why-sdt");
  const howItWorks = document.getElementById("how-it-works");
  const btnStartDesigning = document.getElementById("btn-start-designing");
  const btnWorkspaceSdt = document.getElementById("btn-workspace-sdt");
  const navWhySdt = document.getElementById("nav-why-sdt");
  const navHowItWorks = document.getElementById("nav-how-it-works");
  const navWorkspace = document.getElementById("nav-workspace");
  const workspaceShell = document.getElementById("workspace-shell");
  const requesterWorkspace = document.getElementById("requester-workspace");
  const requesterProgress = document.getElementById("requester-progress");

  const aiLogBox = document.getElementById("ai-log-box");
  const generationMonitorBar = document.getElementById("generation-monitor-bar");
  const previewContainer = document.getElementById("preview-container");
  const reviewEmptyState = document.getElementById("review-empty-state");
  const generationEditNotice = document.getElementById("generation-edit-notice");
  const btnRestartGeneration = document.getElementById("btn-restart-generation");
  const beforeTextBox = document.getElementById("before-text");
  const afterTextBox = document.getElementById("after-text");
  const finalBeforeTextBox = document.getElementById("final-before-text");
  const finalAfterTextBox = document.getElementById("final-after-text");
  const finalSdtBadges = document.getElementById("final-sdt-badges");
  const finalSdtPrimary = document.getElementById("final-sdt-primary");
  const finalSdtSecondary = document.getElementById("final-sdt-secondary");

  const psychologyFactorPanel = document.getElementById("psychology-factor-panel");
  const llmProviderBadge = document.getElementById("llm-provider-badge");
  const factorTaskTypes = document.getElementById("factor-task-types");
  const factorSelectedFrames = document.getElementById("factor-selected-frames");
  const factorBurdens = document.getElementById("factor-burdens");
  const factorMotivators = document.getElementById("factor-motivators");
  const factorSelectionReason = document.getElementById("factor-selection-reason");
  const reviewCriteriaList = document.getElementById("review-criteria-list");
  const factorPrimaryTask = document.getElementById("factor-primary-task");
  const factorFrameSummary = document.getElementById("factor-frame-summary");
  const factorTaskTypeLabel = document.getElementById("factor-task-type-label");
  const factorTaskTypeReason = document.getElementById("factor-task-type-reason");
  const factorTaskContext = document.getElementById("factor-task-context");
  const factorTaskCharacteristics = document.getElementById("factor-task-characteristics");
  const factorRecommendedSdt = document.getElementById("factor-recommended-sdt");
  const factorContextRisk = document.getElementById("factor-context-risk");
  const factorContextFatigue = document.getElementById("factor-context-fatigue");
  const factorContextTime = document.getElementById("factor-context-time");

  const shareCard = document.getElementById("share-card");
  const shareLinkInput = document.getElementById("share-link-input");
  const btnCopyLink = document.getElementById("btn-copy-link");
  const btnOpenWorker = document.getElementById("btn-open-worker");
  const btnExportResults = document.getElementById("btn-export-results");
  const shareCreatedAt = document.getElementById("share-created-at");

  // DOM Elements - Worker Pre-Task
  const workerPreTask = document.getElementById("worker-pre-task");
  const workerWorkspace = document.getElementById("worker-workspace");
  const workerPostTask = document.getElementById("worker-post-task");
  const workerTaskError = document.getElementById("worker-task-error");

  const workerTaskTitle = document.getElementById("worker-task-title");
  const workerTaskReward = document.getElementById("worker-task-reward");
  const workerMotivationPrime = document.getElementById("worker-motivation-prime");
  const workspaceMotivationPrime = document.getElementById("workspace-motivation-prime");
  const workspaceTaskDesc = document.getElementById("workspace-task-desc");
  const workerSpecReward = document.getElementById("worker-spec-reward");
  const workerSpecTimeLimit = document.getElementById("worker-spec-time-limit");
  const btnStartTask = document.getElementById("btn-start-task");
  const workspaceTaskTitle = document.getElementById("workspace-task-title");

  // DOM Elements - Active Labeling Workspace
  const canvasImgContainer = document.getElementById("canvas-image-container");
  const canvasLoading = document.getElementById("canvas-loading");

  const labelProgressText = document.getElementById("label-progress-text");
  const progressBarInner = document.getElementById("progress-bar-inner");
  const labelTimer = document.getElementById("label-timer");

  const labelingQuestion = document.getElementById("labeling-question");
  const optionsWrapper = document.getElementById("options-wrapper");
  const btnSubmitAnnotation = document.getElementById("btn-submit-annotation");

  // DOM Elements - Worker Post-Task Completed
  const postTaskAppreciationText = document.getElementById("post-task-appreciation-text");
  const postMetricReward = document.getElementById("post-metric-reward");
  const btnWorkerExport = document.getElementById("btn-worker-export");
  const btnBackToRequester = document.getElementById("btn-back-to-requester");

  // Toast Notification System
  const toastNotice = document.getElementById("toast-notice");
  const toastNoticeText = document.getElementById("toast-notice-text");

  const showToast = (message) => {
    toastNoticeText.textContent = message;
    toastNotice.classList.add("show");
    setTimeout(() => {
      toastNotice.classList.remove("show");
    }, 3000);
  };

  const setGenerationStep = (stepName, status = "active") => {
    if (!generationMonitorBar) return;
    const step = generationMonitorBar.querySelector(`[data-step="${stepName}"]`);
    if (!step) return;
    step.classList.remove("active", "done", "warn");
    if (status) step.classList.add(status);
  };

  const resetGenerationMonitor = () => {
    if (!generationMonitorBar) return;
    generationMonitorBar.querySelectorAll(".monitor-step").forEach(step => {
      step.classList.remove("active", "done", "warn");
    });
  };

  const startWaitingLog = (label, intervalMs = 15000) => {
    const startedAt = Date.now();
    addThoughtLog(`${label} 요청을 전송했습니다. 처리 상태를 확인할 수 있도록 경과 시간을 표시합니다.`, "wait");
    return setInterval(() => {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      addThoughtLog(`${label} 작성 처리 중... ${seconds}초 경과`, "wait");
    }, intervalMs);
  };

  // State variables
  let selectedCategory = "general";
  let selectedTaskType = "general_low_risk";
  let recommendedTaskType = "general_low_risk";
  let synthesizedBeforeOptions = [];
  let synthesizedAfterOptions = [];
  let synthesizedBeforeLabels = ["의미감/사회적 가치", "유능감/판단 신뢰", "자율성/부담 완화"];
  let synthesizedAfterLabels = ["감사/관계성", "기여/유능감", "자율적 마무리"];
  let synthesizedBeforeFrames = ["Meaningfulness/Relatedness", "Competence", "Autonomy support"];
  let synthesizedAfterFrames = ["Relatedness/Appreciation", "Competence", "Autonomy support"];
  let selectedBeforeOptionIndex = 0;
  let selectedAfterOptionIndex = 0;
  let latestPsychologicalFactors = null;
  let latestStructuredPrompt = "";
  let latestLLMProvider = "local";
  let latestLLMModel = "";
  let isGenerating = false;
  let pendingRegenerate = false;
  let activeGenerationController = null;

  const testCasePresets = {
    emotionally_demanding: {
      taskType: "emotionally_demanding",
      category: "moderation",
      exampleName: "Toxic Comment Moderation",
      title: "온라인 댓글 유해성 분류",
      reward: "1.20",
      timeLimitMinutes: "10",
      riskLevel: "high",
      fatigueLevel: "high",
      objective: "각 댓글을 확인하고 Safe 또는 Harmful 중 하나로 분류하기",
      socialImpact: "커뮤니티 운영자가 유해성 분류 기준과 데이터 품질을 점검하는 데 활용",
      workerContext: "연구용으로 완화된 댓글 예시를 반복적으로 읽고 정책 기준을 적용하는 환경",
      description: `### 작업 개요
온라인 커뮤니티 댓글을 읽고 욕설, 혐오 표현 또는 공격적인 내용이 포함되어 있는지 분류해 주세요. 예시는 연구용으로 완화된 합성 문장만 사용합니다.

### Worker Task
- Safe
- Harmful`
    },
    high_responsibility: {
      taskType: "high_responsibility",
      category: "medical_alert",
      exampleName: "Medical Alert Verification",
      title: "의료 경고 정보 검수",
      reward: "2.00",
      timeLimitMinutes: "10",
      riskLevel: "medium",
      fatigueLevel: "medium",
      objective: "가상의 의료 기록과 시스템의 알레르기 경고가 일치하는지 검수하기",
      socialImpact: "연구용 의료 정보 품질 검수 절차를 평가하는 데 활용",
      workerContext: "실제 환자 정보나 진단 없이 합성 기록의 경고 일치 여부를 신중하게 대조하는 환경",
      description: `### 작업 개요
연구용으로 생성된 가상의 의료 기록을 확인하고 시스템이 표시한 알레르기 경고가 기록 내용과 일치하는지 확인해 주세요.

**Synthetic research data · 실제 환자 정보 없음 · 실제 의료 진단 아님**

### Worker Task
- Correct alert
- Incorrect alert`
    },
    repetitive_cognitive: {
      taskType: "repetitive_cognitive",
      category: "ocr",
      exampleName: "OCR Verification",
      title: "영수증 OCR 결과 검수",
      reward: "1.30",
      timeLimitMinutes: "8",
      riskLevel: "low",
      fatigueLevel: "high",
      objective: "영수증 이미지의 가격과 OCR 추출 가격이 일치하는지 확인하기",
      socialImpact: "영수증 텍스트 추출 데이터의 일관성과 품질을 점검하는 데 활용",
      workerContext: "유사한 가격 대조 판단을 같은 기준으로 반복 수행하는 환경",
      description: `### 작업 개요
영수증 이미지와 자동으로 추출된 텍스트를 비교하고 상품 가격이 정확하게 인식되었는지 확인해 주세요.

### Worker Task
- Match
- Mismatch`
    },
    socially_meaningful: {
      taskType: "socially_meaningful",
      category: "accessibility",
      exampleName: "Accessibility Data Review",
      title: "공공시설 접근성 정보 검수",
      reward: "1.60",
      timeLimitMinutes: "10",
      riskLevel: "low",
      fatigueLevel: "medium",
      objective: "공공시설 접근성 데이터가 이미지 또는 설명과 일치하는지 검수하기",
      socialImpact: "공공시설 접근성 정보의 정확도를 점검하고 정보 수정이 필요한 항목을 찾는 데 활용",
      workerContext: "시설 이미지와 접근성 설명을 차분히 대조하되 개별 판단의 영향을 과장하지 않는 환경",
      description: `### 작업 개요
공공시설의 접근성 정보를 확인하여 제공된 데이터가 이미지 또는 설명과 일치하는지 검수해 주세요.

### Worker Task
- Information correct
- Information needs correction`
    },
    general_low_risk: {
      taskType: "general_low_risk",
      category: "preference",
      exampleName: "Preference Survey",
      title: "상품 이미지 선호도 조사",
      reward: "0.80",
      timeLimitMinutes: "5",
      riskLevel: "low",
      fatigueLevel: "low",
      objective: "두 상품 이미지 중 더 선호하는 이미지를 선택하기",
      socialImpact: "익명 선호 응답을 상품 이미지 표현 연구의 참고 자료로 활용",
      workerContext: "정답이나 높은 책임 없이 개인의 선호를 간단히 선택하는 환경",
      description: `### 작업 개요
두 개의 상품 이미지를 보고 더 선호하는 이미지를 선택해 주세요. 이 작업에는 정답이 없으며 개인의 선호를 묻습니다.

### Worker Task
- Image A
- Image B`
    }
  };

  const TASK_CONTEXT_LABELS = {
    moderation: "Content Moderation",
    medical_alert: "Synthetic Medical Alert Verification",
    ocr: "OCR Verification",
    accessibility: "Accessibility Data Review",
    preference: "Preference Survey",
    medical: "Medical Data Review",
    autonomous: "Road Scene Classification",
    general: "General Crowd Task"
  };

  const renderExampleTaskButtons = () => {
    if (!exampleTaskPresets) return;
    exampleTaskPresets.innerHTML = "";
    Object.values(TaskTypeConfig.TASK_TYPES).forEach(type => {
      const preset = testCasePresets[type.key];
      if (!preset) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "test-case-btn";
      button.dataset.testCase = type.key;
      const typeLabel = document.createElement("span");
      typeLabel.textContent = type.shortLabel;
      const title = document.createElement("strong");
      title.textContent = preset.exampleName;
      button.append(typeLabel, title);
      button.addEventListener("click", () => applyTestCasePreset(type.key));
      exampleTaskPresets.appendChild(button);
    });
  };

  const getTaskTypeAnalysisInput = () => ({
    title: taskTitleBox?.value || "",
    description: taskDescBox?.value || "",
    objective: taskObjectiveBox?.value || "",
    socialImpact: taskSocialImpactBox?.value || "",
    workerContext: taskWorkerContextBox?.value || "",
    category: selectedCategory,
    riskLevel: taskRiskLevelSelect?.value || "medium",
    fatigueLevel: taskFatigueLevelSelect?.value || "medium"
  });

  const selectTaskType = (taskType, { sync = true } = {}) => {
    const normalized = TaskTypeConfig.normalizeTaskTypeKey(taskType) || "general_low_risk";
    selectedTaskType = normalized;
    taskTypeOptions?.querySelectorAll('input[name="task-type"]').forEach(input => {
      input.checked = input.value === normalized;
      input.closest("label")?.classList.toggle("selected", input.checked);
    });
    if (currentTask) {
      const type = TaskTypeConfig.getTaskType(normalized);
      currentTask.taskType = normalized;
      currentTask.taskTypeLabel = type?.label || "";
    }
    if (isGenerating) generationEditNotice?.classList.remove("hidden");
    if (sync && typeof syncFormToDraft === "function") syncFormToDraft();
  };

  const renderTaskTypeOptions = () => {
    if (!taskTypeOptions) return;
    taskTypeOptions.innerHTML = "";
    Object.values(TaskTypeConfig.TASK_TYPES).forEach(type => {
      const card = document.createElement("label");
      card.className = "task-type-card";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "task-type";
      input.value = type.key;
      input.checked = type.key === selectedTaskType;
      const copy = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = type.shortLabel;
      const example = document.createElement("small");
      example.textContent = type.exampleSummary;
      copy.append(title, example);
      card.append(input, copy);
      card.classList.toggle("selected", input.checked);
      input.addEventListener("change", () => {
        selectTaskType(type.key);
        refreshTaskTypeRecommendation();
      });
      taskTypeOptions.appendChild(card);
    });
  };

  const refreshTaskTypeRecommendation = () => {
    const recommendation = TaskTypeConfig.recommendTaskType(getTaskTypeAnalysisInput());
    recommendedTaskType = recommendation.key;
    if (recommendedTaskTypeLabel) recommendedTaskTypeLabel.textContent = recommendation.label;
    if (recommendedTaskTypeReason) recommendedTaskTypeReason.textContent = recommendation.reason;
    if (btnApplyTaskTypeRecommendation) {
      btnApplyTaskTypeRecommendation.disabled = recommendedTaskType === selectedTaskType;
      btnApplyTaskTypeRecommendation.textContent = recommendedTaskType === selectedTaskType ? "적용됨" : "추천 적용";
    }
    return recommendation;
  };

  btnApplyTaskTypeRecommendation?.addEventListener("click", () => {
    selectTaskType(recommendedTaskType);
    refreshTaskTypeRecommendation();
    showToast(`${TaskTypeConfig.getTaskType(recommendedTaskType)?.label || "Task Type"}을 적용했습니다.`);
  });

  const postJSON = async (url, payload, timeoutMs = 130000, externalController = null) => {
    const controller = new AbortController();
    if (externalController) {
      if (externalController.signal.aborted) controller.abort();
      externalController.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(`문구 생성 응답 시간이 ${Math.round(timeoutMs / 1000)}초를 초과했습니다.`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `요청 실패 (${response.status})`);
    }
    return data;
  };

  const createSessionId = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `session-${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
  };

  const calculateTaskAccuracy = (correctItems, attemptedItems) => {
    const attempted = Math.max(0, Number(attemptedItems || 0));
    const correct = Math.max(0, Number(correctItems || 0));
    if (attempted === 0) return { taskAccuracy: null, taskAccuracyPercent: null };
    const taskAccuracy = correct / attempted;
    return { taskAccuracy, taskAccuracyPercent: taskAccuracy * 100 };
  };

  const calculateCompletionTime = (startedAt, completedAt) => {
    const startMs = Date.parse(startedAt || "");
    const endMs = Date.parse(completedAt || "");
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
      return { completionTimeMs: null, completionTimeSeconds: null };
    }
    const completionTimeMs = endMs - startMs;
    return { completionTimeMs, completionTimeSeconds: completionTimeMs / 1000 };
  };

  const getLocalSessions = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("agentic_sessions") || "{}");
      return stored && typeof stored === "object" ? stored : {};
    } catch {
      return {};
    }
  };

  const toSerializableSession = (record = {}) => {
    const { timerInterval, ...serializable } = record;
    return serializable;
  };

  const persistWorkerSessionLocally = (record = workerSession) => {
    if (!record?.sessionId) return;
    const serializable = toSerializableSession(record);
    const sessions = getLocalSessions();
    sessions[record.sessionId] = { ...(sessions[record.sessionId] || {}), ...serializable };
    try {
      localStorage.setItem("agentic_sessions", JSON.stringify(sessions));
    } catch {
      // A storage quota issue must never interrupt the worker task.
    }
  };

  const syncWorkerSession = async (method = "PATCH", record = workerSession, useBeacon = false) => {
    if (!record?.sessionId) return false;
    const serializable = toSerializableSession(record);
    persistWorkerSessionLocally(serializable);
    const url = method === "POST" ? "/api/sessions" : `/api/sessions/${encodeURIComponent(record.sessionId)}`;
    const body = JSON.stringify({ session: serializable });
    if (useBeacon && navigator.sendBeacon) {
      return navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    }
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const createWorkerSession = (taskId, totalItems, category, taskType = "", taskTypeLabel = "") => {
    const openedAt = new Date().toISOString();
    workerSession = {
      sessionId: createSessionId(),
      taskId,
      status: "opened",
      progress: 0,
      totalItems: Math.max(1, Number(totalItems || 10)),
      timerSeconds: 900,
      timerInterval: null,
      timerSpeed: 1,
      selectedOption: null,
      category: category || "general",
      taskCategory: category || "general",
      taskType: TaskTypeConfig.normalizeTaskTypeKey(taskType),
      taskTypeLabel: taskTypeLabel || TaskTypeConfig.getTaskType(taskType)?.label || "",
      openedAt,
      taskStartedAt: null,
      startedAt: null,
      completedAt: null,
      lastSeenAt: openedAt,
      itemStartedAt: null,
      attemptedItems: 0,
      scoredItems: 0,
      correctItems: 0,
      taskAccuracy: null,
      taskAccuracyPercent: null,
      completionTimeMs: null,
      completionTimeSeconds: null,
      instructionReadingTimeMs: null,
      responses: []
    };
    syncWorkerSession("POST", workerSession);
    return workerSession;
  };

  const startWorkerSession = () => {
    if (!workerSession.sessionId || workerSession.status === "completed") return;
    const startedAt = new Date().toISOString();
    workerSession.status = "started";
    workerSession.taskStartedAt = startedAt;
    workerSession.startedAt = startedAt;
    workerSession.lastSeenAt = startedAt;
    workerSession.itemStartedAt = startedAt;
    const openedMs = Date.parse(workerSession.openedAt || "");
    workerSession.instructionReadingTimeMs = Number.isFinite(openedMs) ? Date.parse(startedAt) - openedMs : null;
    syncWorkerSession("PATCH", workerSession);
  };

  const markWorkerSessionAbandoned = (useBeacon = false) => {
    if (!workerSession.sessionId || workerSession.status !== "started") return;
    workerSession.status = "abandoned";
    workerSession.lastSeenAt = new Date().toISOString();
    syncWorkerSession("PATCH", workerSession, useBeacon);
  };

  const saveTaskToServer = async (task) => {
    try {
      await postJSON("/api/tasks", { task }, 130000);
      return true;
    } catch (error) {
      addThoughtLog?.(`[서버 저장] 작업 저장 실패: ${error.message}`, "warning");
      return false;
    }
  };

  const loadTaskFromServer = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, { cache: "no-store" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.task || null;
    } catch {
      return null;
    }
  };

  const saveResultToServer = async (record) => {
    try {
      await postJSON("/api/results", { record }, 30000);
    } catch {
      // Local result storage remains the fallback for prototype runs.
    }
  };

  const getTaskPayloadFromForm = () => {
    const taskType = TaskTypeConfig.getTaskType(selectedTaskType) || TaskTypeConfig.TASK_TYPES.general_low_risk;
    const recommendation = TaskTypeConfig.recommendTaskType(getTaskTypeAnalysisInput());
    return {
    title: taskTitleBox.value.trim(),
    reward: taskRewardBox.value.trim() || "1.50",
    timeLimitMinutes: taskTimeLimitBox.value.trim() || "15",
    description: taskDescBox.value.trim(),
    category: selectedCategory,
    taskCategory: selectedCategory,
    taskType: taskType.key,
    taskTypeLabel: taskType.label,
    taskTypeReason: taskType.key === recommendation.key
      ? recommendation.reason
      : `Requester가 자동 추천(${recommendation.label})을 검토한 뒤 ${taskType.label}를 최종 선택했습니다.`,
    taskTypeCharacteristics: taskType.characteristics,
    riskLevel: taskRiskLevelSelect.value,
    fatigueLevel: taskFatigueLevelSelect.value,
    objective: taskObjectiveBox.value.trim(),
    socialImpact: taskSocialImpactBox.value.trim(),
    workerContext: taskWorkerContextBox.value.trim()
  };
  };

  const extractOptionMessages = (options = []) => options
    .map(option => typeof option === "string" ? option : (option?.message || option?.text || ""))
    .filter(Boolean);

  const extractOptionLabels = (options = [], fallbackLabels = []) => options
    .map((option, idx) => typeof option === "string" ? fallbackLabels[idx] : (option?.label || fallbackLabels[idx]))
    .filter(Boolean);

  const extractOptionFrames = (options = [], fallbackFrames = []) => options
    .map((option, idx) => typeof option === "string" ? fallbackFrames[idx] : (option?.frame || fallbackFrames[idx]))
    .filter(Boolean);

  const ensureThree = (values, fallbackValues) => {
    const merged = [...values];
    fallbackValues.forEach(value => {
      if (merged.length < 3) merged.push(value);
    });
    return merged.slice(0, 3);
  };

  const normalizeGenerationResult = (raw, fallback, title = "") => {
    const fallbackBeforeMessages = extractOptionMessages(fallback.beforeOptions);
    const fallbackAfterMessages = extractOptionMessages(fallback.afterOptions);
    const beforeMessages = ensureThree(extractOptionMessages(raw.beforeOptions), fallbackBeforeMessages);
    const afterMessages = ensureThree(extractOptionMessages(raw.afterOptions), fallbackAfterMessages);
    const beforeLabels = ensureThree(extractOptionLabels(raw.beforeOptions, fallback.beforeLabels), fallback.beforeLabels);
    const afterLabels = ensureThree(extractOptionLabels(raw.afterOptions, fallback.afterLabels), fallback.afterLabels);
    const beforeFrames = ensureThree(
      extractOptionFrames(raw.beforeOptions, fallback.beforeCandidateFrames),
      fallback.beforeCandidateFrames || ["Meaningfulness/Relatedness", "Competence", "Autonomy support"]
    );
    const afterFrames = ensureThree(
      extractOptionFrames(raw.afterOptions, fallback.afterCandidateFrames),
      fallback.afterCandidateFrames || ["Relatedness/Appreciation", "Competence", "Autonomy support"]
    );
    const psychologicalFactors = raw.psychologicalFactors || {
      inferredTaskTypes: [],
      psychologicalBurdens: raw.psychologicalBurden || [],
      motivationalFactors: raw.motivationalOpportunity || [],
      sdtNeeds: [],
      selectedFrames: raw.selectedFrames || [],
      frameSelectionReason: "",
      constraintsApplied: []
    };

    const rawSelectedFrames = psychologicalFactors.selectedFrames || raw.selectedFrames || [];
    const fallbackSelectedFrames = fallback.psychologicalFactors?.selectedFrames || fallback.selectedFrames || [];
    const selectedFrames = (Array.isArray(fallbackSelectedFrames) && fallbackSelectedFrames.length
      ? fallbackSelectedFrames
      : rawSelectedFrames
    ).filter(Boolean);

    psychologicalFactors.primaryTaskType = psychologicalFactors.primaryTaskType || fallback.psychologicalFactors?.primaryTaskType || fallback.primaryTaskType || "";
    psychologicalFactors.primaryPsychologicalType = psychologicalFactors.primaryPsychologicalType || fallback.psychologicalFactors?.primaryPsychologicalType || "";
    psychologicalFactors.taskType = fallback.psychologicalFactors?.taskType || fallback.taskType || psychologicalFactors.taskType || raw.taskType || "general_low_risk";
    psychologicalFactors.taskTypeLabel = fallback.psychologicalFactors?.taskTypeLabel || fallback.taskTypeLabel || psychologicalFactors.taskTypeLabel || raw.taskTypeLabel || TaskTypeConfig.getTaskType(psychologicalFactors.taskType)?.label || TaskTypeConfig.TASK_TYPES.general_low_risk.label;
    psychologicalFactors.taskTypeReason = fallback.psychologicalFactors?.taskTypeReason || fallback.taskTypeReason || psychologicalFactors.taskTypeReason || raw.taskTypeReason || "";
    psychologicalFactors.taskTypeCharacteristics = fallback.psychologicalFactors?.taskTypeCharacteristics || psychologicalFactors.taskTypeCharacteristics || raw.taskTypeCharacteristics || [];
    psychologicalFactors.taskContext = fallback.psychologicalFactors?.taskContext || psychologicalFactors.taskContext || raw.taskContext || "";
    psychologicalFactors.selectedFrames = selectedFrames;
    psychologicalFactors.reviewCriteria = psychologicalFactors.reviewCriteria || raw.reviewCriteria || fallback.psychologicalFactors?.reviewCriteria || fallback.reviewCriteria || [];
    psychologicalFactors.psychologicalBurdens = psychologicalFactors.psychologicalBurdens || raw.psychologicalBurden || [];
    psychologicalFactors.motivationalFactors = psychologicalFactors.motivationalFactors || raw.motivationalOpportunity || [];

    const composedFinalBeforeText = aiGenerator.composeFinalBeforeFromCandidates(
      title,
      selectedFrames,
      beforeMessages,
      fallback.finalBeforeText || raw.finalBeforeText || beforeMessages[0]
    );

    return {
      beforeOptions: beforeMessages,
      afterOptions: afterMessages,
      beforeLabels,
      afterLabels,
      beforeFrames,
      afterFrames,
      psychologicalFactors,
      selectedFrames: psychologicalFactors.selectedFrames || [],
      psychologicalBurden: psychologicalFactors.psychologicalBurdens || [],
      motivationalOpportunity: psychologicalFactors.motivationalFactors || [],
      structuredPrompt: raw.structuredPrompt || fallback.structuredPrompt || raw.structuredPromptSummary || "",
      theme: raw.theme || fallback.theme || "",
      finalBeforeText: composedFinalBeforeText,
      finalAfterText: aiGenerator.composeFinalAfterFromCandidates(
        selectedFrames,
        afterMessages,
        raw.finalAfterText || fallback.finalAfterText || afterMessages[0]
      ),
      provider: raw.provider || "local",
      model: raw.model || ""
    };
  };

  const toDisplayFactorLabel = value => {
    const label = String(value || "").trim();
    const labelMap = {
      "Autonomy support": "자율성 지지",
      "Competence": "유능감",
      "Meaningfulness/Relatedness": "의미감(관계성)",
      "Meaningfulness / Relatedness": "의미감(관계성)",
      "Relatedness/Appreciation": "관계성(감사·공감)",
      "Relatedness / Appreciation": "관계성(감사·공감)"
    };
    return labelMap[label] || label;
  };

  const toSdtBadgeLabel = value => {
    const frame = String(value || "");
    if (/Autonomy|자율/.test(frame)) return "자율성";
    if (/Competence|유능/.test(frame)) return "유능감";
    if (/Relatedness|Meaningfulness|Appreciation|관계/.test(frame)) return "관계성";
    return "";
  };

  const renderFinalSdtBadges = (selectedFrames = []) => {
    const primaryLabel = toSdtBadgeLabel(selectedFrames[0]);
    const secondaryLabel = toSdtBadgeLabel(selectedFrames[1]);
    const hasMetadata = Boolean(primaryLabel && secondaryLabel);
    finalSdtBadges?.classList.toggle("hidden", !hasMetadata);
    if (finalSdtPrimary) finalSdtPrimary.textContent = primaryLabel ? `핵심 · ${primaryLabel}` : "";
    if (finalSdtSecondary) finalSdtSecondary.textContent = secondaryLabel ? `보조 · ${secondaryLabel}` : "";
  };

  const renderPills = (container, items = []) => {
    if (!container) return;
    container.innerHTML = "";
    items.forEach(item => {
      const value = typeof item === "string" ? item : item.type;
      if (!value) return;
      const pill = document.createElement("span");
      pill.className = "factor-pill";
      pill.textContent = toDisplayFactorLabel(value);
      container.appendChild(pill);
    });
  };

  const renderList = (container, items = []) => {
    if (!container) return;
    container.innerHTML = "";
    items.slice(0, 4).forEach(item => {
      const li = document.createElement("li");
      li.textContent = typeof item === "string" ? item : JSON.stringify(item);
      container.appendChild(li);
    });
  };

  const renderPsychologicalFactors = (factors, provider, model) => {
    latestPsychologicalFactors = factors;
    if (!psychologyFactorPanel || !factors) return;

    renderPills(factorTaskTypes, factors.inferredTaskTypes || []);
    renderPills(factorSelectedFrames, factors.selectedFrames || []);
    renderList(factorBurdens, factors.psychologicalBurdens || []);
    renderList(factorMotivators, factors.motivationalFactors || []);
    const taskTypeDefinition = TaskTypeConfig.getTaskType(factors.taskType || factors.taskTypeLabel);
    const characteristicLabels = (factors.taskTypeCharacteristics?.length
      ? factors.taskTypeCharacteristics
      : taskTypeDefinition?.characteristics || [])
      .map(item => typeof item === "string" ? item : item.label)
      .filter(Boolean);
    const riskLabels = { low: "낮음", medium: "중간", high: "높음" };
    const fatigueLabels = { low: "낮음", medium: "중간", high: "높음" };

    if (factorTaskTypeLabel) factorTaskTypeLabel.textContent = factors.taskTypeLabel || taskTypeDefinition?.label || factors.primaryTaskType || "—";
    if (factorTaskTypeReason) factorTaskTypeReason.textContent = factors.taskTypeReason || taskTypeDefinition?.recommendationReason || "—";
    if (factorTaskContext) factorTaskContext.textContent = TASK_CONTEXT_LABELS[selectedCategory] || factors.taskContext || "General Crowd Task";
    if (factorTaskCharacteristics) factorTaskCharacteristics.textContent = characteristicLabels.join(" · ") || "—";
    if (factorRecommendedSdt) factorRecommendedSdt.textContent = (factors.selectedFrames || []).map(toDisplayFactorLabel).join(" · ") || "—";
    if (factorContextRisk) factorContextRisk.textContent = riskLabels[taskRiskLevelSelect?.value] || "—";
    if (factorContextFatigue) factorContextFatigue.textContent = fatigueLabels[taskFatigueLevelSelect?.value] || "—";
    if (factorContextTime) factorContextTime.textContent = taskTimeLimitBox?.value ? `${taskTimeLimitBox.value} min` : "—";

    if (factorPrimaryTask) {
      factorPrimaryTask.textContent = factors.taskTypeLabel || factors.primaryTaskType || "Task Type";
    }
    if (factorFrameSummary) {
      factorFrameSummary.textContent = (factors.selectedFrames || []).map(toDisplayFactorLabel).join(" → ") || "선택 프레임";
    }

    if (factorSelectionReason) {
      factorSelectionReason.textContent = factors.frameSelectionReason || "새 카테고리 규칙에 따라 작업 특성과 심리 프레임을 연결했습니다.";
    }
    if (llmProviderBadge) {
      if (provider === "openai") {
        llmProviderBadge.textContent = `GPT 작성${model ? ` · ${model}` : ""}`;
      } else if (provider === "upstage") {
        llmProviderBadge.textContent = `외부 작성${model ? ` · ${model}` : ""}`;
      } else {
        llmProviderBadge.textContent = "브라우저 작성";
      }
    }
    if (reviewCriteriaList) {
      reviewCriteriaList.innerHTML = "";
      (factors.reviewCriteria || []).forEach((criterion, index) => {
        const card = document.createElement("article");
        card.className = "review-criterion-card";

        const icon = document.createElement("div");
        icon.className = "review-criterion-icon";
        const iconGlyph = document.createElement("i");
        iconGlyph.className = criterion.icon || "lucide-circle-check";
        icon.appendChild(iconGlyph);

        const copy = document.createElement("div");
        const title = document.createElement("h5");
        title.textContent = `${index + 1}. ${criterion.label || toDisplayFactorLabel(criterion.frame)}`;
        const reason = document.createElement("p");
        reason.className = "criterion-reason";
        reason.textContent = criterion.whyNeeded || "작업 분석 결과에 따라 선택된 검토 기준입니다.";
        const check = document.createElement("p");
        check.className = "criterion-check";
        const checkLabel = document.createElement("strong");
        checkLabel.textContent = "메시지에서 확인할 내용";
        check.append(checkLabel, document.createTextNode(criterion.messageCheck || "선택 프레임이 문구에 자연스럽게 반영되었는지 확인합니다."));
        copy.append(title, reason, check);

        const priority = document.createElement("span");
        priority.className = `criterion-priority ${criterion.priority || "support"}`;
        priority.textContent = criterion.priorityLabel || (criterion.selected ? "선택" : "참고");
        card.append(icon, copy, priority);
        reviewCriteriaList.appendChild(card);
      });
    }
    psychologyFactorPanel.classList.remove("hidden");
  };

  const setWorkflowStep = (activeStep) => {
    if (!requesterProgress) return;
    const order = ["input", "generate", "review", "publish"];
    const activeIndex = Math.max(0, order.indexOf(activeStep));
    requesterProgress.querySelectorAll("[data-workflow-step]").forEach((item, index) => {
      item.classList.toggle("active", index === activeIndex);
      item.classList.toggle("done", index < activeIndex);
      if (index === activeIndex) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
  };

  const scrollToElement = (element, focusElement = null) => {
    if (!element) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const headerOffset = (document.querySelector("header")?.getBoundingClientRect().height || 60) + 16;
    const targetTop = Math.max(0, window.scrollY + element.getBoundingClientRect().top - headerOffset);
    window.scrollTo({ top: targetTop, behavior: reduceMotion ? "auto" : "smooth" });
    if (focusElement) setTimeout(() => focusElement.focus({ preventScroll: true }), reduceMotion ? 0 : 500);
  };

  const navSections = [
    { section: platformOverview, button: navTabRequester },
    { section: whyMotivation, button: navTabRequester },
    { section: whySdt, button: navWhySdt },
    { section: document.getElementById("why-task-messages"), button: navWhySdt },
    { section: document.getElementById("worker-experience"), button: navWhySdt },
    { section: howItWorks, button: navHowItWorks },
    { section: document.getElementById("onboarding-ready"), button: navHowItWorks },
    { section: requesterWorkspace, button: navWorkspace }
  ].filter(item => item.section && item.button);
  const navButtons = [navTabRequester, navWhySdt, navHowItWorks, navWorkspace].filter(Boolean);
  let navClickLockUntil = 0;
  let navScrollFrame = null;

  const setActiveNavigation = button => {
    if (!button || button.classList.contains("hidden")) return;
    navButtons.forEach(item => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      if (isActive) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  };

  const updateNavigationFromScroll = () => {
    navScrollFrame = null;
    if (document.body.classList.contains("worker-mode") || performance.now() < navClickLockUntil) return;
    const headerOffset = (document.querySelector("header")?.getBoundingClientRect().height || 60) + 32;
    let activeButton = navTabRequester;
    navSections.forEach(({ section, button }) => {
      if (button.classList.contains("hidden")) return;
      if (section.getBoundingClientRect().top <= headerOffset) activeButton = button;
    });
    setActiveNavigation(activeButton);
  };

  const requestNavigationUpdate = () => {
    if (navScrollFrame !== null) return;
    navScrollFrame = window.requestAnimationFrame(updateNavigationFromScroll);
  };

  const navigateToSection = (button, section, focusElement = null) => {
    setActiveNavigation(button);
    navClickLockUntil = performance.now() + 1200;
    scrollToElement(section, focusElement);
    window.setTimeout(updateNavigationFromScroll, 1250);
  };

  window.addEventListener("scroll", requestNavigationUpdate, { passive: true });
  window.addEventListener("resize", requestNavigationUpdate);

  const ONBOARDING_STORAGE_KEY = "taskMessageStudioOnboardingCompleted";

  const setWorkspaceAvailability = (isAvailable) => {
    workspaceShell?.classList.toggle("hidden", !isAvailable);
    workspaceShell?.setAttribute("aria-hidden", String(!isAvailable));
    navWorkspace?.classList.toggle("hidden", !isAvailable);
    document.body.classList.toggle("onboarding-completed", isAvailable);
  };

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch {
      // The Workspace still opens when browser storage is unavailable.
    }
    setWorkspaceAvailability(true);
    navigateToSection(navWorkspace, requesterWorkspace, taskTitleBox);
  };

  // Development and study reset helper: run this in the browser console when needed.
  window.resetTaskMessageStudioOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {
      // Ignore storage restrictions and reset the visible state.
    }
    setWorkspaceAvailability(false);
    navigateToSection(navTabRequester, platformOverview);
  };

  btnStartDesigning?.addEventListener("click", completeOnboarding);
  btnWorkspaceSdt?.addEventListener("click", () => navigateToSection(navWhySdt, whySdt));
  navTabRequester?.addEventListener("click", () => navigateToSection(navTabRequester, platformOverview));
  navWhySdt?.addEventListener("click", () => navigateToSection(navWhySdt, whySdt));
  navHowItWorks?.addEventListener("click", () => navigateToSection(navHowItWorks, howItWorks));
  navWorkspace?.addEventListener("click", () => navigateToSection(navWorkspace, requesterWorkspace, taskTitleBox));
  document.querySelector(".motivation-to-sdt")?.addEventListener("click", event => {
    event.preventDefault();
    navigateToSection(navWhySdt, whySdt);
  });
  requestNavigationUpdate();

  const syncSelectedCandidateText = () => {
    if (synthesizedBeforeOptions.length > 0) {
      synthesizedBeforeOptions[selectedBeforeOptionIndex] = beforeTextBox.value;
    }
    if (synthesizedAfterOptions.length > 0) {
      synthesizedAfterOptions[selectedAfterOptionIndex] = afterTextBox.value;
    }
    if (currentTask) {
      currentTask.beforeCandidates = [...synthesizedBeforeOptions];
      currentTask.afterCandidates = [...synthesizedAfterOptions];
      currentTask.finalBeforeText = finalBeforeTextBox.value;
      currentTask.finalAfterText = finalAfterTextBox.value;
      currentTask.beforeText = finalBeforeTextBox.value || beforeTextBox.value;
      currentTask.afterText = finalAfterTextBox.value || afterTextBox.value;
      saveDraftToStorage();
    }
  };

  // Routing Handler using Hash Parsing
  const handleRouting = () => {
    const hash = window.location.hash;
    if (!hash.startsWith("#worker") && workerSession.status === "started") {
      markWorkerSessionAbandoned();
    }
    clearInterval(workerSession.timerInterval);

    if (hash.startsWith("#worker")) {
      document.body.classList.add("worker-mode");
      document.body.classList.remove("requester-mode");
      requesterView.classList.add("hidden");
      workerView.classList.remove("hidden");
      navTabRequester?.classList.remove("active");
      navTabWorker?.classList.add("active");

      const query = hash.split("?")[1];
      const params = new URLSearchParams(query);
      let taskId = params.get("taskId");

      if (!taskId) {
        const tasks = JSON.parse(localStorage.getItem("agentic_tasks")) || {};
        if (tasks["task-draft"]) {
          taskId = "task-draft";
        } else if (currentTask && currentTask.id) {
          taskId = currentTask.id;
        } else {
          const taskList = Object.values(tasks);
          if (taskList.length > 0) {
            taskList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            taskId = taskList[0].id;
          }
        }
      }
      if (taskId) {
        loadWorkerTask(taskId);
      } else {
        activeWorkerTask = null;
        workerTaskError.classList.remove("hidden");
        workerPreTask.classList.add("hidden");
        workerWorkspace.classList.add("hidden");
        workerPostTask.classList.add("hidden");
      }
    } else {
      document.body.classList.remove("worker-mode");
      document.body.classList.add("requester-mode");
      requesterView.classList.remove("hidden");
      workerView.classList.add("hidden");
      navTabRequester?.classList.add("active");
      navTabWorker?.classList.remove("active");
    }
  };

  window.addEventListener("hashchange", handleRouting);
  navTabWorker?.addEventListener("click", () => { window.location.hash = "#worker"; });

  // ==========================================================================
  // REQUESTER: TASK PRESETS AND GENERATION
  // ==========================================================================

  const applyTestCasePreset = (caseId) => {
    const preset = testCasePresets[caseId];
    if (!preset) return;

    selectedCategory = preset.category;
    selectTaskType(preset.taskType, { sync: false });
    taskTitleBox.value = preset.title;
    taskRewardBox.value = preset.reward;
    taskTimeLimitBox.value = preset.timeLimitMinutes || "15";
    taskDescBox.value = preset.description;
    taskRiskLevelSelect.value = preset.riskLevel;
    taskFatigueLevelSelect.value = preset.fatigueLevel;
    taskObjectiveBox.value = preset.objective;
    taskSocialImpactBox.value = preset.socialImpact;
    taskWorkerContextBox.value = preset.workerContext;
    const presetPayload = getTaskPayloadFromForm();

    currentTask = {
      id: "task-draft",
      title: preset.title,
      category: preset.category,
      taskCategory: preset.category,
      taskType: preset.taskType,
      taskTypeLabel: TaskTypeConfig.getTaskType(preset.taskType)?.label || "",
      taskTypeReason: presetPayload.taskTypeReason,
      taskTypeCharacteristics: presetPayload.taskTypeCharacteristics,
      reward: preset.reward,
      timeLimitMinutes: preset.timeLimitMinutes || "15",
      description: preset.description,
      riskLevel: preset.riskLevel,
      fatigueLevel: preset.fatigueLevel,
      objective: preset.objective,
      socialImpact: preset.socialImpact,
      workerContext: preset.workerContext,
      beforeText: "",
      afterText: "",
      beforeCandidates: [],
      afterCandidates: [],
      createdAt: new Date().toISOString()
    };

    saveDraftToStorage();
    updateFormCompletion();
    resetGenerationMonitor();
    previewContainer?.classList.add("hidden");
    reviewEmptyState?.classList.remove("hidden");
    shareCard?.classList.add("hidden");
    refreshTaskTypeRecommendation();
    showToast(`${preset.exampleName} 예시와 Task Type이 입력되었습니다.`);
  };

  // Requester convenience: completion meter, validation, reset
  const requiredFormFields = [
    { el: taskTitleBox, label: "작업 제목" },
    { el: taskRewardBox, label: "보상금" },
    { el: taskTimeLimitBox, label: "시간 제한" },
    { el: taskDescBox, label: "작업 지침" },
    { el: taskObjectiveBox, label: "작업 목표" }
  ];

  const updateFormCompletion = () => {
    const completed = requiredFormFields.filter(item => item.el && item.el.value.trim()).length;
    const total = requiredFormFields.length;
    if (formCompletionText) formCompletionText.textContent = `필수 입력 ${completed} / ${total}`;
    if (formCompletionFill) formCompletionFill.style.width = `${Math.round((completed / total) * 100)}%`;
  };

  const validateRequiredFields = () => {
    const missing = requiredFormFields.filter(item => !item.el || !item.el.value.trim());
    requiredFormFields.forEach(item => item.el?.classList.remove("is-invalid"));
    missing.forEach(item => item.el?.classList.add("is-invalid"));
    updateFormCompletion();
    return missing;
  };

  requiredFormFields.forEach(item => {
    item.el?.addEventListener("input", () => {
      item.el.classList.remove("is-invalid");
      updateFormCompletion();
    });
  });

  const editableTaskControls = [
    taskTitleBox, taskRewardBox, taskTimeLimitBox, taskDescBox, taskObjectiveBox,
    taskSocialImpactBox, taskWorkerContextBox, taskRiskLevelSelect, taskFatigueLevelSelect
  ].filter(Boolean);

  editableTaskControls.forEach(control => {
    control.addEventListener("input", () => {
      if (isGenerating) generationEditNotice?.classList.remove("hidden");
    });
    control.addEventListener("change", () => {
      if (isGenerating) generationEditNotice?.classList.remove("hidden");
    });
  });

  btnRestartGeneration?.addEventListener("click", () => {
    if (!isGenerating) {
      btnGenerate?.click();
      return;
    }
    pendingRegenerate = true;
    activeGenerationController?.abort();
    showToast("현재 분석을 취소하고 수정된 조건으로 다시 시작합니다.");
  });

  const closeExamplePopovers = (except = null) => {
    exampleHelpButtons.forEach(button => {
      const wrapper = button.closest(".example-help");
      if (!wrapper || wrapper === except) return;
      wrapper.removeAttribute("data-open");
      button.setAttribute("aria-expanded", "false");
    });
  };

  exampleHelpButtons.forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      const wrapper = button.closest(".example-help");
      const willOpen = wrapper?.getAttribute("data-open") !== "true";
      closeExamplePopovers(wrapper);
      if (willOpen) wrapper?.setAttribute("data-open", "true");
      else wrapper?.removeAttribute("data-open");
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", () => closeExamplePopovers());
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeExamplePopovers();
      document.activeElement?.blur?.();
    }
  });

  btnResetForm?.addEventListener("click", () => {
    taskForm?.reset();
    currentTask = null;
    selectedCategory = "general";
    selectTaskType("general_low_risk", { sync: false });
    synthesizedBeforeOptions = [];
    synthesizedAfterOptions = [];
    latestPsychologicalFactors = null;
    renderFinalSdtBadges([]);
    previewContainer?.classList.add("hidden");
    reviewEmptyState?.classList.remove("hidden");
    shareCard?.classList.add("hidden");
    resetGenerationMonitor();
    if (aiLogBox) {
      aiLogBox.innerHTML = '<div class="ai-thought-line ai-thought-system">입력값이 초기화되었습니다. 새 작업 정보를 입력해 주세요.</div>';
    }
    const tasks = JSON.parse(localStorage.getItem("agentic_tasks")) || {};
    delete tasks["task-draft"];
    localStorage.setItem("agentic_tasks", JSON.stringify(tasks));
    requiredFormFields.forEach(item => item.el?.classList.remove("is-invalid"));
    updateFormCompletion();
    refreshTaskTypeRecommendation();
    setWorkflowStep("input");
    showToast("입력값이 초기화되었습니다.");
  });

  // Trigger Motivation Synthesis
  btnGenerate.addEventListener("click", async (e) => {
    e.preventDefault();

	    const payload = getTaskPayloadFromForm();
    const generationPayload = payload;

    const missingFields = validateRequiredFields();
    if (missingFields.length > 0) {
      showToast(`필수 항목을 입력해 주세요: ${missingFields.map(item => item.label).join(", ")}`);
      missingFields[0].el?.focus();
      return;
    }

    isGenerating = true;
    setWorkflowStep("generate");
    activeGenerationController = new AbortController();
    generationEditNotice?.classList.remove("hidden");
    btnGenerate.disabled = true;
    const originalGenerateButtonHTML = btnGenerate.innerHTML;
    btnGenerate.innerHTML = `<i class="lucide-loader"></i>문구 생성 중`;
    if (aiLogBox) aiLogBox.innerHTML = "";
    resetGenerationMonitor();
    previewContainer?.classList.add("hidden");
    reviewEmptyState?.classList.add("hidden");
    shareCard?.classList.add("hidden");

    try {
      setGenerationStep("metadata", "active");
      addThoughtLog(`[입력 수집] Task Type(${payload.taskTypeLabel}), 작업 제목, 보상, 상세 지침, 위험도(${payload.riskLevel}), 피로도(${payload.fatigueLevel}), 작업 목표, 사회적 가치와 작업 수행 특성을 수집했습니다.`, "meta");
      addThoughtLog(`[입력 요약] 제목: ${payload.title} / 목표: ${payload.objective || "설명에서 자동 추론"} / 사회적 가치: ${payload.socialImpact || "카테고리 기반 자동 추론"}`, "meta");
      setGenerationStep("metadata", "done");

      setGenerationStep("factors", "active");
      // Play explainable agent log. This is not private chain-of-thought; it mirrors the PDF-described pipeline.
      await aiGenerator.generateThoughtsLog(
        generationPayload.title,
        generationPayload.category,
        generationPayload.description,
        generationPayload.riskLevel,
        generationPayload.fatigueLevel,
        generationPayload.objective,
        generationPayload.socialImpact,
        generationPayload.workerContext,
        Number(generationPayload.timeLimitMinutes || 15),
        addThoughtLog,
        generationPayload.taskType
      );
      setGenerationStep("factors", "done");
      setGenerationStep("frames", "active");

      const fallbackResults = aiGenerator.generateInterventions(
        generationPayload.title,
        generationPayload.category,
        generationPayload.description,
        generationPayload.riskLevel,
        generationPayload.fatigueLevel,
        generationPayload.objective,
        generationPayload.socialImpact,
        generationPayload.workerContext,
        generationPayload.reward,
        Number(generationPayload.timeLimitMinutes || 15),
        generationPayload.taskType
      );
      const fallbackFactors = fallbackResults.psychologicalFactors || {};
      addThoughtLog(`[Task Type] 확정: ${fallbackFactors.taskTypeLabel || payload.taskTypeLabel}`, "process");
      addThoughtLog(`[SDT 분석] Task Type과 정서적 부담, 반복·집중 부담, 작업 맥락을 함께 반영한 선택 프레임: ${(fallbackFactors.selectedFrames || fallbackResults.selectedFrames || []).join(" + ")}`, "process");
      setGenerationStep("frames", "done");
      setGenerationStep("constraints", "active");
      addThoughtLog("[제약조건] 후보 문구는 각각 자연스럽게 이어지는 한국어 5문장으로 만들고, 최종 Pre/Post 문구에는 핵심 SDT를 중심 전략으로, 보조 SDT를 보완 전략으로 함께 반영합니다.", "process");
      setGenerationStep("constraints", "done");

      let rawResults;
      let waitLogInterval = null;
      try {
        setGenerationStep("llm", "active");
        addThoughtLog("[생성] 작업 특성에 맞춰 후보 문구와 최종 문구를 구성합니다.", "process");
        waitLogInterval = startWaitingLog("문구 생성");
        rawResults = await postJSON("/api/generate-motivation", generationPayload, 130000, activeGenerationController);
        clearInterval(waitLogInterval);
        addThoughtLog(`[생성] 후보 문구를 준비했습니다. 작업 전 ${rawResults.beforeOptions?.length || 0}개 / 작업 후 ${rawResults.afterOptions?.length || 0}개`, "success");
        setGenerationStep("llm", "done");
      } catch (error) {
        if (waitLogInterval) clearInterval(waitLogInterval);
        rawResults = { ...fallbackResults, provider: "local" };
        setGenerationStep("llm", "warn");
        addThoughtLog(`[로컬 생성] 외부 생성 실패: ${error.message}`, "warning");
        addThoughtLog("[로컬 생성] 저장된 카테고리 규칙으로 후보/최종 문구를 구성합니다.", "process");
        showToast("외부 생성에 실패해 로컬 규칙 기반 후보를 생성했습니다.");
      }

      setGenerationStep("render", "active");
      const results = normalizeGenerationResult(rawResults, fallbackResults, payload.title);
      latestLLMProvider = results.provider;
      latestLLMModel = results.model;
      latestStructuredPrompt = results.structuredPrompt || "";
      addThoughtLog(`[결과 정렬] 후보 문구 6개와 최종 작업 전/후 문구를 화면에 렌더링할 준비를 마쳤습니다.`, "process");

      // Save lists globally for option switching and manual edits.
      synthesizedBeforeOptions = results.beforeOptions;
      synthesizedAfterOptions = results.afterOptions;
      synthesizedBeforeLabels = results.beforeLabels || synthesizedBeforeLabels;
      synthesizedAfterLabels = results.afterLabels || synthesizedAfterLabels;
      synthesizedBeforeFrames = results.beforeFrames || synthesizedBeforeFrames;
      synthesizedAfterFrames = results.afterFrames || synthesizedAfterFrames;
      selectedBeforeOptionIndex = 0;
      selectedAfterOptionIndex = 0;

      currentTask = {
        id: "task-draft",
        title: payload.title,
        category: payload.category,
        taskCategory: payload.taskCategory,
        taskType: payload.taskType,
        taskTypeLabel: payload.taskTypeLabel,
        taskTypeReason: payload.taskTypeReason,
        taskTypeCharacteristics: payload.taskTypeCharacteristics,
        reward: payload.reward,
        timeLimitMinutes: payload.timeLimitMinutes,
        description: payload.description,
        beforeText: results.finalBeforeText,
        afterText: results.finalAfterText,
        beforeCandidates: [...synthesizedBeforeOptions],
        afterCandidates: [...synthesizedAfterOptions],
        beforeCandidateFrames: [...synthesizedBeforeFrames],
        afterCandidateFrames: [...synthesizedAfterFrames],
        finalBeforeText: results.finalBeforeText,
        finalAfterText: results.finalAfterText,
        theme: results.theme,
        psychologicalFactors: results.psychologicalFactors,
        selectedFrames: results.selectedFrames || [],
        psychologicalBurden: results.psychologicalBurden || [],
        motivationalOpportunity: results.motivationalOpportunity || [],
        structuredPrompt: latestStructuredPrompt,
        llmProvider: latestLLMProvider,
        llmModel: latestLLMModel,
        riskLevel: payload.riskLevel,
        fatigueLevel: payload.fatigueLevel,
        objective: payload.objective,
        socialImpact: payload.socialImpact,
        workerContext: payload.workerContext,
        createdAt: new Date().toISOString()
      };

      saveDraftToStorage();

      renderOptionSelectors();
      renderPsychologicalFactors(results.psychologicalFactors, latestLLMProvider, latestLLMModel);
      renderFinalSdtBadges(results.selectedFrames);

      beforeTextBox.value = synthesizedBeforeOptions[0];
      afterTextBox.value = synthesizedAfterOptions[0];
      finalBeforeTextBox.value = results.finalBeforeText;
      finalAfterTextBox.value = results.finalAfterText;

      previewContainer?.classList.remove("hidden");
      reviewEmptyState?.classList.add("hidden");
      setGenerationStep("render", "done");
      setWorkflowStep("review");
      addThoughtLog("[완료] 요청자는 후보 문구와 최종 문구를 직접 확인·수정한 뒤 현재 최종 문구로 작업을 배포할 수 있습니다.", "success");
      previewContainer?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      isGenerating = false;
      activeGenerationController = null;
      generationEditNotice?.classList.add("hidden");
      btnGenerate.disabled = false;
      btnGenerate.innerHTML = originalGenerateButtonHTML;
      if (pendingRegenerate) {
        pendingRegenerate = false;
        setTimeout(() => btnGenerate.click(), 0);
      }
    }
  });

  const addThoughtLog = (text, type = "") => {
    if (!aiLogBox) return;
    const logLine = document.createElement("div");
    logLine.className = `ai-thought-line ai-thought-${type}`;
    const timeNode = document.createElement("span");
    timeNode.className = "ai-thought-time";
    timeNode.textContent = `[${new Date().toLocaleTimeString("ko-KR", { hour12: false })}]`;
    logLine.append(timeNode, document.createTextNode(` ${text}`));
    aiLogBox.appendChild(logLine);
    aiLogBox.scrollTop = aiLogBox.scrollHeight;
  };

  // Render 3-Option Tab selectors dynamically
  const renderOptionSelectors = () => {
    const beforeSelectGroup = document.getElementById("before-options-select-group");
    const afterSelectGroup = document.getElementById("after-options-select-group");

    beforeSelectGroup.innerHTML = "";
    afterSelectGroup.innerHTML = "";

    // 3 Options for Before-Task
    const beforeTitles = synthesizedBeforeLabels;
    beforeTitles.forEach((title, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `option-select-btn${idx === selectedBeforeOptionIndex ? " active" : ""}`;
      const icon = document.createElement("i");
      icon.className = "lucide-sparkles";
      const copy = document.createElement("span");
      copy.className = "candidate-btn-copy";
      const label = document.createElement("span");
      label.textContent = title;
      const tags = document.createElement("span");
      tags.className = "candidate-frame-tags";
      const frameTag = document.createElement("span");
      frameTag.className = "candidate-frame-tag";
      frameTag.textContent = toDisplayFactorLabel(synthesizedBeforeFrames[idx] || "");
      tags.appendChild(frameTag);
      copy.append(label, tags);
      btn.append(icon, copy);
      btn.addEventListener("click", () => {
        syncSelectedCandidateText();
        beforeSelectGroup.querySelectorAll(".option-select-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedBeforeOptionIndex = idx;
        beforeTextBox.value = synthesizedBeforeOptions[idx];
        if (currentTask) {
          currentTask.beforeCandidates = [...synthesizedBeforeOptions];
          saveDraftToStorage();
        }
        showToast(`작업 전 후보 문구: [${title}] 선택됨`);
      });
      beforeSelectGroup.appendChild(btn);
    });

    // 3 Options for After-Task
    const afterTitles = synthesizedAfterLabels;
    afterTitles.forEach((title, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `option-select-btn${idx === selectedAfterOptionIndex ? " active" : ""}`;
      const icon = document.createElement("i");
      icon.className = "lucide-award";
      const copy = document.createElement("span");
      copy.className = "candidate-btn-copy";
      const label = document.createElement("span");
      label.textContent = title;
      const tags = document.createElement("span");
      tags.className = "candidate-frame-tags";
      const frameTag = document.createElement("span");
      frameTag.className = "candidate-frame-tag";
      frameTag.textContent = toDisplayFactorLabel(synthesizedAfterFrames[idx] || "");
      tags.appendChild(frameTag);
      copy.append(label, tags);
      btn.append(icon, copy);
      btn.addEventListener("click", () => {
        syncSelectedCandidateText();
        afterSelectGroup.querySelectorAll(".option-select-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedAfterOptionIndex = idx;
        afterTextBox.value = synthesizedAfterOptions[idx];
        if (currentTask) {
          currentTask.afterCandidates = [...synthesizedAfterOptions];
          saveDraftToStorage();
        }
        showToast(`작업 후 후보 문구: [${title}] 선택됨`);
      });
      afterSelectGroup.appendChild(btn);
    });
  };

  // Publish Task Campaign
  btnPublish.addEventListener("click", async () => {
    if (!currentTask) return;
    syncSelectedCandidateText();
    const publishPayload = getTaskPayloadFromForm();

    const tasks = JSON.parse(localStorage.getItem("agentic_tasks")) || {};
    // Clean up temporary draft on formal publish
    delete tasks["task-draft"];

    currentTask.beforeText = finalBeforeTextBox.value || beforeTextBox.value;
    currentTask.afterText = finalAfterTextBox.value || afterTextBox.value;
    currentTask.finalBeforeText = currentTask.beforeText;
    currentTask.finalAfterText = currentTask.afterText;
    currentTask.timeLimitMinutes = taskTimeLimitBox.value.trim() || currentTask.timeLimitMinutes || "15";
    currentTask.taskCategory = publishPayload.taskCategory;
    currentTask.taskType = publishPayload.taskType;
    currentTask.taskTypeLabel = publishPayload.taskTypeLabel;
    currentTask.taskTypeReason = publishPayload.taskTypeReason;
    currentTask.taskTypeCharacteristics = publishPayload.taskTypeCharacteristics;
    currentTask.beforeCandidates = [...synthesizedBeforeOptions];
    currentTask.afterCandidates = [...synthesizedAfterOptions];
    currentTask.beforeCandidateFrames = [...synthesizedBeforeFrames];
    currentTask.afterCandidateFrames = [...synthesizedAfterFrames];
    currentTask.psychologicalFactors = latestPsychologicalFactors;
    currentTask.structuredPrompt = latestStructuredPrompt;
    currentTask.llmProvider = latestLLMProvider;
    currentTask.llmModel = latestLLMModel;
    currentTask.id = "task-" + Date.now();
    currentTask.createdAt = new Date().toISOString();

    tasks[currentTask.id] = currentTask;
    try {
      localStorage.setItem("agentic_tasks", JSON.stringify(tasks));
    } catch {
      showToast("미디어 용량이 커서 브라우저 임시 저장은 건너뛰었습니다.");
    }

    const serverSaved = await saveTaskToServer(currentTask);

    const workerUrl = `${window.location.origin}${window.location.pathname}#worker?taskId=${currentTask.id}`;
    shareLinkInput.value = workerUrl;
    if (shareCreatedAt) {
      shareCreatedAt.textContent = `${new Date().toLocaleString("ko-KR", { hour12: false })} 생성`;
    }
    const shareStatusText = document.getElementById("share-status-text");
    if (shareStatusText) {
      shareStatusText.textContent = serverSaved ? "서버 저장 완료" : "로컬 링크 생성";
    }

    shareCard.classList.remove("hidden");
    setWorkflowStep("publish");
    showToast(serverSaved ? "작업자 전용 링크가 생성되었습니다." : "이 기기에서 확인할 수 있는 링크가 생성되었습니다. 다른 기기 공유를 위한 서버 저장은 실패했습니다.");
    shareCard.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  // Helper to ensure currentTask exists and sync draft
  const syncFormToDraft = () => {
    if (!currentTask) {
      currentTask = {
        id: "task-draft",
        title: "",
        category: selectedCategory,
        taskCategory: selectedCategory,
        taskType: selectedTaskType,
        taskTypeLabel: TaskTypeConfig.getTaskType(selectedTaskType)?.label || TaskTypeConfig.TASK_TYPES.general_low_risk.label,
        reward: "1.50",
        timeLimitMinutes: "15",
        description: "",
        beforeText: "귀하의 세심한 인지적 가치는 고품질 데이터 구축의 핵심 주춧돌이 됩니다. 높은 자부심을 갖고 동참해 주시기 바랍니다.",
        afterText: "경이로운 기여를 완성하셨습니다! 소중한 노고에 진심으로 깊이 감사드립니다.",
        createdAt: new Date().toISOString()
      };
    }
    const draftPayload = getTaskPayloadFromForm();
    currentTask.title = taskTitleBox.value.trim();
    currentTask.reward = taskRewardBox.value.trim() || "1.50";
    currentTask.timeLimitMinutes = taskTimeLimitBox.value.trim() || "15";
    currentTask.description = taskDescBox.value.trim();
    currentTask.category = selectedCategory;
    currentTask.taskCategory = draftPayload.taskCategory;
    currentTask.taskType = draftPayload.taskType;
    currentTask.taskTypeLabel = draftPayload.taskTypeLabel;
    currentTask.taskTypeReason = draftPayload.taskTypeReason;
    currentTask.taskTypeCharacteristics = draftPayload.taskTypeCharacteristics;
    currentTask.riskLevel = taskRiskLevelSelect.value;
    currentTask.fatigueLevel = taskFatigueLevelSelect.value;
    currentTask.objective = taskObjectiveBox.value.trim();
    currentTask.socialImpact = taskSocialImpactBox.value.trim();
    currentTask.workerContext = taskWorkerContextBox.value.trim();
    saveDraftToStorage();
  };

  taskTitleBox.addEventListener("input", syncFormToDraft);
  taskRewardBox.addEventListener("input", syncFormToDraft);
  taskTimeLimitBox.addEventListener("input", syncFormToDraft);
  taskDescBox.addEventListener("input", syncFormToDraft);
  taskRiskLevelSelect.addEventListener("change", syncFormToDraft);
  taskFatigueLevelSelect.addEventListener("change", syncFormToDraft);
  taskObjectiveBox.addEventListener("input", syncFormToDraft);
  taskSocialImpactBox.addEventListener("input", syncFormToDraft);
  taskWorkerContextBox.addEventListener("input", syncFormToDraft);

  let taskTypeRecommendationTimer = null;
  [taskTitleBox, taskDescBox, taskObjectiveBox, taskSocialImpactBox, taskWorkerContextBox, taskRiskLevelSelect, taskFatigueLevelSelect]
    .filter(Boolean)
    .forEach(element => {
      const eventName = element.tagName === "SELECT" ? "change" : "input";
      element.addEventListener(eventName, () => {
        clearTimeout(taskTypeRecommendationTimer);
        taskTypeRecommendationTimer = setTimeout(refreshTaskTypeRecommendation, 180);
      });
    });

  // Real-time synchronization of manual edits to the textareas
  beforeTextBox.addEventListener("input", () => {
    if (synthesizedBeforeOptions.length > 0) {
      synthesizedBeforeOptions[selectedBeforeOptionIndex] = beforeTextBox.value;
    }
    if (currentTask) {
      currentTask.beforeCandidates = [...synthesizedBeforeOptions];
      saveDraftToStorage();
    }
  });

  afterTextBox.addEventListener("input", () => {
    if (synthesizedAfterOptions.length > 0) {
      synthesizedAfterOptions[selectedAfterOptionIndex] = afterTextBox.value;
    }
    if (currentTask) {
      currentTask.afterCandidates = [...synthesizedAfterOptions];
      saveDraftToStorage();
    }
  });

  finalBeforeTextBox.addEventListener("input", () => {
    if (currentTask) {
      currentTask.beforeText = finalBeforeTextBox.value;
      currentTask.finalBeforeText = finalBeforeTextBox.value;
      saveDraftToStorage();
    }
  });

  finalAfterTextBox.addEventListener("input", () => {
    if (currentTask) {
      currentTask.afterText = finalAfterTextBox.value;
      currentTask.finalAfterText = finalAfterTextBox.value;
      saveDraftToStorage();
    }
  });

  btnCopyLink.addEventListener("click", () => {
    shareLinkInput.select();
    navigator.clipboard.writeText(shareLinkInput.value);
    showToast("작업자 링크가 클립보드에 복사되었습니다.");
  });

  btnOpenWorker.addEventListener("click", () => {
    if (shareLinkInput.value) {
      window.open(shareLinkInput.value, "_blank");
    }
  });

  // Export Complete Research Logs JSON Button (NASA-TLX and survey parameters removed)
  const handleJSONExport = () => {
    const results = JSON.parse(localStorage.getItem("agentic_results")) || [];
    
    const finalReport = results;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalReport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "results.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("results.json 다운로드가 완료되었습니다.");
  };

  btnExportResults?.addEventListener("click", handleJSONExport);
  btnWorkerExport?.addEventListener("click", handleJSONExport);

  // ========================================================================== 
  // CROWD WORKER: PRE-TASK WORKSPACE
  // ========================================================================== 

  const escapeGuidelineHTML = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const formatGuidelineInline = (value = "") => escapeGuidelineHTML(value)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong class="guideline-emphasis">$1</strong>');

  const isNaturalGuidelineHeading = (line = "") => {
    const text = line.trim();
    if (!text || text.length > 40) return false;

    const commonHeading = /^(?:\d+[.)]\s*)?(?:작업\s*개요|상세\s*가이드라인|가이드라인|판단\s*기준|분류\s*기준|작업\s*절차|진행\s*방법|주의\s*사항|유의\s*사항|예외\s*사항|참고\s*사항|작업\s*목표|제출\s*기준)(?:\s*[:：])?$/i;
    const bracketHeading = /^\[[^\]]{2,30}\]$/;
    const shortLabel = /^[^.!?。]{2,24}[:：]$/;
    return commonHeading.test(text) || bracketHeading.test(text) || shortLabel.test(text);
  };

  const renderGuidelineMarkdown = (description = "", compact = false) => String(description)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((originalLine) => {
      const line = originalLine.trim();
      if (!line) return '<div class="guideline-spacer" aria-hidden="true"></div>';

      const markdownHeading = line.match(/^(#{1,6})\s*(.+?)\s*#*$/);
      if (markdownHeading) {
        const level = markdownHeading[1].length <= 2 ? "title" : "subtitle";
        return `<div class="guideline-heading guideline-heading-${level}${compact ? " is-compact" : ""}">${formatGuidelineInline(markdownHeading[2])}</div>`;
      }

      const standaloneBold = line.match(/^\*\*(.+?)\*\*$/);
      if (standaloneBold) {
        return `<div class="guideline-heading guideline-heading-subtitle${compact ? " is-compact" : ""}">${formatGuidelineInline(standaloneBold[1])}</div>`;
      }

      if (isNaturalGuidelineHeading(line)) {
        return `<div class="guideline-heading guideline-heading-subtitle${compact ? " is-compact" : ""}">${formatGuidelineInline(line)}</div>`;
      }

      const lineType = /^(?:[-*•]|\d+[.)])\s+/.test(line) ? " guideline-list-line" : "";
      return `<div class="guideline-line${lineType}">${formatGuidelineInline(originalLine)}</div>`;
    })
    .join("");

  const renderGuidelineDescription = (container, description, compact = false) => {
    if (!container) return;
    if (!description) {
      container.innerHTML = '<span class="guideline-empty">게시된 상세 가이드라인이 존재하지 않습니다.</span>';
      return;
    }
    container.innerHTML = renderGuidelineMarkdown(description, compact);
  };

  const loadWorkerTask = async (taskId) => {
    const tasks = JSON.parse(localStorage.getItem("agentic_tasks")) || {};
    let task = await loadTaskFromServer(taskId);
    if (!task) task = tasks[taskId];

    if (!task) {
      activeWorkerTask = null;
      workerTaskError.classList.remove("hidden");
      workerPreTask.classList.add("hidden");
      workerWorkspace.classList.add("hidden");
      workerPostTask.classList.add("hidden");
      return;
    }

    activeWorkerTask = task;
    workerTaskError.classList.add("hidden");
    workerPreTask.classList.remove("hidden");
    workerWorkspace.classList.add("hidden");
    workerPostTask.classList.add("hidden");

    // Opening the link creates an "opened" session. Task timing starts only after the explicit start action.
    createWorkerSession(taskId, 10, task.category, task.taskType, task.taskTypeLabel);
    const timeLimitMinutes = parseInt(task.timeLimitMinutes || "15", 10);
    const safeTimeLimitMinutes = Number.isFinite(timeLimitMinutes)
      ? Math.min(Math.max(timeLimitMinutes, 1), 180)
      : 15;
    workerSession.timerSeconds = safeTimeLimitMinutes * 60;
    workerSession.timerSpeed = 1;
    workerSession.selectedOption = null;

    // Bind values safely with null checks to prevent script crashes
    if (workerTaskTitle) {
      workerTaskTitle.textContent = task.title || "크라우드소싱 주석 작업";
    }
    if (workspaceTaskTitle) {
      workspaceTaskTitle.textContent = task.title || "크라우드소싱 주석 작업";
    }
    if (workerTaskReward) {
      workerTaskReward.textContent = `$${task.reward || "1.50"}`;
    }
    if (workerSpecReward) {
      workerSpecReward.textContent = `$${task.reward || "1.50"}`;
    }
    if (workerSpecTimeLimit) {
      workerSpecTimeLimit.textContent = `${safeTimeLimitMinutes} 분`;
    }
    if (workerMotivationPrime) {
      workerMotivationPrime.textContent = task.beforeText || "귀하의 세심한 인지적 가치는 고품질 데이터 구축의 핵심 주춧돌이 됩니다.";
    }
    if (workspaceMotivationPrime) {
      workspaceMotivationPrime.textContent = task.beforeText || "귀하의 세심한 인지적 가치는 고품질 데이터 구축의 핵심 주춧돌이 됩니다.";
    }

    // Preserve the stored guideline text and format Markdown only in worker previews.
    const workerTaskDesc = document.getElementById("worker-task-desc");
    renderGuidelineDescription(workerTaskDesc, task.description);
    renderGuidelineDescription(workspaceTaskDesc, task.description, true);
  };

  // Start Campaign Task Workspace
  btnStartTask.addEventListener("click", () => {
    startWorkerSession();
    workerPreTask.classList.add("hidden");
    workerWorkspace.classList.remove("hidden");

    // Render SVGs
    renderImageCanvas();
    renderLabelingOptions();

    // Start countdown
    startCountdown();
  });

  // ==========================================================================
  // SIMULATED COUNTDOWN CLOCK
  // ==========================================================================
  const startCountdown = () => {
    clearInterval(workerSession.timerInterval);

    const updateDisplay = () => {
      const mins = Math.floor(workerSession.timerSeconds / 60);
      const secs = workerSession.timerSeconds % 60;
      labelTimer.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

      if (workerSession.timerSeconds < 180) {
        labelTimer.parentElement.classList.add("timer-critical");
      } else {
        labelTimer.parentElement.classList.remove("timer-critical");
      }
    };

    updateDisplay();

    workerSession.timerInterval = setInterval(() => {
      workerSession.timerSeconds -= 1;

      if (workerSession.timerSeconds <= 0) {
        workerSession.timerSeconds = 0;
        clearInterval(workerSession.timerInterval);
        markWorkerSessionAbandoned();
        btnSubmitAnnotation.disabled = true;
        showToast("제한 시간이 종료되었습니다. 진행 기록은 미완료 세션으로 저장됩니다.");
      }

      updateDisplay();
    }, 1000);
  };

  // ==========================================================================
  // SIMULATED ANNOTATOR CANVAS
  // ==========================================================================
  const generateDynamicSVGAsset = (category, index) => {
    const width = 500;
    const height = 300;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%; height:100%; font-family:'Inter', sans-serif;">`;
    svgContent += `<rect width="100%" height="100%" fill="#f8fafc"/>`;
    svgContent += `<g stroke="rgba(15,23,42,0.07)" stroke-width="1">`;
    for (let x = 0; x < width; x += 25) svgContent += `<line x1="${x}" y1="0" x2="${x}" y2="${height}"/>`;
    for (let y = 0; y < height; y += 25) svgContent += `<line x1="0" y1="${y}" x2="${width}" y2="${y}"/>`;
    svgContent += `</g>`;

    if (category === "medical") {
      svgContent += `
        <path d="M 120 40 Q 180 80 180 260 M 380 40 Q 320 80 320 260" stroke="#94a3b8" stroke-width="12" fill="none" opacity="0.65"/>
        <path d="M 130 80 C 190 120 190 200 175 250 M 370 80 C 310 120 310 200 325 250" stroke="#94a3b8" stroke-width="8" fill="none" opacity="0.65"/>
        
        <path d="M 180 60 Q 100 80 120 240 Q 180 270 200 240 Q 210 160 180 60" fill="rgba(148, 163, 184, 0.25)" stroke="#64748b" stroke-width="2"/>
        <path d="M 320 60 Q 400 80 380 240 Q 320 270 300 240 Q 290 160 320 60" fill="rgba(148, 163, 184, 0.25)" stroke="#64748b" stroke-width="2"/>
        
        <rect x="240" y="30" width="20" height="240" rx="3" fill="#cbd5e1" opacity="0.8"/>
      `;

      if (index === 2 || index === 5 || index === 8) {
        const cx = index === 2 ? 150 : 340;
        const cy = index === 2 ? 140 : 185;
        const radius = index === 2 ? 22 : 15;
        svgContent += `
          <circle cx="${cx}" cy="${cy}" r="${radius}" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" stroke-dasharray="3,3" stroke-width="2">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <line x1="${cx - radius - 15}" y1="${cy}" x2="${cx - radius - 2}" y2="${cy}" stroke="#f43f5e" stroke-width="1.5"/>
          <line x1="${cx + radius + 2}" y1="${cy}" x2="${cx + radius + 15}" y2="${cy}" stroke="#f43f5e" stroke-width="1.5"/>
          <line x1="${cx}" y1="${cy - radius - 15}" x2="${cx}" y2="${cy - radius - 2}" stroke="#f43f5e" stroke-width="1.5"/>
          <line x1="${cx}" y1="${cy + radius + 2}" x2="${cx}" y2="${cy + radius + 15}" stroke="#f43f5e" stroke-width="1.5"/>
        `;
      }
    } else if (category === "autonomous") {
      svgContent += `
        <polygon points="210,130 290,130 450,300 50,300" fill="#cbd5e1"/>
        <line x1="250" y1="130" x2="250" y2="300" stroke="#e11d48" stroke-width="2" stroke-dasharray="8,8"/>
        
        <rect x="0" y="0" width="500" height="130" fill="#0f172a" opacity="0.8"/>
        <path d="M 0 130 L 80 90 L 150 110 L 220 80 L 310 120 L 420 95 L 500 130 Z" fill="#020617"/>
        
        <g transform="translate(${index % 2 === 0 ? '160, 160' : '230, 140'}) scale(${index % 2 === 0 ? '1.1' : '0.7'})">
          <rect x="10" y="30" width="100" height="40" rx="8" fill="none" stroke="#38bdf8" stroke-width="2"/>
          <path d="M 25 30 L 35 10 L 85 10 L 95 30" fill="none" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="30" cy="70" r="12" fill="none" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="90" cy="70" r="12" fill="none" stroke="#38bdf8" stroke-width="2"/>
        </g>
      `;

      if (index === 1 || index === 4 || index === 7) {
        svgContent += `
          <g transform="translate(100, 140)">
            <rect x="0" y="0" width="40" height="90" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4"/>
            <rect x="0" y="-18" width="30" height="18" fill="#a855f7"/>
            <text x="3" y="-5" fill="white" font-size="8" font-weight="700">PEDESTRIAN</text>
            
            <circle cx="20" cy="18" r="8" fill="#f472b6"/>
            <line x1="20" y1="26" x2="20" y2="60" stroke="#f472b6" stroke-width="4"/>
            <line x1="20" y1="35" x2="5" y2="50" stroke="#f472b6" stroke-width="3"/>
            <line x1="20" y1="35" x2="35" y2="50" stroke="#f472b6" stroke-width="3"/>
            <line x1="20" y1="60" x2="10" y2="85" stroke="#f472b6" stroke-width="3.5"/>
            <line x1="20" y1="60" x2="30" y2="85" stroke="#f472b6" stroke-width="3.5"/>
          </g>
        `;
      }
    } else if (category === "moderation") {
      const toxicComments = [
        "다른 사람의 의견을 존중할 생각이 없다면 이 대화에서 나가 주세요. 계속 비하하는 표현을 쓰는 건 불편합니다.",
        "제시하신 정책 제안서는 다소 근거가 부족해 보입니다. 여기에 반박 연구 리포트 링크를 첨부하니 차분하게 토론해 봅시다.",
        "당신 같은 사람은 이 커뮤니티에 있을 자격이 없어요. 다시 글을 올리면 계속 신고하겠습니다.",
        "이번에 새로 산 쿼드콥터 촬영 장치가 꽤 쓸만하네요. 배터리 타임도 45분 이상 버텨줘서 만족스럽게 야외 촬영 중입니다.",
        "그 의견은 정말 무례하고 수준이 낮네요. 더 이상 이런 식으로 말하지 마세요.",
        "단지 주민 자치회 수영장이 내일 아침 성인 자유형 수영 타임에 개방하는지 아시는 분 계신가요? 고맙습니다!",
        "이 판매자와 거래한 뒤 연락이 되지 않습니다. 추가 거래 전에 거래 내역을 확인해 주세요.",
        "시내 베이커리 빵집의 목요일 아침 블루베리 스콘이 정말 맛있어요. 아침 9시 전에는 가야 솔드아웃 안 되고 살 수 있습니다.",
        "이런 형편없는 글을 계속 올리는 사람은 계정을 정지해야 한다고 생각합니다.",
        "단지 주민 자치회 수영장이 내일 아침 성인 자유형 수영 타임에 개방하는지 아시는 분 계신가요?"
      ];

      const commentText = toxicComments[index % toxicComments.length];
      const isToxic = index % 2 === 0; // Toxic comment at index 0, 2, 4, 6, 8

      svgContent += `
        <foreignObject x="25" y="40" width="450" height="220">
          <div xmlns="http://www.w3.org/1999/xhtml" style="color:#1f2937; font-size:12px; line-height:1.5; background:#ffffff; padding:16px; border-radius:10px; border:1px solid #e5e7eb; height: 100%; box-sizing: border-box; box-shadow:0 6px 18px rgba(17,24,39,0.08);">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #e5e7eb; padding-bottom:6px;">
              <span style="font-weight:700; color:#2563eb; font-family:'Inter', sans-serif;">User_ID: 익명_작업자_${1000 + index}</span>
              <span style="font-size:10px; color:#6b7280;">게시글 번호 #15,${200 + index}</span>
            </div>
            <p style="font-style: italic; color:#111827; background:#f8fafc; padding:8px; border-radius:6px; border-left: 3px solid ${isToxic ? '#ef4444' : '#14b8a6'}">
              "${commentText}"
            </p>
            <div style="margin-top:10px; font-size:10px; color:#6b7280;">
              <span style="background:${isToxic ? '#fef2f2' : '#ecfdf5'}; color:${isToxic ? '#b91c1c' : '#047857'}; padding:2px 6px; border-radius:999px; font-weight:700;">
                ${isToxic ? '규정 위반 가능성 있음' : '규정 준수 텍스트'}
              </span>
            </div>
          </div>
        </foreignObject>
      `;
    } else if (category === "medical_alert") {
      const alertMatches = index % 2 === 0;
      const recordAllergy = alertMatches ? "Penicillin" : "Latex";
      svgContent += `
        <rect x="55" y="40" width="390" height="220" rx="14" fill="#ffffff" stroke="#cbd5e1"/>
        <text x="80" y="75" fill="#475569" font-size="12" font-weight="700">SYNTHETIC RESEARCH RECORD</text>
        <text x="80" y="108" fill="#0f172a" font-size="15">Recorded allergy: ${recordAllergy}</text>
        <rect x="80" y="135" width="340" height="72" rx="10" fill="#fff7ed" stroke="#fdba74"/>
        <text x="100" y="163" fill="#9a3412" font-size="12" font-weight="700">SYSTEM ALERT</text>
        <text x="100" y="190" fill="#0f172a" font-size="15">Penicillin allergy warning</text>
        <text x="250" y="238" text-anchor="middle" fill="#64748b" font-size="11">No real patient data · No diagnosis</text>
      `;
    } else if (category === "ocr") {
      const match = index % 2 === 0;
      const receiptPrice = (12 + (index % 5) * 3).toFixed(2);
      const extractedPrice = match ? receiptPrice : (Number(receiptPrice) + 1).toFixed(2);
      svgContent += `
        <rect x="55" y="35" width="190" height="230" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
        <text x="150" y="65" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="700">RECEIPT</text>
        <line x1="80" y1="82" x2="220" y2="82" stroke="#cbd5e1"/>
        <text x="80" y="115" fill="#475569" font-size="12">Product ${index + 1}</text>
        <text x="205" y="115" text-anchor="end" fill="#0f172a" font-size="14">$${receiptPrice}</text>
        <text x="80" y="155" fill="#94a3b8" font-size="11">Thank you</text>
        <rect x="280" y="78" width="165" height="120" rx="10" fill="#eef2ff" stroke="#c7d2fe"/>
        <text x="300" y="108" fill="#4338ca" font-size="11" font-weight="700">OCR EXTRACT</text>
        <text x="300" y="150" fill="#0f172a" font-size="22" font-weight="700">$${extractedPrice}</text>
      `;
    } else if (category === "accessibility") {
      const correct = index % 2 === 0;
      svgContent += `
        <rect x="45" y="45" width="410" height="210" rx="14" fill="#ffffff" stroke="#cbd5e1"/>
        <rect x="75" y="85" width="150" height="120" fill="#e2e8f0" stroke="#94a3b8"/>
        <rect x="120" y="130" width="55" height="75" fill="#ffffff" stroke="#64748b"/>
        <path d="M230 205 L320 165 L380 205" fill="none" stroke="#14b8a6" stroke-width="8"/>
        <circle cx="335" cy="118" r="14" fill="none" stroke="#4f46e5" stroke-width="3"/>
        <path d="M335 132 L335 170 M318 145 L350 145 M335 170 L318 196 M335 170 L353 196" stroke="#4f46e5" stroke-width="3" fill="none"/>
        <text x="250" y="82" fill="#0f172a" font-size="13" font-weight="700">Provided information</text>
        <text x="250" y="105" fill="#475569" font-size="12">Wheelchair ramp: ${correct ? "Available" : "Not available"}</text>
        <text x="250" y="230" fill="#64748b" font-size="10">Research-purpose facility illustration</text>
      `;
    } else if (category === "preference") {
      const leftHue = 210 + (index % 3) * 25;
      const rightHue = 20 + (index % 4) * 25;
      svgContent += `
        <rect x="45" y="45" width="185" height="210" rx="16" fill="#ffffff" stroke="#cbd5e1"/>
        <rect x="270" y="45" width="185" height="210" rx="16" fill="#ffffff" stroke="#cbd5e1"/>
        <circle cx="138" cy="135" r="58" fill="hsl(${leftHue}, 70%, 82%)"/>
        <rect x="105" y="105" width="66" height="66" rx="14" fill="hsl(${leftHue}, 60%, 52%)"/>
        <circle cx="363" cy="135" r="58" fill="hsl(${rightHue}, 75%, 84%)"/>
        <path d="M330 170 L363 98 L396 170 Z" fill="hsl(${rightHue}, 68%, 52%)"/>
        <text x="138" y="230" text-anchor="middle" fill="#334155" font-size="13" font-weight="700">IMAGE A</text>
        <text x="363" y="230" text-anchor="middle" fill="#334155" font-size="13" font-weight="700">IMAGE B</text>
      `;
    } else {
      const isSymmetrical = index % 2 === 0;
      svgContent += `
        <circle cx="250" cy="150" r="70" fill="none" stroke="#14b8a6" stroke-width="3"/>
        <circle cx="250" cy="150" r="3" fill="#14b8a6"/>
        
        <g transform="translate(225, 125) ${isSymmetrical ? 'rotate(0)' : 'rotate(-45, 25, 25)'}">
          <polygon points="25,0 50,45 0,45" fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" stroke-width="2"/>
        </g>
        <text x="250" y="245" fill="#94a3b8" font-size="12" text-anchor="middle">검증 타겟 상태: ${isSymmetrical ? '완전 대칭 구조 (0도)' : '비대칭 왼쪽 기울임 (-45도)'}</text>
      `;
    }

    svgContent += `</svg>`;
    return svgContent;
  };

  const renderImageCanvas = () => {
    canvasLoading.classList.add("active");

    setTimeout(() => {
      const svg = generateDynamicSVGAsset(workerSession.category, workerSession.progress);
      canvasImgContainer.innerHTML = svg;
      canvasLoading.classList.remove("active");
    }, 350);
  };

  // Render classification options and questions
  const renderLabelingOptions = () => {
    optionsWrapper.innerHTML = "";
    workerSession.selectedOption = null;
    if (workerSession.status === "started") workerSession.itemStartedAt = new Date().toISOString();
    btnSubmitAnnotation.disabled = true;

    let questionText = "캔버스의 가이드를 참고하여 판독을 확정하십시오:";
    let options = [];

    if (workerSession.category === "medical") {
      questionText = "제공된 흉부 X-ray 스캔 이미지에 종양 의심 조밀도 병변 조각이 존재합니까?";
      options = [
        "정상 소견: 특이 질감 또는 병변 이상 없음",
        "이상 소견 발견: 유의미한 결절 종양 흔적 감지됨",
        "판독 불가: 이미지 노이즈 및 저해상도 초점 흐림"
      ];
    } else if (workerSession.category === "autonomous") {
      questionText = "하이라이트된 도로 바운딩 박스 안쪽의 교통 위해 장애물을 분류하십시오:";
      options = [
        "장애물 없음: 안전 주행 차선",
        "보행자 실루엣 감지됨",
        "일반 승용차 차체 감지됨",
        "도로 공사용 차단막 장애물 감지됨"
      ];
    } else if (workerSession.category === "moderation") {
      questionText = "해당 유저 댓글 게시물이 위협이나 언어 비하 규정을 위반하는 공격적 성향을 보입니까?";
      options = [
        "깨끗한 텍스트: 커뮤니티 지침 준수",
        "악성 게시물: 공격성 폭언/하라스먼트 규정 위반",
        "스팸 광고성: 상업 홍보 및 도배성 불필요 정보"
      ];
    } else if (workerSession.category === "medical_alert") {
      questionText = "합성 기록의 알레르기 정보와 시스템 경고가 일치합니까? 실제 의료 진단이 아닌 연구용 검수입니다.";
      options = ["Correct alert", "Incorrect alert"];
    } else if (workerSession.category === "ocr") {
      questionText = "영수증의 상품 가격과 OCR 추출 가격을 비교해 주세요.";
      options = ["Match", "Mismatch"];
    } else if (workerSession.category === "accessibility") {
      questionText = "시설 그림과 제공된 접근성 정보가 일치하는지 확인해 주세요.";
      options = ["Information correct", "Information needs correction"];
    } else if (workerSession.category === "preference") {
      questionText = "두 상품 이미지 중 더 선호하는 이미지를 선택해 주세요. 정답은 Worker에게 표시되지 않습니다.";
      options = ["Image A", "Image B"];
    } else {
      questionText = "중앙 캔버스의 타겟 이미지 요소의 회전 지향 방향을 결정해 주십시오:";
      options = [
        "완전한 대칭 배향 (0도 회전)",
        "비대칭 왼쪽 편향 (-45도 경사)",
        "비대칭 오른쪽 편향 (+45도 경사)"
      ];
    }

    labelingQuestion.textContent = questionText;

    options.forEach((opt, idx) => {
      const optBtn = document.createElement("button");
      optBtn.className = "option-btn";
      optBtn.textContent = opt;
      optBtn.setAttribute("data-index", idx);

      optBtn.addEventListener("click", () => {
        const optionButtons = optionsWrapper.querySelectorAll(".option-btn");
        optionButtons.forEach(btn => btn.classList.remove("selected"));
        optBtn.classList.add("selected");

        workerSession.selectedOption = idx;
        btnSubmitAnnotation.disabled = false;
      });

      optionsWrapper.appendChild(optBtn);
    });

    // Update progress numbers
    labelProgressText.textContent = `${workerSession.progress} / ${workerSession.totalItems}`;
    progressBarInner.style.width = `${(workerSession.progress / workerSession.totalItems) * 100}%`;

  };

  // Get Ground Truth target indexes and reasoning
  const getGroundTruthForAsset = (category, index) => {
    let correctIdx = 0;
    let explanation = "";

    if (category === "medical") {
      const isAnomalous = (index === 2 || index === 5 || index === 8);
      correctIdx = isAnomalous ? 1 : 0;
      explanation = isAnomalous
        ? "해당 방사선 스캔은 검사 원 안쪽에 뚜렷한 조밀 결절 음영을 표출하고 있습니다. 표시된 붉은 점선 영역을 재확인하십시오."
        : "폐의 모든 갈비뼈 하단 조직이 맑고 고른 투명도를 띠고 있습니다. 비정상적인 종양성 결절 흔적은 부재합니다.";
    } else if (category === "autonomous") {
      const isPedestrian = (index === 1 || index === 4 || index === 7);
      correctIdx = isPedestrian ? 1 : 2;
      explanation = isPedestrian
        ? "바운딩 어레이 박스 안쪽의 차선 중앙에 분홍색 보행자 실루엣이 가로막고 있어 안전 정지가 필요합니다."
        : "중심 프레임에 잡힌 것은 선행 승용차의 후미 차체입니다. 이는 표준적인 차량 장애물 패턴에 정렬됩니다.";
    } else if (category === "moderation") {
      const isToxic = (index % 2 === 0);
      correctIdx = isToxic ? 1 : 0;
      explanation = isToxic
        ? "유저 코멘트 내부에는 혐오적 멸칭, 신상 털기 협박 및 직접 비하 단어군이 분포하여 직접적 위반 수위를 충족합니다."
        : "해당 코멘트는 가벼운 질의이거나 상대 제안 반론 성격으로, 폭언이나 모욕 규정을 침해하지 않는 안심 댓글입니다.";
    } else if (category === "medical_alert") {
      correctIdx = index % 2 === 0 ? 0 : 1;
      explanation = "합성 기록의 알레르기 항목과 시스템 경고 문자열의 일치 여부를 기준으로 판정합니다.";
    } else if (category === "ocr") {
      correctIdx = index % 2 === 0 ? 0 : 1;
      explanation = "영수증에 표시된 가격과 OCR 추출 가격의 숫자 일치 여부를 기준으로 판정합니다.";
    } else if (category === "accessibility") {
      correctIdx = index % 2 === 0 ? 0 : 1;
      explanation = "그림에 표시된 경사로와 제공 정보가 일치하는지 확인합니다.";
    } else if (category === "preference") {
      correctIdx = null;
      explanation = "선호도 응답에는 정답이 없으므로 원시 선택만 저장하고 Task Accuracy 계산에서는 제외합니다.";
    } else {
      const isSymmetrical = (index % 2 === 0);
      correctIdx = isSymmetrical ? 0 : 1;
      explanation = isSymmetrical
        ? "폴리곤 벡터 정점이 비틀림 없이 정교하게 수직 y축 중심선을 가리키며 균일 대칭을 이루고 있습니다."
        : "타겟 이미지 요소가 반시계 방향으로 45도 편향 경사 상태를 띠어 왼쪽 비대칭 분류 구조를 충족합니다.";
    }

    return { correctIdx, explanation };
  };

  // Submit Annotation directly
  btnSubmitAnnotation.addEventListener("click", () => {
    if (workerSession.selectedOption === null) return;

    const submittedAt = new Date().toISOString();
    const groundTruth = getGroundTruthForAsset(workerSession.category, workerSession.progress);
    const isScorable = Number.isInteger(groundTruth.correctIdx);
    const isCorrect = isScorable ? workerSession.selectedOption === groundTruth.correctIdx : null;
    const itemStartMs = Date.parse(workerSession.itemStartedAt || "");
    const submittedMs = Date.parse(submittedAt);
    const response = {
      itemIndex: workerSession.progress,
      selectedOption: workerSession.selectedOption,
      correctOption: groundTruth.correctIdx,
      isCorrect,
      isScorable,
      itemStartedAt: workerSession.itemStartedAt,
      itemSubmittedAt: submittedAt,
      responseTimeMs: Number.isFinite(itemStartMs) ? Math.max(0, submittedMs - itemStartMs) : null
    };
    workerSession.responses.push(response);
    workerSession.attemptedItems += 1;
    if (isScorable) workerSession.scoredItems += 1;
    if (isCorrect === true) workerSession.correctItems += 1;
    Object.assign(workerSession, calculateTaskAccuracy(workerSession.correctItems, workerSession.scoredItems));
    workerSession.lastSeenAt = submittedAt;

    showToast("제출되었습니다. 다음 항목으로 이동합니다.");
    workerSession.progress += 1;
    syncWorkerSession("PATCH", workerSession);

    if (workerSession.progress >= workerSession.totalItems) {
      completeLabelingItems();
    } else {
      renderImageCanvas();
      renderLabelingOptions();
    }
  });

  // Finished 10 labeling tasks -> Transition directly to final panel
  const completeWorkerSession = (task = {}) => {
    const completedAt = new Date().toISOString();
    workerSession.status = "completed";
    workerSession.completedAt = completedAt;
    workerSession.lastSeenAt = completedAt;
    Object.assign(workerSession, calculateTaskAccuracy(workerSession.correctItems, workerSession.scoredItems ?? workerSession.attemptedItems));
    Object.assign(workerSession, calculateCompletionTime(workerSession.taskStartedAt, completedAt));
    const record = {
      ...toSerializableSession(workerSession),
      taskTitle: task.title || "크라우드 주석 작업",
      taskCategory: task.taskCategory || task.category || "general",
      taskType: task.taskType || workerSession.taskType || "",
      taskTypeLabel: task.taskTypeLabel || workerSession.taskTypeLabel || "",
      taskTypeReason: task.taskTypeReason || "",
      taskTypeCharacteristics: task.taskTypeCharacteristics || [],
      reward: task.reward || "1.50",
      timeLimitMinutes: task.timeLimitMinutes || "15",
      riskLevel: task.riskLevel || "medium",
      fatigueLevel: task.fatigueLevel || "medium",
      objective: task.objective || "",
      socialImpact: task.socialImpact || "",
      workerContext: task.workerContext || "",
      psychologicalFactors: task.psychologicalFactors || null,
      selectedFrames: task.selectedFrames || task.psychologicalFactors?.selectedFrames || [],
      structuredPrompt: task.structuredPrompt || "",
      beforeCandidates: task.beforeCandidates || [],
      afterCandidates: task.afterCandidates || [],
      beforeCandidateFrames: task.beforeCandidateFrames || [],
      afterCandidateFrames: task.afterCandidateFrames || [],
      finalBeforeText: task.finalBeforeText || task.beforeText || "",
      finalAfterText: task.finalAfterText || task.afterText || "",
      llmProvider: task.llmProvider || "local",
      llmModel: task.llmModel || ""
    };
    persistWorkerSessionLocally(record);
    syncWorkerSession("PATCH", record);
    return record;
  };

  const completeLabelingItems = () => {
    clearInterval(workerSession.timerInterval);

    workerWorkspace.classList.add("hidden");
    workerPostTask.classList.remove("hidden");

    const tasks = JSON.parse(localStorage.getItem("agentic_tasks")) || {};
    const task = activeWorkerTask || tasks[workerSession.taskId] || {};

    const sessionRecord = completeWorkerSession(task);

    // Save session record to results database in cache
    const results = JSON.parse(localStorage.getItem("agentic_results")) || [];
    results.push(sessionRecord);
    localStorage.setItem("agentic_results", JSON.stringify(results));
    saveResultToServer(sessionRecord);

    postTaskAppreciationText.textContent = task.afterText || "성공적으로 어노테이션 임무가 완수되었습니다. 감사합니다!";

    // Bind final UI stats (Only approved reward is shown since accuracy and warnings are removed)
    postMetricReward.textContent = `$${task.reward || "1.50"}`;

    // Celebrate with confetti!
    if (typeof confetti === "function") {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.65 } });
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 120, origin: { y: 0.55 } });
      }, 350);
    }
  };

  btnBackToRequester?.remove();

  window.addEventListener("pagehide", () => markWorkerSessionAbandoned(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || workerSession.status !== "started") return;
    workerSession.lastSeenAt = new Date().toISOString();
    syncWorkerSession("PATCH", workerSession);
  });

  renderExampleTaskButtons();
  renderTaskTypeOptions();
  refreshTaskTypeRecommendation();
  updateFormCompletion();
  // Workspace is revealed only after the CTA is clicked in the current visit.
  setWorkspaceAvailability(false);

  // Load router views on init
  handleRouting();
});
