# 기본 SEO

빌드가 카탈로그에서 홈페이지의 실제 상세 링크 목록, 각 상세 페이지의 제목·입력/결과 이미지·사용법·정확한 프롬프트·관련 링크와 sitemap.xml을 자동 생성한다. 새 항목을 정상 등록하면 별도 SEO 파일 편집 없이 다음 빌드에 포함된다. 원문과 기존 예시 설명은 바꾸지 않는다.

정적 본문은 JavaScript 없이도 방문자가 읽을 수 있다. JavaScript로 카탈로그를 성공적으로 불러와 기존 UI를 완성한 뒤 기본적으로 접어 둔다. 방문자는 하단의 목록/사용법 요약을 눌러 언제든 펼칠 수 있다. 로딩에 실패하면 본문을 남긴다. 검색엔진에만 별도 내용을 제공하지 않는다. 실제 색인·순위는 보장하지 않으며 Search Console에서 소유권·사이트맵 처리·검색 유입을 확인한다.

사이트맵 주소는 배포 루트 아래 sitemap.xml이다. SITE_URL을 변경하면 canonical과 사이트맵의 절대 URL도 함께 변경된다. Cloudflare Pages의 호스트 루트에 robots.txt를 생성하고 sitemap.xml을 선언한다. main 이외 브랜치 프리뷰에는 noindex와 robots Disallow를 적용한다. 404.html을 생성하여 없는 URL을 홈페이지로 응답하는 SPA fallback을 방지한다.

검증: npm run check. 모든 카탈로그 항목의 정적 본문과 사이트맵 URL, HTML 삽입 방지, JavaScript 비활성 상태의 목록→상세→목록 이동과 이미지/원문 표시, 기존 UI 전환 및 로딩 실패 시 본문 보존을 검사한다.

## Search Console 운영

등록 대상은 URL 접두어 속성 https://q07k-prompt-gallery.pages.dev/ 이다. 소유권 확인은 index.html의 google-site-verification 메타태그로 하며, 인증 후에도 태그를 유지한다. 이것은 사이트에 공개되는 소유권 확인 표식으로 API 비밀 키가 아니다.

배포 후 https://q07k-prompt-gallery.pages.dev/sitemap.xml 을 제출한다. 제출 및 소유권 확인 성공과 실제 색인 생성은 서로 다르다. Search Console의 사이트맵·페이지 색인·검색 실적에서 처리 결과를 확인한다. 새 프롬프트는 이후 빌드 때 같은 사이트맵에 자동으로 포함된다.

## 검색 유입용 제목과 사용 가이드

대표 5개 항목의 검색 제목·설명·사진 준비·확인된 결과·한계는 `src/search-guides.mjs`에서 관리한다. 빌드된 정적 본문과 상세 모달은 같은 내용을 사용한다. 홈페이지의 HTML 제목·설명과 이 모듈의 `homeSearch`를 함께 갱신한다. 공개할 글의 초안과 후속 측정 기준은 [검색 유입과 소개글](search-distribution.md)을 참고한다.

Cloudflare URL 접두어 속성의 인증 태그만 사이트에 유지한다. 기존 GitHub Pages 속성과 인증 태그는 보존한다. 이전 주소는 [리다이렉트 전용 게시](cloudflare-pages.md#이전-github-주소-리다이렉트)로 운영 주소의 같은 페이지로 이동시키고, 이전 속성에는 이전 주소 사이트맵을 제출한다. 사이트맵 제출 후 수집 결과와 실제 색인 상태를 각각 확인한다.
