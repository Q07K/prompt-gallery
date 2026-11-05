# 테스트와 배포

## 실행 명령

Node.js 22 이상을 사용한다. CI의 기준 환경은 Ubuntu와 Node.js 22다.

```sh
npm ci
npx playwright install chromium
npm run check
```

`npm run check`는 `npm test` → `npm run build` → `npm run test:e2e`를 차례로 실행한다. 앞 단계가 실패하면 다음 단계로 진행하지 않는다.

| 명령 | 검증 범위 |
|---|---|
| `npm test` | 카탈로그 스키마·파일 연결·서로 다른 첨부 예시, 검색·필터·저장 상태, HTML ID 연결, 공유 링크와 Open Graph 이미지 |
| `npm run build` | 공개 파일과 각 프롬프트의 정적 상세 HTML, 공유용 JPEG 생성 |
| `npm run test:e2e` | 빌드 결과에 실제 Chromium으로 접속해 주요 사용자 동작 검증 |

브라우저 테스트만 실행하려면 먼저 `npm run build`를 실행한다. 테스트는 `playwright.config.mjs`가 전용 서버를 시작·종료하며, 이미 실행 중인 서버를 재사용하지 않는다. 접속 경로는 `/`여서 Cloudflare 운영 루트의 자산·공유 링크를 검사한다. 하위 경로 파싱은 공유 링크 단위 검사에서도 확인한다.

## 브라우저 검증

`tests/e2e/gallery.spec.mjs`의 시나리오를 데스크톱 Chromium과 Pixel 7 크기의 모바일 Chromium에서 각각 실행한다. 모바일은 Chromium 에뮬레이션이며 실제 Android나 Safari 검증을 뜻하지 않는다.

1. 카탈로그 전체 카드 순서, 결과 썸네일과 첨부 사진의 실제 로딩, 가로 넘침 여부
2. 카테고리·검색 조합, 빈 결과, 필터 초기화
3. 상세 화면의 프롬프트 원문, 결과·첨부 사진 확대와 닫기, 클립보드의 정확한 복사 문구
4. 북마크가 새로고침 후 유지되고 저장 목록에서 제거되는 흐름
5. 정적 상세 URL 직접 접속·새로고침과 하위 경로를 포함한 공유 링크 복사

각 시나리오는 처리되지 않은 브라우저 JavaScript 오류도 검사한다. 외부 이미지 생성 서비스나 공개 사이트에 의존하지 않고 저장소의 정적 산출물을 검사한다.

클립보드 검사는 운영체제의 CRLF/LF 차이만 통일해 비교하고, 나머지 문자와 빈 줄은 원문과 일치해야 한다. OS 클립보드 경합을 피하도록 브라우저 시나리오는 단일 worker로 실행한다.

## GitHub Actions의 CI와 Cloudflare CD

`.github/workflows/ci.yml`의 표시 이름은 CI이고 필수 작업 이름도 CI이다. PR·main 푸시·수동 실행에서 npm ci → npm test → 빌드 → Chromium 설치 → 브라우저 검사를 실행한다. PR에 배포 권한이나 비밀 값을 제공하지 않는다.

앱 CD는 Cloudflare Pages GitHub 연동이 담당한다. 보호된 main에 PR을 병합하면 Cloudflare가 `npm test && npm run build` 후 dist를 배포한다. 운영 브랜치 main과 환경 변수는 [Cloudflare 운영 문서](cloudflare-pages.md)를 따른다. GitHub Actions에서 CI가 성공했다고 Cloudflare 배포까지 성공한 것으로 보지 않는다.

사이트 배포는 Cloudflare Pages가 담당한다. GitHub Actions의 CI 외에는 이전 주소용 `.github/workflows/legacy-redirects.yml`만 있으며, main에서 수동 실행할 때만 리다이렉트 페이지를 GitHub Pages에 게시한다. 이 워크플로만 GitHub Pages 쓰기 권한을 가진다.

## main 보호 규칙

GitHub **Settings → Rules → Rulesets**의 `main-ci` 규칙으로 관리한다.

- 대상 브랜치: `main`, 적용 상태: Active
- PR을 통해서만 변경, 필수 승인 수: 0
- 필수 상태 검사: GitHub Actions의 `CI`
- 병합 전 최신 대상 브랜치 반영 필요
- 강제 푸시와 브랜치 삭제 금지
- 우회 대상 없음

규칙 설정은 GitHub에 저장되며 YAML만 커밋해도 활성화되는 항목이 아니다. 새 저장소에서는 워크플로를 올려 `CI` 검사를 한 번 실행한 뒤 필수 검사로 지정하고 활성화한다. 저장소 관리 권한이 필요하다. 다른 규칙이 이미 있다면 덮어쓰기 전에 내용을 확인한다.

## 실패 분석

로컬에서는 `playwright-report/`에 HTML 보고서, `test-results/`에 실패 스크린샷·trace가 생성된다. 다음 명령으로 보고서를 연다.

```sh
npx playwright show-report
```

CI 실패 시 Actions 실행의 Artifacts에서 `playwright-failure-report`를 내려받는다. 보고서와 trace는 7일 보관한다. 브라우저 실행 전 단계에서 실패했다면 파일이 없을 수 있으므로 해당 단계 로그를 먼저 확인한다. CI는 브라우저 시나리오를 한 번 재시도하며, 재시도로 통과해도 불안정한 테스트는 원인을 확인한다.

브라우저를 설치하지 않았다는 오류는 `npx playwright install chromium`으로 해결한다. 로컬에서 서버 접근 거부나 브라우저 프로세스 실행 거부가 발생하면 해당 실행 환경의 권한을 확인한다. 제품 테스트를 생략해 이를 해결하지 않는다.

## 배포 확인과 자동 검증의 한계

GitHub Actions에서 해당 커밋의 CI와 Cloudflare의 동일 커밋 배포 성공을 확인한 뒤 [공개 갤러리](https://q07k-prompt-gallery.pages.dev/)의 새 항목과 상세 링크를 확인한다. CI가 검사하는 것은 로컬 빌드 산출물이다. 공개 CDN, 브라우저 캐시, 카카오톡의 미리보기 캐시까지 검증했다고 해석하지 않는다.

이미지 생성 결과의 인물 보존, 그림 스타일, 실제 문구 품질은 수동 검토한다. 자동 테스트는 이미지 로딩이나 링크가 정상임을 확인하며 미적 품질이나 프롬프트 준수를 판정하지 않는다. 카카오톡 캐시 대응은 [공유 링크와 미리보기](sharing.md)를 따른다.

설정 참고: [Playwright의 GitHub Actions 안내](https://playwright.dev/docs/ci-intro), [전용 테스트 서버 설정](https://playwright.dev/docs/test-webserver), [GitHub의 브랜치 보호와 필수 검사](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## 사이트맵 진단 검증

`tests/sitemap-diagnostics.test.mjs`는 정상 XML/캐시·상태 보존, Google IPv4·IPv6 확인과 UA 위조 구분, 검사 도구 분리, preview noindex·운영 기록 제외, 비활성/만료/미연결, KV 실패 시 응답 보존, 원본 503/asset 예외 기록, HEAD를 검증한다. 기존 정적 SEO·사용자 여정 검사도 유지한다. 저장소 mock 검사는 Cloudflare KV 연결 성공의 증거가 아니며 활성화 후 실제 응답 ID와 대시보드 KV 값을 대조해야 한다.
