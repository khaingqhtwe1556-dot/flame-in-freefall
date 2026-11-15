# NASA Combustion Research Resources

**Project:** RAD SI  
**Audience:** Hackathon team  
**Purpose:** A source-grounded guide to the NASA resources below, how they relate to spacecraft fire safety, and how to use the PSI material responsibly in an SI-powered research dashboard.

## Executive overview

NASA's combustion program uses reduced-gravity experiments to separate buoyancy-driven flow from other heat, mass-transfer, and chemical effects. The resulting evidence helps explain why flame shape, soot, material flammability, smoke signatures, and suppression behavior in spacecraft can differ from what Earth-based intuition suggests. The sources connect that science to three safety functions: **prevention**, **detection**, and **suppression**. [S2, S4]

The PSI search is the strongest candidate for the project's research corpus. A combustion search run on **2026-11-14** returned **26 investigation records** spanning experiments, ground investigations, and related analyses. The investigation detail inventories reviewed list **73,909 file entries** with a combined declared size of about **14.4 TB**. These are catalog counts and listed sizes, not a count of unique, downloaded, or necessarily accessible files. The catalog includes heterogeneous formats such as `.dat`, `.txt`, `.csv`, `.zip`, `.mp4`, `.pdf`, and spreadsheets. [S1]

This is not a ready-made, uniformly labeled model-training dataset. A practical first version of RAD SI should index PSI metadata and selected documents, then retrieve and cite relevant evidence. It should not imply that one study predicts another when fuels, oxygen concentration, pressure, airflow, apparatus, gravity level, or measurement methods differ.

## How to use this guide

- **Use PSI accession IDs as record identifiers.** Keep an investigation's own metadata and files linked to that accession.
- **Start with the three operational themes:** prevention/material flammability, detection/smoke, and suppression/extinction.
- **Keep historical accident evidence separate from controlled experiment data.** Accident narratives inform hazards and procedures; they are not experimental labels for a combustion model.
- **Treat published summaries as discovery aids.** Before presenting a quantitative result, inspect its original data file, units, test conditions, methods, and associated publication.
- **Show why a record is recommended.** Rank by operational relevance and data completeness, not just text-search score.

## PSI combustion search: useful investigation families

The search results include these 26 records. The grouping below is for navigation, not a claim that every record is equally relevant to spacecraft fire safety.

| Theme | PSI records | Why they are useful |
|---|---|---|
| Material flammability, fire growth, and prevention | **PSI-20** Burning Rate Emulator (BRE); **PSI-25** BASS-II; **PSI-26** BASS; **PSI-98** SAFFIRE-I; **PSI-99** SAFFIRE-II; **PSI-100** SAFFIRE-III | Material burning, ignition, flame spread, and fire growth relate directly to prevention and habitat material selection. Compare each study's material, sample geometry, oxygen, pressure, and ventilation conditions. |
| Smoke and aerosol detection | **PSI-47** DAFT/DAFT-2; **PSI-101** SAME-R; **PSI-102** SAME; **PSI-115** smoke-generation modeling using SAME data | Useful for smoke-particle properties, background aerosols, sensor conditions, and detection. DAFT is a measurement-feasibility study, not a fire-growth experiment. |
| Droplet combustion, extinction, and suppression | **PSI-39** Cool Flames Investigation (CFI); **PSI-68** FLEX-2; **PSI-69** FLEX | Relevant to liquid-fuel fire limits, inert-gas suppression, extinction, and low-temperature combustion. Distinguish visible flame extinction from continued cool-flame behavior where the data support it. |
| Gaseous flames, soot, and stability | **PSI-10** ACME Flame Design; **PSI-21** ACME Coflow Laminar Diffusion Flame; **PSI-22** ACME E-FIELD Flames; **PSI-23** ACME s-Flame; **PSI-106** SLICE; **PSI-107** SPICE; **PSI-159** ACME Cool Flames Investigation with Gases | Provides flame structure, soot, fuel-dilution, stability, and extinction evidence. Some records primarily advance fundamental combustion models rather than operational fire procedures. |
| Modeling and adjacent investigations | **PSI-60** SPICE data analysis; **PSI-62** BASS flame-spread modeling; **PSI-117** cool-flame CFD analysis; **PSI-142** cool-flame transitions; **PSI-108** surface-tension-driven convection; **PSI-181** solder structure and properties | Ground and adjacent records may add useful context, but their relevance to a fire-safety question should be stated explicitly. PSI-108 and PSI-181 are not direct spacecraft-fire datasets. |

### First-pass shortlist for a fire-safety dashboard

