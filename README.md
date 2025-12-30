# 카드 매칭 기반 인지 훈련 & 성과 분석 게임

카드 매칭 게임을 통해 **반응속도, 정확도, 집중도(복합 점수)**를 측정하고
게임 결과를 **난이도별 · 시간 흐름별로 분석**하는 React 기반 프로젝트입니다.

이 프로젝트는 단순한 게임 구현을 넘어,
**“사용자 행동 데이터를 어떻게 수집하고, 어떤 기준으로 해석할 것인가”**에 초점을 둔
**인지 지표 측정 & 성과 분석 프로젝트**입니다.

---

## TL;DR (요약)

* 카드 매칭 게임을 통한 인지 지표 측정
* **정확도 + 반응속도 기반 복합 점수(집중도) 설계**
* 미진행 게임 필터링으로 통계 신뢰도 확보
* 개인 기록 기반 **추세 분석 & 실력 향상 판정**
* 게임은 측정만, 해석은 성과 화면에서만 수행하도록 구조 분리

> **개인 기록 기반 추세 분석으로 ‘실력 향상’을 판단하는 인지 훈련 게임**

---

## 화면 미리보기

### 홈
<img src="./docs/images/home.png" width="190"/>

### 게임 플레이
<img src="./docs/images/game_preview.png" width="200"/>
<img src="./docs/images/game_play.png" width="190"/>

### 단일 게임 결과
<img src="./docs/images/game_result_1.png" width="190"/>
<img src="./docs/images/game_result_2.png" width="190"/>

### 성과(Performance) 분석
<img src="./docs/images/game_performance_1.png" width="190"/>
<img src="./docs/images/game_performance_2.png" width="190"/>
<img src="./docs/images/game_performance_3.png" width="190"/>

---

## 주요 기능

### 게임 플레이

* 난이도별 설정
  - 카드 쌍 개수
  - 제한 시간
  - 시작 전 카드 미리보기 시간
* 카드 매칭 로직
* 일시정지 / 재시작 / 초기화
* 시간 초과 처리
* **유효 게임 판정**
  - 클릭 1회 이하 등 실제 플레이가 없는 게임 제외

---

### 결과 분석 (단일 게임)

* 게임 종료 시 결과 요약
  - 소요 시간
  - 정확도
  - 집중도 점수
  - 평균 반응속도
  - 시도 / 성공 / 실패 횟수

* 난이도별 평균 통계 시각화
  - 평균 정확도
  - 평균 반응속도
  - 평균 소요 시간

---

### 성과(Performance) 분석

* 난이도 필터
* 최근 N(10)회 게임 타임라인
* 최근 N(10)회 추이 차트 ( + 이동 평균선, 전체 평균선 )
  - 반응속도
  - 정확도
  - 집중도
* 최근 N(10) 평균 vs 전체 평균 비교
* 최고 / 최저 기록 하이라이트
* **실력 향상 판정 배지 표시**

---

## 데이터 관리

  * 게임 결과 저장소: `localStorage`
  * 저장 시점: **게임 종료 직후**
  * Result 화면: 계산 X / 저장된 데이터 표시 O
    - 재진입 / 새로고침에 안전
  * Performance 화면: 저장된 기록 기반 통계 계산

---

## 사용 기술

  * React + TypeScript (Vite)
  * React Router
  * Recharts (성과 추이 및 평균 비교 시각화)
  * Tailwind CSS
  * localStorage 기반 데이터 관리

---

## 설계 포인트

  * 게임 로직과 통계 로직 완전 분리
    - 게임은 측정만, 해석은 성과 화면에서만 수행
    - 단일 게임과 누적 데이터의 책임을 분리
  * 파생 데이터는 `useMemo`로 계산
  * “유효 게임” 개념 도입으로 통계 신뢰도 확보
  * 단일 지표가 아닌 **복합 지표 기반 실력 판단**
  * 도구형 서비스 성격에 맞춰 공통 Header를 사용
  * 게임 플레이 중에도 현재 위치와 주요 기능 접근성을 유지

---

## 폴더 구조

