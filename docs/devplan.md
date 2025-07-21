# VCE Career Guidance App - Complete Development Plan

## 🚀 Phase 1: Project Setup & Foundation (Day 1-2)

### Initial Setup
```bash
npx create-next-app@latest vce-career-guide --typescript --tailwind --eslint
cd vce-career-guide
npm install @clerk/nextjs @supabase/supabase-js @supabase/ssr
npm install @google/generative-ai
npm install @radix-ui/react-* lucide-react class-variance-authority
npm install jspdf html2canvas react-hot-toast
npm install framer-motion
```

### Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   ├── quiz/
│   │   ├── page.tsx
│   │   └── results/
│   ├── subjects/
│   ├── careers/
│   ├── preferences/
│   └── api/
│       ├── gemini/
│       ├── careers/
│       └── subjects/
├── components/
│   ├── ui/ (shadcn components)
│   ├── quiz/
│   ├── auth/
│   └── layout/
├── lib/
│   ├── supabase.ts
│   ├── clerk.ts
│   ├── gemini.ts
│   └── utils.ts
├── types/
└── data/
    └── questions.ts
```

### Environment Variables (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

## 🗄️ Phase 2: Database Setup (Day 2)

### Supabase Tables (supabase/schema.sql)
```sql
-- Users table (managed by Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz responses
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_id INTEGER NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz sessions
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'in_progress',
  initial_responses JSONB,
  followup_questions JSONB,
  followup_responses JSONB,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Saved careers
CREATE TABLE saved_careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  career_name TEXT NOT NULL,
  career_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  preferred_subjects JSONB,
  career_interests JSONB,
  work_preferences JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for authenticated users
```

## 🔐 Phase 3: Authentication Setup (Day 2-3)

### Clerk Integration
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/about"],
  ignoredRoutes: ["/api/webhooks/clerk"]
});

// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
```

### User Management
```typescript
// lib/auth.ts
export async function createUserInDatabase(clerkUser: any) {
  // Create user record in Supabase when Clerk user signs up
}
```

## 📝 Phase 4: Quiz System (Day 3-5)

### Question Data Structure
```typescript
// types/quiz.ts
export interface Question {
  id: number;
  text: string;
  type: 'single-select' | 'multiple-select' | 'likert' | 'spectrum' | 'short-answer' | 'ranking';
  options?: string[];
  required: boolean;
  category: string;
}

// data/questions.ts
export const INITIAL_QUESTIONS: Question[] = [
  // All 25 questions from your specification
];
```

### Quiz Components
```typescript
// components/quiz/QuestionRenderer.tsx
// components/quiz/LikertScale.tsx
// components/quiz/SpectrumSlider.tsx
// components/quiz/RankingComponent.tsx
// components/quiz/MultiSelect.tsx
```

### Gemini AI Integration
```typescript
// lib/gemini.ts
export async function generateFollowupQuestions(responses: any[]) {
  const prompt = `Based on these student responses: ${JSON.stringify(responses)}
  Generate 5 personalized follow-up questions in JSON format...`;
  
  const result = await genAI.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function generateRecommendations(allResponses: any[]) {
  const prompt = `Based on these complete quiz responses, provide:
  1. Top 5 VCE subject recommendations with reasons
  2. Top 5 career suggestions with salary info and growth prospects
  3. University prerequisites for recommended careers
  4. Study strategies and resources`;
  
  const result = await genAI.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

## 🎯 Phase 5: Core Pages Development (Day 5-8)

### Page Priorities:
1. **Homepage** (`/`) - Landing page with CTA
2. **Dashboard** (`/dashboard`) - User hub
3. **Quiz Flow** (`/quiz` → `/quiz/results`)
4. **Subjects** (`/subjects`) - VCE subject browser
5. **Careers** (`/careers`) - Career matching (Tinder-style)
6. **Preferences** (`/preferences`) - Saved data

### Key Components:
```typescript
// components/career-swipe/CareerCard.tsx - Tinder-style swiping
// components/pdf/ReportGenerator.tsx - PDF export
// components/dashboard/QuickActions.tsx
// components/subjects/SubjectCard.tsx
```

## 🎨 Phase 6: UI/UX Implementation (Day 6-9)

### Shadcn/UI Setup
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select slider
npx shadcn-ui@latest add dialog sheet badge progress
```

### Design System
- Dark/Light theme toggle
- Consistent color palette
- Mobile-first responsive design
- Smooth animations with Framer Motion
- Loading states and skeleton components

## 🔄 Phase 7: API Development (Day 7-10)

### API Routes:
```typescript
// app/api/quiz/submit/route.ts
// app/api/gemini/followup/route.ts
// app/api/gemini/recommendations/route.ts
// app/api/careers/search/route.ts
// app/api/subjects/list/route.ts
// app/api/pdf/generate/route.ts
```

### External Data Integration:
- Career salary data (Australian Bureau of Statistics API)
- University course information
- Job market trends
- VCE subject scaling data

## 🎯 Phase 8: Advanced Features (Day 10-12)

### Tinder-Style Career Matching
```typescript
// components/career-swipe/SwipeableCareer.tsx
// Uses react-spring or framer-motion for smooth swipe animations
// Saves matches to user preferences
```

### PDF Report Generation
```typescript
// lib/pdf-generator.ts
// Generates comprehensive career report with:
// - Quiz results summary
// - Recommended subjects and careers
// - Action plan and next steps
// - Resource links
```

### Real-time Features
- Progress tracking
- Recommendation updates
- Social sharing capabilities

## 🧪 Phase 9: Testing & Optimization (Day 12-13)

### Testing Strategy:
- Component testing with Jest/React Testing Library
- API endpoint testing
- User flow testing
- Mobile responsiveness testing
- Performance optimization

### Performance:
- Image optimization
- Code splitting
- Lazy loading
- SEO optimization

## 🚀 Phase 10: Deployment (Day 14)

### Deployment Checklist:
- Environment variables configured
- Database migrations run
- Clerk webhooks configured
- Supabase RLS policies active
- Domain configured
- Analytics setup (Google Analytics/Vercel Analytics)

### Hosting:
- **Frontend**: Vercel (seamless Next.js integration)
- **Database**: Supabase (managed PostgreSQL)
- **Auth**: Clerk (managed authentication)
- **File Storage**: Supabase Storage (for PDFs, images)

## 📋 Development Workflow for Cursor AI

### Daily Cursor Prompts:
1. **"Build the quiz question renderer component that handles all question types from the specification"**
2. **"Create the Gemini AI integration for generating personalized follow-up questions"**
3. **"Implement the career swipe component with Tinder-like UI and animations"**
4. **"Build the PDF report generator with comprehensive career recommendations"**
5. **"Create the responsive dashboard with user progress tracking"**

### Key Cursor Commands:
- `@codebase` - Reference entire codebase
- `@files` - Reference specific files
- `@docs` - Reference documentation
- `@web` - Search for implementation examples

## 🎯 Success Metrics

### Technical KPIs:
- Page load time < 2 seconds
- Mobile responsiveness score > 95%
- Quiz completion rate > 80%
- User retention after first quiz > 60%

### User Experience KPIs:
- Average quiz completion time: 15-20 minutes
- PDF download rate > 70%
- Career match satisfaction rating > 4/5
- Return user rate > 40%

## 🔧 Maintenance & Updates

### Ongoing Tasks:
- Weekly Gemini prompt optimization
- Monthly career data updates
- Quarterly VCE subject information updates
- User feedback integration
- Performance monitoring

---

## 🚨 Critical Success Factors

1. **Start with MVP**: Focus on core quiz → recommendations → PDF flow first
2. **Mobile-First**: Victorian students primarily use mobile devices
3. **Performance**: Fast loading times are crucial for user retention
4. **Data Quality**: Accurate VCE and career information is essential
5. **User Testing**: Get feedback from actual Year 9-11 students early

This plan prioritizes building a working prototype quickly while maintaining code quality and scalability for future enhancements.