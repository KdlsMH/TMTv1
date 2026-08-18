# Task Message Studio — Vercel 배포 전용

이 폴더는 Vercel 배포만을 위해 새로 정리한 프로젝트입니다.

```text
public/      정적 Requester/Worker 화면
api/         Vercel Node.js Functions
supabase/    최초 1회 실행할 데이터베이스 스키마
vercel.json  Vercel 배포 설정
```

로컬 JSON 서버인 `server.js`와 `data/`는 의도적으로 포함하지 않았습니다.

## 1. GitHub

ZIP 안의 파일과 폴더를 GitHub 저장소 최상위에 올립니다.

```text
repository-root/
  api/
  public/
  supabase/
  vercel.json
  README_DEPLOY_KO.md
```

GitHub 저장소 안에 프로젝트 폴더를 한 단계 더 만들지 않는 것을 권장합니다.

## 2. Supabase

Supabase Dashboard의 SQL Editor에서 `supabase/schema.sql` 전체를 한 번 실행합니다.

생성되는 테이블:

- `tasks`
- `sessions`
- `results`

## 3. Vercel 설정

```text
Application/Framework Preset: Other
Root Directory: ./
Build Command: 비움
Output Directory: 비움
Install Command: 비움
```

환경변수:

```text
AI_PROVIDER=openai
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-5.6-luna
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

환경변수를 추가하거나 변경한 뒤에는 반드시 새로 배포합니다.

## 4. 배포 확인

아래 주소가 각각 응답해야 합니다.

```text
https://YOUR_DOMAIN.vercel.app/
https://YOUR_DOMAIN.vercel.app/api/health
```

`/api/health` 응답에서 다음을 확인합니다.

```json
{
  "ok": true,
  "provider": "openai",
  "openAIConfigured": true,
  "supabaseConfigured": true
}
```

API 키 값 자체는 응답에 노출되지 않습니다.