1. **Prevention/materials:** BASS/BASS-II and SAFFIRE-I/II/III, with BRE and SLICE as complementary records.
2. **Detection:** SAME/SAME-R and DAFT; add PSI-115 for modeling that uses SAME data.
3. **Suppression and extinction:** FLEX/FLEX-2; include CFI where low-temperature flame behavior is relevant.
4. **Scientific context:** ACME and SPICE records for soot, flame stability, and gaseous-fuel behavior.

This shortlist is an initial relevance hypothesis, not a final ranking. Review each record's objectives and actual files before including it in a user-facing answer. [S1, S2, S4]

### What PSI metadata can support

Search records expose useful discovery fields such as accession, title, acronym, keywords, flight platform, research area, project type, dates, objectives, approach, hypothesis, research impacts, hardware, and publication information. Detailed records add file listings and file-level attributes. The values and completeness can differ by record, so model the fields as optional and retain the original source values. [S1]

The reported file-entry and byte totals are useful for understanding scale, but not for estimating a clean training corpus. Listings may contain multiple versions or representations; a listed file may require separate access checks; and extensions alone do not describe schema or scientific meaning. Do not bulk-download the corpus. Start with metadata and a small set of relevant, accessible files after checking each study's documentation.

### Record-level PSI technical map

The notes below are based on the PSI search record and its investigation detail metadata, not on independent re-analysis of the listed raw files. Unless another source is cited, the record summaries, asset totals, and extensions below come from that PSI metadata review. The asset totals are file-list entries, and the extensions are inventory hints rather than a description of a standard schema. Check the README, metadata, units, and access conditions for the specific file before interpreting it. [S1]

#### Material flammability, fire growth, and prevention

- **PSI-20 - ACME Burning Rate Emulator (BRE).** Uses methane/nitrogen and ethylene/nitrogen feeds from 25 mm and 50 mm porous burners to emulate burning condensed materials in quiescent microgravity. The record lists O2/N2 cases at 14.7 psia/21% O2, 10.2 psia/26.5% O2, and 8.2 psia/34% O2, plus desired O2/CO2 cases, and seeks burning/extinction behavior. This is a useful bridge between controlled gas-flame tests and material-flammability questions, but the burners emulate rather than directly reproduce each solid or liquid material. **Inventory:** 2,551 entries, led by ZIP, TXT, CSV, and MP4. [S1]
- **PSI-25 - BASS-II.** Examines ignition, growth, spread, and extinction of solid fuels in low-speed forced flow; its record identifies oxygen concentration, flow speed/direction, fuel type/thickness, and sample geometry as key variables. It also compares microgravity behavior with NASA-STD-6001 Test 1 and was intended to inform SoFIE requirements. **Use:** a strong source for condition-aware material-risk comparisons. **Inventory:** 711 entries, led by MP4, ZIP, and PDF.
- **PSI-26 - BASS.** Studies realistic solid-fuel geometries, including wake/obstructed flames, and the effectiveness of an inert gaseous suppressant under different geometries, preheating, and flow. Its metadata cautions that suppressant placement can behave differently in microgravity and that a jet may entrain oxidizer. **Use:** connect prevention and suppression; retain flow direction and flame geometry in any comparison. **Inventory:** 211 entries, led by MP4, ZIP, and PDF.
- **PSI-98 - SAFFIRE-I.** The catalog objective is to determine large-scale fire growth in low gravity and compare low-g flammability limits with NASA's normal-gravity screening test. Its detailed record points to a shared SAFFIRE objectives/development/status document for experimental specifics. **Inventory:** 81 entries, mostly ZIP and PDF.
- **PSI-99 - SAFFIRE-II.** The catalog states the same overarching large-fire-growth and low-g flammability-comparison objectives as SAFFIRE-I. Use the record's run-specific documentation rather than assuming all campaigns used identical samples or procedures. **Inventory:** 251 entries, mostly ZIP, PDF, and spreadsheet files.
- **PSI-100 - SAFFIRE-III.** Again focuses on large-scale fire growth and low-g versus normal-gravity material flammability. It is a distinct investigation record; the common objective statement is not enough to infer run conditions. **Inventory:** 91 entries, mostly ZIP, spreadsheets, and PDF.
- **PSI-106 - SLICE.** Investigates laminar diffusion-flame structure and base stabilization, liftoff limits across fuels/burner sizes, nitrogen dilution, soot, flame length, and radiative heat loss; the stated purpose includes model validation. **Use:** fundamental evidence related to flame behavior, not a direct solid-material certification test. **Inventory:** 23,401 entries, including 22,990 DAT files; inspect the file documentation before treating the DATs as comparable observations.

#### Smoke, aerosol, and detection

