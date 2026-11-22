<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- Research notes written by an AI agent from web sources. Several sources were read as abstracts or search summaries only; the references mark which. Treat as a starting point, not as verified literature review. -->

# Calm terminal spinner: evidence and design guidance

Scope: the `calm` skin of the spinner-skins Claude Code mod, plus its settings (`fps`, `reducedMotion`, `showInfo`, light/dark palette). Written for ADHD and autism spectrum users and anyone sensitive to busy motion. This is design research, not medical advice.

Evidence tags used below:
- **[STRONG]** replicated or meta-analytic, or a binding safety threshold.
- **[WEAK/MIXED]** small studies, inconsistent results, or lab results of unclear transfer.
- **[GUIDANCE]** expert guidance or opinion, no direct test.
- **[JUDGMENT]** my own design call, no direct evidence.

## Summary

1. Flicker safety is the one area with hard numbers: at most 3 flashes per second, with luminance and area limits (refs 2, 7). The current `calm` skin never alternates dark and bright, so it should pass in principle. It has not been run through a flash analyser.
2. Autistic sensory over-responsivity is a large, well-replicated finding (ref 9). Visual motion sensitivity in particular is not directly quantified by anything I found. Autism and ADHD are both heterogeneous, so user control matters more than any default.
3. Attention research says the onset of motion captures attention more than continuous motion does (ref 17). Slow, continuous, onset-free motion is therefore the right shape for an ambient display. Direct tests on terminal animations do not exist.
4. Evidence that watching calm visuals lowers stress is thin. Slow breathing raises HRV (ref 20, strong for the physiology) and has small-to-medium effects on stress (ref 21, moderate bias risk), but those effects come from actively pacing your own breath, not from watching a pacing animation. Nature-video and blue/green-hue effects are weak and mixed (refs 22-25).
5. Bug-level finding: the `calm` timings are measured in frames (`t`), so they scale with `fps`. At the default 12 fps the breath cycle is 17.5 s and the main drift is 26 s. At 30 fps they become 7.0 s and 10.5 s (about 8.6 breaths per minute), which breaks the "calm" promise. The cycle should be driven by wall-clock time.
6. For status text, guidance converges on: stable layout, no shifting text, no urgency colours, honest uncertainty, user-controllable (refs 4, 27, 28, 30). It is expert guidance and participatory work, not experiments.
7. Weakest area: no autistic-led or ADHD-specific study of ambient terminal or progress animations. I found none. All recommendations transfer from adjacent web, lab or environment studies.

## 1. Sensory and visual sensitivity

**Photosensitivity (flicker) [STRONG as safety thresholds, from regulators and WCAG]**
- WCAG SC 2.3.1 passes content with no more than 3 general or red flashes in any 1-second period, or flashes below an area threshold of 0.006 steradians within any 10 degree field (about 25% of a 341 x 256 px block). A general flash is a pair of opposing luminance changes of at least 10% of maximum, where the darker state is below 0.80 relative luminance (ref 2).
- An independent 2024 gap analysis of international guidelines confirms the 3-per-second cap (Japan allows 5 for moderate changes), a 25% screen area in most guidelines, and a 20 cd/m2 change when the darker state is under 160 cd/m2 (ref 7). It notes gaps: nothing defines how long a transition may take, and nothing gives actionable guidance on when smooth motion is perceived as flicker. It proposes working values of 66 ms for flash duration and 20 ms for synchronicity. These are proposals, not standards.
- Pattern limits exist for stripes. The 2005 expert consensus, as summarised in refs 7 and by a search summary I could not verify at source, allows about 5 light/dark stripe pairs if they change direction, flash or reverse, and more if they drift smoothly in one direction. Smooth one-direction motion is exempt in ISO and Ofcom (ref 7). The `calm` rows are horizontal bands with a drift of mixed direction (two sine terms), so keep contrast between bands low (see section 5).
- Photosensitivity is not the same as general sensory over-responsivity. Flash limits protect against seizure risk. They say nothing about comfort for people who are bothered by lower-level motion.

