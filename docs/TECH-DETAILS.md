본 문서는 프로젝트의 **시스템 구조, 설계 의도, 데이터 모델, 성능 최적화 구현**을 설명합니다.

# [← 메인으로 돌아가기](../README.md)

# 카드 매칭 인지 훈련 & 성과 분석 시스템 (Full-Stack)

> JWT 인증과 보안 설계를 기반으로
> 사용자의 인지 반응 데이터를 신뢰 가능한 성과 지표로 분석하는
> 카드 매칭 기반 인지 훈련 웹 애플리케이션

이 프로젝트는 단순한 게임 플레이를 넘어, **반응 속도와 정확도 데이터를 수집하고, 난이도별 가중치 및 패널티를 적용한 '집중도 점수(Skill Score)' 알고리즘으로 분석**하는 것에 초점을 맞추고 있습니다.

---

## 프로젝트 개요 & 목적

- **아키텍처**
  - 본 프로젝트는 **React SPA + NestJS API 서버 아키텍처**로 구성됩니다.

```
React (Frontend)
   │
   │ Axios (Interceptor)
   │
NestJS API Server
   │
MongoDB
```

- **Frontend**
  - 게임 UI, 사용자 상호작용, 데이터 시각화

- **Backend**
  - JWT 인증 / Refresh Token 관리
  - 사용자 계정 관리
  - 게임 기록 저장
  - 성과 분석 및 랭킹 계산

- **핵심 주제 & 목적**
  - 인증 안전성 확보 & 상태 일관성 유지
  - 인지 데이터의 통계적 신뢰도 확보: 서버 중심 데이터 처리
  - 난이도별 변별력 있는 점수 설계

---

## 기술 스택

### Frontend (`client/`)

- **Core**: React 19, TypeScript, Vite
- **UI**: Tailwind CSS
- **Network**: Axios (Interceptor 기반 인증 및 토큰 갱신)
- **Visualization**: Recharts (데이터 추이 시각화)

### Backend (`server/`)

- **Core**: Node.js 22, NestJS 11
- **DB**: MongoDB + Mongoose
- **Security**: Passport (JWT / Refresh), bcrypt, class-validator

### 기타

- Playwright (E2E 인증 테스트)

---

## 인지 지표 및 분석 설계

### 1. 집중도 점수(Skill Score) 산출

- **목적**:
  - 반응 속도와 정확도의 균형
  - 난이도별 변별력 확보
  - 무작위 클릭 억제
  - 음수 점수 방지

사용자의 인지 능력을 다각도로 평가하기 위해 반응 속도와 정확도를 결합한 복합 지표를 사용합니다.

- **반응 점수(Reaction Score)**

  반응 속도를 난이도별 기준값에 따라 **0~100 점수로 정규화**

```ts
const scale = REACTION_SCALES[difficulty];

if (avgReactionTime <= scale.minTime) return 100;
if (avgReactionTime >= scale.maxTime) return scale.minScore ?? 0;

const raw =
  100 -
  ((avgReactionTime - scale.minTime) / (scale.maxTime - scale.minTime)) * 100;

return Math.max(scale.minScore ?? 0, Math.round(raw));
```

> 반응 속도가 빠를수록 높은 점수를, 느릴수록 낮은 점수를 부여하여
> 난이도별 기준에 따라 상대적인 반응 성능을 비교할 수 있도록 설계하였습니다.

- **최종 집중도 점수 (Skill Score)**:

```text
  finalScore = (
    (accuracy * accuracyWeight)
     + (reactionScore * reactionWeight)
    )
    * scoreMultiplier
    - (failedAttempts * penaltyWeight)
```

- **난이도별 차등 적용**
  - EASY / NORMAL / HARD 별 가중치 및 배율 상이 -> 변별력 확보

- **페널티 시스템**
  - 무작위 클릭 및 실패 누적 방지
  - `failedAttempts` 발생 시 감점을 부여

- **최소 점수 보장**
  - 0점 미만 방지 (`Math.max(0, ...)`)

