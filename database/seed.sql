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

