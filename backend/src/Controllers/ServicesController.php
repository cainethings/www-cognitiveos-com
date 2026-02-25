<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Database;
use App\Response;
use PDO;
use Throwable;

final class ServicesController
{
    public static function list(): void
    {
        $payload = self::payload();
        $requestedLocale = self::normalizeLocale($payload['locale'] ?? null);
        $defaultLocale = self::defaultLocale();
        $locale = $requestedLocale ?? $defaultLocale;

        $categoryId = self::normalizePositiveInt($payload['category_id'] ?? null);
        $categorySlug = self::normalizeString($payload['category_slug'] ?? ($payload['category'] ?? null));
        $subcategoryId = self::normalizePositiveInt($payload['subcategory_id'] ?? null);
        $subcategorySlug = self::normalizeString($payload['subcategory_slug'] ?? ($payload['subcategory'] ?? null));
        $cityId = self::normalizePositiveInt($payload['city_id'] ?? null);
        $cityName = self::normalizeString($payload['city_name'] ?? null);

        $includeInactive = self::normalizeBool($payload['include_inactive'] ?? false);
        $includePackages = self::normalizeBool($payload['include_packages'] ?? true);
        $includeFaqs = self::normalizeBool($payload['include_faqs'] ?? true);
        $includeCities = self::normalizeBool($payload['include_cities'] ?? true);

        try {
            $pdo = Database::connection();

            [$sql, $params] = self::buildServiceQuery(
                $categoryId,
                $categorySlug,
                $subcategoryId,
                $subcategorySlug,
                $cityId,
                $cityName,
                $includeInactive,
                $locale,
                $defaultLocale
            );

            $statement = $pdo->prepare($sql);
            $statement->execute($params);
            $rows = $statement->fetchAll();

            $serviceIds = array_values(array_unique(array_map(
                static fn (array $row): int => (int) $row['service_id'],
                $rows
            )));

            $needCityData = $includeCities || $cityId !== null || $cityName !== null;
            $citiesByServiceId = $needCityData ? self::loadCities($pdo, $serviceIds) : [];
            if ($includePackages) {
                $packagesByServiceId = self::loadPackages(
                    $pdo,
                    $serviceIds,
                    $includeInactive,
                    $cityId,
                    $cityName,
                    $locale,
                    $defaultLocale
                );
            } else {
                $packagesByServiceId = [];
            }
            $faqsByServiceId = $includeFaqs
                ? self::loadFaqs($pdo, $serviceIds, $includeInactive, $locale, $defaultLocale)
                : [];
            $selectedCityByServiceId = self::buildSelectedCityMap($citiesByServiceId, $cityId, $cityName);

            $items = [];
            foreach ($rows as $row) {
                $serviceId = (int) $row['service_id'];

                $items[] = [
                    'id' => $serviceId,
                    'name' => $row['service_name'],
                    'slug' => $row['service_slug'],
                    'short_description' => $row['short_description'],
                    'long_description' => $row['long_description'],
                    'image_url' => $row['image_url'],
                    'price_range' => self::servicePriceRange(
                        $row,
                        $selectedCityByServiceId[$serviceId] ?? null
                    ),
                    'duration_minutes' => $row['duration_minutes'] !== null ? (int) $row['duration_minutes'] : null,
                    'rating' => $row['rating'] !== null ? (float) $row['rating'] : null,
                    'review_count' => (int) $row['review_count'],
                    'is_featured' => (bool) $row['is_featured'],
                    'is_active' => (bool) $row['service_is_active'],
                    'sort_order' => (int) $row['service_sort_order'],
                    'metadata' => self::decodeJsonObject($row['metadata'] ?? null),
                    'category' => [
                        'id' => (int) $row['category_id'],
                        'name' => $row['category_name'],
                        'slug' => $row['category_slug'],
                        'is_active' => (bool) $row['category_is_active'],
                        'description' => $row['category_description'],
                    ],
                    'subcategory' => [
                        'id' => (int) $row['subcategory_id'],
                        'name' => $row['subcategory_name'],
                        'slug' => $row['subcategory_slug'],
                        'is_active' => (bool) $row['subcategory_is_active'],
                        'description' => $row['subcategory_description'],
                    ],
                    'cities' => $includeCities ? ($citiesByServiceId[$serviceId] ?? []) : [],
                    'selected_city' => $selectedCityByServiceId[$serviceId] ?? null,
                    'packages' => $packagesByServiceId[$serviceId] ?? [],
                    'faqs' => $faqsByServiceId[$serviceId] ?? [],
                ];
            }

            Response::json([
                'count' => count($items),
                'filters' => [
                    'locale' => $locale,
                    'category_id' => $categoryId,
                    'category_slug' => $categorySlug,
                    'subcategory_id' => $subcategoryId,
                    'subcategory_slug' => $subcategorySlug,
                    'city_id' => $cityId,
                    'city_name' => $cityName,
                    'include_inactive' => $includeInactive,
                ],
                'locale' => [
                    'requested' => $requestedLocale,
                    'resolved' => $locale,
                    'default' => $defaultLocale,
                    'fallback_possible' => $locale !== $defaultLocale,
                ],
                'items' => $items,
            ]);
        } catch (Throwable $exception) {
            error_log('[ServicesController] ' . $exception->getMessage());

            $env = getenv('APP_ENV') ?: 'local';
            $response = ['error' => 'Unable to fetch services right now.'];
            if ($env !== 'production') {
                $response['details'] = $exception->getMessage();
            }

            Response::json($response, 500);
        }
    }