```
src/
├─ App.tsx                         # 라우터 설정
├─ main.tsx                        # React entry point
├─ index.css                       # Tailwind / Pretendard 폰트 설정
├─ vite-env.d.ts                   # 이미지 파일 모듈 등록
│
├── pages/
│   ├── Home.tsx                    # 홈 화면 (게임 시작 / 성과 이동)
│   ├── Game.tsx                    # 게임 세션 관리, 게임 전체 리셋 트리거
│   ├── GameCore.tsx                # 게임 실행 로직 + 게임 UI
│   ├── Result.tsx                  # 단일 게임 결과 화면 (저장된 결과 표시)
│   └── Performance.tsx             # 성과 분석 화면 (누적 통계 / 차트)
│
├── components/
│   ├── game/
│   │   ├── GameCardBoard.tsx       # 카드 보드 UI
│   │   └── GameCardHeader.tsx      # 게임 정보 (시간 / 시도 / 난이도 등)
│   │
│   ├── charts/
│   │   ├── AccuracyByDifficultyChart.tsx   # 난이도별 평균 정확도 차트
│   │   ├── DurationByDifficultyChart.tsx   # 난이도별 평균 소요 시간 차트
│   │   ├── ReactionByDifficultyChart.tsx   # 난이도별 평균 반응 속도 차트
│   │   ├── AccuracyTrendChart.tsx          # 정확도 추이 차트
│   │   ├── ReactionTrendChart.tsx          # 반응속도 추이 차트
│   │   └── SkillScoreTrendChart.tsx        # 집중도 추이 차트
│   │
│   ├── common/
│   │   ├── CardBox.tsx                    # 공용 카드 컴포넌트
│   │   └── ItemDescription.tsx            # 공용 차트 범례 컴포넌트
│   │
│   └── stats/
│   │   ├── AverageCompareCard.tsx          # 반응 속도 비교
│   │   ├── ExtremeCard.tsx                 # 반응 속도 기록: 최고 / 최저
│   │   ├── PreviewProgress.tsx             # 미리 보기 프로그레스바
│   │   ├── ProgressBadge.tsx               # 실력 향상 배지
│   │   ├── RecentTimeline.tsx              # 최근 N(10)회 플레이 기록
│   │   └── StatItem.tsx                    # 공용 아이템 정렬 (3열)
│   │
│   └─ Header.tsx                           # 공통 네비게이션 (NavLink)
│
├── config/
│   └── gameConfig.ts            # 난이도 설정 (시간 / 카드 쌍 / 미리보기)
│
├── hooks/
│   ├── useCardLogic.ts          # 카드 게임 핵심 로직 (매칭 / 종료 / 결과)
│   └── useGameTimer.ts          # 타이머 / 반응 속도 측정 로직
│
├── types/
│   ├── cardData.ts              # 카드 이미지
│   ├── game.ts                  # 게임 진행 중 상태 및 결과
│   └── storage.ts               # localStorage 저장용
│
├── utils/
│   ├── buildAverageData.ts             # 전체 [+최근 N회] (실제 계산 X)
│   │                                     반응 속도 / 정확도 / 집중도 평균
│   ├── buildChartData.ts               # UI 용 차트 (계산 X)
│   ├── buildTrendData.ts               # 최근 N회 정확도/반응속도/집중도 추이
│   │                                      + 이동 평균( movingAverage.ts )
│   ├── calcAverage.ts                  # 평균 계산
│   ├── calcStatsByDifficulty.ts        # 전체 난이도별 평균 계산
│   │                                     (소요시간, 정확도, 반응시간, 실패)
│   ├── createShuffledDeck.ts           # 카드 배열 랜덤 생성
│   ├── difficultyConfig.ts             # 난이도 별 UI용 명칭, 색상 (바 차트)
│   ├── filter.ts                       # 난이도 필터
│   ├── findExtremes.ts                 # 최고/최저 반응 속도 기록
│   ├── getRecentResults.ts             # 최근 N회 기록 불러오기
│   ├── judgeProgress.ts                # 실력 향상 평가 계산
│   ├── loadGameResults.ts              # 게임 결과 불러오기
│   ├── movingAverage.ts                # 이동 평균 계산
│   ├── skillScore.ts                   # 집중도 계산
│   └── storage.ts                      # 결과 데이터 저장 및 조회
│
└── assets/
     └── game/
     │   └── card/                # 카드 이미지 리소스
     └── fonts/                   # Pretendard 폰트
```

---

## 프로젝트 구조 다이어그램: 전체 흐름
```text
[      Game Screen    ]
          │
          │ (카드 클릭 / 타이머 / 매칭)
          ▼
┌─────────────────────┐
    Game Logic Layer
     (Hooks 중심)
                    
   - 카드 상태 관리
   - 타이머 관리
   - 매칭 판정
   - 정확도 계산
   - 반응 속도 기록
└─────────┬───────────┘
          │
          │ 게임 종료
          ▼
┌─────────────────────┐
      Game Result
      (단일 게임)
                   
   - totalAttempts    : 시도 횟수 (회)
   - correctMatches   : 성공 횟수 (회)
   - failedAttempts   : 실패 횟수 (회)
   - accuracy         : 정확도 (%)
   - avgReactionTime  : 평균 반응 속도 (초)
   - duration         : 플레이 시간 (초)
   - skillScore       : 집중도 (점)
└─────────┬───────────┘
          │ 저장
          ▼
┌─────────────────────┐
     Local Storage
     (Game History)
                   
  StoredGameResult[]
└─────────┬───────────┘
          │ 조회
          ▼
┌─────────────────────┐
    Performance Page
       (성과 분석)
                   
  - 난이도 필터
  - 실력 판정
  - 최근 N회 추이
  - 차트 시각화
  - 평균 비교
  - 최고/최저 반응 속도
└─────────────────────┘
```