> 현재 가중치는 **실험적으로 설정**된 값이며,
> 향후 A/B 테스트 및 축적된 사용자 데이터를 바탕으로
> 정교하게 조정할 수 있도록 유연하게 설계하였습니다.

### 2. 데이터 제공 정책

| 구분         | 데이터 소스        | 분석 범위     | 비고           |
| ------------ | ------------------ | ------------- | -------------- |
| **비로그인** | `localStorage`     | 전체 누적     | 기기 종속      |
| **로그인**   | **MongoDB Server** | **최근 30일** | 서버 기준 통계 |

---

## 성과 분석 시스템 (Dashboard)

로그인 사용자 전용 기능이며, **모든 수치와 판정은 서버에서 계산**됩니다.

- **실시간 랭킹**: `GameRecord`의 `skillScore` 인덱스를 활용하여 전체 TOP 10 리스트 제공
- **내 위치 파악**: 내 최고 점수 기반 현재 순위 및 상위 퍼센트(%) 산출
- 최근 N회 **이동 평균선** → 실력 추세 시각화
- **실력 향상 판정**:
  - **단기(2~4회)**: 초기 기록 대비 최근 기록 변화율($\pm20\%$) 기반 상태 판정
  - **장기(5회 이상)**: 전반부/후반부 이동 평균 비교를 통한 추세(상승/유지/저하) 분석
- **서버 사이드 판정**: 클라이언트의 가공 없이 서버에서 `GameDifficultyConfig`의 가중치를 적용한 최종 `progress` 객체를 전달하여 보안성과 일관성을 유지

### 성과 분석 화면

<table>
<tr>
  <td align="center">실력 판정, 순위</td>
  <td align="center">최근 10회 기록</td>
  <td align="center">추이 그래프</td>
  <td align="center">비교 (반응 속도, 점수)</td>
</tr>
<tr>
  <td align="center" valign="top"><img src="./images/game_performance_1.png" width="180"/></td>
  <td align="center" valign="top"><img src="./images/game_performance_2.png" width="180"/></td>
  <td align="center" valign="top"><img src="./images/game_performance_3.png" width="180"/></td>
  <td align="center" valign="top"><img src="./images/game_performance_4.png" width="180"/></td>
</tr>
</table>

> **시각화**
>
> Recharts를 활용해 사용자의 성장 곡선을 한눈에 파악할 수 있도록 구성했습니다.

---

## 인증 / 보안 설계 (JWT)

### 1. Refresh Token 보안 전략 (Rotation)

| 구분                 | 방식                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| **Access Token**     | JWT, `localStorage`에 저장 (인증 유지용)                                |
| **멀티탭 동기화**    | `BroadcastChannel`을 통한 실시간 상태(State) 공유                       |
| **초기 데이터 복구** | 새로고침 시 `localStorage`에서 토큰을 읽어 인증 복구 (`useRestoreUser`) |

1. **DB 해시 저장**: 토큰 원본이 아닌 bcrypt 해시값만 저장하여 DB 유출 피해 최소화
2. **Rotation 적용**: Refresh 요청 시마다 Access/Refresh 토큰을 모두 재발급하며 이전 토큰은 즉시 무효화
3. **멀티탭 동기화**: `BroadcastChannel`을 활용해 한 탭에서 로그아웃/정보 수정 시 모든 탭에 즉시 반영

### 2. 사용자 계정 관리

- **회원정보 수정**: Access Token 인증 필요, 전역 상태 즉시 갱신
- **비밀번호 변경**: 기존 비밀번호 검증 필수, 필요 시 세션 무효화
- **회원 탈퇴**: 비밀번호 재확인, 계정 및 토큰 삭제, 모든 세션 로그아웃

### 3. 설계 의도

#### 3.1 JWT + Rotation

세션 기반 인증 대신 JWT를 선택한 이유:

- 수평 확장 용이
- API 서버 Stateless 유지
- 모바일/SPA 확장 고려

#### 3.2 Refresh Token Rotation

- Refresh Token 탈취 시 재사용 공격 방지
- 토큰 재발급 시 이전 토큰 즉시 무효화