**Autistic sensory over-responsivity [STRONG that it exists; WEAK on visual motion specifics]**
- A meta-analysis of 55 questionnaire studies (4606 autistic people) found large, significant sensory over-responsivity (SOR) compared with typical controls. The effect was heterogeneous. SOR was the most consistently atypical of the three patterns (ref 9). These are questionnaire studies, so they show prevalence of reported sensitivity, not which stimuli trigger it.
- A meta-analysis of 48 articles found a small global motion-perception deficit in autism (ref 10). That is about task performance, not comfort, so it does not show that motion is aversive. I found no systematic review that tests visual motion sensitivity as a component of SOR.
- Participatory work with 24 autistic adults identified six principles that make environments disabling or enabling: sensoryscape, space, predictability, understanding, adjustments and recovery (ref 30). It was about physical public places, not screens. Predictability and the chance to adjust and recover carry over by analogy [WEAK transfer].

**ADHD [WEAK/MIXED]**
- I found no study on ADHD and ambient screen motion. The "moderate brain arousal" model predicts people with ADHD may need more background stimulation, not less, for best performance (ref 26). The supporting study used auditory white noise in children and is small. It also predicts the opposite effect for controls. Treat this as a reason to avoid assuming "calmer is always better" for ADHD users, not as evidence for any visual design.

**Contrast and colour [WEAK/MIXED; guidance conflicts]**
- WCAG 1.4.3 requires 4.5:1 for text (3:1 large) and exempts pure decoration. The Understanding page itself notes that some people with cognitive disabilities need low-contrast combinations and allows that if there is a way back to the required values (ref 5). WCAG says nothing about saturation or brightness being too high.
- A mixed-methods study on web design for autistic people, which I could only see through a search snippet (not read in full), reportedly argues that WCAG 1.4.3/1.4.6 contrast can conflict with stimulus sensitivity and that no criterion covers saturation or brightness (ref 32, unverified).
- Colour-emotion research: in a 62-person study, arousal rose with saturation and brightness, and also rose from blue and green to red, with hue effects depending on saturation (ref 25). In a 60-person VR study, darker rooms gave higher arousal irrespective of hue, and red versus blue differences appeared only for some lightness and saturation combinations (ref 24). Takeaway: lightness and saturation matter at least as much as hue, and results are patchy.

**Pause, stop, hide and reduced motion [GUIDANCE, but widely accepted]**
- SC 2.2.2 (Level A): moving content that starts automatically, lasts more than 5 seconds and sits alongside other content needs a way to pause, stop or hide it. A loading animation shown alone is exempt. The 5 seconds is described as "long enough to get a user's attention, but not so long that a user cannot wait out the distraction" (ref 1). A terminal spinner runs next to the transcript, so by analogy the rule applies. WCAG is a web standard and does not bind a terminal mod. I am using it as a benchmark.
- SC 2.3.3 (AAA) says non-essential motion triggered by interaction should be disableable, and notes vestibular reactions such as dizziness and nausea (ref 3). It excludes colour and opacity changes from "motion", which is a useful hint: fades are less risky than movement.
- `prefers-reduced-motion` is the web convention: users ask for non-essential motion to be removed, reduced or replaced. MDN's example replaces a scaling pulse with a slow opacity dissolve and says scaling and panning of large objects are vestibular triggers (ref 6). A terminal has no such OS signal here, so the `reducedMotion` setting is the equivalent.
- COGA (W3C cognitive accessibility guidance) lists "I need to turn distractions off easily" (user story 3.5.1) and the patterns "Let Users Control When the Content Moves or Changes" and "Ensure Controls and Content Do Not Move Unexpectedly" (ref 4). My fetch showed only the headings for the patterns, not their body text.

## 2. Attention, waiting and perceived time

**Response-time limits [GUIDANCE, long-standing and widely cited]**
- 0.1 s feels instantaneous, 1 s keeps the train of thought, 10 s is the limit for keeping attention. Above about 10 s, show progress. A busy cursor with a changing number can suffice for 2-10 s (ref 13). Agent turns run seconds to minutes, so they are all in the "tell me it is alive" zone.

**Determinate vs indeterminate progress [WEAK/MIXED]**
- Myers (CHI 1985) reportedly found that people preferred percent-done bars (86% in one summary) and tolerated inaccurate bars better than none (ref 14). I could not read the PDF (scanned) and have only secondary summaries, so the numbers are unverified.
- Speed illusions: a 2022 lab study with 5-second bars found constant and speed-up bars were judged shortest, and bars judged slower coincided with higher cognitive load (ref 16). Harrison et al. 2010 tested visual augmentations of bars for perceived duration (ref 15). Their project page gave no numbers, so I do not quote any.
- Implication: these illusions apply to determinate bars over short waits. An agent turn has unknown length, so any fill that implies "x% done" would be dishonest. The `calm` skin correctly avoids a progress bar.

