-- UAT incremental patch for swadesiconnection API schema expectations
-- Covers:
-- 1) City-wise pricing/availability columns + package_city_prices table
-- 2) Locales + translation tables + EN seed backfill
--
-- Target DB:
USE u625450350_sci;

-- =========================================================
-- A. CITY-WISE PRICING / AVAILABILITY (skip if already done)
-- =========================================================
-- If any ADD COLUMN fails because it already exists, comment that line and rerun.

ALTER TABLE service_cities
  ADD COLUMN base_price_min_override DECIMAL(10,2) NULL AFTER city_id,
  ADD COLUMN base_price_max_override DECIMAL(10,2) NULL AFTER base_price_min_override,
  ADD COLUMN currency_code CHAR(3) NULL AFTER base_price_max_override,
  ADD COLUMN availability_status ENUM('available', 'limited', 'unavailable') NOT NULL DEFAULT 'available' AFTER currency_code,
  ADD COLUMN city_notes VARCHAR(255) NULL AFTER availability_status,
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER city_notes;

CREATE TABLE IF NOT EXISTS package_city_prices (
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
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_package_city_prices_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_package_city_prices_package_city (package_id, city_id),
  KEY idx_package_city_prices_city (city_id, package_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional backfill defaults for existing mappings
UPDATE service_cities sc
JOIN services s ON s.id = sc.service_id
SET sc.base_price_min_override = COALESCE(sc.base_price_min_override, s.base_price_min),
    sc.base_price_max_override = COALESCE(sc.base_price_max_override, s.base_price_max),
    sc.currency_code = COALESCE(sc.currency_code, s.currency_code, 'INR'),
    sc.availability_status = COALESCE(sc.availability_status, 'available'),
    sc.is_active = COALESCE(sc.is_active, 1);

-- =========================================================
-- B. I18N / CMS-LIKE TRANSLATION TABLES
-- =========================================================

CREATE TABLE IF NOT EXISTS locales (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category_translations (
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

CREATE TABLE IF NOT EXISTS subcategory_translations (
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

CREATE TABLE IF NOT EXISTS service_translations (
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

CREATE TABLE IF NOT EXISTS package_translations (
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

CREATE TABLE IF NOT EXISTS faq_translations (
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

-- Locales seed/upsert
INSERT INTO locales (code, name, is_active, is_default) VALUES
('en', 'English', 1, 1),
('ta', 'Tamil', 1, 0),
('te', 'Telugu', 1, 0),
('hi', 'Hindi', 1, 0)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  is_active = VALUES(is_active);

-- Ensure only 'en' is default (safe repeat)
UPDATE locales SET is_default = CASE WHEN code = 'en' THEN 1 ELSE 0 END;

-- EN backfill (idempotent via ON DUPLICATE KEY UPDATE)
INSERT INTO category_translations (category_id, locale_code, name, slug, description, is_published)
SELECT c.id, 'en', c.name, c.slug, c.description, 1
FROM categories c
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  slug = VALUES(slug),
  description = VALUES(description),
  is_published = VALUES(is_published);

INSERT INTO subcategory_translations (subcategory_id, locale_code, name, slug, description, is_published)
SELECT sc.id, 'en', sc.name, sc.slug, sc.description, 1
FROM subcategories sc
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  slug = VALUES(slug),
  description = VALUES(description),
  is_published = VALUES(is_published);

INSERT INTO service_translations (service_id, locale_code, name, slug, short_description, long_description, is_published)
SELECT s.id, 'en', s.name, s.slug, s.short_description, s.long_description, 1
FROM services s
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  slug = VALUES(slug),
  short_description = VALUES(short_description),
  long_description = VALUES(long_description),
  is_published = VALUES(is_published);

INSERT INTO package_translations (package_id, locale_code, name, slug, description, is_published)
SELECT p.id, 'en', p.name, p.slug, p.description, 1
FROM packages p
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  slug = VALUES(slug),
  description = VALUES(description),
  is_published = VALUES(is_published);

INSERT INTO faq_translations (faq_id, locale_code, question, answer, is_published)
SELECT f.id, 'en', f.question, f.answer, 1
FROM faqs f
ON DUPLICATE KEY UPDATE
  question = VALUES(question),
  answer = VALUES(answer),
  is_published = VALUES(is_published);
