-- InternGuide seed data for local development and demos
-- run AFTER schema.sql:  mysql -u root -p < database/seed.sql
-- every seed user logs in with the password: Password123
USE internguide;

INSERT INTO users (name, email, password_hash, role, is_verified) VALUES
  ('Admin User',       'admin@internguide.rw',    'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'admin',         TRUE),
  ('Grace Mukamana',   'grace@kivusoftware.rw',   'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', TRUE),
  ('Eric Habimana',    'eric@isokodigital.rw',    'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', TRUE),
  ('Aline Uwase',      'aline@alustudent.com',    'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('David Mugisha',    'david@alustudent.com',    'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Sandrine Ishimwe', 'sandrine@alustudent.com', 'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       FALSE);

-- average_rating only reflects approved reviews; Akagera has none yet so it stays NULL
INSERT INTO companies (owner_id, name, description, industry, location, website, average_rating) VALUES
  (2,    'Kivu Software',   'Custom software and mobile apps for the region.', 'Software',   'Kigali', 'https://kivusoftware.rw',   4.5),
  (3,    'Isoko Digital',   'E-commerce platform connecting local sellers.',   'E-commerce', 'Kigali', 'https://isokodigital.rw',   4.0),
  (NULL, 'Akagera Systems', 'Data engineering and AI consulting.',             'Data & AI',  'Kigali', 'https://akagerasystems.rw', NULL);

INSERT INTO internships (company_id, title, description, location, deadline, is_active) VALUES
  (1, 'Frontend Developer Intern',  'Work on our React dashboard with a senior mentor.', 'Kigali', '2026-09-01', TRUE),
  (1, 'QA Intern',                  'Manual and automated testing of mobile releases.',  'Kigali', '2026-08-15', TRUE),
  (2, 'Marketing Analytics Intern', 'Analyse seller campaign data.',                     'Kigali', '2026-08-30', TRUE),
  (3, 'Data Engineering Intern',    'Build data pipelines with Python.',                 'Kigali', '2026-07-20', FALSE);

-- rating is always the average of the four category scores
INSERT INTO reviews (company_id, user_id, mentorship, tasks, learning, environment, rating, comment, status) VALUES
  (1, 4, 5, 4, 5, 4, 4.5, 'Great mentorship, I shipped real features.',           'approved'),
  (1, 5, 4, 5, 4, 5, 4.5, 'Challenging tasks and a supportive team.',             'approved'),
  (2, 4, 4, 4, 4, 4, 4.0, 'Solid experience, learned a lot about e-commerce.',    'approved'),
  (3, 5, 3, 4, 3, 4, 3.5, 'Interesting work, still waiting for my verification.', 'pending'),
  (2, 6, 2, 3, 2, 3, 2.5, 'Could not verify this internship.',                    'rejected');

-- file_path is cleared once a proof is reviewed, the file itself gets deleted for privacy
INSERT INTO verification_proofs (user_id, company_id, file_path, status) VALUES
  (4, 1, NULL, 'approved'),
  (5, 1, NULL, 'approved'),
  (4, 2, NULL, 'approved'),
  (5, 3, 'uploads/proofs/david-akagera.pdf', 'pending'),
  (6, 2, NULL, 'rejected');

INSERT INTO replies (review_id, user_id, body) VALUES
  (1, 2, 'Thank you Aline! It was a pleasure having you on the team.'),
  (3, 3, 'Glad you enjoyed it — our next cohort opens in August.');