    private static function buildServiceQuery(
        ?int $categoryId,
        ?string $categorySlug,
        ?int $subcategoryId,
        ?string $subcategorySlug,
        ?int $cityId,
        ?string $cityName,
        bool $includeInactive,
        string $locale,
        string $defaultLocale
    ): array {
        $params = [];
        $conditions = [];

        $sql = '
            SELECT DISTINCT
                s.id AS service_id,
                COALESCE(st_req.name, st_def.name, s.name) AS service_name,
                COALESCE(st_req.slug, st_def.slug, s.slug) AS service_slug,
                COALESCE(st_req.short_description, st_def.short_description, s.short_description) AS short_description,
                COALESCE(st_req.long_description, st_def.long_description, s.long_description) AS long_description,
                s.image_url,
                s.base_price_min,
                s.base_price_max,
                s.currency_code,
                s.duration_minutes,
                s.rating,
                s.review_count,
                s.is_featured,
                s.is_active AS service_is_active,
                s.sort_order AS service_sort_order,
                s.metadata,
                sc.id AS subcategory_id,
                COALESCE(sct_req.name, sct_def.name, sc.name) AS subcategory_name,
                COALESCE(sct_req.slug, sct_def.slug, sc.slug) AS subcategory_slug,
                COALESCE(sct_req.description, sct_def.description, sc.description) AS subcategory_description,
                sc.is_active AS subcategory_is_active,
                c.id AS category_id,
                COALESCE(ct_req.name, ct_def.name, c.name) AS category_name,
                COALESCE(ct_req.slug, ct_def.slug, c.slug) AS category_slug,
                COALESCE(ct_req.description, ct_def.description, c.description) AS category_description,
                c.is_active AS category_is_active
            FROM services s
            INNER JOIN subcategories sc ON sc.id = s.subcategory_id
            INNER JOIN categories c ON c.id = sc.category_id
            LEFT JOIN service_translations st_req
                ON st_req.service_id = s.id
               AND st_req.locale_code = :st_req_locale
               AND st_req.is_published = 1
            LEFT JOIN service_translations st_def
                ON st_def.service_id = s.id
               AND st_def.locale_code = :st_def_locale
               AND st_def.is_published = 1
            LEFT JOIN subcategory_translations sct_req
                ON sct_req.subcategory_id = sc.id
               AND sct_req.locale_code = :sct_req_locale
               AND sct_req.is_published = 1
            LEFT JOIN subcategory_translations sct_def
                ON sct_def.subcategory_id = sc.id
               AND sct_def.locale_code = :sct_def_locale
               AND sct_def.is_published = 1
            LEFT JOIN category_translations ct_req
                ON ct_req.category_id = c.id
               AND ct_req.locale_code = :ct_req_locale
               AND ct_req.is_published = 1
            LEFT JOIN category_translations ct_def
                ON ct_def.category_id = c.id
               AND ct_def.locale_code = :ct_def_locale
               AND ct_def.is_published = 1
        ';

        $params['st_req_locale'] = $locale;
        $params['st_def_locale'] = $defaultLocale;
        $params['sct_req_locale'] = $locale;
        $params['sct_def_locale'] = $defaultLocale;
        $params['ct_req_locale'] = $locale;
        $params['ct_def_locale'] = $defaultLocale;

        if ($cityId !== null || $cityName !== null) {
            $sql .= '
                INNER JOIN service_cities svc ON svc.service_id = s.id
                INNER JOIN cities ci ON ci.id = svc.city_id
            ';
        }

        if (!$includeInactive) {
            $conditions[] = 's.is_active = 1';
            $conditions[] = 'sc.is_active = 1';
            $conditions[] = 'c.is_active = 1';
            if ($cityId !== null || $cityName !== null) {
                $conditions[] = 'svc.is_active = 1';
                $conditions[] = 'ci.is_active = 1';
                $conditions[] = "svc.availability_status <> 'unavailable'";
            }
        }

        if ($categoryId !== null) {
            $conditions[] = 'c.id = :category_id';
            $params['category_id'] = $categoryId;
        } elseif ($categorySlug !== null) {
            $conditions[] = 'c.slug = :category_slug';
            $params['category_slug'] = $categorySlug;
        }

        if ($subcategoryId !== null) {
            $conditions[] = 'sc.id = :subcategory_id';
            $params['subcategory_id'] = $subcategoryId;
        } elseif ($subcategorySlug !== null) {
            $conditions[] = 'sc.slug = :subcategory_slug';
            $params['subcategory_slug'] = $subcategorySlug;
        }

        if ($cityId !== null) {
            $conditions[] = 'ci.id = :city_id';
            $params['city_id'] = $cityId;
        } elseif ($cityName !== null) {
            $conditions[] = 'LOWER(ci.name) = LOWER(:city_name)';
            $params['city_name'] = $cityName;
        }

        if ($conditions !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY c.sort_order ASC, c.id ASC, sc.sort_order ASC, sc.id ASC, s.sort_order ASC, s.id ASC';

        return [$sql, $params];
    }

    private static function loadCities(PDO $pdo, array $serviceIds): array
    {
        if ($serviceIds === []) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($serviceIds), '?'));
        $sql = '
            SELECT
                sc.service_id,
                c.id,
                c.name,
                c.slug,
                sc.base_price_min_override,
                sc.base_price_max_override,
                sc.currency_code AS override_currency_code,
                sc.availability_status,
                sc.city_notes,
                sc.is_active AS mapping_is_active
            FROM service_cities sc
            INNER JOIN cities c ON c.id = sc.city_id
            WHERE sc.service_id IN (' . $placeholders . ')
              AND c.is_active = 1
              AND sc.is_active = 1
            ORDER BY c.name ASC
        ';