**Time perception in ADHD [STRONG for existence, WEAK for design use]**
- A meta-analysis of 55 studies found broad timing deficits in ADHD: discrimination of very brief durations, more variable estimates of multi-second durations, accuracy deficits suggesting an accelerated internal clock, and in reproduction tasks, distraction-related slow counting at short intervals and delay-aversion-related fast counting at long intervals (ref 11).
- A review of adult studies (only nine, 2012-2022) found most showed problems with time estimation, reproduction and management, but results were mixed and instruments are not standardised (ref 12).
- Implication [JUDGMENT]: an external elapsed-time readout may help people who misjudge durations. Delay aversion also suggests long waits with no feedback feel worse. Neither is tested for terminal spinners, and an always-visible ticking clock could also raise time pressure. Hence make it optional.
- I found one preprint on time perception and sensory features in autism that says findings are inconsistent (ref 33). Not peer reviewed, so I cite it only for "inconsistent".

**Attention capture [STRONG in lab, WEAK transfer]**
- The onset of motion captures attention. In Abrams and Christ's experiments, objects that had just started moving gained an attentional advantage, whereas simply moving objects among static ones did not (ref 17). A later replication used isoluminant stimuli and found the same pattern (not read in full; abstract via search only).
- Implication: for an ambient display, avoid sudden starts, stops or changes of direction and avoid items popping in. Continuous slow motion is less capturing than onsets. That finding is from letter-search tasks, not terminals.

**Interruption and resumption [WEAK/MIXED transfer]**
- In a CHI 2008 experiment, interrupted work was finished faster with no quality loss but with more stress, frustration, time pressure and effort. Individual differences predicted costs (ref 18). Resumption lag after an interruption was about 4 seconds in the Altmann and Trafton experiments, reduced by cues (ref 19, seen only through search summaries).
- Implication: anything that pulls the eyes away from the user's own task is a small interruption with a price. An ambient animation should be a place you can glance at, not one that calls you. These studies involve people interrupting each other, not a screen element.

## 3. Calming design: how strong is the evidence?

**Slow breathing, around 6 breaths per minute**
- Voluntary slow breathing raises vagally mediated HRV. A systematic review and meta-analysis of 223 studies found increases during a session, immediately after one session and after multi-session interventions (ref 20) [STRONG for the physiological measure; HRV is a proxy, not wellbeing].
- A meta-analysis of 12 RCTs (785 adults) found breathwork gave a small-to-medium reduction in self-reported stress, g = -0.35 (95% CI -0.55 to -0.14), with most studies at moderate risk of bias. The authors warn against a "miscalibration between hype and evidence" (ref 21) [WEAK-to-MODERATE].
- Key gap: these studies are about people who actively breathe at a set pace. I found no study showing that watching a pacing animation, with the user breathing normally, reduces stress. The `calm` "breath" is a swell of the water level and is not a pacer. Do not market it as breathing guidance.

**Nature scenes and slow-motion nature on screens**
- A systematic review of 37 indoor experiments found most studies using photos, VR or video of natural scenery showed more relaxed body responses than controls (ref 22). It is a narrative synthesis of heterogeneous studies.
- A preregistered RCT (n = 164) found participants rated nature videos as more restorative, but no significant stress benefit on cortisol, heart rate, HRV or self-reported stress. Small-to-moderate effects could not be ruled out (ref 23) [MIXED: perceived restoration is consistent, physiological effect is not].
- Slow, abstract water is not natural video. No evidence tests abstract block-character water.

**Blue and green hues**
- Colour studies show lightness and saturation drive arousal at least as much as hue (refs 24, 25). Popular claims that blue/green is "proven calming" are not supported by effect sizes I could find. Muted, low-saturation, mid-lightness colours are the more defensible reason for the current palette [WEAK].

**Net judgment:** the calm skin's design is well-motivated as low-stimulation, not as therapeutic. Safe claim: "designed to be low-stimulation". Unsupported claim: "calming" or "reduces stress".

## 4. Information design for low load

