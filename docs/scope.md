

1. **Project Overview & Scope**  
   - This application helps Victorian high school students (Years 9–11) choose VCE subjects aligned to their interests, abilities, and career aspirations.  
   - It uses an **AI‑driven quiz** (via Google Gemini API) that asks a set of predetermined questions, processes answers, generates 7 more personalized follow‑up questions, and outputs final recommendations (subjects, careers, study resources, salary info).  The results page can then lead to a tinder style career matching page, where career options are chosen by the student in the same way that tinder UI is used for selection, swipe left to reject, swipe right to make a match. 
   - Students complete the quiz, view recommendations, save preferences, and download a personalized PDF report.  
   - The program is coded in **React/Next.js, JavaScript/TypeScript, HTML & CSS (Tailwind or Material 3)**.
- if supabase tables need to be created, make a separate supabase folder where sql files can ebcreated.  
   - Use Supabase for all database tasks, use a transaction pooler for connectivity
 - Use clerk to handle authentication and login/signup
- The ai should handle internet grabbing capabilities like for the careers and the subjects page, unless a database call is better. 
- Shadcn theme will be given

 **Question Outline & Structure**  
   - Use the **final question stack** prepared earlier. Each question should appear exactly as:  


Each entry includes:

* ✅ **Question**
* 📘 **Type**
* ✏️ **Sample Answer**

---

### ✅ 1. What subjects do you currently enjoy the most and why?

📘 **Type:** Short Answer
✏️ *"I really enjoy science and maths because I like solving problems and understanding how things work."*

---

### ✅ 2. How confident are you about what you want to do after school?

📘 **Type:** Likert Scale (1 = Not confident at all, 5 = Very confident)
✏️ *2 – “I have some interests, but nothing I feel sure about yet.”*

---

### ✅ 3. Rank the following in order of importance to you in a career (1 = most important, 5 = least important):

📘 **Type:** Ranking

* Salary
* Flexibility
* Job Security
* Passion
* Work-Life Balance
  ✏️ *1. Passion, 2. Work-Life Balance, 3. Salary, 4. Job Security, 5. Flexibility*

---

### ✅ 4. Which of the following tasks do you enjoy? (Select all that apply)

📘 **Type:** Multiple Select + *“Other” short text field*

* Solving puzzles and logical problems
* Helping others or providing support
* Designing, drawing, or creating things
* Writing, reading, or storytelling
* Working with numbers or spreadsheets
* Organising events or managing tasks
* Building or fixing mechanical things
* Using or making technology
* *Other: \[\_\_\_\_\_\_\_\_]*
  ✏️ *"Solving puzzles, using or making technology, and organising tasks."*

---

### ✅ 5. What motivates you most when planning your future?

📘 **Type:** Single Select + *“Other” text field*

* Passion
* Stability
* Salary
* Freedom
* *Other: \[\_\_\_\_\_\_\_\_]*
  ✏️ *“Passion and the chance to make a difference in society.”*

---

### ✅ 6. When are you most focused or productive?

📘 **Type:** Single Select

* Morning
* Midday
* Afternoon
* Evening
* Late Night
  ✏️ *“Afternoon”*

---

### ✅ 7. What is your ideal work environment?

📘 **Type:** Multiple Select + *“Other” text field*

* Office
* Outdoors
* Scientific lab
* Remote/work from home
* Physical/manual settings
* Creative studio
* *Other: \[\_\_\_\_\_\_\_\_]*
  ✏️ *“Creative studio and lab-based environments.”*

---

### ✅ 8. How important is job stability to you?

📘 **Type:** Spectrum (0 = Not Important, 10 = Extremely Important)
✏️ *8 – “I want long-term security.”*

---

### ✅ 9. Describe your ideal career in one sentence.

📘 **Type:** Short Answer
✏️ *“Something that lets me work on tech projects and help people.”*

---

### ✅ 10. What are your strongest academic areas?

📘 **Type:** Multiple Select + *“Other” text field*

* English
* Mathematics
* Science
* History / Humanities
* Languages
* Technology
* Business / Commerce
* Physical Education
* *Other: \[\_\_\_\_\_\_\_\_]*
  ✏️ *“Maths, Science, Technology”*

---

### ✅ 11. Do you prefer working alone or in teams?

