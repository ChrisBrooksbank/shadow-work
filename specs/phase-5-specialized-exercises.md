# Phase 5: Specialized Exercises

## Overview

Enhanced features for exercises that need more than the basic step flow — trigger pattern analysis, dream journaling, and guided visualization flows.

## Requirements

- [ ] Trigger Tracking enhancements:
  - Structured input: situation, emotion, intensity (1-10), body location, shadow insight
  - Store in triggerLogs table
  - Pattern analysis: most common emotions, recurring situations, body location heatmap
  - "Your patterns" summary view accessible from exercise completion
- [ ] Dream Work enhancements:
  - DreamEntry storage in dreamEntries table
  - Figure tracking (recurring characters/archetypes)
  - Emotion tagging per dream
  - Analysis notes field
  - Dream journal list view
- [ ] Inner Child Work guided flow:
  - Visualization prompts (step-by-step guided imagery)
  - Letter writing step with save
- [ ] Active Imagination guided flow:
  - Meditation timer with ambient state
  - Freewrite recording after meditation
- [ ] Mirror Work guided flow:
  - Prompted self-confrontation sequence
  - Timed holds with prompts
- [ ] Safety disclaimers and grounding techniques (safety.ts):
  - Pre-exercise safety check for deep/abyss exercises
  - Grounding technique accessible during any exercise
  - Crisis resources link in settings

## Acceptance Criteria

- [ ] Trigger tracking shows pattern analysis after 3+ entries
- [ ] Dream entries store figures and emotions separately
- [ ] All 5 specialized flows complete without errors
- [ ] Safety/grounding is accessible mid-exercise
- [ ] Grounding technique actually helps (breathing exercise or 5-4-3-2-1 sensory)

## Out of Scope

- AI-powered dream interpretation
- Therapist referral system
