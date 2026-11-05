# Cloudflare Pages 운영

운영 주소: https://q07k-prompt-gallery.pages.dev/
코드 저장소: https://github.com/Q07K/prompt-gallery

## 새 세션과 운영 현황 확인

현재 로컬 브랜치의 README나 과거 Actions 성공 기록만으로 운영 환경을 판단하지 않는다. [저장소 시작 지침](../AGENTS.md)에 따라 원본 저장소의 최신 기본 브랜치를 fetch하고 그 ref의 이 문서와 CI 구성을 읽는다. 오래된 콘텐츠 브랜치는 그대로 보존한다. 설정 확인과 실제 배포 성공은 구분하고, 배포 성공은 Cloudflare에서 운영 브랜치 main의 커밋 SHA와 상태를 확인한다.

이관 후에는 새 세션이 여는 기본 프로젝트 폴더에도 이 운영 문서와 시작 지침을 반영한다. 사이트맵 오류나 색인 상태는 별도로 실제 Search Console 결과를 확인하며 이 문서를 성공 증빙으로 사용하지 않는다.

## 자동 배포

Cloudflare Pages의 GitHub 연동에서 main을 운영 브랜치로 설정한다. 빌드 명령은 `npm test && npm run build`, 출력 디렉터리는 `dist`, 환경 변수는 NODE_VERSION=22, SITE_URL=https://q07k-prompt-gallery.pages.dev/ 이다.
GitHub Actions의 필수 CI는 단위 검사·빌드·데스크톱/모바일 브라우저 검사를 수행한다. main 보호 규칙의 CI를 통과한 PR만 병합하며 우회하지 않는다. Cloudflare가 main 커밋을 감지해 자체 빌드 후 배포한다. 프리뷰는 별도 주소이고 운영 분석 수집·색인을 끈다.

## 분석과 SEO

기존 GA4 속성 559520260, 스트림 16158654707, 측정 ID G-FJ0FKHBV1X를 유지한다. 웹 스트림 주소를 새 주소로 변경한다. 기존 이벤트와 맞춤 정의를 그대로 사용하고 다른 태그를 중복 설치하지 않는다.
Search Console은 새 URL 접두어 속성을 HTML 태그로 인증하고 sitemap.xml을 제출한다. 기존 속성과 데이터는 보존한다. 사이트맵 제출과 수집 성공, 페이지 색인과 검색 유입은 각각 확인한다.

## 운영 주소 기준

공개 주소와 공유 링크, GA4 웹 스트림, canonical, robots.txt와 sitemap.xml은 https://q07k-prompt-gallery.pages.dev/ 를 기준으로 관리한다. GitHub Pages는 앱 콘텐츠를 게시하지 않는다. Search Console의 과거 속성 및 GA4의 기존 기록은 보존한다.

### 이전 GitHub 주소 리다이렉트