        $statement = $pdo->prepare($sql);
        foreach (array_values($serviceIds) as $index => $serviceId) {
            $statement->bindValue($index + 1, $serviceId, PDO::PARAM_INT);
        }
        $statement->execute();

        $grouped = [];
        foreach ($statement->fetchAll() as $row) {
            $serviceId = (int) $row['service_id'];
            $grouped[$serviceId][] = [
                'id' => (int) $row['id'],
                'name' => $row['name'],
                'slug' => $row['slug'],
                'availability_status' => $row['availability_status'],
                'is_active' => (bool) $row['mapping_is_active'],
                'city_notes' => $row['city_notes'],
                'price_override' => [
                    'min' => $row['base_price_min_override'] !== null ? (float) $row['base_price_min_override'] : null,
                    'max' => $row['base_price_max_override'] !== null ? (float) $row['base_price_max_override'] : null,
                    'currency_code' => $row['override_currency_code'],
                ],
            ];
        }

        return $grouped;
    }

    private static function loadPackages(
        PDO $pdo,
        array $serviceIds,
        bool $includeInactive,
        ?int $selectedCityId,
        ?string $selectedCityName,
        string $locale,
        string $defaultLocale
    ): array
    {
        if ($serviceIds === []) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($serviceIds), '?'));
        $sql = '
            SELECT
                p.id,
                p.service_id,
                COALESCE(pt_req.name, pt_def.name, p.name) AS name,
                COALESCE(pt_req.slug, pt_def.slug, p.slug) AS slug,
                COALESCE(pt_req.description, pt_def.description, p.description) AS description,
                p.price,
                p.priest_count,
                p.duration_minutes,
                p.sort_order,
                p.is_active
            FROM packages p
            LEFT JOIN package_translations pt_req
                ON pt_req.package_id = p.id
               AND pt_req.locale_code = ?
               AND pt_req.is_published = 1
            LEFT JOIN package_translations pt_def
                ON pt_def.package_id = p.id
               AND pt_def.locale_code = ?
               AND pt_def.is_published = 1
            WHERE p.service_id IN (' . $placeholders . ')
        ';

        if (!$includeInactive) {
            $sql .= ' AND p.is_active = 1';
        }

        $sql .= ' ORDER BY p.service_id ASC, p.sort_order ASC, p.id ASC';

        $statement = $pdo->prepare($sql);
        $statement->bindValue(1, $locale);
        $statement->bindValue(2, $defaultLocale);
        foreach (array_values($serviceIds) as $index => $serviceId) {
            $statement->bindValue($index + 3, $serviceId, PDO::PARAM_INT);
        }
        $statement->execute();
        $packages = $statement->fetchAll();

        $packageIds = array_values(array_unique(array_map(
            static fn (array $row): int => (int) $row['id'],
            $packages
        )));

        $proceduresByPackageId = self::loadPackageProcedures($pdo, $packageIds);
        $inclusionsByPackageId = self::loadPackageInclusions($pdo, $packageIds);
        $packageCityPricesByPackageId = self::loadPackageCityPrices($pdo, $packageIds, $includeInactive);

        $grouped = [];
        foreach ($packages as $row) {
            $packageId = (int) $row['id'];
            $serviceId = (int) $row['service_id'];

            $cityPriceOverride = self::selectPackageCityPrice(
                $packageCityPricesByPackageId[$packageId] ?? [],
                $selectedCityId,
                $selectedCityName
            );

            $basePrice = $row['price'] !== null ? (float) $row['price'] : null;
            $effectivePrice = $cityPriceOverride !== null ? (float) $cityPriceOverride['price_override'] : $basePrice;
            $effectiveCurrency = $cityPriceOverride['currency_code'] ?? null;

            $grouped[$serviceId][] = [
                'id' => $packageId,
                'name' => $row['name'],
                'slug' => $row['slug'],
                'description' => $row['description'],
                'base_price' => $basePrice,
                'price' => $effectivePrice,
                'price_source' => $cityPriceOverride !== null ? 'city_override' : 'package_default',
                'currency_code' => $effectiveCurrency ?? 'INR',
                'priest_count' => $row['priest_count'] !== null ? (int) $row['priest_count'] : null,
                'duration_minutes' => $row['duration_minutes'] !== null ? (int) $row['duration_minutes'] : null,
                'is_active' => (bool) $row['is_active'],
                'sort_order' => (int) $row['sort_order'],
                'city_price_overrides' => array_values($packageCityPricesByPackageId[$packageId] ?? []),
                'procedures' => $proceduresByPackageId[$packageId] ?? [],
                'inclusions' => $inclusionsByPackageId[$packageId] ?? [],
            ];
        }

        return $grouped;
    }

    private static function loadPackageCityPrices(PDO $pdo, array $packageIds, bool $includeInactive): array
    {
        if ($packageIds === []) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($packageIds), '?'));
        $sql = '
            SELECT
                pcp.id,
                pcp.package_id,
                pcp.city_id,
                pcp.price_override,
                pcp.currency_code,
                pcp.is_active,
                c.name AS city_name,
                c.slug AS city_slug
            FROM package_city_prices pcp
            INNER JOIN cities c ON c.id = pcp.city_id
            WHERE pcp.package_id IN (' . $placeholders . ')
              AND c.is_active = 1
        ';

        if (!$includeInactive) {
            $sql .= ' AND pcp.is_active = 1';
        }

        $sql .= ' ORDER BY pcp.package_id ASC, c.name ASC';

        $statement = $pdo->prepare($sql);
        foreach (array_values($packageIds) as $index => $packageId) {
            $statement->bindValue($index + 1, $packageId, PDO::PARAM_INT);
        }
        $statement->execute();

        $grouped = [];
        foreach ($statement->fetchAll() as $row) {
            $packageId = (int) $row['package_id'];
            $cityId = (int) $row['city_id'];
            $grouped[$packageId][$cityId] = [
                'id' => (int) $row['id'],
                'city_id' => $cityId,
                'city_name' => $row['city_name'],
                'city_slug' => $row['city_slug'],
                'price_override' => (float) $row['price_override'],
                'currency_code' => $row['currency_code'],
                'is_active' => (bool) $row['is_active'],
            ];
        }

        return $grouped;
    }

    private static function loadPackageProcedures(PDO $pdo, array $packageIds): array
    {
        if ($packageIds === []) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($packageIds), '?'));
        $sql = '
            SELECT id, package_id, procedure_name, sort_order
            FROM package_procedures
            WHERE package_id IN (' . $placeholders . ')
            ORDER BY package_id ASC, sort_order ASC, id ASC
        ';

        $statement = $pdo->prepare($sql);
        foreach (array_values($packageIds) as $index => $packageId) {
            $statement->bindValue($index + 1, $packageId, PDO::PARAM_INT);
        }
        $statement->execute();

        $grouped = [];
        foreach ($statement->fetchAll() as $row) {
            $packageId = (int) $row['package_id'];
            $grouped[$packageId][] = [
                'id' => (int) $row['id'],
                'procedure_name' => $row['procedure_name'],
                'sort_order' => (int) $row['sort_order'],
            ];
        }

        return $grouped;
    }

    private static function loadPackageInclusions(PDO $pdo, array $packageIds): array
    {
        if ($packageIds === []) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($packageIds), '?'));
        $sql = '
            SELECT id, package_id, inclusion_name, is_optional, sort_order
            FROM package_inclusions
            WHERE package_id IN (' . $placeholders . ')
            ORDER BY package_id ASC, sort_order ASC, id ASC
        ';

        $statement = $pdo->prepare($sql);
        foreach (array_values($packageIds) as $index => $packageId) {
            $statement->bindValue($index + 1, $packageId, PDO::PARAM_INT);
        }
        $statement->execute();

        $grouped = [];
        foreach ($statement->fetchAll() as $row) {
            $packageId = (int) $row['package_id'];
            $grouped[$packageId][] = [
                'id' => (int) $row['id'],
                'inclusion_name' => $row['inclusion_name'],
                'is_optional' => (bool) $row['is_optional'],
                'sort_order' => (int) $row['sort_order'],
            ];
        }

        return $grouped;
    }

    private static function loadFaqs(
        PDO $pdo,
        array $serviceIds,
        bool $includeInactive,
        string $locale,
        string $defaultLocale
    ): array
    {
        if ($serviceIds === []) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($serviceIds), '?'));
        $sql = '
            SELECT
                f.id,
                f.service_id,
                COALESCE(ft_req.question, ft_def.question, f.question) AS question,
                COALESCE(ft_req.answer, ft_def.answer, f.answer) AS answer,
                f.sort_order,
                f.is_active
            FROM faqs f
            LEFT JOIN faq_translations ft_req
                ON ft_req.faq_id = f.id
               AND ft_req.locale_code = ?
               AND ft_req.is_published = 1
            LEFT JOIN faq_translations ft_def
                ON ft_def.faq_id = f.id
               AND ft_def.locale_code = ?
               AND ft_def.is_published = 1
            WHERE f.service_id IN (' . $placeholders . ')
        ';

        if (!$includeInactive) {
            $sql .= ' AND f.is_active = 1';
        }

        $sql .= ' ORDER BY f.service_id ASC, f.sort_order ASC, f.id ASC';

        $statement = $pdo->prepare($sql);
        $statement->bindValue(1, $locale);
        $statement->bindValue(2, $defaultLocale);
        foreach (array_values($serviceIds) as $index => $serviceId) {
            $statement->bindValue($index + 3, $serviceId, PDO::PARAM_INT);
        }
        $statement->execute();

        $grouped = [];
        foreach ($statement->fetchAll() as $row) {
            $serviceId = (int) $row['service_id'];
            $grouped[$serviceId][] = [
                'id' => (int) $row['id'],
                'question' => $row['question'],
                'answer' => $row['answer'],
                'is_active' => (bool) $row['is_active'],
                'sort_order' => (int) $row['sort_order'],
            ];
        }

        return $grouped;
    }

    private static function payload(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw !== false && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return $_POST ?: [];
    }

    private static function normalizePositiveInt($value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $intValue = (int) $value;
        return $intValue > 0 ? $intValue : null;
    }

    private static function normalizeString($value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim((string) $value);
        return $normalized !== '' ? $normalized : null;
    }

    private static function normalizeLocale($value): ?string
    {
        $locale = self::normalizeString($value);
        if ($locale === null) {
            return null;
        }

        $locale = strtolower(str_replace('_', '-', $locale));
        return preg_match('/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/', $locale) === 1 ? $locale : null;
    }

    private static function defaultLocale(): string
    {
        $envLocale = self::normalizeLocale(getenv('DEFAULT_CONTENT_LOCALE') ?: null);
        return $envLocale ?? 'en';
    }

    private static function normalizeBool($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        $normalized = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        return $normalized ?? false;
    }

    private static function decodeJsonObject($value): ?array
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : null;
    }

    private static function buildSelectedCityMap(array $citiesByServiceId, ?int $cityId, ?string $cityName): array
    {
        if ($cityId === null && $cityName === null) {
            return [];
        }

        $selected = [];
        foreach ($citiesByServiceId as $serviceId => $cities) {
            foreach ($cities as $city) {
                $matchesId = $cityId !== null && (int) $city['id'] === $cityId;
                $matchesName = $cityName !== null && strcasecmp((string) $city['name'], $cityName) === 0;
                if ($matchesId || $matchesName) {
                    $selected[(int) $serviceId] = $city;
                    break;
                }
            }
        }

        return $selected;
    }

    private static function servicePriceRange(array $row, ?array $selectedCity): array
    {
        $defaultMin = $row['base_price_min'] !== null ? (float) $row['base_price_min'] : null;
        $defaultMax = $row['base_price_max'] !== null ? (float) $row['base_price_max'] : null;
        $defaultCurrency = $row['currency_code'];

        if ($selectedCity === null) {
            return [
                'min' => $defaultMin,
                'max' => $defaultMax,
                'currency_code' => $defaultCurrency,
                'source' => 'service_default',
            ];
        }

        $override = $selectedCity['price_override'] ?? null;
        $overrideMin = is_array($override) && $override['min'] !== null ? (float) $override['min'] : null;
        $overrideMax = is_array($override) && $override['max'] !== null ? (float) $override['max'] : null;
        $overrideCurrency = is_array($override) ? ($override['currency_code'] ?? null) : null;

        $hasOverride = $overrideMin !== null || $overrideMax !== null;

        return [
            'min' => $hasOverride ? ($overrideMin ?? $defaultMin) : $defaultMin,
            'max' => $hasOverride ? ($overrideMax ?? $defaultMax) : $defaultMax,
            'currency_code' => $overrideCurrency ?? $defaultCurrency,
            'source' => $hasOverride ? 'city_override' : 'service_default',
        ];
    }

    private static function selectPackageCityPrice(array $cityPrices, ?int $cityId, ?string $cityName): ?array
    {
        if ($cityPrices === []) {
            return null;
        }

        if ($cityId !== null && isset($cityPrices[$cityId])) {
            return $cityPrices[$cityId];
        }

        if ($cityName !== null) {
            foreach ($cityPrices as $cityPrice) {
                if (strcasecmp((string) ($cityPrice['city_name'] ?? ''), $cityName) === 0) {
                    return $cityPrice;
                }
            }
        }

        return null;
    }
}