- **PSI-47 - DAFT/DAFT-2.** Tests whether a modified TSI P-Trak particle counter works in microgravity, compares it with a DustTrak control, and creates aerosol standards. The work supports SAME and helps distinguish fire particles from background dust. **Inventory:** 351 entries, led by BMP images, ZIP, MP4, and spreadsheet files.
- **PSI-102 - SAME.** Measures smoke-particle size distributions for spacecraft materials and examines sample temperature, airflow, and smoke residence time; the project also describes detector evaluation and smoke-growth modeling. **Use:** relate material and test conditions to particle signatures, while avoiding a one-size-fits-all detector threshold. **Inventory:** 111 entries, led by XLS and PDF.
- **PSI-101 - SAME-R.** Extends SAME with modified materials, operating conditions, and diagnostics. The record documents that contamination affected returned TEM grids in the earlier SAME campaign; SAME-R file descriptions distinguish rack/flight data, operations imagery, TEM images, and video. Preserve run identifiers and sample provenance. **Inventory:** 371 entries, including XLS, ZIP, PPTX, CSV, and MP4.
- **PSI-115 - SAME-data smoke modeling.** A ground study simulates dibutyl-phthalate particle growth under Earth and microgravity conditions, considering low cross-flow, thermophoresis, settling, and wake geometry. **Use:** complementary model evidence for particle transport, not direct flight measurement. **Inventory:** 51 entries, 50 of them DAT files plus a ZIP.

#### Droplet combustion, extinction, and suppression

- **PSI-69 - FLEX.** Studies liquid-droplet flammability limits and gaseous suppressants; the guide describes heptane and methanol tests with nitrogen, carbon dioxide, helium, or xenon diluents. Relevant observables include burning rate, extinction, radiation, soot, and temperature. **Use:** a primary source for suppressant and extinction questions. The ambient mixture, droplet, and suppressant conditions must accompany any comparison. **Inventory:** 8,851 entries, led by TXT, ZIP, MP4, and PDF.
- **PSI-68 - FLEX-2.** Extends droplet work toward bi-component fuels and more realistic combustor conditions. Its metadata describes liquid-phase mixing, steady/unsteady gas- and liquid-phase behavior, extinction boundaries, soot-shell dynamics, droplet-array interactions, and model validation. **Use:** rich but technically specialized; identify the fuel blend and test regime before extracting a result. **Inventory:** 10,701 entries, mostly TXT and ZIP.
- **PSI-39 - Cool Flames Investigation (CFI).** Examines n-dodecane and n-dodecane/isododecane droplets at 0.25-5 atm, including helium dilution, droplet size, extinction, and soot during cool-flame combustion. The engine-chemistry value is substantial; the link to spacecraft fire response is more specific, namely low-temperature burning after visible-flame behavior changes. **Inventory:** 3,101 entries, led by TXT, ZIP, metadata, and MP4.
- **PSI-117 - FLEX cool-flame CFD.** A ground follow-on uses OpenFOAM to model n-alkane droplet cool flames and examine imposed heating and convection against FLEX observations. It reports model outputs such as ignition delay, oscillation, stand-off, and extinction behavior. Treat these as model results, not new flight measurements. **Inventory:** one ZIP entry.
- **PSI-142 - FLEX-based cool-flame study.** Uses FLEX conditions/data in simulations and ground-based counterflow flame experiments to examine cool-flame transitions and extinction. It is a secondary analysis, not a new spaceflight campaign. **Inventory:** four entries (DOCX, ZIP, and XLSX).

#### Gaseous flames, soot, and model validation