**Calm technology [GUIDANCE]**
- Weiser and Brown (1995) define the goal as technology that moves easily from the periphery of attention to the center and back. The periphery informs without overburdening, and moving to the center lets us act (ref 27). Their example, the "Dangling String", is a plastic cord whose twitching shows network traffic (ref 27). They also state that information technology is more often the enemy of calm (ref 27).
- Amber Case's eight principles, from her 2015 book as excerpted in 2016, include: require the smallest possible amount of attention, make use of the periphery, communicate without needing to speak, work even when it fails, and use the minimum technology needed (ref 28). These are principles from one practitioner, not tested rules.

**Predictable layout and control [GUIDANCE]**
- COGA: "Controls and content do not move unexpectedly as I am using them" (user story 3.1.2); "I need rapid feedback or visual cues to show when an event is successfully triggered" (3.7.2); show completed, current and pending steps (4.2.4) (ref 4). Also "Make Each Step Clear". There is no pending-step data in an agent turn, so the last one is not applicable.
- Participatory autism research stresses predictability, structure and the ability to adjust (refs 30, 31). Ref 31 (18 studies) says the design process itself should feel safe and predictable. It is about how to involve autistic people in design, not about interface rules.
- Second-hand reports (not verified) say autistic participants accepted animations when they had a clear function (ref 32 context, search summary only).

**What follows for the dashboard [JUDGMENT, built on the above]**
- Fixed column widths for numbers so digits never shift the layout.
- Slow, quantised updates (elapsed time per second is fine; cost to the cent, not live fractions).
- No colour change for "high" values; redundancy by text and position, not hue.
- Say "unknown" when unknown (`?`) and label cost as an estimate (the README already says it is one).

## Recommendations (ranked)

| # | Recommendation | Rationale | Evidence strength | Refs |
|---|----------------|-----------|-------------------|------|
| 1 | Drive all `calm` phases from wall-clock seconds, not frame count. Keep breath-like cycle at 10 s or longer and drift at 20 s or longer at every `fps`. | Today `fps=30` shortens the breath to 7.0 s and drift to 10.5 s; `fps=6` stretches them to 35 s and 52 s. Speed should not depend on a performance setting. Cycle length of 10 s is the 6 per minute point; no study shows it matters for passive viewing. | [JUDGMENT] on values; [STRONG] that motion salience drives capture | 11, 17, 20, 21 |
| 2 | Make `reducedMotion` and an off switch easy to reach (a single option and, ideally, a one-key or command toggle for a running session). Document it first in the README for `calm`. | SC 2.2.2: auto-starting motion over 5 s alongside other content needs pause/stop/hide. COGA wants distractions easy to turn off. Individual preference varies widely. | [GUIDANCE] | 1, 3, 4, 6 |
| 3 | Keep no flashing: no cell may alternate bright/dark faster than 3 per second, and never between very different luminances. Keep `fps` max at or below the default and avoid hard alternation at any `fps`. Run the skin through a flash/pattern analyser (for example the Harding-based tools mentioned in ref 7) before calling it safe. | Hard thresholds exist and are cheap to meet. Current design is smooth, but not verified. | [STRONG] | 2, 7 |
| 4 | No onsets: no abrupt appear or disappear, no direction reversals. Keep the end-of-turn "Settled" line as the single deliberate change. | Motion onset captures attention more than continuous motion. The end of a turn is the one event you do want noticed. | [STRONG] in lab; [WEAK] transfer | 17, 18 |
| 5 | Keep `showInfo` available but let users choose a quiet preset: elapsed time only, or no numbers. Do not tie it to colour. Consider making `calm` default to the smaller set (elapsed time, context %) and leave cost and last-tool lines opt-in. | Progress feedback reduces uncertainty (secondary evidence) and elapsed time may help time-estimation difficulty in ADHD. But ticking numbers and cost can add load or time pressure. Individual variation is the main thing known. | [WEAK/MIXED] | 11, 12, 13, 14, 28 |
| 6 | Fix widths in the dashboard so nothing shifts. Pad elapsed time, percent and cost to a stable width (for example `$ 0.41` to `$12.40`). Move to minutes after 60 s to reduce churn. | COGA: content should not move unexpectedly. A width jump at `$9.99` to `$10.00` or `9%` to `10%` is the kind of shift to avoid. The minutes cadence is a judgment call. | [GUIDANCE]; cadence [JUDGMENT] | 4, 28 |
| 7 | Keep depth as the context cue, but always give the number as text when `showInfo` is on. State uncertainty plainly: `ctx ?` and `~$` for estimates. Do not add alarm colours or blinking near the limit; keep the current "water just gets deeper". | The depth cue is spatial, so already non-colour. But animation-to-background contrast in the light palette is only 1.3:1 to 2.9:1 (computed from palette hex values against `#ffffff`), so the cue may not be visible to everyone, which makes the text the reliable channel. | [GUIDANCE] | 4, 5, 28 |
| 8 | Narrow the palette's contrast range and make light and dark equal. Light palette against white is 1.34 to 2.93:1; dark palette against `#1e1e1e` is 2.21 to 7.86:1 (computed). Step between adjacent shades is 1.27 to 1.58:1. Cap the brightest shade near 3:1 against the background in both sets. | Saturation and brightness drive arousal as much as hue. The dark palette's brightest shade is much more prominent than the light one's. 3:1 is the WCAG non-text benchmark, used here as a ceiling rather than a floor. The exact cap is a judgment call. | [WEAK] | 5, 24, 25, 32 |
| 9 | Recommended defaults: `fps` 6 for `calm`, since the motion is slow and low frame rates remove nothing visible. Test whether discrete cell steps at 6 fps look like ticking, and if so keep 8-12. | Lower fps lowers update churn and CPU, and helps over SSH. At very low fps, whole-cell steps can look jerky. Needs a user test. | [JUDGMENT] | 7 |
| 10 | Use no claim of calming or stress relief in the README. Say "low-stimulation" and "designed to be easy on busy or sensitive attention". | Passive viewing of abstract water has no direct evidence; nature-video physiology evidence is mixed. | [WEAK/MIXED] | 20-23 |
| 11 | Keep a heartbeat when `reducedMotion` is on: the dashboard updates once a second, which tells users the agent is alive. If `showInfo` is also off, show a very small, very slow indicator (for example one cell moving once every several seconds). | A fully still frame with no text cannot be told apart from a hang. Needs a user test. | [JUDGMENT] | 13, 27, 28 |
| 12 | Do not add a fake progress bar or "x% done" on the animation. | Turn length is unknown. Honesty about uncertainty. Speed illusions apply to determinate bars and are about manipulating perception. | [GUIDANCE] | 15, 16, 28 |

