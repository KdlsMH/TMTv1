# Task Message Studio 배포 가이드 (Vercel + Supabase)

이 프로젝트는 Vercel에서 `server.js`를 실행하지 않습니다.

- `index.html`, `css`, `js`: Vercel 정적 파일
- `api/*.js`: Vercel Node.js Functions
- Supabase: `tasks`, `results`, `sessions` 영구 저장
- `server.js`, `data/*.json`: 로컬 실행 전용

## 1. Supabase 프로젝트 만들기

1. Supabase Dashboard에서 새 프로젝트를 만듭니다.
2. **SQL Editor > New query**를 엽니다.
3. `docs/supabase_schema.sql` 전체를 붙여 넣고 **Run**을 누릅니다.
4. **Table Editor**에서 다음 테이블이 생성됐는지 확인합니다.
   - `tasks`
   - `results`
   - `sessions`
5. **Project Settings > API**에서 아래 값을 복사합니다.
   - Project URL
   - Legacy API Keys의 `service_role` key

`service_role` key는 브라우저 코드, GitHub, 문서에 넣지 마세요. 이 프로젝트의 Vercel 환경변수에만 저장합니다.

## 2. GitHub 저장소 준비

ZIP을 푼 뒤 `index.html`, `vercel.json`, `api`, `css`, `js`가 보이는 폴더를 GitHub 저장소의 루트로 올립니다.

```text
repository-root/
  index.html
  vercel.json
  api/
  css/
  js/
  docs/
```

ZIP의 바깥 폴더만 올려서 프로젝트 파일이 한 단계 더 안쪽에 들어갔다면, Vercel의 **Root Directory**를 `task-message-studio-sdt-onboarding`으로 지정합니다.

## 3. Vercel 프로젝트 만들기

1. Vercel Dashboard에서 **Add New > Project**를 선택합니다.
2. GitHub 저장소를 Import합니다.
3. 설정은 다음과 같이 둡니다.
   - Framework Preset: `Other`
   - Root Directory: `index.html`이 있는 폴더
   - Build Command: 비움
   - Output Directory: 비움
   - Install Command: 비움

## 4. Vercel 환경변수

Vercel **Project > Settings > Environment Variables**에 추가합니다.

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_LEGACY_SERVICE_ROLE_KEY
```

GPT 메시지 생성을 사용하려면 아래 값을 추가합니다.

```text
AI_PROVIDER=openai
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-5.6-luna
```

`OPENAI_API_URL`은 기본적으로 `https://api.openai.com/v1/responses`를 사용하므로 별도로 등록할 필요가 없습니다. 품질과 비용의 균형을 더 중시할 때는 `OPENAI_MODEL=gpt-5.6-terra`로 변경할 수 있습니다.

기존 Upstage를 계속 사용하려면 다음처럼 설정할 수도 있습니다.

```text
AI_PROVIDER=upstage
UPSTAGE_API_KEY=YOUR_UPSTAGE_API_KEY
UPSTAGE_MODEL=solar-pro2
```

환경은 최소 `Production`에 적용하고 Preview에서도 시험하려면 `Preview`도 선택합니다. 저장 후 반드시 새로 배포하거나 **Deployments > Redeploy**를 실행합니다.

외부 API 키가 없어도 Worker Task와 연구 로그는 작동하며, 메시지는 브라우저 로컬 생성 fallback을 사용합니다. `OPENAI_API_KEY`는 브라우저 코드나 GitHub에 넣지 말고 Vercel 서버 환경변수에만 저장합니다.

## 5. 배포 및 확인

1. Vercel에서 **Deploy**를 누릅니다.
2. 생성된 `https://...vercel.app` 주소를 엽니다.
3. Requester에서 Example Task를 선택하고 메시지를 생성합니다.
4. Worker Link를 만든 뒤 시크릿 창 또는 다른 브라우저에서 엽니다.
5. 작업 시작, 응답 제출, 완료까지 진행합니다.
6. Supabase Table Editor에서 확인합니다.
   - `tasks`: Worker Link 생성에 사용된 Task
   - `sessions`: `opened` → `started` → `completed` 상태와 raw metrics
   - `results`: 완료 결과 payload

## 6. Windows에서 Vercel CLI로 직접 배포하기 (선택)

PowerShell에서 `index.html`이 있는 프로젝트 폴더로 이동한 다음 실행합니다.

```powershell
npm install -g vercel
vercel login
vercel
```

환경변수 설정 후 Production으로 배포합니다.

```powershell
vercel --prod
```

## 7. 자주 발생하는 문제

### `Cannot find module .../outputs/server.js`

명령을 잘못된 상위 폴더에서 실행한 경우입니다. 로컬 실행 시에는 `server.js`가 실제로 있는 폴더로 이동해야 합니다. Vercel 배포에서는 `node server.js`를 실행하지 않습니다.

### Worker Link를 다른 PC에서 열 수 없음

대부분 `tasks` 테이블 미생성 또는 Supabase 환경변수 누락입니다. `/api/tasks` Function 로그와 Supabase Table Editor를 확인합니다.

### Supabase API가 401을 반환함

현재 코드에는 `anon`/publishable key가 아니라 Legacy `service_role` key를 `SUPABASE_SERVICE_ROLE_KEY`로 넣어야 합니다.

### 환경변수를 추가했는데 계속 실패함

Vercel 환경변수 변경은 기존 배포에 소급 적용되지 않습니다. 새 배포 또는 Redeploy가 필요합니다.