📘 **Type:** Single Select

* Independently
* In a team
* Depends on the task
  ✏️ *“Depends on the task”*

---

### ✅ 12. Which of these best reflects your attitude towards your future?

📘 **Type:** Single Select

* I want to do what I love, no matter the risk
* I want something stable with a good income
* I want flexibility and work-life balance
  ✏️ *“I want something stable with a good income”*

---

### ✅ 13. What is your dream job (if any)?

📘 **Type:** Short Answer
✏️ *“Creative director at a game design company”*

---

### ✅ 14. Are there any careers or industries you’re sure you don’t want to explore?

📘 **Type:** Short Answer
✏️ *“Healthcare, anything involving blood.”*

---

### ✅ 15. Which subjects are you currently considering for VCE?

📘 **Type:** Multiple Select + *“Other” field*

Arts

Art Creative Practice 
Art Making and Exhibiting 
Dance 
Drama 
Media 
Music Composition 
Music Contemporary Performance 
Music Inquiry 
Music Repertoire Performance 
Theatre Studies 
Visual Communication Design 
Business and Economics

Accounting 
Business Management 
Economics 
Industry and Enterprise 
Legal Studies 
English

English 
English as an Additional Language 
English Language 
Literature 
Health and Physical Education

Health and Human Development 
Outdoor and Environmental Studies 
Physical Education 
Humanities

Classical Studies 
Geography 
Ancient History 
Australian History 
History: Revolutions 
Philosophy 
Australian Politics 
Global Politics 
Religion and Society 
Sociology 
Texts and Traditions 
Languages

Aboriginal Languages 
Arabic 
Armenian 
Auslan 
Bengali 
Bosnian 
Chin Hakha 
Chinese First Language 
Chinese Language, Culture and Society 
Chinese Second Language Advanced 
Chinese Second Language 
Classical Greek 
Classical Hebrew 
Croatian 
Dutch 
Filipino 
French 
German 
Greek 
Hebrew 
Hindi 
Hungarian 
Indigenous Languages 
Indonesian First Language 
Indonesian Second Language 
Italian 
Japanese First Language 
Japanese Second Language 
Karen 
Khmer 
Korean First Language 
Korean Second Language 
Latin 
Macedonian 
Persian 
Polish 
Portuguese 
Punjabi 
Romanian 
Russian 
Serbian 
Sinhala 
Spanish 
Swedish 
Tamil 
Turkish 
Vietnamese First Language 
Vietnamese Second Language 
Yiddish 
Mathematics

Foundation Mathematics 
General Mathematics 
Mathematical Methods 
Specialist Mathematics 
Sciences

Biology 
Chemistry 
Environmental Science 
Physics 
Psychology 
Technologies

Agricultural & Horticultural Studies 
Algorithmics (HESS) 
Applied Computing: Data Analytics 
Applied Computing: Software Development 
Food Studies 
Product Design and Technologies 
Systems Engineering 
Other

Extended Investigation 
VCE VET Subjects

VCE VET Business 
VCE VET Community Services 
VCE VET Creative and Digital Media 
VCE VET Dance 
VCE VET Engineering Studies 
VCE VET Equine Studies 
VCE VET Furnishing 
VCE VET Health Services 
VCE VET Hospitality 
VCE VET Hospitality (Cookery) 
VCE VET Information Technology 
VCE VET Integrated Technologies 
VCE VET Laboratory Skills 
VCE VET Music Performance 
VCE VET Music Sound Production 
VCE VET Sport and Recreation
✏️ *"English Language, Biology, Chemistry, Legal Studies"*

---

### ✅ 16. Who influences your subject/career decisions the most?

📘 **Type:** Single Select

* Parents
* Teachers
* Peers
* Career Advisor
* Online Resources
* Social Media / Influencers
* Yourself
  ✏️ *“Myself and my parents equally”*

---

### ✅ 17. How much do you know about university prerequisites or job requirements?

📘 **Type:** Spectrum (0 = No knowledge, 10 = Expert-level)
✏️ *“4 – I’ve read VTAC info but it’s still confusing”*

---

### ✅ 18. How comfortable are you with uncertainty about your future career?

📘 **Type:** Spectrum (0 = Not comfortable at all, 10 = Very comfortable)
✏️ *“3 – I get nervous if I don’t have a plan”*

