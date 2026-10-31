# 개발 문서

이 저장소의 작업 방식과 검증 기준을 정리한다. 실행 명령은 루트 디렉터리에서 사용한다.

| 문서 | 다루는 내용 |
|---|---|
| [스킬 사용 가이드](prompt-gallery-workflow-guide.md) | 시작 방법, 채팅 선택지, 호출 예시, 역할과 단계별 완료 범위 |
| [프롬프트 작업 스킬](../.agents/skills/prompt-gallery-workflow/SKILL.md) | 제작·테스트·등록·배포와 작업 브랜치 정리 |
| [Cloudflare Pages 운영](cloudflare-pages.md) | 현재 운영 주소, GitHub CI와 Cloudflare CD, 오래된 checkout에서의 확인 절차 |
| [개발 흐름](development.md) | 브랜치, 로컬 실행, 변경 범위, PR, 병합, 복구 |
| [테스트와 배포](testing-and-deployment.md) | 로컬 검사, CI 필수 검사, 브라우저 테스트, Pages 배포, 실패 대응 |
| [프롬프트 등록 원칙](prompt-publishing.md) | 원문 보존, 이미지 생성·검토, 카탈로그 항목 형식, 등록 순서, 생성 기록 |
| [공유 링크와 미리보기](sharing.md) | 프롬프트별 정적 공유 페이지, Open Graph 이미지, 카카오톡 캐시 |
| [기본 SEO](seo.md) | 정적 본문·사이트맵 자동 생성과 검증 |
| [GA4 이용 통계](analytics.md) | 측정 ID, 수집 이벤트, 맞춤 정의, 지표 해석과 검증 |
| [카탈로그 등록 기록](catalog-history.md) | 루트 README에서 옮긴 날짜별 등록·수정 기록과 샘플 출처 |

## 생성 이력과 참고 자료

- [부분 채색 라인드로잉 v10 개선 검토](spot-color-line-art-review-2026-10-31.md), [실제 문구](spot-color-line-art-prompt-v10.txt), [인물·풍경·그림자 입력·결과·해시](image-generation-2026-10-31-spot-color-line-art-v10.json)

- [빈티지 여행 포스터 v2 얼굴 보존 개선 검토](amalfi-summer-face-review-2026-10-22.md), [실제 문구](amalfi-summer-prompt-v2.txt), [전후 문구·입력·파일 해시](image-generation-2026-10-22-amalfi-summer-face.json)

- [여행 사진 도자기 무드등 v3 등록 검토](travel-ceramic-nightlight-review-2026-10-19.md), [실제 문구](travel-ceramic-nightlight-prompt-v3.txt), [원본·결과·해시 기록](image-generation-2026-10-19-travel-ceramic-nightlight.json)

- [티니핑 v14 사진 한 장 사용법](teenieping-input-guide.md), [실제 문구](teenieping-prompt-v14.txt), [수정 검토](teenieping-review-2026-10-19.md), [생성 기록](image-generation-2026-10-19-teenieping.json)

- [K-pop 아이돌 v4 등록 검토](kpop-idol-review-2026-10-19.md), [적용 문구](kpop-idol-prompt-v4.txt), [생성 기록](image-generation-2026-10-19-kpop-idol.json)

- [띠부띠부씰 v1 등록 검토](ttibu-sticker-review-2026-10-19.md)
- [띠부띠부씰 실제 문구 v1](ttibu-sticker-prompt-v1.txt)
- [띠부띠부씰 실제 입력·치수·파일 해시](image-generation-2026-10-19-ttibu-sticker.json)

- [다마고치 v1 등록 검토](tamagotchi-review-2026-10-19.md)
- [다마고치 실제 입력과 파일 해시](image-generation-2026-10-19-tamagotchi.json)
- [다마고치 실제 적용 문구 v1](tamagotchi-prompt-v1.txt)

- [짱구 범용 프롬프트 인물·풍경·반려동물 등록 검토](shinchan-review-2026-10-18.md)
- [짱구 3종 실제 입력과 원본·결과 파일 해시](image-generation-2026-10-18-shinchan.json)

- [소닉 주인공 두 사진 등록 검토](sonic-review-2026-10-18.md)
- [소닉 실제 입력과 원본·결과 파일 해시](image-generation-2026-10-18-sonic.json)

- [개구리 왕눈이 주인공 등록 검토](demetan-review-2026-10-18.md)
- [개구리 왕눈이 실제 입력·공개 문구·파일 해시](image-generation-2026-10-18-demetan.json)

- [어드벤처 타임 주인공 등록 검토](adventure-time-review-2026-10-18.md)
- [어드벤처 타임 실제 입력·공개 문구·파일 해시](image-generation-2026-10-18-adventure-time.json)

- [베르사유의 장미 복장 고정 수정·두 복장 생성 검토](rose-of-versailles-costume-review-2026-10-18.md)
- [베르사유의 장미 복장 수정 전후·실제 입력·파일 해시](rose-of-versailles-costume-revision-2026-10-18.json)
- [종이 팝업북 신규 원본 3종 등록 검토](paper-popup-book-review-2026-10-18.md)
- [종이 팝업북 실제 입력과 원본·결과 파일 해시](image-generation-2026-10-18-paper-popup-book.json)

