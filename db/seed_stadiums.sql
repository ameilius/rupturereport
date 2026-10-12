-- NFL home stadiums for the 2026 season (30 venues, 32 teams).
-- Idempotent: re-running upserts on the unique slug, so corrected values
-- overwrite rows from earlier seed versions.
-- Verified 2026-10-12 against the sources cited on each row.
-- surface_brand is NULL where 2026 sources disagree or don't name a product.
--
-- Shared sources:
--   [CC]  https://www.ccgrass.com/nfl-stadiums-turf-grass/            (Sep 24 2026, full surface table)
--   [SN]  https://www.sportingnews.com/us/nfl/news/nfl-stadiums-real-grass-artificial-turf-2026/88bc878934fa3d69e295937c
--   [AS]  https://en.as.com/nfl/nfl-field-controversy-grows-which-stadiums-still-use-artificial-turf-in-2026-f202607-n/
--   [MG]  https://www.mightygrass.com/nfl-stadiums-turf-vs-grass/
-- World Cup 2026: Atlanta, Foxborough, Arlington, Houston, Inglewood,
-- East Rutherford and Seattle laid temporary grass for the tournament and
-- went back to turf for the NFL season. Kansas City, Miami, Philadelphia and
-- Santa Clara stayed on grass. Source: https://sports.yahoo.com/articles/nfl-stadiums-artificial-turf-vs-082256208.html

