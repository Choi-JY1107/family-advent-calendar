# Indie Crew 1st Hackathon

해커톤 사전 준비용 보일러플레이트. 전략 가이드는 [STRATEGY.md](./STRATEGY.md) 참고.

## 구조

```
indie-hackathon/
├── frontend/          Vite + Svelte 5 + TypeScript + SCSS(BEM)
│   ├── src/lib/
│   │   └── supabase.ts    Supabase 클라이언트 (lazy init)
│   └── .env.example       VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
├── backend/           Node.js + TypeScript (no framework)
│   └── src/index.ts
└── package.json       루트 스크립트 프록시 (워크스페이스 도구 없음)
```

## 설치

```bash
npm run install:all
```

## 개발

각 서버는 별도 터미널에서:

```bash
npm run dev:frontend    # http://localhost:5173
npm run dev:backend     # node --watch + experimental TS strip
```

## 환경 변수

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

## 타입 체크 / 빌드

```bash
npm run check
npm run build
```

## 메모

- 패키지 매니저: **npm** (pnpm/yarn 쓰지 않음)
- 모노레포 도구 없음. `npm --prefix`로 단순 프록시.
- backend는 Node 22+의 `--experimental-strip-types`로 빌드 없이 .ts 직접 실행. 프레임워크 미설치 (Express/Hono/NestJS 등 필요 시 그때 추가).
- frontend 스타일: SCSS + BEM 방식. CSS 프레임워크 없음.
