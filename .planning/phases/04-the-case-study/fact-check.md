# Fact-check — the D-19 accuracy gate

Audit of every quotation and every number in `content/the-chart-therefore-changes.mdx` (EN) and
`content/die-darstellung-aendert-sich.mdx` (DE) against the Plan 01 live-text snapshots, the
methodology page, and `ARTICLE_PLAN.md` (the one licensed non-live source, for the abandoned
thesis material in beat 2).

**Method.** A throwaway Node probe (`probe.mjs`, scratchpad, not committed) mechanically extracted
every straight-double-quoted span from the EN file and every „…“-guillemet span from the DE file,
plus the pivot blockquote in each, and ran `.includes()` against the concatenated live-text
snapshot for that language. Every numeral not already covered by an extracted quotation was then
traced by hand against the live pages, `en-methodology.txt` / `de-methodology.txt`, or
`ARTICLE_PLAN.md`, with the clause around each number carried into the claim column so the number
is not judged out of context. Figure captions were checked against the sources they name.

**Result columns.** `MATCHED` — the string appears verbatim in the named live-text snapshot; the
only acceptable result for anything the piece presents as a quotation. `PARAPHRASE` — the claim
faithfully restates a source sentence and is not presented as a quotation; the source sentence is
recorded so the reader can judge the restatement. The third possible result — no source found —
is disallowed by the plan and does not occur below: **every claim in both files traces to a named
source.**

---

## Table A — The twelve named trap checks

Each is its own row because each is a specific, previously-identified failure mode that a casual
read would not catch.