2026-10-20 이관 때 이전 주소(https://q07k.github.io/prompt-gallery/)를 리다이렉트 없이 껐더니, Google이 그때 색인한 github.io 페이지·이미지가 검색 결과에 남은 채 404를 보여 주고 새 주소로 신호가 넘어가지 않았다. 그래서 2026-11-05에 리다이렉트 전용 게시를 복구했다.

`.github/workflows/legacy-redirects.yml`(수동 실행, main 전용)이 `scripts/build-redirects.mjs`로 만든 `legacy-dist/`만 GitHub Pages에 게시한다. 저장소 Settings → Pages의 Source는 GitHub Actions여야 한다. 각 이전 주소는 운영 주소의 같은 페이지로 canonical·즉시 meta refresh·JavaScript 이동을 하며 query/hash(이전 `#prompt=` 링크 포함)를 보존한다. HTTP 301이 아니고 Search Console 주소 변경 도구 대상도 아니다. 이미지·GA4 태그는 게시하지 않고 이전 Search Console 속성의 인증 태그만 유지한다. `sitemap.xml`은 이전 주소 목록이며 이전 속성에만 제출한다.

새 프롬프트는 404.html의 경로 대응으로도 이동하지만 404 상태로 응답하므로, 이전 주소에 이미 색인된 프롬프트가 바뀌거나 늘었다면 워크플로를 다시 실행한다. 검색 결과에서 github.io 주소가 사라지고 운영 주소로 바뀐 것을 확인하기 전에는 이 게시를 내리지 않는다.

브라우저 북마크는 origin별 localStorage에 저장된다.

## 비용과 확장

초기에는 Pages 무료 플랜과 기존 로컬 WebP 이미지를 사용한다. R2 구독·유료 플랜·도메인 구매는 이 이관에 포함하지 않는다. 큰 이미지의 저장소 분리는 후속 작업이다.

## 임시 사이트맵 수집 진단

`functions/sitemap.xml.js`만 Pages Function으로 실행하며 빌드의 `_routes.json`은 `/sitemap.xml`만 포함한다. 홈페이지·프롬프트·이미지는 정적으로 제공한다. 이 기능은 사이트맵 오류의 수정이 아니라 수집 요청 도달 여부와 응답을 확인할 관측 장치다.

활성화에는 운영 환경의 KV binding `SEO_DIAGNOSTICS`와 UTC ISO 시각의 `SITEMAP_DIAGNOSTICS_UNTIL` 두 항목이 모두 필요하다. 기본은 비활성이다. 사용자 승인 후 무료 KV namespace `prompt-gallery-seo-diagnostics`를 한 개 만들고 binding에 연결한다. Workers Free 플랜을 유지하며 유료 구독을 활성화하지 않는다. 무료 KV의 쓰기 한도를 넘으면 기록이 실패할 수 있지만 사이트맵 응답은 유지한다. 해당 Function 요청 자체가 Free Functions 한도를 넘으면 Cloudflare의 Fail open 설정에 의존하므로 현재 설정도 검증한다.

진단은 활성화 시점부터 최대 48시간만 설정한다. 요청별 시각·메서드·출처 분류·Cloudflare 지역·응답 상태·MIME·길이·SHA256을 KV에 7일 TTL로 저장한다. 원본 IP·전체 User-Agent·쿠키·쿼리·Referer는 저장하지 않는다. IP는 요청 처리 중에만 Google 공개 대역과 비교한다. 고정 스냅샷 출처와 날짜는 `server/google-crawler-networks.mjs`에 기록한다. 진단을 재사용할 때는 최신 공개 대역으로 갱신한다.

`claimedAgent=inspection`은 URL 검사 도구 주장, `googlebot`은 Googlebot 주장이다. `sourceNetwork`가 common/special/userTriggered인 경우에만 공개 Google 네트워크와 일치한다. 이것도 특정 Google 내부 수집 시스템을 인증하거나 사이트맵 처리 성공을 증명하지 않는다. 일반 수집 후보 요청과 수동 실시간 테스트를 분리해 해석한다.

KV는 공개 조회 엔드포인트를 만들지 않고 계정 대시보드에서 읽는다. 응답의 `X-Sitemap-Diagnostic-Id`로 개별 기록을 대조한다. Function 도달 이후의 응답만 관찰하므로 DNS/TLS/Cloudflare 엣지 단계에서 실패한 요청은 기록되지 않는다. 기록이 없다는 사실만으로 Google이 요청하지 않았다고 단정할 수 없다. 파일 응답 실패가 관측되면 해당 상태와 시각을 조사하고, 확인된 Google 요청에 정상 XML 지문이 남는데 GSC가 실패를 유지하면 Google 처리 단계 문의의 근거로 사용한다.

배포 후 순서: 일반 GET의 XML 지문·45 URL·응답 ID·KV 기록을 확인 → 원본 사이트맵 수동 실시간 테스트 1회로 검사 도구 기록 확인 → 원본 sitemap.xml 1회 제출과 시각 기록 → 추가 제출 없이 일반 수집 기록 대조. 변형 URL 추가·반복 새로고침 자동화를 만들지 않는다. 48시간 진단 종료 후 증거를 읽어 실패 구간 또는 미확정 범위를 보고하고 Function을 제거하는 PR을 만든다. KV namespace 영구 삭제는 별도 사용자 확인 없이 하지 않고 TTL 만료를 사용한다.

### 진단 활성화 설정 관리

Wrangler 설정 파일을 운영·프리뷰 설정의 기준으로 사용한다. 기존 대시보드 설정을 내려받아 NODE_VERSION, SITE_URL, 호환성 날짜를 보존했다. KV namespace ID는 a611580b639844e88a477909a6d359d0이며, SEO_DIAGNOSTICS와 SITEMAP_DIAGNOSTICS_UNTIL은 production에만 선언한다. 프리뷰와 로컬 설정에는 진단 저장소·종료 시각을 넣지 않는다. GitHub main 자동 배포는 계속 사용한다.

이번 진단 종료 시각은 2026-10-23T05:07:13Z 이다. 설정 작성 시점부터 48시간이며 실제 배포 이후의 기록 시간은 이보다 짧다. 종료 후 새 기록을 남기지 않으며 기존 기록은 7일 TTL로 만료된다. 이 설정 파일만으로 실제 배포·KV 기록 검증이 완료됐다고 판단하지 않는다.