---

## 집중도 점수 설계

단순 반응속도는 무작정 빠르게 클릭해도 높아질 수 있습니다.
이를 방지하기 위해 **정확도와 반응속도를 결합한 복합 점수**를 설계했습니다.

* 정확도 비중 ↑
* 반응속도는 보조 지표
* 미진행 게임은 통계에서 제외
* 가중치 상수화로 추후 자동 조정 가능

> “빠르기만 한 플레이”가 아닌
> **정확하고 안정적인 플레이를 높은 점수로 평가**하는 것이 목표입니다.

---

### 집중도 점수 예시 수식 (개념)

* 집중도 (skillScore)
  ```ts
  skillScore =
    (accuracy * ACC_WEIGHT) +
    (normalizedReactionTime * REACTION_WEIGHT)
  ```
  - ACC_WEIGHT: 60%
  - REACTION_WEIGHT: 40%

* 정확도 (accuracy): 0 ~ 100
  ```ts
  (attempts === 0) 
    ? 0 
    : Math.round((correctMatches / attempts) * (correctMatches / pairs) * 100)
  ```

* reactionTime 정규화 (normalizedReactionTime): 느릴수록 감점
  ```ts
  if (sec <= 0.4) return 100;
  if (sec >= 2.0) return 0;
  return Math.round(100 - ((sec - 0.4) / 1.6) * 100);
  ```

> 현재 가중치는 **실험적 설정**이며,
> 실제 서비스 환경에서는 A/B 테스트를 통해 조정 가능한 구조입니다.

---

## 미진행 게임 제외 이유

### 문제 상황

* 시간 초과 & 클릭 1회 이하
  > 반응속도 0초로 기록되어 **최고 기록으로 오인**,
  > **집중도** 계산 시 반응속도 가중치가 **40점으로 잘못 적용**됨

### 해결

* 게임 종료 시 **유효 게임 필터링**하여 저장하지 않음
  ```ts
  (avgReactionTime + accuracy) > 0
  ```

➡ 통계 신뢰도 확보

---

## 이동 평균선의 의미

  > 개별 게임 결과는 편차가 크기 때문에
  > **최근 N(5)회 평균을 연결하여 실질적인 흐름을 파악**하기 위해 사용합니다.

---

## 실력 향상 판정 로직

단순 점수 비교가 아닌,
**데이터 수에 따라 다른 기준을 적용하는 이중 판정 구조**입니다.
판정 결과는 향상 / 저하 / 유지로 구분되며,
수치 변화가 0일 경우 퍼센트 문구는 생략하여 자연스러운 메시지를 제공합니다.

### 단기 데이터 분석 (2~4개)

* 데이터가 적을 때 발생하는 노이즈 방어
* 첫 기록 대비 마지막 기록 변화율 기준
* 단기 변화율이 ±20% 이상이고 중간 점수가 지나치게 낮지 않을 때만 상태 변화 인정
* 메시지에 변화율이 0%인 경우는 표시하지 않음 → “0% 상승/하락” 어색함 방지

---

### 장기 추세 분석 (5개 이상)

* 전반부 평균 vs 후반부 평균 비교
* 추세 기반 판정 (`up / down / flat`)
* 최근 평균 점수가 **전체 평균보다 높은지** 추가 확인
* 메시지에 변화율이 있을 경우만 표시, 0% 변화는 생략

➡ 단기 확률적 요인과 장기 안정적 실력 향상을 구분하여,
   사용자가 직관적으로 자신의 인지 상태 변화를 이해할 수 있도록 설계되었습니다.

---

## 향후 개선 아이디어

* localStorage 한계 대응: 대용량 데이터 대비 성능 최적화
* 서버 기반 저장 & 사용자 계정 연동 - **서버 API**
* 테스트 코드 추가
* 랭킹/공유/댓글 기능 추가
* 반응속도 **분산(일관성) 지표** 추가
* 게임 도중 헤더를 클릭해 이탈할 경우 현재 진행 중인
  데이터의 유실 처리(자동 패배 처리 vs 기록 제외)에 대한 정책
* 게임 진행 완료율 추가
  - 현재는 100% 진행만 저장
  - 사용자의 중간 이탈 저장 -> 난이도별 이탈율 분석
* 게임 종류 확장 대비 공통 인터페이스 설계

---

## 마무리

이 프로젝트는
**게임을 만들기 위해 데이터를 쓰는 것이 아니라,
데이터를 관찰하기 위해 게임을 만든 사례**입니다.

측정 → 해석 → 신뢰도 → 추세 판단까지
프론트엔드에서 어디까지 설계할 수 있는지를 실험한 프로젝트입니다.