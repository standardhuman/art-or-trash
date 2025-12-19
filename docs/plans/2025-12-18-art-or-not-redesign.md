# Art or Not? Redesign

**Date:** 2025-12-18
**Status:** Approved

---

## Overview

Transform "Art or Not?" from a "guess if it's museum art" game into a **community-driven art tribunal** where users submit photos and the crowd decides what counts as art.

### Core Premise

There is no "correct answer." The question "What is art?" is answered collectively by human judgment. Users submit photos of things in the gray zone—dumpster finds that look beautiful, museum pieces that seem absurd, everyday objects with unexpected aesthetics—and the community votes.

---

## User Experience

### Voting Flow

1. User sees an image (seeded museum content or user submission, indistinguishable)
2. Swipe to vote:
   - **Right** = Art
   - **Left** = Trash (Not Art)
   - **Up** = Confidently Art
   - **Down** = Confidently Trash
3. Tap buttons also available for discoverability
4. See verdict with crowd percentages and tone-matched copy

### Verdict Display

Copy tone escalates with conviction level:

| Vote Margin | Tone | Example |
|-------------|------|---------|
| 45-55% (Deadlocked) | Dry, formal | "The tribunal remains divided." |
| 56-70% (Leaning) | Measured | "A modest majority has ruled: art." |
| 71-85% (Clear) | Confident | "The verdict is in: definitively trash." |
| 86-95% (Landslide) | Emphatic | "The people have spoken with conviction: garbage." |
| 96%+ (Unanimous) | Absurdist | "Humanity has spoken with devastating clarity: this is trash." |

Each tier has 5-10 copy variants to avoid repetition.

---

## Gamification

### Confidence-Based Streaks

Streaks reward *reading the room*, not agreeing with the majority.

- **Confident swipe + landslide result** = streak continues
- **Confident swipe + close vote** = streak breaks ("You thought this was obvious. Humanity disagreed.")
- **Neutral swipe + close vote** = streak continues ("You called it—this one was divisive.")

### Personal Stats Dashboard

Three sections:

1. **Taste Profile**
   "You're 34% more likely to call things art than average. Classification: Generous Critic."

2. **Prediction Calibration**
   "You've correctly read the room 71% of the time. Current streak: 8. Best streak: 23."

3. **Submission Performance** (for uploaders)
   "Your submissions average 67% art votes. Most controversial: 52/48 split."

### Leaderboard

Single weekly leaderboard ranking prediction accuracy weighted by volume. You need both skill and participation to climb.

---

## User Accounts

| Action | Account Required? |
|--------|-------------------|
| Vote | No (anonymous) |
| Track local stats | No |
| Save stats across devices | Yes |
| Appear on leaderboard | Yes |
| Submit images | Yes |

Lightweight signup: email or social auth. No friction for casual voters.

---

## Submission System

### Upload Flow

1. Tap "Submit" (must be signed in)
2. Select or capture photo
3. **Required:** Declare "I think this is Art" or "I think this is Trash"
4. Optional crop/adjust
5. Automated screening (NSFW, quality)
6. Submission enters the voting pool

### Community Moderation

- New submissions blend invisibly into the main feed—no "pending" tags
- Items need ~20-50 votes to "graduate" to established status
- Graduated images carry more weight in overall stats

### Content Moderation

Layered defense:

1. **Automated screening on upload** - NSFW detection, basic quality checks
2. **User reports** - Flag icon after voting; 3 reports triggers review
3. **Suspicious pattern detection** - Unusual voting patterns trigger review

### Submitter Feedback

After graduation: "Your submission received its verdict: 73% called it art. You predicted art. The crowd agrees."

---

## Visual Design

### Aesthetic: Elevated Playful

- **Background:** Gallery white (#fafafa)
- **Typography:** Elegant serif for headlines (GT Sectra/Playfair), clean sans-serif for UI (Inter)
- **Color palette:** Mostly monochromatic, strategic accent colors for feedback
- **Spacing:** Generous white space, museum-like breathing room

### Core Voting Screen

```
┌─────────────────────────────────┐
│                                 │
│         [streak: 8]             │
│                                 │
│   ┌───────────────────────────┐ │
│   │                           │ │
│   │                           │ │
│   │          IMAGE            │ │
│   │                           │ │
│   │                           │ │
│   └───────────────────────────┘ │
│                                 │
│      ← swipe or tap →           │
│                                 │
│     [TRASH]        [ART]        │
│                                 │
└─────────────────────────────────┘
```

### Micro-interactions

- **Swipe right:** Image slides off with subtle golden glow
- **Swipe left:** Image fades with gentle desaturation
- **Confident swipes:** More dramatic animation + haptic feedback (mobile)
- **Verdict reveal:** Elegant fade-in, typography matches tone

### Buttons

Understated outlined style by default. Visible for discoverability, but swiping is the primary interaction.

---

## Navigation

### Bottom Nav (mobile) / Top Nav (desktop)

```
[Vote]   [Leaderboard]   [Profile]   [Submit]
```

- **Vote** - Main feed (default landing)
- **Leaderboard** - Weekly rankings, your position highlighted
- **Profile** - Stats dashboard, taste profile, submission history, settings
- **Submit** - Upload flow (prompts login if needed)

### Post-Vote Options

After verdict reveal:
- Share icon (share image + verdict)
- Flag icon (report)
- Swipe/tap anywhere to advance

### First-Time Experience

Brief coach marks showing swipe gestures. 3 screens max, skippable.

---

## Seeded Content

Existing scraped museum images (Met, Rijksmuseum, Art Institute of Chicago) and "trash" photos become seed content. They're treated exactly like user submissions—no special status, no "correct answer."

Over time, user submissions become the primary content source.

---

## Technical Considerations

### New Data Requirements

- User accounts (email, social auth)
- Confidence votes (vote + confidence level)
- Streak tracking per user
- Submission metadata (submitter prediction, graduation status)
- Weekly leaderboard snapshots

### APIs to Add/Modify

- Auth endpoints (signup, login, social auth)
- Confidence vote endpoint (extends current vote)
- User stats endpoint
- Leaderboard endpoint
- Submission endpoint with image upload
- Moderation queue endpoints

### Third-Party Services

- Image moderation API (AWS Rekognition or similar)
- Image hosting/CDN for user uploads
- Auth provider (Supabase Auth already in use)

---

## Open Questions

1. Exact vote threshold for submission graduation?
2. Weekly leaderboard reset timing (Sunday midnight? Monday?)?
3. Specific font choices within the serif/sans-serif families?
4. Share functionality—which platforms to support?

---

## Success Metrics

- Daily active voters
- Submission rate (uploads per day)
- Account creation conversion rate
- Average votes per session
- Leaderboard engagement (% of users who check it)