- **PSI-10 - ACME Flame Design.** Studies normal and inverse spherical diffusion flames using methane/ethylene and varying flow, dilution, and pressure to identify soot-inception/extinction behavior. **Use:** fundamental soot/flame-design evidence; less direct for crewed-habitat fire procedures. **Inventory:** 3,807 entries, led by ZIP, TXT, CSV, and MDIPSUG.
- **PSI-21 - ACME Coflow Laminar Diffusion Flame (CLD).** Characterizes methane and ethylene coflow flames from very dilute, near-extinction conditions to highly sooting conditions, with model-development goals. **Use:** connects fuel dilution and flow to flame/soot structure; keep the coflow setting explicit. **Inventory:** 4,851 entries, led by ZIP, TXT, CSV, MP4, and LOG.
- **PSI-22 - ACME E-FIELD Flames.** Varies electric-field strength/polarity, fuel, and flow to study chemi-ion current, flame response, stability, and soot. The detailed record describes methane/ethylene and voltage-current measurements. **Use:** an unusual flame-control mechanism, not a substitute for conventional fire suppression evidence. **Inventory:** 3,251 entries, led by ZIP, TXT, LOG, CSV, and MP4.
- **PSI-23 - ACME s-Flame.** Uses spherical diffusion flames to compare soot-free and sooty flame structure and dynamics, including extinction and transport/chemical-kinetic model validation. **Use:** valuable benchmark science; compare only with records sharing compatible fuel, diluent, and conditions. **Inventory:** 6,801 entries, led by ZIP, ASC, TXT, LOG, and CSV.
- **PSI-107 - SPICE.** Studies non-buoyant jet-flame smoke points and sooting propensity across fuels including ethylene, propane, and propylene mixtures, varying burner diameter, coflow, and fuel/air flow. The source connects soot to radiant heat and fire-spread concerns. **Inventory:** 211 entries, led by ZIP, XLS, PDF, and MP4.
- **PSI-159 - ACME Cool Flames Investigation with Gases (CFI-G).** Studies cool diffusion flames using propane, n-butane, and n-pentane in normal/inverse configurations across mixture and flow conditions, with camera, radiometer, photomultiplier, and thermocouple diagnostics plus CFD support. **Use:** gaseous-fuel low-temperature flame evidence; do not conflate it with droplet CFI (PSI-39). **Inventory:** 3,756 entries, led by TXT, ZIP, CSV, and MDIPSUG.
- **PSI-60 - SPICE image/model analysis.** A ground investigation applies image processing, color-ratio pyrometry, and calibrated SPICE light data to estimate soot-temperature fields and investigate soot differences between 1-g and 0-g flames. **Use:** derived analysis that can explain how imagery becomes a scientific variable. **Inventory:** one ZIP entry.

#### Modeling and adjacent records

- **PSI-62 - BASS flame-spread modeling.** Develops/validates flamelet-generated-manifold methods against BASS experiments and two-color tomography for concurrent flame spread. **Use:** model-validation evidence; separate simulation outputs from measured BASS observations. **Inventory:** one ZIP entry.
- **PSI-108 - Surface Tension Driven Convection Experiment-1 (STDCE-1).** Studies thermocapillary flow and temperature fields under constant-temperature and constant-flux configurations. It is a fluid-physics record, not a direct fire-safety experiment. **Inventory:** 51 entries, mainly MP4 and PDF.
- **PSI-181 - Solder structure and properties.** Examines Pb-Sn and lead-free solder microstructure across terrestrial/microgravity and temperature conditions. It is not combustion research and should be excluded from a fire-safety relevance ranking unless a user asks about spacecraft materials manufacturing. **Inventory:** 340 entries, mostly ZIP.

## Scientific context and facilities

NASA's overview describes the reason for reduced-gravity combustion research: buoyancy can dominate terrestrial flame behavior and obscure other processes. The ISS allows longer observation than short drop-tower or parabolic-flight tests. The page labels Flammability of Materials on the Moon (FM2), Solid Fuel Ignition and Extinction (SoFIE), and Flammability Limits At Reduced-g Experiment (FLARE) as current initiatives. FM2 addresses material burning at lunar gravity (one-sixth g); SoFIE examines ignition and extinction of solid fuels; and FLARE seeks to relate normal- and reduced-gravity flammability. The page also summarizes archived programs including ACME, BASS, DAFT, FLEX, SAFFIRE, SAME, SLICE, and SPICE. Treat these labels as the page's description, not independent confirmation of flight or operational status. [S2]

The overview describes the **Combustion Integrated Rack (CIR)** as a dedicated ISS facility with a 100-liter combustion chamber, optical access, diagnostics, gas handling, and safety features. The **Multi-user Droplet Combustion Apparatus (MDCA)** supports droplet-combustion investigations in the CIR. The older guide gives more implementation detail: CIR's configuration included multiple optical windows, cameras/lighting, gas distribution and cleanup, vibration isolation, and vacuum resources. It describes the **Microgravity Science Glovebox (MSG)** as a negative-pressure contained workbench with an enclosed work volume, used by experiments including SAME, SPICE, SLICE, and BASS. These are configuration details from the 2015 guide, not a guarantee of current facility configuration. Match an investigation to its actual hardware and configuration; a shared facility does not make two experiments directly comparable. [S2, S4]

The 2015 Researcher's Guide explains important comparison variables: fuel and material, sample geometry, oxygen fraction, pressure, forced-flow velocity, heat flux, diluent or suppressant, diagnostics, gravity environment, and acceleration disturbances. It notes that crew movement, equipment, vehicle events, and operations can disturb the ISS acceleration environment; the guide discusses SAMS/MAMS measurement systems for characterizing those conditions. It also summarizes evidence that low-flow microgravity flames can behave differently from normal-gravity flames; material flammability can depend strongly on ventilation and oxygen; soot and aerosol signatures can change; and local suppressant application may not always extinguish a flame. These are context-setting findings, not universal rules for every material or spacecraft scenario. [S4]