## Open questions and caveats

- **No direct evidence.** I found no study of ambient terminal animation, autistic-led or otherwise. Everything transfers from web, lab or physical-environment work.
- **Heterogeneity.** Autism and ADHD are both broad. Some people find slow motion soothing, some find any motion intrusive, and some ADHD users may want more stimulation (ref 26). User control and a documented still mode are the only defensible defaults.
- **Reading limits.** For several sources I read only the abstract (refs 9, 10, 11, 17, 18 beyond abstract, 20, 21, 22, 24, 25, 26, 30, 31) because the full text was blocked or a PDF would not parse. Ref 4 (COGA) was read only through headings for many patterns. Refs 14, 19 and 32 are known only through search summaries. They are marked in the reference list.
- **Not verified:** Wilkins, Emmett and Harding (2005) stripe-pattern limits, the 334 ms flash spacing and "five stripe pairs" are from secondary summaries (ref 7 and a search snippet), not from the original paper.
- **Terminal differences.** Terminal cells are large, fixed-grid and often small on screen; WCAG area and contrast rules were written for pages. Flash thresholds use pixel/visual-angle areas that I did not compute for this display. A test with a real analyser is needed.
- **Possible testing.** Cheap checks: (a) compute per-cell luminance change per frame and assert under 10% and under 3 transitions per second; (b) assert cycle durations are fps-independent; (c) assert dashboard line widths do not change across values; (d) a small user trial with a few autistic and ADHD users comparing `calm` at default, `fps=6` and still frame, asking about comfort and "did it pull my eyes".
- **No medical claims.** Nothing here shows the skin treats or relieves any condition.
- Fabrication check: Harrison et al. 2010 results and Myers 1985 figures are not used as numbers beyond what a summary reported and are marked unverified.

## References

Dates are the publication or access year as shown on the page. "Read" means I fetched and read the page or text; "abstract" means I read the abstract only (via the Europe PMC API or a publisher page); "snippet" means only a search-result summary.

