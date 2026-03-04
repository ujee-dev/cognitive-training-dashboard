# React·Node.js 기반 학습 프로젝트: 인지 훈련 성과 분석 시스템

**프로젝트 개요**

> 카드 매칭 기반 인지 훈련 게임을 확장하여, 사용자 반응 데이터를 신뢰 가능한 지표로 분석하는 학습용 풀스택 프로젝트입니다.
> 공백기 동안 최신 웹 스택과 서버 구조를 재학습하며, 단순 기능 구현을 넘어 **데이터 신뢰성과 일관된 판정 구조**를 고민했습니다.

**역할 및 주요 설계**

- **프론트엔드 설계**: React + TypeScript 기반 게임 UI 구현, 사용자 상호작용 및 데이터 시각화
- **백엔드 설계**: Node.js + NestJS 기반 서버 구축, JWT 인증과 Refresh Token 관리 구조 설계, 사용자 기록 저장 및 서버 사이드 점수 계산
- **데이터 설계**: MongoDB를 활용해 로그인/비로그인 사용자 데이터를 구분 저장하고, 난이도별 가중치와 페널티를 적용한 ‘집중도 점수(Skill Score)’ 계산 구조 설계
- **검증/테스트**: Playwright 기반 E2E 테스트를 통해 인증 흐름, 토큰 갱신, 접근 제어 검증

**문제 인식 및 해결 과정**

1. **데이터 신뢰성 확보**
   - 초기 로컬 저장 방식만으로는 기록 일관성과 분석 한계 존재
   - → 서버 사이드 기록 관리 및 점수 계산 구조로 전환

2. **사용자 판정 구조 설계**
   - 난이도별 가중치, 점수 배율, 실패 패널티 적용
   - → 단일 점수가 아닌 복합 지표로 인지 성과를 분석

3. **보안 및 인증 흐름**
   - Access/Refresh Token 구조 설계
   - 멀티탭 동기화 및 토큰 만료/갱신 검증

     > Case: 여러 API가 동시 호출될 때 토큰 갱신 중복 발생

     > Solution: Promise Memoization 패턴을 적용하여 중복 요청을 방지하고 상태 일관성 확보

**성과 및 학습 포인트**

- React·Node.js·MongoDB 기반 최신 스택 학습 및 풀스택 개발 경험 확보
- 데이터 신뢰성을 고려한 서버 사이드 점수 산출 및 판정 구조 설계 경험
- E2E 테스트 적용을 통한 인증/보안 검증 경험
- 단순 기능 구현을 넘어 설계와 데이터 기반 사고 경험

**기술 스택 요약**

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Axios
- **Backend**: Node.js 22, NestJS 11, MongoDB, Mongoose, Passport(JWT/Refresh), bcrypt, class-validator
- **Testing**: Playwright (E2E 인증 및 보안 테스트)

## 자세한 기술 구현 내용

- 원본 기술 중심 README는 [docs/TECH-DETAILS.md](./docs/TECH-DETAILS.md) 참고