The guide's experiment descriptions connect the records to questions a dashboard can answer:

- **BASS/BASS-II and SAFFIRE:** What materials and airflow/oxygen conditions were tested, and what was observed about burning or spread?
- **SAME/SAME-R and DAFT:** What particle or background-aerosol measurements inform detection?
- **FLEX/FLEX-2 and CFI:** What fuels, diluents, and conditions relate to extinction, suppression, or cool flames?
- **ACME, SLICE, and SPICE:** What flame-structure, soot, stability, or model-validation evidence is available?

The guide is an October 2015 edition. Its descriptions of planned work and facility availability are historical snapshots; use the newer NASA overview and individual PSI records for current descriptions. [S2, S4]

### Findings from the guide that matter to the dashboard

The guide does more than explain that flames look different in microgravity; it identifies assumptions and variables that change the safety interpretation:

- **A flame can persist without buoyant flow.** The guide recounts candle flames lasting more than 45 minutes in microgravity and flame-ball experiments lasting more than 40 minutes. These examples challenge the assumption that a flame must self-extinguish when buoyancy-driven convection is absent. [S4]
- **Low-flow solid-fuel behavior is not a simple extension of 1-g behavior.** The guide describes a flammability boundary with a low-velocity region of increased concern, with characteristic flow near 10 cm/s in the discussed tests, and upstream flame spread at low forced-flow speeds. These are condition-specific findings from particular fuels and tests, not universal thresholds. [S4]
- **Flammability depends on coupled conditions.** Oxygen fraction, forced-flow speed and direction, pressure, sample thickness/shape, external heating, radiative losses, and sample preparation can all matter. A result without its test conditions is not a defensible ranking feature. [S4]
- **Visible extinction may not mean chemistry has stopped.** FLEX droplet studies described cool flames that continued after visible hot-flame extinction. For a dashboard, label visible flame, cool-flame activity, and complete extinction as distinct observations when the source reports them. [S4]
- **Smoke detection is a particle-characterization problem.** Smoke particle size and transport change with the environment; the guide connects SAME and DAFT to detector requirements and false-alarm challenges. Cite instrument and measurement context rather than treating "smoke" as one uniform signal. [S4]
- **Suppression is geometry- and flow-dependent.** The guide reports that a local nitrogen jet can entrain air and strengthen some microgravity flames, and that the best application point may not be obvious for an obstructed or wake-stabilized flame. Do not convert this into a general claim that nitrogen suppresses or worsens all fires. [S4]

These observations support a dashboard that answers "under what conditions and for which material/fuel?" before making a general statement. They also suggest explanatory fields for **flow regime**, **gravity level**, **observed combustion phase**, **diagnostic**, and **suppression delivery geometry**.

## Historical cases: lessons for safety interpretation

### Apollo 1

NASA's AS-204 page documents the 1967 cabin fire during a ground test in a pressurized, pure-oxygen environment. The review board found evidence of electrical arcing but did not identify a definitive ignition source. Fire growth and pressure made the three-piece hatch difficult to open; NASA also describes gaps in hazard review and rescue planning. Subsequent changes included a faster-opening hatch, tighter control of combustible materials, and fire-resistant suit materials. For RAD SI, Apollo 1 is a **systems-safety case** about oxygen-rich environments, ignition control, egress, hazard analysis, and organizational safety, not microgravity combustion data. [S5]

### Apollo 13

Apollo 13 was an oxygen-system explosion rather than a cabin fire. NASA's page describes how tank-heater design and thermostat incompatibility contributed to overheating and insulation damage; the loss of oxygen and fuel-cell capability forced an emergency return. The review-board recommendations led to tank-system redesign, additional redundancy, thermostat changes, and wiring protection. Its value is reliability engineering, oxygen-system hazards, and contingency planning; do not merge its event data with flame experiments. [S6]

### Mir

NASA's history of the 1997 Mir fire describes a solid-fuel oxygen generator that ignited, produced dense smoke, and temporarily blocked access to one Soyuz vehicle. The crew used masks and extinguishers, and the station's life-support system cleared the smoke. Investigators later considered hydrocarbon contamination, possibly latex glove material, the likely cause. The account highlights contamination control, crew training, egress, smoke management, and redundancy. It is an operational case study, not a controlled combustion test. [S7]

### Incident comparison for safety queries

