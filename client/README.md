my-app/
├── app/                    # App Router: all routes live here
│   ├── (galaxy)/           # Route group (optional, for parallel sections)
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── ...
│   ├── (dashboard)/        # Another route group
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── layout.tsx
│   │   └── ...
│   ├── api/                # Route handlers (Next.js server functions)
│   │   ├── users/
│   │   │   └── route.ts
│   │   └── ...
│   ├── globals.css
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
│
├── components/             # Reusable UI components
│   ├── ui/                 # Atomic components (buttons, cards, etc.)
│   ├── layout/             # Navbar, sidebar, footer...
│   └── composite/          # Feature-specific but shared components
│
├── features/               # Feature modules (cleanly separated logic)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api/
│   ├── mentorships/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── utils/
│   └── ...
│
├── lib/                    # Utilities and singletons (API, config, etc.)
│   ├── api.ts              # Axios/fetch clients, interceptors
│   ├── constants.ts
│   ├── env.ts              # Zod-based env validation
│   ├── helpers.ts
│   └── types.ts
│
├── public/                 # Static assets (favicons, images, fonts)
│
├── tests/                  # Vitest / Jest unit tests
│   ├── components/
│   ├── features/
│   └── setup.ts
│
├── tailwind.config.ts
└── README.md