| # | Check | EN result | DE result |
|---|-------|-----------|-----------|
| 1 | `International Baccalaureate` appears in neither file (the disqualifying error; IB here means Illes Balears, never the diploma programme). | Absent — `grep -c` returns 0. | Absent — `grep -c` returns 0. |
| 2 | The measure is EU-27; the string `EU-15` appears nowhere, the draft `act2.md` script notwithstanding. | `EU-27` used at lines 45, 52, 64; `EU-15` absent. | `EU-27` used (as `EU-27-Durchschnitt`) at lines 45, 52, 64; `EU-15` absent. |
| 3 | The year the islands stopped gaining ground is 1993, not "around 1990". | Line 57: "stopped gaining ground on Europe in 1993" (quoted, MATCHED against `en-story.txt:131`). `around 1990` absent. | Line 57/59: "Seit 1993 verlieren die Balearen..." (quoted, MATCHED against `de-story.txt:130`). `um 1990` / `etwa 1990` absent. |
| 4 | The unit near every figure is 2011 international PPP dollars; no euro sign inside a `<Figure>` block, notwithstanding the shipped image filename `f1-constant-dollars.png`. | `€` count inside `<Figure>…</Figure>` blocks: 0 (checked by `sed -n '/<Figure/,/<\/Figure>/p' \| grep -c "€"`). `PPP` / `2011 international` used at lines 34, 45, 69, 71. The two `€` figures in the file (line 25) sit in prose about the *abandoned* thesis, outside any `Figure` block. | `€` count inside `<Figure>…</Figure>` blocks: 0. `PPP-Dollar` / `internationale Dollar von 2011` used at lines 34, 45, 69, 71. The two `€` figures (line 25) are likewise outside any `Figure` block. |
| 5 | Only Extremadura is described as growing tenfold; the others share "the pattern". | `tenfold` occurs exactly once (line 31, Extremadura); the Andalusia/Portugal/France/Ireland sentence uses "pattern", not a number (line 31, MATCHED against `en-story.txt:107`). | `verzehnfacht` occurs exactly once (line 31, Extremadura); the Andalusia/Portugal/France/Ireland sentence uses "Muster" (line 31, MATCHED against `de-story.txt:106`). |
| 6 | The piece never asserts tourism caused the climb or the fall; `proves`, `caused` (as the piece's own claim) and `debunks` appear nowhere. | `grep -n "proves\|caused\|debunks"` returns nothing. Line 39's causal-posture sentence is phrased as a negation ("At no point does the piece assert that tourism was responsible..."). | `grep -n "beweist\|verursacht\|widerlegt"` returns nothing. Line 39: "Nirgends behauptet dieser Beitrag, der Tourismus sei... verantwortlich gewesen". |
| 7 | The relative measure is described as promoted, not invented — the abandoned plan's own Chart 1 already used it. | Line 27: "It was already there, as the abandoned plan's opening exhibit... A chart that opened a five-part indictment became the chart the finished piece turns on." No "invented"/"discovered" claim (`grep` for `invented` returns nothing). Corroborated by `ARTICLE_PLAN.md:10`, "Chart 1: GDP per capita (relative to EU regional average) vs tourist arrivals". | Line 27: "Es stand schon da, als Eröffnungsgrafik des verworfenen Plans... Eine Grafik, die eine fünfteilige Anklage eröffnete, wurde zu der Grafik, um die sich der fertige Beitrag dreht." No "erfunden" claim. Same `ARTICLE_PLAN.md` corroboration (the DE file translates, ARTICLE_PLAN.md has no German original). |
| 8 | The quoted live headline is "Everyone in Mallorca Knows It", not the slug. | Line 61: `"Everyone in Mallorca Knows It"` MATCHED against `en-story.txt:9` (rendered `<h1>`) and `:139`. The slug `everyone-in-mallorca-agrees-on-one-thing` appears only inside the outbound URL, never as prose. | Line 61: `„Auf Mallorca weiss es jeder“` MATCHED against `de-story.txt:8` and `:138`. Slug `auf-mallorca-weiss-es-jeder` only inside the URL. |
| 9 | No language count is asserted anywhere. | Line 61: "ships in several languages" — no number. | Line 61: "erscheint in mehreren Sprachen" — no number. |
| 10 | The Valdivielso and Moranta citation carries no volume or issue number (three variants exist across the author's own surfaces). | Line 75: "Valdivielso and Moranta (2019) — never a volume or issue number, since every printed variant contradicts another." No `27(12)`/`28(12)` anywhere in the file. | Line 75: "Valdivielso und Moranta (2019) – nie Band- oder Heftnummer, da sich jede gedruckte Variante widerspricht." Same absence. |
| 11 | The methodology reports the single-year-anchor proximity without attributing surprise to the author. | Line 73 quotes only "is actually closer to Rosés-Wolf's real GDP figures" (MATCHED, `en-methodology.txt:498`) — no "I did not expect" / "surprisingly" framing (`grep` for `surpris` returns nothing). | Line 73 quotes only "liegt... sogar näher an den realen BIP-Werten von Rosés-Wolf" (MATCHED, `de-methodology.txt:498`) — no "überraschend" framing. |
| 12 | No World Bank attribution and no reference to a private repo. | `grep -n "World Bank\|ib-gdp-evolution\|github.com"` returns nothing. | `grep -n "World Bank\|ib-gdp-evolution\|github.com"` returns nothing. |

All twelve checks pass in both languages. None forced a prose change — the files already satisfied
every trap on first read, which is itself worth recording rather than assuming.

---

## Table B — EN: quotations and the pivot blockquote (21 rows)

Every span inside straight double quotes, plus the one blockquote. Source column names the
live-text file and line; search string is the substring actually matched by the probe.

| Claim (as written) | Source file | Search string (excerpt) | Result |
|---|---|---|---|
| Pivot blockquote: "The chart *therefore* changes. Instead of plotting income in dollars, it expresses each economy as a percentage of the EU average." | `en-story.txt:111` | "The chart therefore changes. Instead of plotting income in dollars, it expresses each economy as a percentage of the EU average." | MATCHED (the `*therefore*` emphasis is additive markup, not a wording change) |
| "The Balearic Paradox: Is Tourism Mallorca's Dutch Disease?" | `ARTICLE_PLAN.md:1` | "The Balearic Paradox: Is Tourism Mallorca's Dutch Disease?" | MATCHED — licensed non-live source (D-01); this is the title of a piece that was never published, so no live page can carry it |
| "This project began with a widely shared suspicion: tourist arrivals keep breaking records, but life for local people stopped improving long ago and may be getting worse. I wanted to know whether that impression would survive contact with the data." | `en-methodology.txt:7` | full sentence | MATCHED |
| "GDP per head in Extremadura also increased tenfold within two generations." | `en-story.txt:105` | "GDP per head in Extremadura also increased tenfold within two generations." | MATCHED |
| "The same pattern appears in Andalusia, Portugal, France, Ireland and much of Europe." | `en-story.txt:107` | full sentence | MATCHED |
| "Tourism was the Balearics' route into that wider boom, but it was not the boom's underlying cause." | `en-story.txt:107` | full sentence (curly apostrophes) | MATCHED |
| "the islands were not exceptionally poor throughout the first half of the century." | `en-story.txt:121` | full sentence | MATCHED |
| "It rises and falls, moving above and below the European average." | `en-story.txt:115` | full sentence | MATCHED |
| "In 2022, for instance, Ireland stood at 158%, while Bulgaria, the EU's poorest country, stood at 54%." | `en-story.txt:113` | full sentence | MATCHED |
| "The Balearics stopped gaining ground on Europe in 1993 and have fallen behind ever since, even as arrivals have tripled." | `en-story.txt:131` | full sentence | MATCHED |
| "It took 25 years from the end of the Balearics' relative economic rise to the first mass protests against tourism." | `en-story.txt:133` | full sentence | MATCHED |
| "More young people are leaving the islands for work—three times as many as in 2009." | `en-story.txt:127`/`:343` | full sentence | MATCHED |
| "Everyone in Mallorca Knows It" (rendered page title, quoted as headline not slug) | `en-story.txt:9`,`:139` | "Everyone in Mallorca Knows It" | MATCHED |
| "would amount to assuming zero inflation—clearly unrealistic." | `en-methodology.txt:461` | full clause | MATCHED |
| "Using 2000 rather than 2022 changes the estimate by more than 20%." | `en-methodology.txt:463` | full sentence | MATCHED |
| "This works only if the relationship between PPP dollars and PPS changes steadily—for example, if inflation is constant." | `en-methodology.txt:465` | full sentence | MATCHED |
| "Up to 2020, the simpler single-year method is actually closer to Rosés-Wolf's real GDP figures, because Rosés-Wolf and Eurostat follow similar paths." | `en-methodology.txt:498` | full sentence | MATCHED |
| "The pandemic was a large but temporary external shock, and plotting those years would obscure rather than clarify the 125-year trend." | `en-methodology.txt:404` | full sentence | MATCHED |
| "the Balearic index remained within 1% of Spain's" | `en-methodology.txt:279` | "the Balearic index remained within 1% of Spain's" | MATCHED |
| "Coverage becomes complete in 1985" | `en-methodology.txt:118` | "Coverage becomes complete in 1985" | MATCHED |
| "Even if Cirer-Costa's estimate for 1920 were wrong by a factor of ten—2,000 or 200,000 arrivals rather than 20,000—the steep rise after 1960 would look essentially the same. The article's conclusion would not change." | `en-methodology.txt:398` | full passage | MATCHED |

**21/21 MATCHED, 0 PARAPHRASE-inside-quotation-marks defects, 0 with no traceable source.**

---

## Table C — EN: numeral and prose claims not inside quotation marks

Every numeral together with the clause around it, where the claim is not already covered by
Table B. These are checked as PARAPHRASE (faithful restatement, or in several cases verbatim
non-quoted prose) unless noted.

| Claim (as written) | Source | Source sentence / fact | Result |
|---|---|---|---|
| "Tourism accounts for 45.5% of the Balearic economy" | `en-story.txt:16` | "Tourism accounts for 45.5% of the Balearic economy." | PARAPHRASE (verbatim wording, not quotation-marked in the MDX) |
| "the islands now rank among Spain's wealthiest regions, GDP per head close to the European average" | `en-story.txt:16` | "The islands now rank among Spain's wealthiest regions, with GDP per head close to the European average." | PARAPHRASE |
| "I set out to test that claim against 125 years of data" | `en-methodology.txt:404` + overall series coverage 1900–2025 | "...the langfristige [125-year] trend" and the reconstructed series' own 1900–2025 span | PARAPHRASE |
| "an average salary of about €23,100 against roughly €31,600 needed for basic expenses" | `ARTICLE_PLAN.md:19` | "average salary ~€23,100/year vs ~€31,600 needed for basic expenses" | PARAPHRASE — **traced to the unpublished ARTICLE_PLAN.md, not a live page** (the abandoned thesis was never published; this is honest provenance, not a gap) |
| "early school leaving at 20.1% — the worst rate in Spain despite the region ranking fourth or fifth by GDP" | `ARTICLE_PLAN.md:43` | "Spain's worst early school leaving rate (20.1%) despite being the 4th-5th richest region by GDP" | PARAPHRASE — traced to ARTICLE_PLAN.md, unpublished |
| "housing at 60.8 years of income needed to buy a home against 29.7 nationally" | `ARTICLE_PLAN.md:60` | "60.8 years to buy (vs 29.7 nationally)" | PARAPHRASE — traced to ARTICLE_PLAN.md, unpublished |
| "and environmental strain" | `ARTICLE_PLAN.md:66-83` (SYMPTOM 5) | The environment symptom section (water, energy, waste) | PARAPHRASE — traced to ARTICLE_PLAN.md, unpublished |
| "It was already there, as the abandoned plan's opening exhibit." | `ARTICLE_PLAN.md:10` | "Chart 1: GDP per capita (relative to EU regional average) vs tourist arrivals over time." | PARAPHRASE — see Table A row 7 |
| "a plan to merge four stepped intro charts into one scroll-driven, animated timeline" | `ARTICLE_PLAN.md:109` | "Scrollytelling: merge 4 stepped intro charts into one scroll-driven animated timeline." | PARAPHRASE — the one sentence in ARTICLE_PLAN.md's "Tech decisions" section expressible without naming a library (D-12) |
| "the axis stops plotting income in constant 2011 international PPP dollars and starts plotting each economy as a percentage of the EU-27 average, with 100 as the baseline" | `en-story.txt:111,113` | "The chart therefore changes... A line above 100% is richer than average... The EU average is fixed at 100%." | PARAPHRASE |
| "the six absolute comparators of the constant-dollar view give way to the Balearics, Ireland, Bulgaria and the EU average" | `en-story.txt:278-280` (chart legend: Balearics/Bulgaria/Ireland) + `04-RESEARCH.md` C-5 | Legend rows "Balearics / Bulgaria / Ireland" on the axis-switch chart state | PARAPHRASE, corroborated by RESEARCH's own correction that F1 and F2 do not share a comparator set |
| "At no point does the piece assert that tourism was responsible for the climb, or responsible for what comes after it." | self-referential — verified structurally | `grep` for `proves\|caused\|debunks` returns nothing in the file itself | Verified true by direct inspection of the file being described |
| "The GDP series behind every chart in the piece is chained from sources that do not agree on units. Rosés-Wolf and the Maddison Project report constant 2011 international PPP dollars; Eurostat reports current purchasing power standards per person, which carry no inflation adjustment." | `en-methodology.txt:411` | "The sources use different measures of purchasing power. Rosés-Wolf and Maddison report constant 2011 international dollars adjusted for purchasing power; Eurostat reports current purchasing power standards (PPS) per person." | PARAPHRASE |
| "The method I used instead keeps every Rosés-Wolf observation as a fixed anchor and rescales the Eurostat-derived profile to meet it at both ends" | `en-methodology.txt:565` | "For Spanish regions, every observed Rosés-Wolf value is retained... The resulting annual pattern is rescaled to meet the Rosés-Wolf values at both ends." | PARAPHRASE |
| "The two approaches diverge on the post-pandemic recovery, not before it." | `en-methodology.txt:498` | "Their treatment of the post-pandemic recovery then diverges: Eurostat's rebound begins earlier..." | PARAPHRASE |
| "I use no separate regional deflator, either" | `en-methodology.txt:279,741` | "I compared each region's consumer price index with the national index to see whether separate regional deflators were justified... the method assumes uniform purchasing power across Spain." | PARAPHRASE |
| "The EU-27 average carries its own seam: it is computed rather than published, population-weighted across today's 27 member states." | `en-methodology.txt:118` | "I use this table only to calculate a population-weighted average for today's 27 EU member states. Maddison does not provide that average as a ready-made series." | PARAPHRASE |
| Aside intro: "the series behind every chart is chained from four sources, preferring the official record wherever years overlap: Cirer-Costa's estimates for 1900–1936, Barceló Pons's reconstruction for 1925–1965, Valdivielso and Moranta for 1959–2019, and the AETIB yearbooks with FRONTUR data for 1998–2025." | `en-methodology.txt:326,342,358,374,390` | The four TOURIST ARRIVALS source cards and their coverage ranges | PARAPHRASE (dates match the facts-table values, per RESEARCH C-6's preference for the facts table over the page's own inconsistent prose sentence) |
| "The arrivals research cited above exists in three slightly different forms across my own published surfaces" | `04-RESEARCH.md` C-7 | Three variants confirmed: `27(12)/2019` (live citation), `(2020)` (live section heading), `28(12)/2020` (`methodology.md`) | PARAPHRASE, corroborated by RESEARCH's own verification |

---

## Table D — EN: figure captions (3 rows)

| Figure | Caption text | Source | Result |
|---|---|---|---|
| F1 `f1-constant-dollars.png` | "GDP per head in constant 2011 international PPP dollars for six regions and countries, built from the Rosés-Wolf regional GDP database and the Maddison Project." | `en-methodology.txt:22-100` (Rosés-Wolf GDP sheet, Maddison Project GDP sheet descriptions) | PARAPHRASE |
| F2 `f2-eu-average.png` | "GDP per head as a percentage of the EU-27 average, with 100 as the average, built from the Maddison Project's population-weighted EU-27 series." | `en-methodology.txt:118-122` ("this table... to calculate a population-weighted average for today's 27 EU member states") | PARAPHRASE |
| F3 `f3-arrivals-diverge.png` | "Balearic income as a percentage of the EU-27 average against tourist arrivals, chained from Rosés-Wolf, the Maddison Project, and the AETIB and FRONTUR arrivals series." | `en-methodology.txt:322-390` (arrivals sourcing section) | PARAPHRASE |

---

## Table E — DE: quotations and the pivot blockquote (21 rows)

| Claim (as written) | Source file | Search string (excerpt) | Result |
|---|---|---|---|
| Pivot blockquote: "Dafür ändert sich die Darstellung. Statt das Einkommen in Dollar anzugeben, zeigt die Grafik jede Volkswirtschaft als Anteil am EU-Durchschnitt." | `de-story.txt:110` | full sentence | MATCHED |
| „The Balearic Paradox: Is Tourism Mallorca's Dutch Disease?" | `ARTICLE_PLAN.md:1` | "The Balearic Paradox: Is Tourism Mallorca's Dutch Disease?" | MATCHED — licensed non-live source (D-01); the English title is kept as-is since no German title of the unpublished piece exists |
| „Am Anfang dieses Projekts stand ein Verdacht, den viele teilen: Die Besucher:innenzahlen brechen einen Rekord nach dem anderen, doch das Leben der Einheimischen verbessert sich seit Langem nicht mehr – womöglich wird es sogar schlechter. Ich wollte wissen, ob dieser Eindruck einer Prüfung durch die Daten standhält." | `de-methodology.txt:7` | full sentence | MATCHED |
| „Ohne Magaluf oder s'Arenal, ohne Badehotels und sogar ohne Küste verzehnfachte sich auch in Extremadura die Wirtschaftsleistung pro Kopf innerhalb von zwei Generationen." | `de-story.txt:104` | full sentence (curly apostrophe) | MATCHED |
| „Dasselbe Muster zeigt sich in Andalusien, Portugal, Frankreich, Irland und grossen Teilen Europas." | `de-story.txt:106` | full sentence | MATCHED |
| „Für die Balearen war der Tourismus der Zugang zu diesem europaweiten Aufschwung – dessen eigentliche Ursache war er nicht." | `de-story.txt:106` | full sentence | MATCHED |
| „In der ersten Hälfte des 20. Jahrhunderts waren die Inseln nicht aussergewöhnlich arm." | `de-story.txt:120` | full sentence | MATCHED |
| „Sie bewegt sich auf und ab, mal über, mal unter dem europäischen Durchschnitt." | `de-story.txt:114` | full sentence | MATCHED |
| „Irland erreichte 2022 zum Beispiel 158 Prozent, Bulgarien, das ärmste EU-Land, 54 Prozent." | `de-story.txt:112` | full sentence | MATCHED |
| „Seit 1993 verlieren die Balearen gegenüber Europa an Boden, obwohl sich die Zahl der Gäste verdreifacht hat." | `de-story.txt:130` | full sentence | MATCHED |
| „Zwischen dem Ende des relativen Aufschwungs 1993 und den ersten Massendemonstrationen gegen den Tourismus lagen 25 Jahre." | `de-story.txt:132` | full sentence | MATCHED |
| „Immer mehr junge Menschen verlassen die Inseln, um anderswo zu arbeiten – dreimal so viele wie 2009." | `de-story.txt:126`/`:342` | full sentence | MATCHED |
| „Auf Mallorca weiss es jeder" (rendered page title, headline not slug) | `de-story.txt:8`,`:138` | "Auf Mallorca weiss es jeder" | MATCHED |
| „einer Inflationsrate von null – eine offensichtlich unrealistische Annahme" | `de-methodology.txt:461` | full clause | MATCHED |
| „Wird 2000 statt 2022 gewählt, weichen die Schätzungen um mehr als 20 Prozent voneinander ab." | `de-methodology.txt:463` | full sentence | MATCHED |
| „nur, wenn sich das Verhältnis zwischen KKP-Dollar und KKS gleichmässig verändert – etwa bei konstanter Inflation." | `de-methodology.txt:465` | full clause | MATCHED |
| „Bis 2020 liegt das einfachere Einjahresverfahren sogar näher an den realen BIP-Werten von Rosés-Wolf, weil beide Quellen bis dahin ähnlich verlaufen." | `de-methodology.txt:498` | full sentence | MATCHED |
| „Die Pandemie war ein starker, aber vorübergehender äusserer Schock; ihre Darstellung würde die langfristige Entwicklung über 125 Jahre eher verdecken als erklären." | `de-methodology.txt:404` | full sentence | MATCHED |
| „Zwischen 2002 und 2024 wich der balearische Wert um weniger als ein Prozent vom Landeswert ab" | `de-methodology.txt:279` | full clause | MATCHED |
| „Erst ab 1985 liegen Daten für alle Länder vor" | `de-methodology.txt:118` | full clause | MATCHED |
| „Selbst wenn Cirer-Costas Schätzung für 1920 um den Faktor zehn falsch wäre – also 2.000 oder 200.000 statt 20.000 Ankünfte –, sähe der steile Anstieg nach 1960 nahezu gleich aus. An der Schlussfolgerung änderte sich nichts." | `de-methodology.txt:398` | full passage | MATCHED |

**21/21 MATCHED, 0 PARAPHRASE-inside-quotation-marks defects, 0 with no traceable source.**

---

## Table F — DE: numeral and prose claims not inside quotation marks

| Claim (as written) | Source | Source sentence / fact | Result |
|---|---|---|---|
| "Der Tourismus erwirtschaftet 45,5 Prozent der balearischen Wirtschaftsleistung" | `de-story.txt:15` | "Der Tourismus erwirtschaftet 45,5 Prozent der balearischen Wirtschaftsleistung." | PARAPHRASE (verbatim wording, not quotation-marked) |
| "die Inseln zählen heute zu den wohlhabendsten Regionen Spaniens; ihr Pro-Kopf-Einkommen liegt nahe am europäischen Durchschnitt" | `de-story.txt:15` | same sentence | PARAPHRASE |
| "ich wollte diese Behauptung an 125 Jahren Daten prüfen" | `de-methodology.txt:404` + overall series coverage 1900–2025 | "die langfristige Entwicklung über 125 Jahre" | PARAPHRASE |
| "ein Durchschnittsgehalt von rund 23.100 € gegenüber rund 31.600 €, die für die Grundausgaben nötig wären" | `ARTICLE_PLAN.md:19` (translated) | "average salary ~€23,100/year vs ~€31,600 needed for basic expenses" | PARAPHRASE — traced to unpublished `ARTICLE_PLAN.md`; number correctly localised (period as thousands separator, comma as decimal — no value changed) |
| "ein Schulabbruch von 20,1 Prozent – die schlechteste Quote Spaniens, obwohl die Region beim BIP auf Platz vier oder fünf liegt" | `ARTICLE_PLAN.md:43` (translated) | "Spain's worst early school leaving rate (20.1%) despite being the 4th-5th richest region by GDP" | PARAPHRASE — traced to unpublished `ARTICLE_PLAN.md` |
| "Wohnraum mit 60,8 Jahreseinkommen für ein Eigenheim gegenüber 29,7 landesweit" | `ARTICLE_PLAN.md:60` (translated) | "60.8 years to buy (vs 29.7 nationally)" | PARAPHRASE — traced to unpublished `ARTICLE_PLAN.md` |
| "und Umweltbelastung" | `ARTICLE_PLAN.md:66-83` (SYMPTOM 5, translated) | The environment symptom section | PARAPHRASE — traced to unpublished `ARTICLE_PLAN.md` |
| "Es stand schon da, als Eröffnungsgrafik des verworfenen Plans." | `ARTICLE_PLAN.md:10` | "Chart 1: GDP per capita (relative to EU regional average) vs tourist arrivals over time." | PARAPHRASE — see Table A row 7 |
| **Observation, not a defect:** the DE file has no sentence corresponding to EN's "a plan to merge four stepped intro charts into one scroll-driven, animated timeline" (`the-chart-therefore-changes.mdx:27`) — the German beat 3 paragraph ends one sentence earlier. Nothing false is asserted; a true claim present in EN is simply absent in DE. Flagged for the user's editorial pass (see `launch-gate.md`), not fixed here, because omission is a completeness question, not an accuracy one, and D-19 governs accuracy. | — | — | N/A (no claim to source) |
| "Die Achse hört auf, das Einkommen in konstanten internationalen PPP-Dollar von 2011 abzutragen, und beginnt, jede Volkswirtschaft als Prozentsatz des EU-27-Durchschnitts darzustellen, mit 100 als Basislinie." | `de-story.txt:110,112` | "Dafür ändert sich die Darstellung... Der EU-Durchschnitt liegt bei 100 Prozent." | PARAPHRASE |
| "die sechs absoluten Vergleichsregionen der Dollaransicht weichen den Balearen, Irland, Bulgarien und dem EU-Durchschnitt" | `de-story.txt:277-279` (chart legend Balearen/Bulgarien/Irland) + `04-RESEARCH.md` C-5 | Legend rows on the axis-switch chart state | PARAPHRASE, same corroboration as the EN row |
| "Nirgends behauptet dieser Beitrag, der Tourismus sei für den Anstieg verantwortlich gewesen, oder für das, was danach kommt." | self-referential — verified structurally | `grep` for `beweist\|verursacht\|widerlegt` returns nothing in the file itself | Verified true by direct inspection |
| "Die BIP-Reihe hinter jeder Grafik dieses Beitrags ist aus Quellen verkettet, die sich nicht auf gemeinsame Einheiten einigen." | `de-methodology.txt:411` | "Die Quellen verwenden unterschiedliche Kaufkraftmasse. Rosés-Wolf und Maddison rechnen mit kaufkraftbereinigten internationalen Dollar..." | PARAPHRASE |
| "Die Methode, die ich stattdessen verwendet habe, hält jede Rosés-Wolf-Beobachtung als festen Anker" | `de-methodology.txt:565` | "Bei den spanischen Regionen bleiben alle beobachteten Rosés-Wolf-Werte erhalten." | PARAPHRASE |
| "Die beiden Ansätze weichen erst bei der Erholung nach der Pandemie voneinander ab, nicht davor." | `de-methodology.txt:498` | "Bei der Erholung nach der Pandemie weichen sie jedoch voneinander ab." | PARAPHRASE |
| "Ich verwende auch keinen eigenen regionalen Deflator" | `de-methodology.txt:279,741` | "die Methode unterstellt innerhalb Spaniens eine einheitliche Kaufkraft" | PARAPHRASE |
| "Auch der EU-27-Durchschnitt trägt eine eigene Nahtstelle: Er ist berechnet, nicht veröffentlicht" | `de-methodology.txt:118` | "Diese Tabelle dient ausschliesslich dazu, einen nach Bevölkerung gewichteten Durchschnitt für die heutigen 27 EU-Staaten zu berechnen. Maddison stellt diesen Wert nicht als fertige Zeitreihe bereit." | PARAPHRASE |
| Aside intro: four chained arrivals sources with their coverage ranges | `de-methodology.txt:330,346,362,378` | The four TOURIST:INNENANKÜNFTE source cards | PARAPHRASE (dates match the facts-table values, per RESEARCH C-6) |
| "Die oben zitierte Forschung zu den Ankünften existiert in drei leicht unterschiedlichen Fassungen auf meinen eigenen veröffentlichten Seiten" | `04-RESEARCH.md` C-7 | Three variants confirmed | PARAPHRASE, corroborated by RESEARCH's own verification |

---

## Table G — DE: figure captions (3 rows)

| Figure | Caption text | Source | Result |
|---|---|---|---|
| F1 `f1-constant-dollars.png` | "BIP pro Kopf in konstanten internationalen PPP-Dollar von 2011 für sechs Regionen und Länder, aus der Rosés-Wolf-Datenbank zum regionalen BIP und dem Maddison-Projekt." | `de-methodology.txt:22-100` | PARAPHRASE |
| F2 `f2-eu-average.png` | "BIP pro Kopf als Anteil am EU-27-Durchschnitt, mit 100 als Mittelwert, aus dem bevölkerungsgewichteten EU-27-Wert des Maddison-Projekts." | `de-methodology.txt:118-122` | PARAPHRASE |
| F3 `f3-arrivals-diverge.png` | "Balearisches Einkommen als Anteil am EU-27-Durchschnitt gegenüber den Tourist:innenankünften, verkettet aus Rosés-Wolf, dem Maddison-Projekt sowie den AETIB- und FRONTUR-Ankunftsreihen." | `de-methodology.txt:322-390` | PARAPHRASE |

---

## Row counts

| | EN | DE | Total |
|---|---|---|---|
| Quotation/blockquote rows (Table B/E) | 21 | 21 | 42 |
| Numeral/prose claim rows (Table C/F, excluding the 1 completeness observation) | 18 | 17 | 35 |
| Figure caption rows (Table D/G) | 3 | 3 | 6 |
| **Total claims audited** | **42** | **41** | **83** |
| MATCHED | 21 | 21 | 42 |
| PARAPHRASE | 21 | 20 | 41 |
| No traceable source | 0 | 0 | **0** |
| Observations (not a sourcing defect) | — | 1 (DE completeness gap, Table F) | 1 |

**Prose fixes forced by this audit: 0.** Both files passed every check, including all twelve
named traps, on first read. No edit was made to either MDX file. `npm run test:unit` was re-run
after the audit as a confirmation, not because a fix required it — see Verification below.

---

## Verification

```
$ npm run test:unit
```
88 passed (0 failed) — unchanged from the state Plan 05 left (`04-05-SUMMARY.md`), confirming
this audit made no code or content changes that could have regressed the suite.

```
$ /usr/bin/grep -c <disallowed-result-value> .planning/phases/04-the-case-study/fact-check.md
0
```

```
$ grep -c "International Baccalaureate\|World Bank\|EU-15\|ib-gdp-evolution\|github.com" content/the-chart-therefore-changes.mdx
0
$ grep -c "International Baccalaureate\|World Bank\|EU-15\|ib-gdp-evolution\|github.com" content/die-darstellung-aendert-sich.mdx
0
```
