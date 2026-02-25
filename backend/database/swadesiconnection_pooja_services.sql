-- =============================================
-- SWADESI CONNECTION (swadesiconnection.in)
-- POOJA / CEREMONY SERVICES DATABASE (MySQL 8+)
-- =============================================
--
-- Notes:
-- 1) Remove DROP/CREATE in production if DB already exists.
-- 2) This schema is adapted from your Harivara structure and extended
--    with sort_order, is_active, updated_at, indexes, and constraints.

DROP DATABASE IF EXISTS u625450350_sci;
CREATE DATABASE u625450350_sci CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE u625450350_sci;

-- =============================================
-- 1. CATEGORIES
-- =============================================

CREATE TABLE categories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NULL,
  image_url VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_categories_active_sort (is_active, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. SUBCATEGORIES
-- =============================================

CREATE TABLE subcategories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subcategories_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  UNIQUE KEY uq_subcategories_category_slug (category_id, slug),
  KEY idx_subcategories_category_active_sort (category_id, is_active, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. SERVICES
-- =============================================

CREATE TABLE services (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  subcategory_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  short_description TEXT NULL,
  long_description TEXT NULL,
  image_url VARCHAR(255) NULL,
  base_price_min DECIMAL(10,2) NULL,
  base_price_max DECIMAL(10,2) NULL,
  currency_code CHAR(3) NOT NULL DEFAULT 'INR',
  duration_minutes INT UNSIGNED NULL,
  rating DECIMAL(3,2) NULL,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_services_subcategory
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  KEY idx_services_subcategory_active_sort (subcategory_id, is_active, sort_order, id),
  KEY idx_services_featured (is_featured, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. PACKAGES
-- =============================================

CREATE TABLE packages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  service_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(140) NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NULL,
  priest_count INT UNSIGNED NULL,
  duration_minutes INT UNSIGNED NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_packages_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE KEY uq_packages_service_slug (service_id, slug),
  KEY idx_packages_service_active_sort (service_id, is_active, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. PACKAGE PROCEDURES
-- =============================================

CREATE TABLE package_procedures (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  procedure_name VARCHAR(200) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_procedures_package
    FOREIGN KEY (package_id) REFERENCES packages(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  KEY idx_package_procedures_package_sort (package_id, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. PACKAGE INCLUSIONS
-- =============================================

CREATE TABLE package_inclusions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  inclusion_name VARCHAR(200) NOT NULL,
  is_optional TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_inclusions_package
    FOREIGN KEY (package_id) REFERENCES packages(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  KEY idx_package_inclusions_package_sort (package_id, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. CITIES
-- =============================================

CREATE TABLE cities (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NULL UNIQUE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. SERVICE CITIES (M:N)
-- =============================================

CREATE TABLE service_cities (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  service_id BIGINT UNSIGNED NOT NULL,
  city_id BIGINT UNSIGNED NOT NULL,
  base_price_min_override DECIMAL(10,2) NULL,
  base_price_max_override DECIMAL(10,2) NULL,
  currency_code CHAR(3) NULL,
  availability_status ENUM('available', 'limited', 'unavailable') NOT NULL DEFAULT 'available',
  city_notes VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_cities_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_service_cities_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  UNIQUE KEY uq_service_cities_service_city (service_id, city_id),
  KEY idx_service_cities_city (city_id, service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. PACKAGE CITY PRICES (optional package-level overrides)
-- =============================================

CREATE TABLE package_city_prices (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  city_id BIGINT UNSIGNED NOT NULL,
  price_override DECIMAL(10,2) NOT NULL,
  currency_code CHAR(3) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_city_prices_package
    FOREIGN KEY (package_id) REFERENCES packages(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_package_city_prices_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  UNIQUE KEY uq_package_city_prices_package_city (package_id, city_id),
  KEY idx_package_city_prices_city (city_id, package_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. REVIEWS
-- =============================================

CREATE TABLE reviews (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  service_id BIGINT UNSIGNED NOT NULL,
  user_name VARCHAR(100) NULL,
  rating TINYINT UNSIGNED NULL,
  review_text TEXT NULL,
  is_approved TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  KEY idx_reviews_service_approved_created (service_id, is_approved, created_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 11. FAQ
-- =============================================

CREATE TABLE faqs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  service_id BIGINT UNSIGNED NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_faqs_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  KEY idx_faqs_service_active_sort (service_id, is_active, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 12. LOCALES
-- =============================================

CREATE TABLE locales (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 13. CATEGORY TRANSLATIONS
-- =============================================

CREATE TABLE category_translations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  locale_code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description VARCHAR(255) NULL,
  cms_content JSON NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_category_translations_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_category_translations_locale
    FOREIGN KEY (locale_code) REFERENCES locales(code)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_category_translations_category_locale (category_id, locale_code),
  UNIQUE KEY uq_category_translations_locale_slug (locale_code, slug),
  KEY idx_category_translations_lookup (category_id, locale_code, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 14. SUBCATEGORY TRANSLATIONS
-- =============================================

CREATE TABLE subcategory_translations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  subcategory_id BIGINT UNSIGNED NOT NULL,
  locale_code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description VARCHAR(255) NULL,
  cms_content JSON NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subcategory_translations_subcategory
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_subcategory_translations_locale
    FOREIGN KEY (locale_code) REFERENCES locales(code)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_subcategory_translations_subcategory_locale (subcategory_id, locale_code),
  UNIQUE KEY uq_subcategory_translations_locale_slug (locale_code, slug),
  KEY idx_subcategory_translations_lookup (subcategory_id, locale_code, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 15. SERVICE TRANSLATIONS
-- =============================================

CREATE TABLE service_translations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  service_id BIGINT UNSIGNED NOT NULL,
  locale_code VARCHAR(10) NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  short_description TEXT NULL,
  long_description TEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description VARCHAR(255) NULL,
  cms_content JSON NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_translations_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_service_translations_locale
    FOREIGN KEY (locale_code) REFERENCES locales(code)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_service_translations_service_locale (service_id, locale_code),
  UNIQUE KEY uq_service_translations_locale_slug (locale_code, slug),
  KEY idx_service_translations_lookup (service_id, locale_code, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 16. PACKAGE TRANSLATIONS
-- =============================================

CREATE TABLE package_translations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT UNSIGNED NOT NULL,
  locale_code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(140) NULL,
  description TEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description VARCHAR(255) NULL,
  cms_content JSON NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_translations_package
    FOREIGN KEY (package_id) REFERENCES packages(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_package_translations_locale
    FOREIGN KEY (locale_code) REFERENCES locales(code)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_package_translations_package_locale (package_id, locale_code),
  UNIQUE KEY uq_package_translations_locale_slug (locale_code, slug),
  KEY idx_package_translations_lookup (package_id, locale_code, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 17. FAQ TRANSLATIONS
-- =============================================

CREATE TABLE faq_translations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  faq_id BIGINT UNSIGNED NOT NULL,
  locale_code VARCHAR(10) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_faq_translations_faq
    FOREIGN KEY (faq_id) REFERENCES faqs(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_faq_translations_locale
    FOREIGN KEY (locale_code) REFERENCES locales(code)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_faq_translations_faq_locale (faq_id, locale_code),
  KEY idx_faq_translations_lookup (faq_id, locale_code, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SEED DATA (starter)
-- =============================================

-- Categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Ceremonies', 'ceremonies', 'Traditional Hindu Ceremonies', 10);

-- Subcategories
INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
(1, 'Tamil Pooja Services', 'tamil-pooja-services', 10);

-- Cities
INSERT INTO cities (name, slug) VALUES
('Hyderabad', 'hyderabad'),
('Chennai', 'chennai'),
('Bangalore', 'bangalore');

-- Services
INSERT INTO services
(subcategory_id, name, slug, short_description, base_price_min, base_price_max, rating, review_count, sort_order)
VALUES
(1, 'Aksharabhyasam', 'aksharabhyasam', 'Initiation into education ceremony.', 4800, 8800, 4.80, 20, 10),
(1, 'Annaprasana', 'annaprasana', 'First rice feeding ceremony.', 5000, 9000, 4.70, 15, 20),
(1, 'Griha Pravesham', 'griha-pravesham', 'House warming ceremony.', 7000, 15000, 4.90, 30, 30),
(1, 'Marriage', 'marriage', 'Traditional Hindu wedding rituals.', 25000, 75000, 4.90, 50, 40),
(1, 'Upanayanam', 'upanayanam', 'Sacred thread ceremony.', 12000, 25000, 4.60, 12, 50);

-- Service Cities Mapping (+ city-wise service price overrides)
INSERT INTO service_cities
(service_id, city_id, base_price_min_override, base_price_max_override, currency_code, availability_status, city_notes)
VALUES
(1,1,4800,8800,'INR','available',NULL),
(1,2,5200,9200,'INR','available','Travel and material availability may affect timing'),
(1,3,5500,9800,'INR','limited','Weekend slots fill fast'),
(2,1,5000,9000,'INR','available',NULL),
(2,2,5400,9400,'INR','available',NULL),
(3,1,7000,15000,'INR','available',NULL),
(3,3,7800,16500,'INR','limited',NULL),
(4,1,25000,75000,'INR','available','Depends on muhurtham and guest count'),
(5,2,12000,25000,'INR','available',NULL);

-- Packages (Example for Aksharabhyasam)
INSERT INTO packages (service_id, name, slug, description, price, priest_count, sort_order) VALUES
(1, 'Economy', 'economy', '1 Priest + Pooja Samagri', 4800, 1, 10),
(1, 'Standard', 'standard', '2 Priests + Saraswati & Hayagreeva Homam', 8800, 2, 20);

-- Package Procedures
INSERT INTO package_procedures (package_id, procedure_name, sort_order) VALUES
(1, 'Ganapathi Pooja', 10),
(1, 'Punyaha Vachanam', 20),
(1, 'Saraswati Pooja', 30),
(2, 'Ganapathi Pooja', 10),
(2, 'Maha Sankalpam', 20),
(2, 'Kalasha Pooja', 30),
(2, 'Saraswati & Hayagreeva Homam', 40);

-- Package Inclusions
INSERT INTO package_inclusions (package_id, inclusion_name, is_optional, sort_order) VALUES
(1, 'Dakshina', 0, 10),
(1, 'All Pooja Materials', 0, 20),
(1, 'Flowers & Fruits', 1, 30),
(2, 'Dakshina', 0, 10),
(2, 'All Pooja Materials', 0, 20);

-- Package City Price Overrides (optional)
INSERT INTO package_city_prices (package_id, city_id, price_override, currency_code) VALUES
(1, 2, 5200, 'INR'),
(1, 3, 5600, 'INR'),
(2, 2, 9300, 'INR'),
(2, 3, 9800, 'INR');

-- Reviews
INSERT INTO reviews (service_id, user_name, rating, review_text, is_approved) VALUES
(1, 'Ramesh', 5, 'Very professional and punctual service.', 1),
(1, 'Lakshmi', 4, 'Good priests and well organized.', 1);

-- FAQs
INSERT INTO faqs (service_id, question, answer, sort_order) VALUES
(1, 'When should Aksharabhyasam be performed?',
 'Usually performed on auspicious days like Vasant Panchami or Vijayadasami.', 10),
(1, 'What is included in the package?',
 'Priest, materials, and chanting as per Vedic standards.', 20);

-- Locales
INSERT INTO locales (code, name, is_default) VALUES
('en', 'English', 1),
('ta', 'Tamil', 0),
('te', 'Telugu', 0),
('hi', 'Hindi', 0);

-- Seed EN translations from base tables
INSERT INTO category_translations (category_id, locale_code, name, slug, description, is_published)
SELECT id, 'en', name, slug, description, 1 FROM categories;

INSERT INTO subcategory_translations (subcategory_id, locale_code, name, slug, description, is_published)
SELECT id, 'en', name, slug, description, 1 FROM subcategories;

INSERT INTO service_translations (service_id, locale_code, name, slug, short_description, long_description, is_published)
SELECT id, 'en', name, slug, short_description, long_description, 1 FROM services;

INSERT INTO package_translations (package_id, locale_code, name, slug, description, is_published)
SELECT id, 'en', name, slug, description, 1 FROM packages;

INSERT INTO faq_translations (faq_id, locale_code, question, answer, is_published)
SELECT id, 'en', question, answer, 1 FROM faqs;