1. W3C. *Understanding Success Criterion 2.2.2: Pause, Stop, Hide* (WCAG 2.2). https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html (read)
2. W3C. *Understanding Success Criterion 2.3.1: Three Flashes or Below Threshold* (WCAG 2.2). https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html (read)
3. W3C. *Understanding Success Criterion 2.3.3: Animation from Interactions* (WCAG 2.2). https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html (read)
4. W3C Cognitive and Learning Disabilities Accessibility Task Force. *Making Content Usable for People with Cognitive and Learning Disabilities* (COGA). https://www.w3.org/TR/coga-usable/ (read first 100,000 of about 470,000 characters; many pattern bodies not seen; year not confirmed)
5. W3C. *Understanding Success Criterion 1.4.3: Contrast (Minimum)* (WCAG 2.2). https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html (read)
6. MDN Web Docs. *prefers-reduced-motion*. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion (read)
7. Jordan, J. B., and Vanderheiden, G. C. (2024). *International Guidelines for Photosensitive Epilepsy: Gap Analysis and Recommendations.* ACM Transactions on Accessible Computing 17(3), 1-35. https://doi.org/10.1145/3694790 ; https://pmc.ncbi.nlm.nih.gov/articles/PMC11872230/ (read first 100,000 of about 188,000 characters)
8. (not used)
9. Ben-Sasson, A., Gal, E., Fluss, R., Katz-Zetler, N., and Cermak, S. A. (2019). *Update of a Meta-analysis of Sensory Symptoms in ASD: A New Decade of Research.* Journal of Autism and Developmental Disorders. https://doi.org/10.1007/s10803-019-04180-0 (abstract)
10. Van der Hallen, R., Manning, C., Evers, K., and Wagemans, J. (2019). *Global Motion Perception in Autism Spectrum Disorder: A Meta-Analysis.* Journal of Autism and Developmental Disorders. https://doi.org/10.1007/s10803-019-04194-8 (abstract)
11. Marx, I., Cortese, S., Koelch, M. G., and Hacker, T. (2022). *Meta-analysis: Altered Perceptual Timing Abilities in Attention-Deficit/Hyperactivity Disorder.* Journal of the American Academy of Child and Adolescent Psychiatry. https://doi.org/10.1016/j.jaac.2021.12.004 (abstract)
12. Mette, C. (2023). *Time Perception in Adult ADHD: Findings from a Decade - A Review.* International Journal of Environmental Research and Public Health 20(4), 3098. https://pmc.ncbi.nlm.nih.gov/articles/PMC9962130/ (read first 100,000 characters)
13. Nielsen, J. (1993; page includes a 2014 update). *Response Times: The 3 Important Limits* (from *Usability Engineering*). Nielsen Norman Group. https://www.nngroup.com/articles/response-times-3-important-limits/ (read)
14. Myers, B. A. (1985). *The importance of percent-done progress indicators for computer-human interfaces.* Proceedings of CHI '85, ACM, 11-17. https://www.cs.cmu.edu/~bam/papers/percentdoneCHI85.pdf (PDF was a scan I could not read; findings from search summaries only, unverified)
15. Harrison, C., Yeo, Z., and Hudson, S. E. (2010). *Faster Progress Bars: Manipulating Perceived Duration with Visual Augmentations.* Proceedings of CHI '10, ACM, 1545-1548. https://www.chrisharrison.net/index.php/Research/ProgressBars2 (project page read; no numeric results on it; the first author's name on that page is "Chris" and the second "Z. Yeo")
16. Wang, Q., Kang, X., and Rau, P.-L. P. (2022). *The Magic of Slow-to-Fast and Constant: Evaluating Time Perception of Progress Bars by Bayesian Model.* arXiv:2211.13909. https://arxiv.org/abs/2211.13909 (abstract; preprint)
17. Abrams, R. A., and Christ, S. E. (2003). *Motion onset captures attention.* Psychological Science 14(5). https://doi.org/10.1111/1467-9280.01458 (abstract). Related: Guo, R. M., Abrams, R. A., Moscovitch, M., and Pratt, J. (2010). *Isoluminant motion onset captures attention.* Attention, Perception, & Psychophysics. https://doi.org/10.3758/app.72.5.1311 (abstract)
18. Mark, G., Gudith, D., and Klocke, U. (2008). *The Cost of Interrupted Work: More Speed and Stress.* Proceedings of CHI 2008, ACM, 107-110. https://doi.org/10.1145/1357054.1357072 ; https://www.ics.uci.edu/~gmark/chi08-mark.pdf (read abstract and introduction)
19. Altmann, E. M., and Trafton, J. G. (2004). *Task Interruption: Resumption Lag and the Role of Cues.* Proceedings of the Cognitive Science Society. https://escholarship.org/content/qt18b4r661/qt18b4r661.pdf (snippet only; not opened)
20. Laborde, S., Allen, M. S., Borges, U., Dosseville, F., Hosang, T. J., Iskra, M., Mosley, E., Salvotti, C., Spolverato, L., Zammit, N., and Javelle, F. (2022). *Effects of voluntary slow breathing on heart rate and heart rate variability: A systematic review and a meta-analysis.* Neuroscience and Biobehavioral Reviews. https://doi.org/10.1016/j.neubiorev.2022.104711 (abstract)
21. Fincham, G. W., Strauss, C., Montero-Marin, J., and Cavanagh, K. (2023). *Effect of breathwork on stress and mental health: A meta-analysis of randomised-controlled trials.* Scientific Reports. https://doi.org/10.1038/s41598-022-27247-y (abstract)
22. Jo, H., Song, C., and Miyazaki, Y. (2019). *Physiological Benefits of Viewing Nature: A Systematic Review of Indoor Experiments.* International Journal of Environmental Research and Public Health. https://doi.org/10.3390/ijerph16234739 (abstract)
23. Steininger, M. O., Nitschke, J. P., Schenk, L., White, M. P., and Lamm, C. (2026). *Brief virtual nature exposure and acute stress: inconclusive evidence regarding stress reactivity, recovery, and emotion regulation.* Journal of Environmental Psychology 114. https://pmc.ncbi.nlm.nih.gov/articles/PMC7619404/ ; https://doi.org/10.1016/j.jenvp.2026.103181 (read abstract summary)
24. Weijs, M. L., Jonauskaite, D., Reutimann, R., Mohr, C., and Lenggenhager, B. (2023). *Effects of environmental colours in virtual reality: Physiological arousal affected by lightness and hue.* Royal Society Open Science. https://doi.org/10.1098/rsos.230432 (abstract)
25. Wilms, L., and Oberfeld, D. (2018). *Color and emotion: effects of hue, saturation, and brightness.* Psychological Research. https://doi.org/10.1007/s00426-017-0880-8 (abstract)
26. Soderlund, G., Sikstrom, S., and Smart, A. (2007). *Listen to the noise: noise is beneficial for cognitive performance in ADHD.* Journal of Child Psychology and Psychiatry. https://doi.org/10.1111/j.1469-7610.2007.01749.x (abstract; auditory noise only)
27. Weiser, M., and Brown, J. S. (1995). *Designing Calm Technology.* Xerox PARC, 21 December 1995. Read on a 2017 repost: https://www.karlstechnology.com/blog/designing-calm-technology/ (the fetch tool reported it as the full text, but I could not check it against the original)
28. Case, A. (2016). *Principles of Calm Technology* (O'Reilly Radar, 21 March 2016, excerpt from *Calm Technology: Principles and Patterns for Non-Intrusive Design*, O'Reilly Media, 2015). https://oreilly.com/content/principles-calm-technology-we-are-not-bad-at-technology-technology-is-bad-at-us (read)
29. (not used)
30. MacLennan, K., Woolley, C., Andsensory, E., Heasman, B., Starns, J., George, B., and Manning, C. (2023). *"It Is a Big Spider Web of Things": Sensory Experiences of Autistic Adults in Public Spaces.* Autism in Adulthood. https://doi.org/10.1089/aut.2022.0024 (abstract)
31. Maun, R., Fabri, M., and Trevorrow, P. (2024). *Participatory Methods to Engage Autistic People in the Design of Digital Technology: A Systematic Literature Review.* Journal of Autism and Developmental Disorders. https://doi.org/10.1007/s10803-023-06015-5 (abstract)
32. *Web Design for People on the Autism Spectrum: A Mixed-Methods Study on Digital Barriers.* ACM, https://doi.org/10.1145/3820253.3831390 (could not open: 403; authors, year and venue not retrieved; claims come from a search summary only and are unverified)
33. Atsumi, T., Ide, M., and Terao, Y. (2026). *The relationship between sensory features and time perception in autism spectrum disorders: A systematic review.* OSF preprint (not peer reviewed). https://doi.org/10.31234/osf.io/p4mdy (abstract)

Computed values (contrast ratios, cycle lengths at each fps) come from the palette hex codes and sine constants in `/var/home/goern/src/spinner-skins/hooks/skins.ts` (`calm` skin) using the WCAG relative luminance formula. Nothing in that repo was edited.
