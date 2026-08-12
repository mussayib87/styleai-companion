# StyleAI Companion

Build StyleAI — AI Personal Stylist & Smart Wardrobe Platform

Build a premium, production-quality AI fashion application called StyleAI.

StyleAI is not a normal fashion store and not simply a clothing recommendation chatbot. It is an AI personal stylist that understands the user's actual wardrobe, discovers outfit combinations, plans what the user should wear throughout the week, helps evaluate clothes before buying them, and eventually provides AI virtual try-on.

The central problem we are solving is:

People own many clothes but still struggle every day to decide what matches, what to wear for different occasions, and whether a new clothing item is worth buying.

The core promise is:

"Your wardrobe already has more outfits than you realize. StyleAI discovers them, plans them, and helps you decide what to wear or buy."

1. PRODUCT EXPERIENCE

The application should feel like a premium AI-powered personal stylist.

Use a modern, elegant, highly polished UI with:

Premium fashion aesthetic

Dark navy/black or sophisticated light/dark theme

Purple/violet AI accent

Large high-quality clothing imagery

Rounded cards

Smooth animations

Clean typography

Excellent spacing

Mobile-first responsive design

Desktop responsive dashboard

Modern icons

Clear CTA buttons

Beautiful empty states

Loading/skeleton states

Error states

Toast notifications

Bottom navigation on mobile

Sidebar navigation on desktop

Do NOT make it look like a generic admin dashboard.

It should feel like a real consumer AI product that could eventually be published as a startup.

2. MAIN NAVIGATION

Create:

Home

My Wardrobe

Outfit Planner

AI Stylist

AI Try-On

Shopping Assistant

Favorites

Calendar

Style Profile

Analytics

Settings

Mobile bottom navigation:

Home

Wardrobe

AI/Style

Planner

Profile

Include a central "+" action for quickly adding clothes.

3. ONBOARDING

Create a beautiful onboarding flow.

Step 1:

Welcome:

"Meet your personal AI stylist."

Explain:

"Upload your wardrobe and let AI discover outfits you never thought of."

Step 2:

Ask the user to optionally upload a clear personal photo.

Use this only for personalization and optional outfit visualization.

Do not rate the user's attractiveness or body.

Step 3:

Ask for style preferences:

Simple

Minimal

Trendy

Casual

Smart Casual

Formal

Streetwear

Classic

Allow multiple selections.

Step 4:

Ask preferred clothing fit:

Loose

Regular

Fitted

Step 5:

Ask preferred colors.

Step 6:

Ask common occasions:

College

Office

Interview

Casual

Party

Wedding

Travel

Date/event

Daily wear

Step 7:

Ask routine.

Example:

Monday-Friday: College

Saturday: Casual/social

Sunday: Relaxed

Allow the user to customize every day.

Step 8:

Ask notification preference:

"Would you like StyleAI to remind you what to wear every morning?"

Allow:

Yes

No

Custom time

4. HOME DASHBOARD

The Home screen should be the heart of the application.

At the top:

Good morning, [Name] 👋

Subtitle:

"Your AI stylist has planned your day."

Show:

TODAY'S OUTFIT

Example:

Wednesday • College

Display:

Blue shirt

Black jeans

White sneakers

Silver watch

Show a large outfit visualization/image.

Add:

92% Match

But treat this as an internal recommendation score, not an objective judgment about the user's appearance.

Add:

View Full Look

and:

Change Outfit

5. WHY THIS OUTFIT?

Create a card explaining the AI reasoning.

Example:

✓ Suitable for today's occasion

✓ Works with your selected style

✓ Appropriate for the selected weather

✓ You haven't worn this combination recently

✓ Uses clothes already available in your wardrobe

Do NOT say that the AI is judging whether the user's body looks good.

6. MY WARDROBE

Create a digital wardrobe.

Categories:

Shirts

T-Shirts

Pants

Jeans

Trousers

Shoes

Jackets

Dresses

Accessories

Other

Each category should show item count.

Example:

Shirts — 10

T-Shirts — 8

Pants — 10

Shoes — 4

Jackets — 2

Accessories — 8

7. ADD CLOTHES WITH CAMERA

This is one of the most important features.

The user should be able to:

Take Photo

or

Upload Photo

After uploading a clothing image, AI should analyze it.

Example result:

Category: Shirt

Color: White

Pattern: Solid

Style: Casual

Sleeve: Full

Fit: Regular

Allow the user to edit/correct the AI's detection before saving.

The AI should never assume its recognition is perfect.

Add:

Save to Wardrobe

8. BULK WARDROBE SCANNING

Allow users to upload multiple clothing photos.

Example:

User uploads:

10 shirts 10 pants 4 shoes 2 jackets

The AI organizes them automatically.

Show progress:

Analyzing your wardrobe...

Then:

26 items successfully added.

9. AI OUTFIT OPTIMIZER

This is the core AI engine.

If the user has:

10 shirts × 10 pants

there are 100 possible shirt-pant combinations.

Do NOT show all 100.

The AI should analyze and rank the strongest combinations.

Consider:

Color compatibility

Pattern compatibility

Style compatibility

Formality

Occasion

Weather

User preferences

Existing wardrobe

Shoes

Jackets

Accessories

Recently worn clothes

Laundry/availability

User likes/dislikes

Generate the best outfits.

Example:

#1 Best Match

White shirt + Dark blue jeans + White sneakers

Suitable for: College / Casual

#2

Black T-shirt + Beige trousers + Black sneakers

Suitable for: Casual / Evening

#3

Blue shirt + Black jeans + White sneakers

Suitable for: College / Smart Casual

10. COMPLETE OUTFIT GENERATION

Do not only match shirts and pants.

Build complete outfits:

Top + Bottom + Shoes + Accessories + Optional jacket

Example:

White shirt + Blue jeans + White sneakers + Watch

Add:

Save Outfit

Wear Today

Try Another

AI Try-On

11. "STYLE ME" FEATURE

Create a prominent AI button:

✨ Style Me

When clicked, ask:

"What are you dressing for?"

Options:

College

Office

Interview

Casual

Party

Wedding

Travel

Date/event

Daily wear

Then ask optional:

Weather Preferred style Color preference Fit preference

Then generate 3–5 outfits from the user's actual wardrobe.

12. WEEKLY AI OUTFIT PLANNER

This is one of the most important differentiating features.

The user can define their weekly schedule.

Example:

Monday — College Tuesday — College Wednesday — College Thursday — College Friday — College Saturday — Casual Sunday — Relaxed

AI generates a complete weekly outfit plan.

Example:

Monday: White shirt + blue jeans + sneakers

Tuesday: Black T-shirt + beige trousers + sneakers

Wednesday: Blue shirt + black jeans + white sneakers

Thursday: Green T-shirt + blue jeans + sneakers

Friday: Checked shirt + black jeans + sneakers

Saturday: Black T-shirt + beige trousers + denim jacket

Sunday: Relaxed T-shirt + jeans + sneakers

Avoid unnecessary repetition.

Take into account clothes already worn during the week.

Allow:

Regenerate Week

Change Day

Lock Outfit

Save Plan

13. DAILY OUTFIT NOTIFICATION

Create notification functionality.

Every morning:

👕 Today's outfit is ready.

Example:

Wednesday • College

Blue shirt + black jeans + white sneakers

Buttons:

View Outfit

Change Outfit

Mark as Worn

Notifications must be optional and controlled by the user.

14. WEATHER AWARENESS

Integrate a weather API later, but build the UI and service abstraction now.

Use weather as one factor.

Examples:

Hot: Prefer suitable lightweight clothing from the wardrobe.

Rain: Consider practical clothing and footwear.

Cold: Consider jackets/outerwear.

Do not make unsafe or medically oriented claims.

15. OUTFIT HISTORY

Track what the user wears.

Allow:

Mark as Worn

Store:

Outfit

Date

Occasion

Items used

The AI should use history to reduce unnecessary repetition.

Example:

If the user wore:

Blue shirt + black jeans

yesterday, do not automatically recommend exactly the same combination today unless the user requests it.

16. AI LEARNING FROM USER FEEDBACK

Every outfit should allow:

❤️ Like

❌ Not for me

⭐ Save

🔄 Try another

The AI should learn from these signals.

Example:

If the user repeatedly rejects formal clothing, future recommendations should become more casual.

If the user repeatedly likes neutral colors, increase relevant recommendations.

17. LAUNDRY / CLOTHING AVAILABILITY

Add a feature:

"In Laundry"

Users can mark items unavailable.

Example:

Black jeans → In Laundry

The AI must temporarily exclude them from outfit recommendations.

When available:

Mark as Available

This makes the weekly planner much more realistic.

18. AI SHOPPING ASSISTANT

Create a separate feature:

🛍️ AI Shopping Assistant

The problem:

A user sees clothing online and thinks:

"Should I buy this?"

The AI should help answer that.

The user can provide:

Product image