---

### ✅ 19. If you could solve one global or local problem, what would it be?

📘 **Type:** Short Answer
✏️ *“Improving education access in low-income communities”*

---

### ✅ 20. What three words would your friends use to describe you?

📘 **Type:** Short Answer
✏️ *“Driven, creative, helpful”*

---

### ✅ 21. What are your main hobbies, extracurriculars or part-time jobs?

📘 **Type:** Short Answer
✏️ *“Volunteering, photography, tutoring younger students”*

---

### ✅ 22. Do you see yourself starting a business or freelancing someday?

📘 **Type:** Single Select

* Yes
* No
* Maybe
  ✏️ *“Maybe, if I feel confident enough”*

---

### ✅ 23. Are there specific industries that fascinate you?

📘 **Type:** Multiple Select + *“Other” field*

* Tech
* Healthcare
* Education
* Business/Finance
* Arts & Media
* Construction/Trades
* Science & Research
* *Other: \[\_\_\_\_\_\_\_\_]*
  ✏️ *“Tech and Education”*

---

### ✅ 24. What is your preferred method of learning?

📘 **Type:** Single Select

* Visual (images, diagrams)
* Auditory (lectures, audio)
* Reading/writing
* Kinesthetic (hands-on)
  ✏️ *“Kinesthetic and visual”*

---

### ✅ 25. Do you care more about doing what you love or earning a high salary?

📘 **Type:** Spectrum (0 = All Passion, 10 = All Salary)
✏️ *5 – “I want a balance between income and passion”*

---

Lead to 5 followup questions in various answering styles


## 🔁 **User Flow Master Prompt for Cursor**



---

## 👤 **A. New Student User Flow**

> The following steps represent the journey of a **first-time student user** who has not signed up before:

1. **Homepage (`/`)**

   * Call-to-action buttons: "Take the Quiz", "Login", and "Sign Up"
   * User clicks **Sign Up**

2. **Signup Page (`/signup`)**

   * User registers with email/password via clerk authentication
   * System auto-creates a new student profile and redirects to dashboard

3. **Dashboard Page (`/dashboard`)**

   * Prompt user to **take the Career Quiz** if no quiz data exists

4. **Career Quiz Page (`/quiz`)**

   * First section: Fixed set of predefined questions (multiple choice, sliders, etc.)
   * After submission: Query Gemini AI API to generate a **personalised second set of questions**
   * User completes second set and submits

5. **Career Report Page (`/quiz/results`)**

   * Displays:

     * Career suggestions (from Gemini AI)
     * Matching subjects
     * Recommended university courses with prerequisites
     * Job market data (salary, growth rate)
     * Study strategies
     * A **Download Career Report** button
   * Option to **save the result** to preferences (`/preferences`)

6. **Further Suggestions Page (`/suggestions`)**

   * Explore more:

     * Careers and university courses
     * Related subjects and fallback career options
     * Resume and interview tips
     * Useful external links
     * Optional: Bookmark or favorite items

7. **Subject Descriptions Page (`/subjects`)**

   * Browse full list of VCE subjects
   * Each subject shows:

     * Description
     * Scaling
     * Career relevance
     * Linked resources

8. **Resources Page (`/suggestions`)**

   * Student accesses curated resources filtered by tags:

     * Study, Careers, Time Management, Mental Health, etc.
   * Can mark as saved or share

9. **Saved Preferences Page (`/preferences`)**

   * View and reload saved quizzes, subject configurations, or career report sessions

10. **Log Out / Re-login (`/login`)**

    * On return, user is taken to dashboard with access to previous data

---

## 🔁 **B. Returning Student Flow**

> A student who has previously logged in and completed the quiz:

1. **Login Page (`/login`)**

   * Firebase auth verifies credentials

2. **Dashboard Page**

   * System checks:

     * If quiz submitted → Offer option to retake
     * If saved preferences exist → Offer to reload
     * Highlight links to **Report**, **Subjects**, **Suggestions**, **Resources**

3. **Can directly jump to:**

   * `/quiz/results` to view most recent career report
   * `/preferences` to reload older quiz setups
   * `/subjects` to browse subject details again
   * `/suggestions` to see updated career/further resource suggestions