- [베르사유의 장미 주인공 3차 승인 결과 등록 검토](rose-of-versailles-review-2026-10-17.md)
- [베르사유의 장미 실제 입력·공개 문구·파일 해시](image-generation-2026-10-17-rose-of-versailles.json)
- [마인크래프트 범용 프롬프트 3종 예시 검토](minecraft-three-examples-review-2026-10-17.md)
- [마인크래프트 3종 실제 입력과 파일 해시](image-generation-2026-10-17-minecraft-three-examples.json)

- [메이플스토리 중단 작업 복원·3종 예시 게시 검토](maplestory-three-examples-review-2026-10-17.md)
- [메이플스토리 인물·반려동물·풍경 3종 실제 입력·파일 해시](image-generation-2026-10-17-maplestory-three-examples.json)
- [메이플스토리 인물·반려동물·풍경 범용 확장 검토](maplestory-universal-review-2026-10-17.md)
- [메이플스토리 수정 전후 문구·범용 테스트·파일 해시](maplestory-prompt-revision-2026-10-17.json)
- [카트라이더 인게임 레이서 2차 결과 등록 검토](kartrider-review-2026-10-17.md)
- [카트라이더 두 차례 실제 입력과 파일 해시](image-generation-2026-10-17-kartrider.json)
- [병원 X선 필름 등록 검토](xray-film-review-2026-10-17.md)
- [병원 X선 필름 실제 입력과 파일 해시](image-generation-2026-10-17-xray-film.json)
- [발로란트 신규 요원 2차 결과 등록 검토](valorant-review-2026-10-17.md)
- [발로란트 세 단계 실제 입력과 파일 해시](image-generation-2026-10-17-valorant.json)

- [메이플스토리 인게임 캐릭터 2차 결과 등록 검토](maplestory-review-2026-10-17.md)
- [메이플스토리 두 차례 실제 입력과 파일 해시](image-generation-2026-10-17-maplestory.json)
- [마인크래프트 인게임 캐릭터 등록 검토](minecraft-review-2026-10-17.md)
- [마인크래프트 실제 입력과 파일 해시](image-generation-2026-10-17-minecraft.json)
- [마인크래프트 범용 사진용 프롬프트 수정 기록](minecraft-prompt-revision-2026-10-17.json)
- [감성 여행 다이어리 등록 검토](travel-diary-review-2026-10-17.md)
- [감성 여행 다이어리 실제 입력과 파일 해시](image-generation-2026-10-17-travel-diary.json)
- [숲 이중노출 얼굴 그림체 수정 검토](forest-illustration-review-2026-10-17.md)
- [숲 이중노출 그림체 수정 실제 입력과 파일 해시](image-generation-2026-10-17-forest-illustration.json)
- [2026-10-17 숲 이중노출·풍경 목판화 등록 검토](aesthetic-prompts-review-2026-10-17.md)
- [숲 이중노출·풍경 목판화 실제 입력과 파일 해시](image-generation-2026-10-17-aesthetic.json)
- [예쁘고 감각적인 사진 변환 후보 조사](prompt-research-aesthetic-2026-10-17.md)
- [기존 사진 변환 프롬프트와 예시](photo-transform-prompts.md)
- [2026-10-15 실제 생성 입력과 이미지 해시](image-generation-2026-10-15.json)
- [2026-10-16 사용자 프롬프트 5종 검토](user-prompt-tests-2026-10-16.md)
- [2026-10-16 실제 생성 입력과 이미지 해시](image-generation-2026-10-16.json)
- [2026-10-16 블록 토이 월드 원본·결과 검토](brick-world-review-2026-10-16.md)
- [블록 토이 월드 실제 생성 입력과 이미지 해시](image-generation-2026-10-16-brick-world.json)
- [손그림 애니메이션·픽셀 OOTD 원본·결과 검토](pixel-animation-review-2026-10-16.md)
- [손그림 애니메이션·픽셀 OOTD 실제 입력과 이미지 해시](image-generation-2026-10-16-pixel-animation.json)
- [기존 UX 검토](ux-review.md)
- [밝은 임파스토 유화 등록 검토](bright-impasto-review-2026-10-16.md)
- [밝은 임파스토 유화 실제 입력·중간 단계·파일 해시](image-generation-2026-10-16-bright-impasto.json)
- [밝은 유화 범용 사진 프롬프트 수정 기록](bright-impasto-prompt-revision-2026-10-16.json)
- [깜찍한 흑백 두들 게시 검토](doodle-review-2026-10-16.md)
- [깜찍한 흑백 두들 세 단계 실제 입력·파일 해시](image-generation-2026-10-16-doodle.json)

과거 생성 기록은 당시의 사실을 보존한다. 현재 개발 절차는 위 운영 문서를 따른다. 기록에 있는 카탈로그 개수나 최초 프롬프트가 현재 상태와 다를 수 있다.

- [검색 유입과 소개글 초안](search-distribution.md) — 대표 5개 가이드, GPT/ChatGPT 표현, 배포 후 성과 확인

- [Cloudflare Pages 배포·GA4·SEO 이관 운영](cloudflare-pages.md)

- [원라인 드로잉 v3 두 인물 예시 등록 검토](one-line-drawing-review-2026-10-26.md)
- [원라인 드로잉 v3 실제 입력과 파일 해시](image-generation-2026-10-26-one-line-drawing.json)