| Case | Initiating hazard and propagation | Consequence / response | RAD SI use and evidence limit |
|---|---|---|---|
| **Apollo 1, 1967** | Pressurized pure-oxygen ground test; the review found electrical-arcing evidence but no definitive ignition source. Fire growth raised temperature and pressure; the three-piece hatch was difficult to open and the test had not received the appropriate hazard review. | Three crew members died from asphyxia/toxic gases. Later changes included a faster unified hatch, tighter combustible-material control, fire-resistant suit materials, and safety-process changes. | Tag as **ignition + oxygen-enrichment + egress + safety governance**. Use NASA's accident review for causal findings; do not treat it as a controlled flame experiment. [S5] |
| **Apollo 13, 1970** | An oxygen-tank heater/thermostat mismatch and damaged insulation contributed to tank failure. This was an oxygen-system explosion, not a cabin fire. | Loss of oxygen and fuel-cell capability forced a return-to-Earth contingency. The review prompted tank-system redesign, thermostat changes, added redundancy, and improved wiring protection. | Tag as **energy-storage / oxygen-system reliability + contingency operations**. It is a useful systems-safety comparison, not a fire-spread training example. [S6] |
| **Mir, 1997** | A solid-fuel oxygen-generator canister ignited in the station; the flame and smoke obstructed one escape route. NASA's account says investigators later identified contamination, likely latex glove material, as the most likely cause. | The crew used masks and multiple extinguishers; the station life-support system cleared smoke. Follow-up included crew-response training and changes in canister preparation. | Tag as **contamination + onboard response + smoke + egress + oxygen-generation redundancy**. Retain uncertainty around the exact contaminant mechanism. [S7] |

This comparison is best used for retrieval and scenario framing. The event narratives do not provide a shared experimental protocol or comparable quantitative labels.

## Terrestrial technology transfer

The three NASA Spinoff summaries are historical examples; they do not establish that the specific products remain commercially available or have unchanged performance today.

| Resource | What the summary reports | RAD SI connection |
|---|---|---|
| **Fireman's Air Tanks** (1976) | NASA Johnson Space Center and industry developed a lighter firefighter breathing-air backpack, with a redesigned mask and an individualized low-air warning. | Human factors and equipment design under hazardous, low-visibility conditions. |
| **Fire Detector** (1978) | A shuttle-derived detector sampled airborne particles and was designed to distinguish combustion particles from dust, reducing nuisance alarms and supporting centralized monitoring. | Detection systems must distinguish smoke from background aerosols and provide actionable location information. |
| **New Technology for the Fire Attire** (1982) | Project FIRES adapted lightweight, heat-resistant materials and design concepts associated with astronaut suits for firefighter protective ensembles. | Material science and protective equipment as an Earth application of space technology. |

Use these as **technology-transfer examples**, not as evidence for spacecraft sensor thresholds or comparative product performance. [S8, S9, S10]

### What the historical summaries actually support

- **Fireman's Air Tanks:** The 1976 summary reports a 20 lb backpack for a 30-minute air supply, described at the time as 13 lb lighter than conventional tanks, with a 4,500 psi system. It also mentions an aluminum liner wrapped in resin-impregnated glass fiber, a redesigned mask for better vision, and a personalized low-air warning. The comparison is to the equipment of that era, not today's standards. [S8]
- **Fire Detector:** The 1978 summary describes a shuttle-orbiter detector that samples airborne particles, distinguishes combustion particles from dust, and can link multiple sensors to a central display to identify a fire location. It reports detection before visible flame and smoke; treat that as the historical article's claim, not a modern independent performance evaluation. [S9]
- **Project FIRES / Fire Attire:** The 1982 summary describes a NASA/FEMA effort, technically managed by Marshall, to apply astronaut-suit and spacecraft thermal-protection materials to firefighter ensembles. It reports field evaluation involving 14 municipal fire departments. That is evidence of a planned/ongoing transfer program in the source period, not proof of present-day adoption or measured injury reduction. [S10]

### Cross-source evidence map

| User question | Primary PSI evidence | Supporting context | What the answer must preserve |
|---|---|---|---|
| Which tested materials or conditions relate to ignition and flame spread? | BASS/BASS-II, SAFFIRE, BRE, SLICE | NASA overview and 2015 guide; Apollo 1 safety case | Material/shape, oxygen, pressure, flow, gravity, apparatus, and whether evidence is screening, flight, or model data |
| What smoke properties can inform detection? | SAME/SAME-R, DAFT; PSI-115 model | Fire Detector Spinoff summary; Mir smoke-response case | Particle-size method, sample/material, flow/residence time, background dust, and sensor model |
| What is known about extinguishment? | FLEX/FLEX-2, BASS | 2015 guide's suppressant discussion; Apollo 1/Mir response narratives | Fuel/material, suppressant identity and delivery, flame geometry, ambient oxygen/flow, and definition of extinction |
| What improves mission-level resilience? | SAFFIRE and fire-safety PSI records, where directly relevant | Apollo 1, Apollo 13, Mir | Separate prevention, detection, suppression, egress, crew procedure, and system redundancy; distinguish incident evidence from experiments |
| Where did research transfer to Earth? | No single PSI record is sufficient | Three Spinoff summaries | Keep historical dates, claims, and evaluation context attached; do not infer current product status |

