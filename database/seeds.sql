-- ============================================================
-- SportConnect Pro — Données de test (seeds.sql)
-- Respecter cet ordre d'insertion (contraintes de clés étrangères)
-- ============================================================

-- 1. families (aucune dépendance)
INSERT INTO families (name, quotient_familial) VALUES
  ('Famille Dupont', 550.00),   -- QF < 600 -> -40% (bourse sociale)
  ('Famille Martin', 750.00),   -- 600-900 -> -20%
  ('Famille Bernard', 1200.00), -- > 900 -> pas de réduction
  ('Famille Petit', 400.00);    -- < 600 -> -40%

-- 2. associations (aucune dépendance)
INSERT INTO associations (name, contact_email, contact_phone) VALUES
  ('AS Basket Métropole', 'contact@asbasket.fr', '+212600000001'),
  ('Club de Natation Les Dauphins', 'contact@dauphins.fr', '+212600000002'),
  ('Judo Club du Parc', 'contact@judoparc.fr', '+212600000003'),
  ('Boxing Academy', 'contact@boxingacademy.fr', '+212600000004');

-- 3. facilities (aucune dépendance)
INSERT INTO facilities (name, address, erp_capacity, is_divisible) VALUES
  ('Gymnase Jean Moulin', '12 rue de la République', 80, TRUE),
  ('Piscine Municipale des Ondines', '5 avenue des Sports', 60, FALSE),
  ('Dojo du Parc', '3 allée des Tilleuls', 30, FALSE),
  ('Complexe Sportif du Vallon', '20 chemin du Vallon', 120, TRUE);

-- 4. members (dépend de families)
INSERT INTO members (family_id, first_name, last_name, birth_date, is_resident, medical_certificate_date, pass_sport_code) VALUES
  (1, 'Léo',   'Dupont',  '2015-03-14', TRUE,  '2025-09-01', 'PS-2026-001'),  -- Poussin/Benjamin, cert valide
  (1, 'Emma',  'Dupont',  '2013-07-22', TRUE,  '2025-09-01', NULL),           -- 2e du foyer Dupont -> -15%
  (1, 'Noah',  'Dupont',  '2011-01-05', TRUE,  '2024-05-10', NULL),           -- 3e du foyer Dupont -> -30%
  (2, 'Chloé', 'Martin',  '1998-11-30', TRUE,  '2026-01-15', NULL),           -- Senior, résident
  (3, 'Hugo',  'Bernard', '1985-06-18', FALSE, '2023-02-01', NULL),           -- Cert > 3 ans -> non conforme
  (4, 'Alice', 'Petit',   '2009-09-09', TRUE,  '2026-08-01', 'PS-2026-002');  -- Minime, Pass'Sport

-- 5. activities (dépend de facilities et associations)
INSERT INTO activities (facility_id, association_id, name, sport_type, is_high_risk, age_category, base_price, max_capacity, subzone, day_of_week, start_time, end_time) VALUES
  (1, 1, 'Basketball Minimes', 'Basketball', FALSE, 'minime',       180.00, 16, 'A',  3, '17:00', '18:30'),
  (1, 1, 'Basketball Cadets',  'Basketball', FALSE, 'cadet',        190.00, 16, 'B',  3, '17:00', '18:30'), -- même créneau, autre sous-zone -> pas de conflit
  (2, 2, 'Natation Benjamin',  'Natation',   FALSE, 'benjamin',     220.00, 12, NULL, 3, '17:30', '18:30'),
  (3, 3, 'Judo Poussin',       'Judo',       FALSE, 'poussin',      160.00, 20, NULL, 2, '18:00', '19:00'),
  (4, 4, 'Boxe Adultes',       'Boxe',       TRUE,  'senior',       250.00, 15, 'B',  4, '19:00', '20:30'); -- sport à risque, cert < 1 an requis

-- 6. registrations (dépend de members et activities)
INSERT INTO registrations (member_id, activity_id, final_price, status, payment_plan) VALUES
  (3, 1, 180.00, 'confirmed', 'full'),                 -- Noah, 1ère inscription du foyer -> plein tarif de base
  (2, 3, 187.00, 'confirmed', 'three_installments'),   -- Emma, natation, paiement en 3x
  (6, 4, 96.00,  'confirmed', 'full');                 -- Alice, QF 400 -> -40%, tarif réduit

-- 7. waiting_list (dépend de members et activities)
INSERT INTO waiting_list (activity_id, member_id, priority_score, status) VALUES
  (5, 5, 0,  'waiting'),   -- Hugo (non-résident), en attente pour la Boxe
  (5, 4, 10, 'waiting');   -- Chloé (résidente), priorité +10 -> devrait passer devant Hugo