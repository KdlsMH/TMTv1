# Windows 로컬 실행 방법

## 준비

1. [Node.js LTS](https://nodejs.org/)를 설치합니다. Node.js 20 이상을 권장합니다.
2. `task-message-studio-sdt-onboarding.zip`의 압축을 풉니다.
3. 압축을 푼 폴더 안에서 `server.js`가 보이는지 확인합니다.

## PowerShell에서 실행

아래 경로는 실제 압축 해제 위치에 맞게 변경합니다.

```powershell
cd "$HOME\Downloads\task-message-studio-sdt-onboarding"
dir .\server.js
node --version
node .\server.js
```

터미널에 다음과 비슷한 문구가 표시되면 실행된 것입니다.

```text
AgenticMotivation server running at http://127.0.0.1:5173
```

웹 브라우저에서 다음 주소를 엽니다.

```text
http://127.0.0.1:5173
```

종료할 때는 PowerShell에서 `Ctrl + C`를 누릅니다.

## 포트가 이미 사용 중인 경우

```powershell
$env:PORT=5174
node .\server.js
```

그다음 `http://127.0.0.1:5174`를 엽니다.

## MODULE_NOT_FOUND가 표시되는 경우

대부분 `server.js`가 없는 상위 폴더에서 실행했을 때 발생합니다.

```powershell
dir .\server.js
```

위 명령에서 파일이 나오지 않으면, `server.js`가 들어 있는 안쪽 프로젝트 폴더로 이동한 뒤 다시 실행합니다.

## 외부 LLM API

`OPENAI_API_KEY`를 설정하지 않아도 화면과 Worker Task는 실행되며, 메시지 생성은 브라우저의 로컬 규칙 fallback을 사용합니다.

GPT API를 사용할 때는 같은 PowerShell 창에서 다음처럼 실행합니다.

```powershell
$env:AI_PROVIDER="openai"
$env:OPENAI_API_KEY="발급받은 OpenAI API 키"
$env:OPENAI_MODEL="gpt-5.6-luna"
node server.js
```

API 키는 소스 코드나 GitHub에 저장하지 마세요.
