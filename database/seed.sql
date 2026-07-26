-- Sample data for local development and demos.
-- Load it after schema.sql:  mysql -u <user> -p internguide < database/seed.sql
--
-- Every account below uses the password: Password123
-- The companies are invented, not real businesses, because the reviews
-- attached to them are invented too.

USE internguide;

-- ---------------------------------------------------------------- users
-- 1 admin, 8 company owners, 18 students.
INSERT INTO users (name, email, password_hash, role, is_verified) VALUES
  ('Admin User',        'admin@internguide.rw',      'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'admin',         TRUE),
  ('Grace Mukamana',    'grace@kivusoftware.rw',     'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', TRUE),
  ('Eric Habimana',     'eric@isokodigital.rw',      'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', TRUE),
  ('Claudine Uwera',    'claudine@virungafintech.rw','scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', TRUE),
  ('Patrick Nsengimana','patrick@gorillacloud.rw',   'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', TRUE),
  ('Diane Umutoni',     'diane@sabyinyoagri.rw',     'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', TRUE),
  ('Olivier Rwema',     'olivier@amahoroedtech.rw',  'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', TRUE),
  ('Josiane Ingabire',  'josiane@ubwizadesign.rw',   'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', TRUE),
  -- registered her business but is still waiting for an admin to approve it
  ('Solange Mukandori', 'solange@ruzizipayments.rw', 'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'company_owner', FALSE),
  ('Aline Uwase',       'aline@alustudent.com',      'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('David Mugisha',     'david@alustudent.com',      'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  -- the one student left unverified on purpose, for testing the proof flow
  ('Sandrine Ishimwe',  'sandrine@alustudent.com',   'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       FALSE),
  ('Kevin Niyonzima',   'kevin@alustudent.com',      'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Chantal Mukamana',  'chantal@alustudent.com',    'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Fabrice Iradukunda','fabrice@alustudent.com',    'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Divine Uwimana',    'divine@alustudent.com',     'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Emmanuel Bizimana', 'emmanuel@alustudent.com',   'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Sonia Umulisa',     'sonia@alustudent.com',      'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Yves Ndayisaba',    'yves@alustudent.com',       'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Ange Kayitesi',     'ange@alustudent.com',       'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Bruno Mutabazi',    'bruno@alustudent.com',      'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Nadine Uwase',      'nadine@alustudent.com',     'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Samuel Gatete',     'samuel@alustudent.com',     'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Peace Umuhoza',     'peace@alustudent.com',      'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Alain Rugema',      'alain@alustudent.com',      'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       TRUE),
  ('Clarisse Nyirahabimana','clarisse@alustudent.com','scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',      TRUE),
  ('Thierry Habineza',  'thierry@alustudent.com',    'scrypt:32768:8:1$nMUCToAAl68a07PG$c925f5dbf1eaf7f3e2c4b709c1ca582d8fabd208a837ab3c28db36b288383e7eda0b1f75c0daca3ea807ba3402788db0da346a2b8f122168b903b1306724c705', 'student',       FALSE);

-- ------------------------------------------------------------ companies
-- 15 companies. Company 14 is still 'pending', so it sits in the admin's
-- approval queue and stays out of search until someone approves it.
-- average_rating is left NULL here and filled in at the bottom of this file.
INSERT INTO companies (owner_id, name, description, industry, location, website, google_address, size, founded_year, status) VALUES
  (2,    'Kivu Software',        'Custom software and mobile apps for the region.',            'Software',    'Kigali',  'https://kivusoftware.rw',   'KG 7 Ave, Kigali, Rwanda',                 '51-200', 2016, 'approved'),
  (3,    'Isoko Digital',        'E-commerce platform connecting local sellers.',              'E-commerce',  'Kigali',  'https://isokodigital.rw',   'KN 3 Rd, Nyarugenge, Kigali, Rwanda',      '11-50',  2018, 'approved'),
  (NULL, 'Akagera Systems',      'Data engineering and AI consulting.',                        'Data & AI',   'Kigali',  'https://akagerasystems.rw', 'KG 9 Ave, Kimihurura, Kigali, Rwanda',     '11-50',  2020, 'approved'),
  (NULL, 'Nyungwe Analytics',    'Research analytics for universities and NGOs.',              'Data & AI',   'Huye',    'https://nyungweanalytics.rw','Huye, Southern Province, Rwanda',         '1-10',   2021, 'approved'),
  (4,    'Virunga Fintech',      'Mobile lending and savings products.',                       'Fintech',     'Kigali',  'https://virungafintech.rw', 'KG 11 Ave, Kacyiru, Kigali, Rwanda',       '51-200', 2015, 'approved'),
  (NULL, 'Muhazi Health Tech',   'Clinic management software for rural health centres.',       'HealthTech',  'Kigali',  'https://muhazihealth.rw',   'KN 5 Rd, Kiyovu, Kigali, Rwanda',          '11-50',  2019, 'approved'),
  (NULL, 'Rwenzori Logistics',   'Delivery and warehousing across the Great Lakes region.',    'Logistics',   'Kigali',  'https://rwenzorilogistics.rw','KG 2 Roundabout, Gikondo, Kigali, Rwanda','200+',  2012, 'approved'),
  (5,    'Gorilla Cloud',        'Cloud hosting and DevOps support for African startups.',     'Cloud',       'Kigali',  'https://gorillacloud.rw',   'KG 5 Ave, Remera, Kigali, Rwanda',         '11-50',  2019, 'approved'),
  (NULL, 'Umuganda Labs',        'Civic technology built with local governments.',             'Civic Tech',  'Kigali',  'https://umugandalabs.rw',   'KN 78 St, Nyamirambo, Kigali, Rwanda',     '1-10',   2022, 'approved'),
  (NULL, 'Inzozi Media',         'Video production and digital storytelling.',                 'Media',       'Kigali',  'https://inzozimedia.rw',    'KG 546 St, Kimironko, Kigali, Rwanda',     '11-50',  2017, 'approved'),
  (6,    'Sabyinyo AgriTech',    'Sensors and advisory tools for smallholder farmers.',        'AgriTech',    'Musanze', 'https://sabyinyoagri.rw',   'Musanze, Northern Province, Rwanda',       '11-50',  2020, 'approved'),
  (NULL, 'Karongi Energy',       'Off-grid solar for lakeside communities.',                   'Energy',      'Karongi', 'https://karongienergy.rw',  'Karongi, Western Province, Rwanda',        '51-200', 2014, 'approved'),
  (8,    'Ubwiza Design Studio', 'Brand and product design for East African companies.',       'Design',      'Kigali',  'https://ubwizadesign.rw',   'KG 8 Ave, Kacyiru, Kigali, Rwanda',        '1-10',   2021, 'approved'),
  (9,    'Ruzizi Payments',      'Cross-border payments for traders on the Rwanda-DRC border.','Fintech',     'Rubavu',  'https://ruzizipayments.rw', 'Rubavu, Western Province, Rwanda',         '1-10',   2025, 'pending'),
  (7,    'Amahoro EdTech',       'Learning tools for secondary schools.',                      'EdTech',      'Kigali',  'https://amahoroedtech.rw',  'KG 176 St, Gisozi, Kigali, Rwanda',        '11-50',  2018, 'approved');

-- ------------------------------------------------------- company perks
INSERT INTO company_amenities (company_id, amenity) VALUES
  (1,'meals'),(1,'transport_allowance'),(1,'laptop_provided'),(1,'mentorship_program'),(1,'certificate'),(1,'return_offer'),
  (2,'transport_allowance'),(2,'flexible_hours'),(2,'certificate'),
  (3,'laptop_provided'),(3,'training_program'),(3,'certificate'),
  (4,'flexible_hours'),(4,'certificate'),
  (5,'meals'),(5,'transport_allowance'),(5,'health_insurance'),(5,'laptop_provided'),(5,'mentorship_program'),(5,'return_offer'),
  (6,'transport_allowance'),(6,'health_insurance'),(6,'certificate'),
  (7,'meals'),(7,'transport_allowance'),(7,'accommodation'),
  (8,'laptop_provided'),(8,'flexible_hours'),(8,'mentorship_program'),(8,'certificate'),(8,'return_offer'),
  (9,'flexible_hours'),(9,'mentorship_program'),
  (10,'meals'),(10,'flexible_hours'),(10,'certificate'),
  (11,'meals'),(11,'transport_allowance'),(11,'accommodation'),(11,'training_program'),
  (12,'transport_allowance'),(12,'accommodation'),(12,'health_insurance'),(12,'training_program'),
  (13,'laptop_provided'),(13,'flexible_hours'),(13,'mentorship_program'),
  (15,'meals'),(15,'laptop_provided'),(15,'training_program'),(15,'certificate');

-- --------------------------------------------------------- internships
INSERT INTO internships (company_id, title, description, location, deadline, is_active, compensation, stipend_amount, stipend_currency, stipend_period, work_mode, schedule, duration_months, start_date, openings, field) VALUES
  (1,  'Frontend Engineering Intern', 'Build screens in React alongside the product team.',        'Kigali',  '2026-09-30', TRUE,  'paid',            250000, 'RWF', 'month', 'hybrid', 'full_time', 6, '2026-10-01', 3, 'Engineering'),
  (1,  'QA Intern',                   'Write test plans and catch bugs before release.',           'Kigali',  '2026-08-31', TRUE,  'stipend',          80000, 'RWF', 'month', 'onsite', 'part_time', 3, '2026-09-15', 1, 'Engineering'),
  (2,  'Marketing Intern',            'Run campaigns for our seller community.',                   'Kigali',  '2026-09-15', TRUE,  'stipend',         100000, 'RWF', 'month', 'onsite', 'full_time', 4, '2026-10-01', 2, 'Marketing'),
  (2,  'Customer Support Intern',     'Help sellers get set up on the platform.',                  'Kigali',  '2026-10-31', TRUE,  'unpaid',            NULL, 'RWF',  NULL,   'remote', 'part_time', 3, '2026-11-01', 2, 'Operations'),
  (3,  'Data Engineering Intern',     'Move data into our warehouse and keep pipelines healthy.',  'Kigali',  '2026-09-01', TRUE,  'paid',            300000, 'RWF', 'month', 'onsite', 'full_time', 6, '2026-09-15', 2, 'Data'),
  (4,  'Research Assistant Intern',   'Clean survey data and prepare charts for reports.',         'Huye',    '2026-08-20', TRUE,  'academic_credit',   NULL, 'RWF',  NULL,   'hybrid', 'part_time', 4, '2026-09-01', 1, 'Data'),
  (5,  'Backend Engineering Intern',  'Ship API features for our lending product.',                'Kigali',  '2026-09-30', TRUE,  'paid',            350000, 'RWF', 'month', 'hybrid', 'full_time', 6, '2026-10-01', 4, 'Engineering'),
  (5,  'Risk Analyst Intern',         'Study repayment patterns and flag risky accounts.',         'Kigali',  '2026-09-30', TRUE,  'paid',            300000, 'RWF', 'month', 'onsite', 'full_time', 6, '2026-10-01', 2, 'Finance'),
  (5,  'UI Design Intern',            'Design screens for the savings app.',                       'Kigali',  '2026-07-31', FALSE, 'stipend',         150000, 'RWF', 'month', 'remote', 'flexible',  3, '2026-08-01', 1, 'Design'),
  (6,  'Mobile Developer Intern',     'Build the offline-first clinic app.',                       'Kigali',  '2026-10-15', TRUE,  'stipend',         120000, 'RWF', 'month', 'hybrid', 'full_time', 5, '2026-11-01', 2, 'Engineering'),
  (7,  'Operations Intern',           'Track deliveries and keep the dispatch board accurate.',    'Kigali',  '2026-08-31', TRUE,  'paid',            200000, 'RWF', 'month', 'onsite', 'full_time', 6, '2026-09-01', 5, 'Operations'),
  (7,  'Warehouse Data Intern',       'Keep stock records clean and report weekly.',               'Kigali',  '2026-09-30', TRUE,  'unpaid',            NULL, 'RWF',  NULL,   'onsite', 'part_time', 3, '2026-10-01', 2, 'Operations'),
  (8,  'DevOps Intern',               'Automate deployments and watch the monitoring dashboards.', 'Kigali',  '2026-09-20', TRUE,  'paid',            280000, 'RWF', 'month', 'remote', 'full_time', 6, '2026-10-01', 2, 'Engineering'),
  (8,  'Technical Writer Intern',     'Document our platform for new customers.',                  'Kigali',  '2026-10-31', TRUE,  'stipend',          90000, 'RWF', 'month', 'remote', 'flexible',  4, '2026-11-01', 1, 'Content'),
  (9,  'Civic Research Intern',       'Interview residents and summarise what they need.',         'Kigali',  '2026-08-15', TRUE,  'academic_credit',   NULL, 'RWF',  NULL,   'hybrid', 'part_time', 3, '2026-09-01', 2, 'Research'),
  (10, 'Video Production Intern',     'Shoot and edit short documentaries.',                       'Kigali',  '2026-09-10', TRUE,  'stipend',          80000, 'RWF', 'month', 'onsite', 'full_time', 4, '2026-10-01', 2, 'Media'),
  (10, 'Social Media Intern',         'Plan and schedule content across our channels.',            'Kigali',  '2026-11-30', TRUE,  'unpaid',            NULL, 'RWF',  NULL,   'remote', 'part_time', 3, '2026-12-01', 1, 'Marketing'),
  (11, 'Field Agronomy Intern',       'Visit farms and record sensor readings.',                   'Musanze', '2026-08-31', TRUE,  'paid',            180000, 'RWF', 'month', 'onsite', 'full_time', 6, '2026-09-15', 3, 'Agriculture'),
  (11, 'IoT Hardware Intern',         'Assemble and test soil sensors.',                           'Musanze', '2026-09-30', TRUE,  'stipend',         130000, 'RWF', 'month', 'onsite', 'full_time', 4, '2026-10-01', 2, 'Engineering'),
  (12, 'Solar Technician Intern',     'Install and service home solar kits.',                      'Karongi', '2026-09-15', TRUE,  'paid',            220000, 'RWF', 'month', 'onsite', 'full_time', 6, '2026-10-01', 4, 'Engineering'),
  (12, 'Community Trainer Intern',    'Teach households how to use their solar kits.',             'Karongi', '2026-10-31', TRUE,  'stipend',         110000, 'RWF', 'month', 'onsite', 'part_time', 3, '2026-11-01', 2, 'Operations'),
  (13, 'Brand Design Intern',         'Work on identity projects for real clients.',               'Kigali',  '2026-09-30', TRUE,  'stipend',         140000, 'RWF', 'month', 'hybrid', 'flexible',  4, '2026-10-15', 1, 'Design'),
  (13, 'Motion Design Intern',        'Animate explainer videos for client launches.',             'Kigali',  '2026-08-31', FALSE, 'unpaid',            NULL, 'RWF',  NULL,   'remote', 'part_time', 3, '2026-09-01', 1, 'Design'),
  (15, 'Curriculum Intern',           'Turn the syllabus into short lessons teachers can use.',    'Kigali',  '2026-09-30', TRUE,  'stipend',         120000, 'RWF', 'month', 'hybrid', 'full_time', 5, '2026-10-01', 2, 'Education'),
  (15, 'Teacher Training Intern',     'Run workshops for teachers joining the platform.',          'Kigali',  '2026-10-15', TRUE,  'academic_credit',   NULL, 'RWF',  NULL,   'onsite', 'part_time', 3, '2026-11-01', 2, 'Education');

-- ------------------------------------------------------------- reviews
-- gender and intern_year are optional on the real form; a few rows leave
-- gender blank on purpose so the charts have to cope with missing answers.
INSERT INTO reviews (company_id, user_id, mentorship, tasks, learning, environment, rating, comment, status, gender, intern_year) VALUES
  -- Kivu Software
  (1, 10, 5,4,4,4, 4.3, 'Great mentorship, I shipped real features in my first month.', 'approved', 'female', 2024),
  (1, 11, 4,4,4,4, 4.0, 'Solid team. Code reviews were patient and useful.',            'approved', 'male',   2024),
  (1, 13, 4,3,4,3, 3.5, 'Learned a lot, though the first weeks were slow.',             'approved', 'male',   2023),
  (1, 14, 5,5,4,4, 4.5, 'My manager made time for me every single week.',               'approved', 'female', 2023),
  (1, 15, 5,4,5,4, 4.5, 'Real production work, not coffee runs.',                       'approved', 'male',   2025),
  (1, 16, 4,4,5,5, 4.5, 'Best learning environment I have been in.',                    'approved', 'female', 2025),
  (1, 17, 3,3,4,3, 3.3, 'Good exposure but my mentor was often travelling.',            'approved', 'male',   2025),
  (1, 18, 5,5,5,4, 4.8, 'They treated interns like junior engineers, in a good way.',   'approved', 'female', 2026),
  (1, 19, 4,4,4,5, 4.3, 'Friendly office and a clear plan for my six months.',          'approved', 'male',   2026),
  (1, 20, 5,5,5,5, 5.0, 'I was offered a job at the end. Could not ask for more.',      'approved', 'female', 2024),
  (1, 21, 3,4,3,3, 3.3, 'Decent tasks, but onboarding could be much better.',           'approved', 'male',   2023),
  (1, 22, 4,5,4,4, 4.3, 'Loved the project I was given.',                               'pending',  'female', 2026),
  -- Isoko Digital
  (2, 10, 4,4,4,4, 4.0, 'Busy but well organised. I saw the whole product cycle.',      'approved', 'female', 2023),
  (2, 11, 3,3,3,3, 3.0, 'Average. You have to push to get interesting work.',           'approved', 'male',   2025),
  (2, 13, 4,3,3,3, 3.3, 'Nice people, repetitive tasks.',                               'approved', 'male',   2024),
  (2, 16, 5,4,4,4, 4.3, 'They paid on time and the transport money helped a lot.',      'approved', 'female', 2024),
  (2, 18, 4,4,3,4, 3.8, 'Good first internship.',                                       'approved', 'female', 2025),
  (2, 23, 3,4,3,3, 3.3, 'Fine, but no real mentorship structure.',                      'approved', 'male',   2025),
  (2, 24, 4,4,4,5, 4.3, 'The team genuinely listened to intern ideas.',                 'approved', 'female', 2026),
  (2, 25, 2,3,3,2, 2.5, 'I mostly did data entry for three months.',                    'approved', 'male',   2026),
  -- Virunga Fintech
  (5, 14, 5,5,5,4, 4.8, 'Serious engineering culture and proper code review.',          'approved', 'female', 2024),
  (5, 15, 4,4,4,4, 4.0, 'Good pay for an internship and real responsibility.',          'approved', 'male',   2024),
  (5, 17, 4,4,5,5, 4.5, 'I left knowing how a lending system actually works.',          'approved', 'male',   2025),
  (5, 19, 3,3,3,3, 3.0, 'Fine, but I was left alone more than I expected.',             'approved', 'male',   2025),
  (5, 20, 5,4,4,4, 4.3, 'Strong mentoring, especially in my first month.',              'approved', 'female', 2026),
  (5, 26, 4,5,4,4, 4.3, 'Challenging work and a supportive manager.',                   'approved', 'female', 2026),
  (5, 23, 4,4,3,4, 3.8, 'Learned risk modelling from scratch.',                         'approved', 'male',   2023),
  (5, 21, 5,5,4,5, 4.8, 'They invested in me and it showed.',                           'approved', 'male',   2023),
  -- Gorilla Cloud
  (8, 13, 5,5,5,5, 5.0, 'The best six months of my degree.',                            'approved', 'male',   2025),
  (8, 16, 4,5,4,4, 4.3, 'Remote worked well, the team was always reachable.',           'approved', 'female', 2025),
  (8, 18, 4,4,4,4, 4.0, 'Good balance of support and independence.',                    'approved', 'female', 2024),
  (8, 24, 5,4,5,4, 4.5, 'Learned more about infrastructure than in two courses.',       'approved', 'female', 2026),
  (8, 25, 4,4,4,5, 4.3, 'Clear expectations from day one.',                             'approved', 'male',   2026),
  (8, 26, 3,4,3,3, 3.3, 'Good company, but my project kept changing.',                  'approved', 'female', 2024),
  -- smaller companies
  (4, 10, 4,4,4,4, 4.0, 'Small team, so I got to try everything.',                      'approved', 'female', 2025),
  (4, 15, 3,3,4,3, 3.3, 'Quiet office, useful research experience.',                    'approved', 'male',   2026),
  (4, 20, 5,4,4,4, 4.3, 'My supervisor was excellent.',                                 'approved', 'female', 2023),
  (6, 17, 4,4,5,5, 4.5, 'Meaningful work, our app is used in real clinics.',            'approved', 'male',   2024),
  (6, 22, 3,3,3,3, 3.0, 'Okay experience, slow decision making.',                       'approved', 'female', 2025),
  (7, 21, 2,2,3,2, 2.3, 'Long hours and very little guidance.',                         'approved', 'male',   2025),
  (7, 23, 3,2,3,3, 2.8, 'I would not do it again, but I did learn logistics.',          'approved', 'male',   2024),
  (9, 14, 5,5,5,5, 5.0, 'Tiny team, huge impact. I loved it.',                          'approved', 'female', 2026),
  (9, 19, 4,4,4,4, 4.0, 'Interesting civic projects with real users.',                  'approved', 'male',   2026),
  (10, 26, 3,4,3,3, 3.3, 'Creative work but the pay was very low.',                     'approved', 'female', 2025),
  (10, 25, 2,2,2,3, 2.3, 'Disorganised. I often had nothing to do.',                    'approved', 'male',   2023),
  (11, 11, 4,4,4,5, 4.3, 'Field work every week, never boring.',                        'approved', 'male',   2026),
  (11, 22, 4,4,4,4, 4.0, 'Good training and they covered accommodation.',               'approved', 'female', 2024),
  (11, 17, 3,3,3,4, 3.3, 'Useful, though the sensors broke a lot.',                     'approved', 'male',   2023),
  (12, 24, 4,3,4,3, 3.5, 'Practical skills, lots of travel around the lake.',           'approved', 'female', 2024),
  (13, 20, 5,5,4,5, 4.8, 'Real client projects in my portfolio now.',                   'approved', 'female', 2025),
  (13, 14, 4,5,5,4, 4.5, 'Josiane reviewed my work personally every week.',             'approved', 'female', 2025),
  (13, 25, 4,4,4,4, 4.0, 'Small studio, very hands on.',                                'approved', 'male',   2024),
  (15, 18, 5,5,5,4, 4.8, 'I helped write lessons now used in real schools.',            'approved', 'female', 2023),
  (15, 13, 4,4,3,4, 3.8, 'Good team, a bit slow at times.',                             'approved', 'male',   2026),
  (15, 16, 4,4,4,4, 4.0, 'Solid experience for anyone going into teaching.',            'approved', NULL,     2026),
  -- a rejected one, so the moderation history is not all approvals
  (3, 21, 2,2,2,2, 2.0, 'They never replied to my emails.',                             'rejected', 'male',   2026);

-- ------------------------------------------------------------- replies
INSERT INTO replies (review_id, user_id, body) VALUES
  (1,  2, 'Thank you Aline. The mentorship programme is something we work hard at.'),
  (11, 2, 'Fair point on onboarding, we have rewritten our first-week plan since.'),
  (25, 4, 'Thank you, we are glad the structure worked for you.'),
  (24, 4, 'Sorry you felt left alone. We have added weekly check-ins for every intern.'),
  (34, 5, 'Thanks for the honest note, our project scoping is much tighter now.');

-- -------------------------------------------------- verification proofs
-- Two are still pending, so the admin queue has something in it.
INSERT INTO verification_proofs (user_id, company_id, file_path, status) VALUES
  (10, 1,  NULL, 'approved'),
  (11, 1,  NULL, 'approved'),
  (13, 2,  NULL, 'approved'),
  (14, 5,  NULL, 'approved'),
  (12, 3,  'uploads/proofs/sandrine-akagera.pdf', 'pending'),
  (27, 11, 'uploads/proofs/thierry-sabyinyo.pdf', 'pending');

-- ----------------------------------------------------- derived numbers
-- The app keeps average_rating up to date through the rating service; here
-- we do the same sum once, so the seeded data matches what the code would
-- have produced. Only approved reviews count.
UPDATE companies c
   SET average_rating = (
     SELECT ROUND(AVG(r.rating), 1)
       FROM reviews r
      WHERE r.company_id = c.id AND r.status = 'approved'
   );

-- demo accounts are pre-verified so their logins work
UPDATE users SET email_verified = TRUE;