INSERT INTO stadiums (name, slug, city, state, surface_type, surface_brand, notes) VALUES
-- Cardinals. Source: [CC] [SN]
('State Farm Stadium', 'state-farm-stadium', 'Glendale', 'AZ', 'natural', NULL, 'Cardinals. Retractable roof; roll-out natural grass tray.'),
-- Falcons. Sources: [AS] (FieldTurf Revolution), [MG] (FieldTurf CORE); both name FieldTurf
('Mercedes-Benz Stadium', 'mercedes-benz-stadium', 'Atlanta', 'GA', 'artificial', 'FieldTurf', 'Falcons. Retractable roof. Temporary grass for World Cup 2026; back to turf for the NFL season.'),
-- Ravens. Source: [CC] [SN]
('M&T Bank Stadium', 'mt-bank-stadium', 'Baltimore', 'MD', 'natural', NULL, 'Ravens.'),
-- Bills. Sources: https://www.buffalobills.com/news/why-are-the-bills-replacing-the-grass-at-highmark-stadium-it-wasn-t-up-to-their-standards
--               https://apnews.com/article/bills-stadium-grass-field-a5d656f544d6f2404575f5c406deb033
('Highmark Stadium', 'highmark-stadium', 'Orchard Park', 'NY', 'natural', 'Kentucky bluegrass', 'Bills. New stadium opened 2026 with heated, sub-air natural grass (Tuckahoe Turf Farms). Old stadium was turf. Field re-sodded Sept 2026 before the home opener.'),
-- Panthers. Sources: [CC] [AS] [MG]; https://www.panthers.com/news/new-playing-surface-bank-of-america-stadium
('Bank of America Stadium', 'bank-of-america-stadium', 'Charlotte', 'NC', 'artificial', 'FieldTurf', 'Panthers (shared with Charlotte FC). FieldTurf since 2021; still turf in 2026.'),
-- Bears. Source: [CC] [SN]
('Soldier Field', 'soldier-field', 'Chicago', 'IL', 'natural', NULL, 'Bears.'),
-- Bengals. Sources: [AS] [MG] (both: UBU Speed Series S5-M)
('Paycor Stadium', 'paycor-stadium', 'Cincinnati', 'OH', 'artificial', 'UBU Speed Series S5-M', 'Bengals.'),
-- Browns. Source: [CC] [SN]
('Huntington Bank Field', 'huntington-bank-field', 'Cleveland', 'OH', 'natural', NULL, 'Browns.'),
-- Cowboys. Sources: [AS] [MG] (Hellas Matrix)
('AT&T Stadium', 'att-stadium', 'Arlington', 'TX', 'artificial', 'Hellas Matrix', 'Cowboys. Retractable roof. Temporary grass for World Cup 2026; back to turf for the NFL season.'),
-- Broncos. Sources: [CC] (natural); The Athletic says only two NFL fields are hybrid (Lambeau, the Linc):
--          https://www.nytimes.com/athletic/7460649/2026/07/21/grass-vs-turf-nfl-debate/
('Empower Field at Mile High', 'empower-field-at-mile-high', 'Denver', 'CO', 'natural', NULL, 'Broncos.'),
-- Lions. Sources: [AS] (FieldTurf Classic HD), [MG] (FieldTurf CORE); both name FieldTurf
('Ford Field', 'ford-field', 'Detroit', 'MI', 'artificial', 'FieldTurf', 'Lions. Fixed dome.'),
-- Packers. Sources: [CC] (hybrid); https://www.packers.com/news/new-turf-ready-to-welcome-packers-into-2018-season
--          https://www.sispitches.com/us/case-study/touchdown-with-the-latest-sis-grass-hybrid-technology-at-green-bay-packers/
('Lambeau Field', 'lambeau-field', 'Green Bay', 'WI', 'hybrid', 'SISGrass hybrid', 'Packers. Kentucky bluegrass stitched with synthetic fibers (SISGrass since 2018).'),
-- Texans. Sources: [AS] [MG] (Hellas Matrix)
('NRG Stadium', 'nrg-stadium', 'Houston', 'TX', 'artificial', 'Hellas Matrix', 'Texans. Retractable roof. Temporary grass for World Cup 2026; back to turf for the NFL season.'),
-- Colts. Sources: [AS] [MG] (Shaw Sports Momentum Pro)
('Lucas Oil Stadium', 'lucas-oil-stadium', 'Indianapolis', 'IN', 'artificial', 'Shaw Sports Momentum Pro', 'Colts. Retractable roof.'),
-- Jaguars. Sources: [CC]; https://www.jaguars.com/news/jaguars-provide-2026-stadium-and-ticketing-updates
--          https://www.nfl.com/news/jaguars-everbank-stadium-renovation-2026-season
('EverBank Stadium', 'everbank-stadium', 'Jacksonville', 'FL', 'natural', NULL, 'Jaguars. 2026: six regular-season home games here at reduced capacity (~42,500) during the Stadium of the Future renovation. Two designated home games are in London (Wembley and Tottenham). 2027: Camping World Stadium, Orlando. New stadium opens 2028.'),
-- Chiefs. Source: [CC]; stays on grass (see World Cup note above)
('GEHA Field at Arrowhead Stadium', 'arrowhead-stadium', 'Kansas City', 'MO', 'natural', NULL, 'Chiefs. World Cup 2026 venue (grass).'),
-- Raiders. Source: [CC] [SN]
('Allegiant Stadium', 'allegiant-stadium', 'Las Vegas', 'NV', 'natural', NULL, 'Raiders. Fixed roof; roll-out natural grass tray.'),
-- Rams & Chargers. Sources: [AS] [MG] (Hellas Matrix)
('SoFi Stadium', 'sofi-stadium', 'Inglewood', 'CA', 'artificial', 'Hellas Matrix', 'Rams and Chargers. Temporary grass for World Cup 2026; back to turf for the NFL season.'),
-- Dolphins. Source: [CC]
('Hard Rock Stadium', 'hard-rock-stadium', 'Miami Gardens', 'FL', 'natural', NULL, 'Dolphins. World Cup 2026 venue (grass).'),
-- Vikings. Sources: [CC] (turf); https://www.startribune.com/vikings-us-bank-stadium-slit-film-turf-monofilament-justin-jefferson/600329966
--          Brand unconfirmed: [MG] / RFP name Act Global (UBU S5); [AS] names none
('U.S. Bank Stadium', 'us-bank-stadium', 'Minneapolis', 'MN', 'artificial', NULL, 'Vikings. Fixed roof. Monofilament turf installed 2024.'),
-- Patriots. Sources: https://www.sportsbusinessjournal.com/Articles/2026/08/10/gillette-stadium-installing-new-artificial-turf-after-nfl-noncompliance/
--          https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/turf-debacle-in-new-england-prompts-fieldturf-victory-lap
('Gillette Stadium', 'gillette-stadium', 'Foxborough', 'MA', 'artificial', 'FieldTurf', 'Patriots. Grass for World Cup 2026, then a Hellas turf that failed NFL lab compliance (no E-layer). Replaced with FieldTurf (2025-spec field) in Aug 2026.'),
-- Saints. Sources: [CC] (turf); brand conflict: [AS] FieldTurf Revolution 360 vs [MG] Turf Nation S5;
--          https://en.wikipedia.org/wiki/Caesars_Superdome
('Caesars Superdome', 'caesars-superdome', 'New Orleans', 'LA', 'artificial', NULL, 'Saints. Fixed dome.'),
-- Giants & Jets. Sources: [CC]; https://jetsxfactor.com/2026/07/24/jets-metlife-stadium-swap-out-world-cup-grass-turf/
--          brand conflict: [AS] UBU Speed Series S5-M vs [MG] FieldTurf CORE
('MetLife Stadium', 'metlife-stadium', 'East Rutherford', 'NJ', 'artificial', NULL, 'Giants and Jets. Hosted the World Cup 2026 final on temporary grass; permanent turf reinstalled July 2026.'),
-- Eagles. Sources: [CC] (hybrid); https://billypenn.com/2026/05/13/lincoln-financial-field-fifa-world-cup-soccer-tournament-grass-turf-covered-signs-eagles/
('Lincoln Financial Field', 'lincoln-financial-field', 'Philadelphia', 'PA', 'hybrid', NULL, 'Eagles. Hybrid grass. World Cup 2026 pitch was Kentucky bluegrass/ryegrass with HERO Hybrid Grass fibers; unconfirmed whether that system stays for the NFL season.'),
-- Steelers. Source: [CC] [SN]
('Acrisure Stadium', 'acrisure-stadium', 'Pittsburgh', 'PA', 'natural', NULL, 'Steelers.'),
-- 49ers. Source: [CC]
('Levi''s Stadium', 'levis-stadium', 'Santa Clara', 'CA', 'natural', NULL, '49ers. World Cup 2026 venue (grass).'),
-- Seahawks. Sources: [AS] [MG] (FieldTurf Revolution 360)
('Lumen Field', 'lumen-field', 'Seattle', 'WA', 'artificial', 'FieldTurf Revolution 360', 'Seahawks. Temporary grass for World Cup 2026; back to turf for the NFL season.'),
-- Buccaneers. Source: [CC] [SN]
('Raymond James Stadium', 'raymond-james-stadium', 'Tampa', 'FL', 'natural', NULL, 'Buccaneers.'),
-- Titans. Sources: [CC] [MG]; https://www.sportsfieldmanagement.org/news/hellas-matrix-helix-to-be-installed-at-nissan-stadium/
('Nissan Stadium', 'nissan-stadium', 'Nashville', 'TN', 'artificial', 'Hellas Matrix Helix', 'Titans. Turf since 2023. New enclosed stadium due 2027.'),
-- Commanders. Source: [CC] [SN]
('Northwest Stadium', 'northwest-stadium', 'Landover', 'MD', 'natural', NULL, 'Commanders.')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  city = VALUES(city),
  state = VALUES(state),
  surface_type = VALUES(surface_type),
  surface_brand = VALUES(surface_brand),
  notes = VALUES(notes);