#### 3.3 Access Token localStorage 저장 이유

- 명시적 토큰 갱신 제어 가능
- Axios Interceptor 기반 인증 흐름 단순화
- 멀티탭 상태 동기화 용이

> 참고: 향후 HttpOnly Cookie 기반 인증으로 전환 예정

---

## Database Schema (MongoDB)

### 1. User (사용자)

인증 및 세션 관리를 위한 핵심 스키마입니다.

- `email`: 유저 식별자 (Unique, Indexed)
- `password`: bcrypt 해시 비밀번호
- `nickname`, `profileImage`: 프로필 정보
- `currentHashedRefreshToken`: 보안 인증용 해시 토큰

### 2. Game

등록된 인지 훈련 게임의 메타 정보를 관리합니다.

- `code`: URL 및 시스템 식별용 코드 (예: `card-matching`)
- `name`: 사용자 노출용 게임명
- 확장 대비:
  - `isActive`: 활성화 여부 (시즌제/이벤트 대응)
  - `validFrom`, `validTo`: 운영 가능 기간 설정

### 3. GameDifficultyConfig (난이도 설정)

각 게임의 난이도별 규칙 및 **집중도 점수 가중치**를 저장합니다.

- `gameId`: 해당 게임 참조 (Ref: Game)
- `difficulty`: 난이도 구분 (`EASY`, `NORMAL`, `HARD`)
- **게임 규칙**: 카드 쌍, 시간 제한, 미리보기 시간 등
- **점수 가중치**: `scoreMultiplier`, `accuracyWeight`, `reactionWeight`, `penaltyWeight`

### 4. GameRecord (게임 결과 기록)

사용자의 플레이 데이터와 분석된 인지 지표를 저장합니다.

- `userId`, `gameId`: 참조 식별자 (Indexed)
- `difficulty`: 난이도 구분 (`EASY`, `NORMAL`, `HARD`)
- `duration`: 게임 진행 시간
- `skillScore`: 계산된 최종 집중도 점수
- `avgReactionTime`, `accuracy`: 핵심 분석 데이터
- `totalAttempts` `correctMatches` `failedAttempts`: 카드매칭 게임 전용 데이터
- 확장 대비:
  - `reactionTimeDetails`: 개별 반응 시간 배열 (표준편차 분석용)
  - `stdDev`, `consistencyScore`: 인지 안정성, 일관성 지표
  - `theme`: 게임 테마 설정

### 5. Index 전략

- **성능 최적화 (Indexing Strategy)**
  - **사용자별 분석**:
    `{ userId: 1, gameId: 1, difficulty: 1, createdAt: -1 }`
  - **랭킹**:
    `{ gameId: 1, difficulty: 1, skillScore: -1 }`

---

## Frontend 성능 최적화

대시보드 페이지는 차트와 사용자 데이터를 동시에 렌더링하기 때문에
초기 로딩과 렌더링 비용을 줄이기 위한 최적화 작업을 수행했습니다.

---

### 1. Route 기반 Code Splitting

#### 문제

React SPA 구조에서 모든 페이지 코드가 초기 번들에 포함되면
초기 로딩 성능이 저하될 수 있습니다.

---

#### 해결

페이지 단위 코드 분리를 위해 다음 구조를 적용했습니다.

- `createBrowserRouter`
- `React.lazy`

예시

```tsx
const Performance = lazy(() => import("../pages/Performance"));
```

---

#### 결과

Preview Lighthouse 기준

| Page | Before | After  |
| ---- | ------ | ------ |
| Main | 18+ 점 | 85+ 점 |

초기 로딩 성능이 개선되었습니다.

---

### 2. 번들 분리 (Vite manualChunks)

#### 문제

차트 라이브러리(Recharts, D3)는 번들 크기가 큰 편이며
React Router와 함께 번들에 포함될 경우 캐시 효율이 떨어질 수 있습니다.

---

#### 해결

Vite `manualChunks` 설정을 통해 라이브러리를 분리했습니다.

