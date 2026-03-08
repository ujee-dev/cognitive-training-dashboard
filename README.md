# React·Node.js 기반 학습 프로젝트: 인지 훈련 성과 분석 시스템

> 카드 매칭 기반 인지 훈련 게임 데이터를 저장하고 분석하여
> **사용자 성과를 시각화하는 풀스택 웹 애플리케이션**입니다.
>
> 단순 기능 구현을 넘어 **데이터 신뢰성, 인증 구조, 프론트엔드 성능 최적화**를 중심으로 설계했습니다.

---

## 프로젝트 개요

이 프로젝트는 카드 매칭 게임에서 발생하는 사용자 반응 데이터를 기반으로
사용자의 집중도 및 수행 성과를 분석하는 웹 서비스입니다.

프로젝트 구현 과정에서 다음과 같은 기술적 문제를 해결하는 데 집중했습니다.

- 서버 기반 데이터 관리로 **기록 신뢰성 확보**
- JWT 기반 인증 시스템 설계
- React 대시보드(Dashboard)의 **렌더링 성능 최적화**
- Lighthouse 지표 개선을 통한 **웹 성능 및 접근성 향상**
- Playwright 기반 E2E 테스트를 통한 **인증 흐름 검증**

## 아키텍처

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

---

## 주요 화면

### 게임 진행

<table>
<tr>
  <td align="center">힌트</td>
  <td align="center">진행</td>
  <td align="center">현재 결과</td>
  <td align="center">난이도별 평균</td>
</tr>
<tr>
  <td align="center" valign="top"><img src="./docs/images/game_preview.png" width="180"/></td>
  <td align="center" valign="top"><img src="./docs/images/game_play.png" width="180"/></td>
  <td align="center" valign="top"><img src="./docs/images/game_result_1.png" width="180"/></td>
  <td align="center" valign="top"><img src="./docs/images/game_result_2.png" width="180"/></td>
</tr>
</table>

### 성과

<table>
<tr>
  <td align="center">실력 판정, 순위</td>
  <td align="center">최근 10회 기록</td>
  <td align="center">추이 그래프</td>
  <td align="center">비교 (반응 속도, 점수)</td>
</tr>
<tr>
  <td align="center" valign="top"><img src="./docs/images/game_performance_1.png" width="180"/></td>
  <td align="center" valign="top"><img src="./docs/images/game_performance_2.png" width="180"/></td>
  <td align="center" valign="top"><img src="./docs/images/game_performance_3.png" width="180"/></td>
  <td align="center" valign="top"><img src="./docs/images/game_performance_4.png" width="180"/></td>
</tr>
</table>

> **시각화**
>
> Recharts를 활용해 사용자의 성장 곡선을 한눈에 파악할 수 있도록 구성했습니다.

---

## 주요 기능

- 카드 매칭 기반 인지 훈련 게임
- 사용자 게임 기록 저장
- 난이도 기반 점수 계산
- 성과 데이터 차트 시각화
- JWT 기반 사용자 인증 (Access / Refresh Token)

---

## 주요 Lighthouse 지표 개선

### 1. 대시보드 초기 로딩 성능 문제

#### 문제

React SPA 구조에서 모든 페이지와 차트 라이브러리가
초기 번들에 포함되면서 **초기 로딩 성능이 저하되는 문제(TBT 상승)가 있었습니다.**

Lighthouse 측정 결과

- Main Page Performance: **18** 점

#### 해결

초기 번들 크기를 줄이기 위해 **Route 기반 Code Splitting**을 적용했습니다.

- `createBrowserRouter`
- `React.lazy`

또한 Vite `manualChunks` 설정을 통해 번들을 분리했습니다.

분리 대상

- `recharts` & `d3`
- `react-router`
- `vendor`

#### 결과

초기 번들 로딩 부담이 감소하여

| Page | Performance     |
| ---- | --------------- |
| Main | **18 → 85+** 점 |

으로 개선되었습니다.

---

### 2. 차트 렌더링 성능 문제

#### 문제

대시보드 페이지에서 여러 Recharts 차트를 렌더링하면서
데이터 변경 시 불필요한 재렌더링이 발생했습니다.

#### 해결

차트 렌더링 비용을 줄이기 위해 다음 작업을 진행했습니다.

- Chart 컴포넌트를 `React.memo`로 감싸 재렌더링 방지
- `ResponsiveContainer` 의존성 제거

#### 결과

차트 렌더링 시 불필요한 재렌더링이 감소하여
대시보드 페이지 성능이 개선되었습니다.

| Page             | Performance    |
| ---------------- | -------------- |
| Performance Page | **4 → 86+** 점 |

---

### 3. 프로필 이미지 리소스 최적화

#### 문제

프로필 이미지 업로드 시 원본 이미지를 그대로 사용할 경우
이미지 파일 크기가 커져 네트워크 비용이 증가할 수 있습니다.

#### 해결

이미지 업로드 과정에서 다음 처리를 적용했습니다.

- WebP 변환
- 해상도 제한
- 파일 용량 제한

#### 결과

이미지 리소스 크기를 줄여
네트워크 전송량을 감소시켰습니다.

### 4. 추가 리소스 최적화

- Pretendard Variable Font 적용
- 게임 퍼즐 이미지 WebP 변환

---

### Lighthouse 성능 개선 결과 (Preview 기준, 단위: 점)

| Page        | Before (Dev) | After (Preview) |
| ----------- | ------------ | --------------- |
| Main        | 18+          | **85+**         |
| Game        | 31           | **86**          |
| Performance | 4            | **86+**         |
| Profile     | 35           | **89**          |

### 기타 지표 (Preview 기준, 단위: 점)

| Category       | Score        |
| -------------- | ------------ |
| Accessibility  | **92 ~ 95**  |
| Best Practices | **96 ~ 100** |
| SEO            | **91+**      |

---

## 기술 스택

### Frontend

React 19, TypeScript, Vite, Tailwind CSS, Recharts, Axios, React Router

### Backend

Node.js 22, NestJS 11, MongoDB, Mongoose, Passport (JWT / Refresh Token), bcrypt, class-validator

### DevOps/Auth

mkcert (Local HTTPS), JWT (Access/Refresh), Playwright (E2E)

---

## 개발 환경

HTTPS 기반 개발 환경을 구성했습니다.

- `mkcert`를 이용한 Local HTTPS
- env 기반 API 주소 관리

```
VITE_API_URL=https://localhost:3000
```

---

## 프로젝트 문서

보다 상세한 기술 구현 내용은 다음 문서에서 확인할 수 있습니다.

```
./docs/TECH-DETAILS.md
```

---

## 프로젝트 목표

이 프로젝트는 다음 역량을 학습하고 정리하기 위해 진행되었습니다.

- React 기반 SPA 구조 설계
- NestJS API 서버 설계
- JWT 인증 시스템 구현
- 데이터 시각화 대시보드 개발
- Lighthouse 기반 웹 성능 최적화 경험

---

## 성장 포인트

> **커스텀 알고리즘 설계**
>
> 단순 CRUD를 넘어, 인지 심리학적 요소를 반영한 점수 산출 로직을 직접 설계하며 백엔드 비즈니스 로직의 복잡성을 경험했습니다.

> **보안과 사용자 경험의 절충**
>
> JWT Rotation을 통해 보안을 강화하면서도, BroadcastChannel을 이용해 멀티탭 환경에서의 사용자 이탈을 방지하는 UX 최적화를 고민했습니다.