### Source-by-source project interpretation

| Source | Contribution to the research picture | Best role in RAD SI | Boundary to preserve |
|---|---|---|---|
| **S1 - PSI combustion search** | Searchable study metadata, objectives, investigation families, and file inventories. | Core evidence index and record/file provenance. | A file listing is not a reviewed dataset; validate access, schema, units, and run context. |
| **S2 - NASA Glenn overview** | Program context, current/archived experiment families, CIR/MDCA, and NASA's high-level explanation of reduced-gravity work. | Explain the mission and group records by prevention/detection/suppression. | Page status labels can change; verify individual experiment status. |
| **S3 - ScienceCasts video** | Short introductory media item about the value of combustion experiments on the ISS. | Optional onboarding or dashboard explainer. | The transcript was unavailable in this review, so no detailed result is attributed to the video. |
| **S4 - Researcher's Guide** | Technical concepts, experiment descriptions, known microgravity effects, facilities, and research-planning constraints. | Scientific context and condition dictionary for comparing PSI studies. | October 2015 edition; planned/active language is historical. |
| **S5 - Apollo 1** | Cabin-fire conditions, review findings, egress problems, and corrective design/safety changes. | Historical prevention and emergency-egress case. | Accident investigation narrative, not experimental combustion data. |
| **S6 - Apollo 13** | Oxygen-tank failure and mission recovery; system redesign and redundancy lessons. | Reliability and contingency case adjacent to fire safety. | Oxygen-system explosion, not a cabin-fire or flame-spread experiment. |
| **S7 - Mir fire** | On-orbit oxygen-generator fire, smoke, crew response, blocked escape route, and likely contamination cause. | Operational case for contamination control, response, and egress. | The exact contaminant mechanism is reported as most likely, not definitively established. |
| **S8 - Fireman's Air Tanks** | 1976 example of lighter breathing-air gear, mask visibility, and low-air warning design. | Human-factors / equipment-transfer example. | Historical product comparison; no present-day performance evidence. |
| **S9 - Fire Detector** | 1978 example of particle discrimination, nuisance-alarm reduction, and centralized fire location. | Detection-transfer example that complements SAME/DAFT. | Historical summary claims; not current detector validation data. |
| **S10 - Fire Attire** | 1982 NASA/FEMA Project FIRES summary of suit-material transfer and firefighter field evaluation. | Protective-material transfer example. | Field-evaluation history; not evidence of present adoption or quantified outcome. |

## Recommended RAD SI data model and workflow

### Minimum record structure

Preserve source provenance and represent missing values explicitly. A first-pass investigation record should include:

| Field group | Suggested fields |
|---|---|
| Identity and provenance | PSI accession, title, acronym, source URL, record version/date, related investigations, citation/publication |
| Research purpose | Objective, hypothesis, approach, research area, operational theme (prevention/detection/suppression/fundamental science) |
| Experimental conditions | Gravity environment, measured acceleration context when available, facility/hardware, fuel/material and geometry, oxygen fraction, pressure, airflow, temperature/heat flux, suppressant/diluent |
| Measurements | Diagnostic/sensor type, measured variable, units, temporal or spatial resolution, observed outcome, uncertainty/limitations |
| Data assets | File name, format, size, version, access/restriction status, description, parent investigation, checksum when available |
| Interpretation | Relevance rationale, evidence strength, transferability limits, extraction status, reviewer notes |

Keep the original units and reported labels. Add normalized values only alongside, not instead of, the source values, and record the conversion and assumptions.

### Staged implementation guidance

1. **Preserve a source snapshot:** ingest the 26 search records and detail metadata with retrieval time, source URL, accession, record version, and raw values. Store file-list entries as assets linked to their investigation; do not flatten them into one corpus.
2. **Measure coverage before ranking:** report which records have objectives, conditions, publications, measurements, and accessible files. Missing fields mean "unknown," not "no result."
3. **Select files deliberately:** begin with a small, well-documented set from the prevention, detection, and suppression shortlist. Inspect README/metadata and representative samples before writing a parser.
4. **Parse by modality:** extract text from PDFs and office documents with page/file provenance; inspect CSV/XLS/DAT headers and units before normalization; retain ZIPs as containers with child-file manifests; treat images and video as visual evidence requiring validated captions or human review.
5. **Build source-grounded retrieval:** index investigation summaries and selected document text; attach citations at the PSI accession and file/page level. Keep experiment records, derived model reports, historical cases, and Spinoff stories in separately labeled evidence classes.
6. **Evaluate before training:** create representative user questions and an expert-reviewed answer/evidence set. Measure whether retrieval returns the right investigation, conditions, and source passage. Fine-tune only if a defined task and defensible labeled examples later justify it.