```ts
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('recharts') || id.includes('d3')) {
      return 'charts';
    }
    if (id.includes('react-router')) {
      return 'router';
    }
    return 'vendor';
  }
},
```

---

#### 결과

- 공통 라이브러리 캐싱 효율 증가
- 페이지 변경 시 재다운로드 감소

---

### 3. 차트 렌더링 최적화

#### 문제

대시보드 페이지에서 여러 차트를 렌더링할 때
데이터 변경 시 불필요한 재렌더링이 발생할 수 있습니다.

---

#### 해결

차트 컴포넌트에 `React.memo`를 적용했습니다.

```tsx
export const BaseLineChart = React.memo(function BaseLineChart(...)
```

또한 차트 컨테이너 구조를 단순화했습니다.

---

#### 결과

차트 렌더링 비용이 감소했습니다.

| Page        | Before | After  |
| ----------- | ------ | ------ |
| Performance | 4 점   | 86+ 점 |

---

### 4. 이미지 리소스 최적화

#### 문제

프로필 이미지가 원본 해상도로 업로드될 경우
표시 크기에 비해 파일 크기가 커질 수 있습니다.

---

#### 해결

이미지 업로드 시 다음과 같은 최적화 및 제한 사항을 적용했습니다.

- WebP 변환
- 이미지 해상도 제한
- 파일 용량 제한

---

#### 결과

이미지 다운로드 크기가 감소했습니다.

---

### 5. 폰트 리소스 최적화

#### 문제

Pretendard 폰트를 개별 폰트 파일로 사용할 경우  
여러 weight 파일이 로드되면서 네트워크 요청 수가 증가할 수 있습니다.

#### 해결

Pretendard 폰트를 **Variable Font** 방식으로 변경하여  
단일 폰트 파일로 weight를 처리하도록 구성했습니다.

#### 결과

- 폰트 파일 수 감소
- 네트워크 요청 수 감소

---

## 접근성 및 SEO 개선

Lighthouse 지표 개선을 위해 다음 작업을 적용했습니다.

- input `autocomplete` 속성 추가
- meta description 설정
- robots.txt 추가
- HTTPS 개발 환경 적용 (mkcert)

---

## E2E 인증 테스트 시나리오 (Playwright)

1. **인증 흐름**: 로그인 유지, 새로고침 시 세션 복구, 토큰 만료 시 자동 갱신 테스트
2. **보안 경계**: 비로그인 시 성과 페이지 접근 차단 및 리다이렉트 검증
3. **동기화**: 멀티탭 환경에서의 실시간 상태 공유 확인

---

### 실행 방법

#### 환경 변수 설정

```bash
# server/.env
MONGO_URI=mongodb://localhost:27017/cognitive-app
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# client/.env
VITE_APP_API_URL=https://localhost:3000

```

#### 설치 및 구동

```bash
# Backend
cd server && npm install && npm run start:dev

# Frontend
cd client && npm install && npm run dev

```

---

## 향후 개선 계획

- HttpOnly Cookie 기반 인증 전환
- 배포 환경 구성
- k6 성능 테스트 수행
- 테스트 확장 (과부하, 더미 데이터)
- 인증 보안 강화
- 로직 검증 통계화

---

## 설계 인사이트

> "측정은 게임이, 해석은 서버가"

본 프로젝트는 단순한 게임 구현을 넘어 사용자의 미세한 반응 데이터를 의미 있는 지표로 전환하는 것에 집중했습니다.

- **데이터 무결성**: 모든 판정과 가공은 서버에서 수행하여 클라이언트 측의 조작 가능성을 차단했습니다.

- **노이즈 제거**: 단순 이동 평균선 도입을 통해 일시적인 컨디션 난조로 인한 통계적 왜곡을 방지했습니다.

- **복합 지표**: 단일 점수가 아닌 정확도와 속도를 결합한 'Skill Score'를 통해 다각적인 인지 평가를 구현했습니다.

이 프로젝트의 핵심은 “게임 구현”이 아니라  
**인지 데이터를 신뢰 가능한 지표로 만들기 위한 설계와 검증**에 있습니다.
