-- NFL home stadiums (2026 season). Idempotent: INSERT IGNORE on unique slug.
-- VERIFY before relying on this data. Surfaces change often (and several
-- venues get temporary grass for the 2026 FIFA World Cup).
-- Lines marked "-- UNCERTAIN" need confirming; surface_brand is NULL
-- where the brand is not known with confidence.

INSERT IGNORE INTO stadiums (name, slug, city, state, surface_type, surface_brand, notes) VALUES
('State Farm Stadium', 'state-farm-stadium', 'Glendale', 'AZ', 'natural', NULL, 'Retractable roof; roll-out grass tray. Cardinals.'),
('Mercedes-Benz Stadium', 'mercedes-benz-stadium', 'Atlanta', 'GA', 'artificial', 'FieldTurf', 'Retractable roof. Falcons.'),
('M&T Bank Stadium', 'mt-bank-stadium', 'Baltimore', 'MD', 'natural', NULL, 'Ravens.'),
('Highmark Stadium', 'highmark-stadium', 'Orchard Park', 'NY', 'natural', NULL, 'New Bills stadium opening 2026.'), -- UNCERTAIN surface (new venue)
('Bank of America Stadium', 'bank-of-america-stadium', 'Charlotte', 'NC', 'natural', NULL, 'Panthers. Reported switch from FieldTurf to grass in 2025.'), -- UNCERTAIN
('Soldier Field', 'soldier-field', 'Chicago', 'IL', 'natural', NULL, 'Bears.'),
('Paycor Stadium', 'paycor-stadium', 'Cincinnati', 'OH', 'artificial', NULL, 'Bengals.'), -- UNCERTAIN brand
('Huntington Bank Field', 'huntington-bank-field', 'Cleveland', 'OH', 'natural', NULL, 'Browns.'),
('AT&T Stadium', 'att-stadium', 'Arlington', 'TX', 'artificial', 'Hellas Matrix', 'Retractable roof. Cowboys. World Cup 2026 venue.'), -- UNCERTAIN brand
('Empower Field at Mile High', 'empower-field-at-mile-high', 'Denver', 'CO', 'hybrid', NULL, 'Broncos.'), -- UNCERTAIN (natural vs hybrid)
('Ford Field', 'ford-field', 'Detroit', 'MI', 'artificial', 'FieldTurf', 'Dome. Lions.'),
('Lambeau Field', 'lambeau-field', 'Green Bay', 'WI', 'hybrid', 'SISGrass', 'Packers.'), -- UNCERTAIN brand
('NRG Stadium', 'nrg-stadium', 'Houston', 'TX', 'artificial', 'Hellas Matrix', 'Retractable roof. Texans. World Cup 2026 venue.'), -- UNCERTAIN brand
('Lucas Oil Stadium', 'lucas-oil-stadium', 'Indianapolis', 'IN', 'artificial', NULL, 'Retractable roof. Colts.'), -- UNCERTAIN brand
('EverBank Stadium', 'everbank-stadium', 'Jacksonville', 'FL', 'natural', NULL, 'Jaguars. Under major renovation 2025-2027; 2026 home venue/capacity may differ.'), -- UNCERTAIN
('GEHA Field at Arrowhead Stadium', 'arrowhead-stadium', 'Kansas City', 'MO', 'natural', NULL, 'Chiefs. World Cup 2026 venue.'),
('Allegiant Stadium', 'allegiant-stadium', 'Las Vegas', 'NV', 'natural', NULL, 'Dome; roll-out grass tray. Raiders.'),
('SoFi Stadium', 'sofi-stadium', 'Inglewood', 'CA', 'artificial', 'Hellas Matrix', 'Rams and Chargers. World Cup 2026 venue.'), -- UNCERTAIN brand
('Hard Rock Stadium', 'hard-rock-stadium', 'Miami Gardens', 'FL', 'natural', NULL, 'Dolphins.'),
('U.S. Bank Stadium', 'us-bank-stadium', 'Minneapolis', 'MN', 'artificial', NULL, 'Dome. Vikings.'), -- UNCERTAIN brand
('Gillette Stadium', 'gillette-stadium', 'Foxborough', 'MA', 'artificial', 'FieldTurf', 'Patriots. World Cup 2026 venue.'),
('Caesars Superdome', 'caesars-superdome', 'New Orleans', 'LA', 'artificial', NULL, 'Dome. Saints.'), -- UNCERTAIN brand
('MetLife Stadium', 'metlife-stadium', 'East Rutherford', 'NJ', 'artificial', NULL, 'Giants and Jets. World Cup 2026 final venue (temporary grass for the tournament).'), -- UNCERTAIN brand
('Lincoln Financial Field', 'lincoln-financial-field', 'Philadelphia', 'PA', 'natural', NULL, 'Eagles. World Cup 2026 venue.'), -- UNCERTAIN (natural vs hybrid)
('Acrisure Stadium', 'acrisure-stadium', 'Pittsburgh', 'PA', 'natural', NULL, 'Steelers.'),
('Levi''s Stadium', 'levis-stadium', 'Santa Clara', 'CA', 'natural', NULL, '49ers. World Cup 2026 venue.'),
('Lumen Field', 'lumen-field', 'Seattle', 'WA', 'artificial', 'FieldTurf', 'Seahawks. World Cup 2026 venue.'),
('Raymond James Stadium', 'raymond-james-stadium', 'Tampa', 'FL', 'natural', NULL, 'Buccaneers.'),
('Nissan Stadium', 'nissan-stadium', 'Nashville', 'TN', 'artificial', NULL, 'Titans. Switched to artificial turf in 2023; new stadium due 2027.'), -- UNCERTAIN brand
('Northwest Stadium', 'northwest-stadium', 'Landover', 'MD', 'natural', NULL, 'Commanders.');