Product URL where technically and legally supported

Screenshot

Product information

The AI analyzes the item against the user's existing wardrobe.

Example:

Product: Black oversized shirt

AI:

Wardrobe Compatibility: HIGH

This product could create:

6 useful new combinations

Possible pairings:

Blue jeans

Beige trousers

Black jeans

White sneakers

Denim jacket

Also show:

Why consider it?

✓ Works with several existing items

✓ Matches your preferred style

✓ Adds new outfit combinations

Potential issue

You already own a similar black T-shirt.

Do not guarantee that the user will buy the product or claim a specific conversion increase without real user data.

19. "SHOULD I BUY THIS?" FEATURE

Create a dedicated CTA.

User uploads a product.

AI returns:

Compatibility: High / Medium / Low

New combinations: 6

Existing wardrobe overlap: Low / Medium / High

Style compatibility: High / Medium / Low

Occasion compatibility:

College Casual Party

Then:

See Outfit Combinations

Try AI Try-On

20. AI VIRTUAL TRY-ON

Create an AI Try-On section.

User:

Uploads/selects personal photo.

Selects clothing items.

AI generates an approximate visualization.

Flow:

Your Photo + Selected Outfit

AI Try-On Preview

The generated image should preserve the person's identity as much as technically possible.

Clearly label the result:

"AI-generated preview — actual fit and appearance may vary."

Do not present it as a guarantee of real-world fit.

21. AI STYLE PROFILE

Create a profile page showing:

Style preferences Preferred colors Fit preference Favorite outfits Frequently worn items Rejected styles Favorite occasions

Example:

Style: Minimal + Casual

Fit: Regular

Favorite colors: Black, White, Blue

Favorite occasion: College

22. FAVORITES

Allow users to save:

Clothing items

Outfits

Shopping products

Try-On looks

23. CALENDAR

Create a calendar showing:

Monday: College — Outfit A

Tuesday: College — Outfit B

Wednesday: College — Outfit C

etc.

Allow the user to manually replace an outfit.

24. ANALYTICS

Create useful wardrobe insights.

Examples:

Total wardrobe items: 34

Outfits discovered: 78

Most worn color: Blue

Most worn category: T-Shirts

Least used items: ...

Most versatile item: White shirt

Potential duplicate: Black T-shirt

Do not shame users for owning many clothes.

25. AI STYLIST CHAT

Create an AI chat interface.

The user can ask:

"Style me for college tomorrow."

"I wore my blue jeans yesterday."

"My black shirt is in laundry."

"I have an interview Friday."

"Give me three outfits with this jacket."

"I'm going out with friends tonight."

"Which pants work with this shirt?"

"Does this product fit my wardrobe?"

The AI should use the user's wardrobe database and preferences instead of giving generic fashion advice.

26. AI AGENT ARCHITECTURE

Do not make the AI merely return text.

The long-term architecture should be agent-like:

User request ↓ Understand intent ↓ Read user profile ↓ Read wardrobe ↓ Read schedule ↓ Read outfit history ↓ Read availability/laundry ↓ Read weather ↓ Analyze possible combinations ↓ Rank combinations ↓ Generate recommendation ↓ Save/update plan if requested ↓ Return result

Create clear service boundaries so these capabilities can be expanded later.

27. DATABASE

Use a clean relational database.

Suggested tables:

users profiles style_preferences wardrobe_items wardrobe_categories outfits outfit_items outfit_feedback wear_history weekly_plans daily_plans notifications shopping_items shopping_analyses try_on_requests favorites

Use proper relationships.

Do not store everything inside one giant JSON field.

28. SECURITY & PRIVACY

User photos and wardrobe information are private.

Implement:

Authentication

Row-level security

Private image storage

Secure API calls

Server-side secrets

Never expose AI API keys in frontend code

User-controlled deletion

Clear privacy controls

Do not store unnecessary personal information.

29. AI API ARCHITECTURE

Do not hard-code the application around one AI provider.

Create an abstraction such as:

AIService

with functions like:

analyzeClothingImage()

generateOutfits()

rankOutfits()

analyzeShoppingProduct()

generateTryOn()

chatWithStylist()

This allows the model/provider to be changed later without rewriting the whole application.

30. IMPORTANT: BUILD A REAL WORKING MVP

Do NOT generate only static mockups.

Implement real:

Authentication

Database

Image upload

Wardrobe CRUD

Clothing categories

Outfit generation interface

Weekly planner

Favorites

Feedback

User preferences

For AI features, create proper API/service boundaries and use environment variables for secrets.

