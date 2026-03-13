# 🔵 Spring Boot 마이그레이션 기술 명세서

본 문서는 기존 **NestJS(Node.js)** 기반의 백엔드 시스템을 **Spring Boot 3(Java)**로 마이그레이션하며 결정한 기술적 선택과 설계 과정을 기록합니다.

**[← 'README'로 돌아가기](../README.md)**

---

## 1. 마이그레이션 배경 및 목적

### NestJS 환경의 한계

- **런타임 타입 안정성:** TypeScript를 사용했음에도 컴파일 시점과 런타임 간의 괴리 및 유연함이 때로는 대규모 로직 관리에서 불안정성으로 작용함.
- **데이터 무결성:** MongoDB(NoSQL)의 유연함이 성과 분석 데이터의 엄격한 정규화와 무결성을 보장하는 데 한계를 보임.

### 마이그레이션 목표

- **강력한 타입 시스템 도입:** Java 17의 엄격한 타입을 통해 비즈니스 로직의 신뢰도 향상.
- **RDBMS 전환:** PostgreSQL 도입을 통해 데이터 간의 관계를 명확히 정의하고 참조 무결성 확보.
- **객체 지향 설계:** JPA(Hibernate)를 활용하여 도메인 중심 설계(DDD) 기반의 코드 구조 확립.

---

## 2. 기술 스택 비교 (Stack Comparison)

| 구분          | Legacy (NestJS) | Migration (Spring Boot) | 사유                            |
| :------------ | :-------------- | :---------------------- | :------------------------------ |
| **Language**  | TypeScript      | **Java 17**             | 엄격한 타입 안정성              |
| **Framework** | NestJS 11       | **Spring Boot 3.5**     | 엔터프라이즈급 생태계 활용      |
| **Database**  | MongoDB         | **PostgreSQL**          | 복잡한 관계형 데이터 처리       |
| **ORM**       | Mongoose        | **Spring Data JPA**     | 객체-관계 매핑의 표준화         |
| **Auth**      | Passport JWT    | **Spring Security**     | 강력하고 유연한 보안 프레임워크 |

---

## 3. 시스템 아키텍처 및 패키지 구조

Spring Boot의 표준인 **Layered Architecture**를 채택하여 관심사를 분리합니다.

```text
src/main/java/com/project/
  ├── auth/            # Spring Security 및 JWT 로직
  ├── record/          # 게임 기록 및 성과 분석 도메인
  │    ├── controller/ # API 엔드포인트
  │    ├── service/    # 비즈니스 로직 (성과 산출 알고리즘)
  │    ├── repository/ # DB 접근 계층 (JPA)
  │    └── entity/     # JPA 엔티티 (DB 테이블 매핑)
  ├── user/            # 사용자 관리 도메인
  └── common/          # 공통 유틸리티 및 예외 처리
```
