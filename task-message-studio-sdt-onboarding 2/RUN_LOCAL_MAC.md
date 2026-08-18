# macOS 로컬 실행

Apple Silicon(M1–M4)에서 별도 빌드 과정 없이 Node.js로 실행합니다.

```bash
cd "/압축을/푼/폴더"
node server.js
```

브라우저에서 `http://127.0.0.1:5173`을 엽니다.

포트를 바꾸려면:

```bash
PORT=5198 node server.js
```

`MODULE_NOT_FOUND .../outputs/server.js` 오류는 ZIP을 풀지 않았거나 `server.js`가 없는 상위 폴더에서 실행했을 때 발생합니다. Finder에서 ZIP을 먼저 푼 뒤, Terminal에서 실제 `server.js`가 보이는 폴더로 이동해 실행하세요.

```bash
pwd
ls -la
```

목록에 `server.js`, `index.html`, `js`, `css`, `api`, `data`가 보여야 합니다.

Requester Workspace는 각 방문에서 `메시지 설계 시작` 버튼을 누른 뒤 표시됩니다.

## GPT API 사용

GPT API를 사용할 때는 다음 환경변수를 설정한 뒤 실행합니다.

```bash
export AI_PROVIDER="openai"
export OPENAI_API_KEY="발급받은 OpenAI API 키"
export OPENAI_MODEL="gpt-5.6-luna"
node server.js
```

API 키는 소스 코드나 Git 저장소에 저장하지 마세요.