If an AI API is not configured yet, provide a clear mock/demo mode so the UI can still be tested without breaking.

31. RESPONSIVE DESIGN

The application must work beautifully on:

Android phones

iPhones

Tablets

Desktop browsers

Mobile is the primary experience.

Make camera/upload actions extremely easy on mobile.

32. EMPTY STATES

Examples:

No wardrobe:

"Your wardrobe is empty."

"Add your first clothing item and let AI start styling you."

No weekly plan:

"Your week hasn't been planned yet."

Button:

Plan My Week

No favorites:

"Save outfits you love and find them here."

33. LOADING STATES

Examples:

"Analyzing your shirt..."

"Finding the best combinations..."

"Planning your week..."

"Checking your wardrobe..."

"Creating your AI preview..."

Use polished skeletons and progress animations.

34. ERROR HANDLING

Never show raw technical errors to the user.

Instead:

"We couldn't analyze that image. Try uploading a clearer photo."

or:

"Something went wrong while creating your outfit. Try again."

35. HOME SCREEN QUICK ACTIONS

Make these highly visible:

📸 Add Clothes

✨ Style Me

📅 Plan My Week

🪞 AI Try-On

🛍️ Should I Buy This?

36. DESIGN THE HOME DASHBOARD

The dashboard should contain:

Top: Good morning + notification + profile

Main: Today's Outfit

Side/card: Why this outfit?

Next: Weekly Plan

Next: Quick Actions

Next: My Wardrobe

Next: AI Outfit Ideas

Next: AI Shopping Assistant

Bottom: AI Try-On / See It On You

The overall design should feel premium, modern, intelligent, and visually exciting.

37. DEMO DATA

Create realistic demo data so the application looks complete immediately.

Example wardrobe:

10 shirts 8 T-shirts 10 pants 4 shoes 2 jackets 8 accessories

Generate demo outfits and a weekly schedule.

Use realistic clothing images/placeholders.

Do not use copyrighted brand assets unless appropriately licensed.

38. FINAL PRODUCT FLOW

The complete experience should be:

User signs up ↓ Creates style profile ↓ Uploads personal photo optionally ↓ Scans wardrobe ↓ AI understands clothing ↓ Wardrobe becomes digital ↓ AI discovers combinations ↓ User saves favorites ↓ User sets weekly routine ↓ AI plans 7 days ↓ Daily notification arrives ↓ User marks outfit as worn ↓ AI learns preferences ↓ User browses an online clothing product ↓ AI checks wardrobe compatibility ↓ User sees possible combinations ↓ User launches AI Try-On ↓ User can decide whether to buy ↓ New purchased item gets added to wardrobe ↓ AI discovers new combinations ↓ The system continuously becomes a more personalized AI stylist.

39. PRODUCT POSITIONING

Do not position StyleAI as:

"An AI that tells you whether you look good."

Position it as:

"Your wardrobe's AI brain."

It understands:

What you own + What you like + Where you're going + What you've already worn + What the weather is like + What you're considering buying

and turns that information into:

What you should wear next.

40. BUILDING PRIORITY

Build in this exact order:

Phase 1

Authentication → Profile → Wardrobe → Image upload → Clothing recognition

Phase 2

Outfit matching → Complete outfits → Save/favorite → Like/dislike

Phase 3

Weekly planner → Calendar → Wear history → Daily notifications

Phase 4

Weather → Laundry availability → Better personalization

Phase 5

Shopping Assistant → Product analysis → Wardrobe compatibility

Phase 6

AI Try-On

Phase 7

Advanced AI agent → Natural language commands → More intelligent planning → Continuous personalization

Do not attempt to implement every advanced AI capability before the core wardrobe and outfit system works.

FINAL INSTRUCTION

Build this as a real, scalable AI product, not a simple portfolio mockup.

Start with a polished frontend and working backend architecture.

Every major screen should be connected through real navigation and realistic state.

Use reusable components.

Keep AI providers replaceable.

Keep secrets server-side.

Make the application visually impressive but prioritize usability.

The final result should feel like a serious startup product that combines:

Digital Wardrobe + AI Outfit Optimizer + Personal Stylist + Weekly Outfit Planner + Daily Outfit Notifications + Weather Context + Shopping Assistant + Wardrobe Compatibility + AI Virtual Try-On.

The core user experience should always answer one question:

"What should I wear today?"

And the second major question:

"Should I buy this, and will it actually work with what I already own?"

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/005e2cf7-9c94-4481-9fd2-90acb34d6010).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
