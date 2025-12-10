# Team 8 Database Project Web

이 프로젝트는 데이터베이스 팀 8조의 웹 애플리케이션 소스 코드입니다. React (Vite)와 TypeScript를 기반으로 구축되었습니다.

## 1. 폴더 구조

핵심 소스 코드는 `src` 디렉토리 내에 위치합니다.

```
src/
├── assets/         # 정적 리소스 (이미지, 아이콘 등)
├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── common/     # 공통 컴포넌트 (Button, Card 등)
│   ├── layout/     # 레이아웃 컴포넌트 (Sidebar, Header)
│   ├── session/    # 세션 관련 컴포넌트
│   └── user/       # 사용자/관리자 관련 모달 등
├── pages/          # 주요 페이지 컴포넌트
│   ├── Dashboard.tsx    # 대시보드
│   ├── Project.tsx      # 프로젝트 관리
│   ├── UserOrg.tsx      # 사용자 및 조직 관리
│   └── ...              # 기타 페이지 (모델, 데이터셋 등)
├── store/          # 전역 상태 관리 (Zustand - useDataStore.ts)
├── styles/         # 스타일 설정 (Theme, GlobalStyles)
├── App.tsx         # 라우팅 및 앱 구조 설정
└── main.tsx        # 진입점 (Entry point)
```

## 2. 실행 방법

프로젝트 루트 디렉토리에서 터미널을 열고 다음 명령어들을 실행하세요.

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```
실행 후 터미널에 표시되는 로컬 주소(예: `http://localhost:5173`)로 접속하여 확인할 수 있습니다.


## 3. 개발 환경 버전

이 프로젝트는 다음 환경에서 개발되었습니다.

- **Node.js**: 18.0.0 이상 권장
- **TypeScript**: 5.9.x
- **React**: 19.2.x
- **Vite**: 7.2.x