### Transparent first-pass relevance rubric

For a prototype, use an explainable, human-reviewable score rather than a learned "hazard prediction." One possible rubric is 0-2 points for each factor:

| Factor | 0 | 1 | 2 |
|---|---|---|---|
| Safety-theme match | No clear fire-safety link | Indirect/fundamental link | Direct prevention, detection, or suppression evidence |
| Condition match | Key conditions differ or are unknown | Partial match | Strong match to the user's fuel/material, oxygen, pressure, flow, and gravity context |
| Evidence specificity | Narrative only | Methods or observations described | Traceable measurements/files and methods are available |
| Record completeness | Sparse metadata | Some conditions/publications present | Conditions, diagnostics, files, and references are well described |
| Access readiness | Access unknown/restricted | Metadata or summary only | Relevant source files are accessible and documented |

Show the factor scores and missing conditions alongside the total. This is a prioritization aid, not a validated risk score; do not present it as a probability of ignition, fire growth, or suppression success.

### Ranking and answer-quality guardrails

- Prefer direct evidence for the user's hazard and conditions; explain when a record is only indirectly relevant.
- Do not compare flammability limits or suppression performance without matching key conditions and measurement definitions.
- Distinguish measured results, NASA narrative summaries, model outputs, historical interpretations, and derived dashboard recommendations.
- Show access status and missing fields; do not infer a result from a file name or a search match.
- Use conservative language for extrapolation from microgravity to lunar gravity, spacecraft ventilation, or terrestrial settings.

## Source catalog

1. **[S1] NASA Physical Sciences Informatics (PSI), combustion search.** Dynamic search results and investigation records; use accession IDs and file-level metadata for traceability. The search page itself is a JavaScript application, so its visible HTML shell is not the complete search data.  
   https://psi.nasa.gov/physci/repo/search?q=combustion
2. **[S2] NASA Glenn, Combustion Science.** Scientific overview, experiment families, facilities, current initiatives as described on the page, and links to archived experiment summaries.  
   https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/
3. **[S3] NASA ScienceCasts, "The Power of Studying Combustion on the ISS" (March 13, 2018).** A short visual introduction to ISS combustion studies. The page metadata and description were accessible, but a full transcript was not exposed in the review environment; do not attribute detailed technical claims to the video without viewing it or obtaining its transcript.  
   https://www.youtube.com/watch?v=W1oXykoz9zg
4. **[S4] NASA, "A Researcher's Guide to: Combustion Science."** Article page links to the October 2015, 56-page guide by Gokoglu, Dietrich, Stocker, Ferkul, Olson, and Hicks. The guide covers microgravity fundamentals, prior investigations, safety lessons, facilities, and research planning.  
   https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/  
   [Download the linked 2015 PDF](https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf)
5. **[S5] NASA Safety and Mission Assurance, Apollo 1 AS-204.** Accident history, review-board findings, changes, and linked investigation documents.  
   https://sma.nasa.gov/sma-disciplines/accllp/apollo-1
6. **[S6] NASA Safety and Mission Assurance, Apollo 13 CSM-109 LM-7.** Oxygen-tank accident history, review-board findings, system changes, and linked reports.  
   https://sma.nasa.gov/sma-disciplines/accllp/apollo-13
7. **[S7] NASA History, "25 Years Ago: Fire Aboard Space Station Mir."** Narrative of the 1997 solid-fuel oxygen-generator fire and operational response.  
   https://www.nasa.gov/history/25-years-ago-fire-aboard-space-station-mir/
8. **[S8] NASA Spinoff, "Fireman's Air Tanks."** Historical summary, originally published in 1976.  
   https://spinoff.nasa.gov/node/9582
9. **[S9] NASA Spinoff, "Fire Detector."** Historical summary, originally published in 1978.  
   https://spinoff.nasa.gov/node/9407
10. **[S10] NASA Spinoff, "New Technology for the Fire Attire."** Historical summary of Project FIRES, originally published in 1982.  
    https://spinoff.nasa.gov/node/9918

## Review limitations

- The PSI search metadata and file inventories were reviewed; the 73,909 listed file entries were **not** downloaded or individually analyzed.
- PSI file-entry counts and summed declared sizes are approximate inventory measures, not deduplicated storage or guaranteed access totals.
- The YouTube page exposed title and description but not the complete transcript/video content in the review environment.
- Spinoff pages were retrieved through an alternate text-rendering route after direct page retrieval failed.
- The 2015 guide's planned/active language may be outdated. Use the current NASA overview and individual investigation records to verify present status.
