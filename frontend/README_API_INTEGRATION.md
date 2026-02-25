# Swadesi Connection UAT API Integration Guide (Frontend)

This document helps frontend engineers implement the Pooja Services experience using the UAT API and AI-assisted prompt engineering.

## Base URL

- UAT API base: `https://uat.swadesiconnection.in/api`

## Endpoints

- `GET /health`
- `GET /db-check`
- `POST /services/list`

## Core Mental Model

- `Service` = pooja/ceremony offering
- `City` = where a service is available
- `service_cities` = availability + city-specific service price override
- `Packages` = variants of a service
- `package_city_prices` = city-specific package price override
- `Translations` = localized labels/content (`en`, `ta`, `te`, `hi`)

Pricing behavior:
- Default price comes from `services` / `packages`
- If city override exists, API returns effective city price and source (`city_override`)

## `POST /services/list`

### Supported Request Body (JSON)

```json
{
  "locale": "en",
  "category_slug": "ceremonies",
  "subcategory_slug": "tamil-pooja-services",
  "city_name": "Chennai",
  "include_packages": true,
  "include_faqs": true,
  "include_cities": true,
  "include_inactive": false
}
```

### Filters (all optional)

- `locale` (`en`, `ta`, `te`, `hi`, etc.)
- `category_id`
- `category_slug`
- `subcategory_id`
- `subcategory_slug`
- `city_id`
- `city_name`
- `include_packages` (default `true`)
- `include_faqs` (default `true`)
- `include_cities` (default `true`)
- `include_inactive` (default `false`)

### Response Shape (important fields)

```json
{
  "count": 1,
  "filters": {
    "locale": "en"
  },
  "locale": {
    "requested": "ta",
    "resolved": "ta",
    "default": "en",
    "fallback_possible": true
  },
  "items": [
    {
      "id": 1,
      "name": "Aksharabhyasam",
      "slug": "aksharabhyasam",
      "short_description": "Initiation into education ceremony.",
      "long_description": null,
      "price_range": {
        "min": 5200,
        "max": 9200,
        "currency_code": "INR",
        "source": "city_override"
      },
      "category": {
        "id": 1,
        "name": "Ceremonies",
        "slug": "ceremonies",
        "description": "Traditional Hindu Ceremonies"
      },
      "subcategory": {
        "id": 1,
        "name": "Tamil Pooja Services",
        "slug": "tamil-pooja-services",
        "description": null
      },
      "cities": [
        {
          "id": 2,
          "name": "Chennai",
          "slug": "chennai",
          "availability_status": "available",
          "city_notes": null,
          "price_override": {
            "min": 5200,
            "max": 9200,
            "currency_code": "INR"
          }
        }
      ],
      "selected_city": {
        "id": 2,
        "name": "Chennai",
        "slug": "chennai",
        "availability_status": "available",
        "city_notes": null,
        "price_override": {
          "min": 5200,
          "max": 9200,
          "currency_code": "INR"
        }
      },
      "packages": [
        {
          "id": 1,
          "name": "Economy",
          "price": 5200,
          "base_price": 4800,
          "price_source": "city_override",
          "currency_code": "INR",
          "city_price_overrides": [],
          "procedures": [],
          "inclusions": []
        }
      ],
      "faqs": [
        {
          "id": 1,
          "question": "When should Aksharabhyasam be performed?",
          "answer": "Usually performed on auspicious days..."
        }
      ]
    }
  ]
}
```

## Frontend Implementation Notes

- Always call `POST /services/list` with JSON body (even for "all services").
- Pass `locale` from app language state.
- Pass `city_name` or `city_id` from city selector to get effective city pricing.
- Display `price_range.source` and `packages[].price_source` only for debugging/admin; hide in customer UI.
- Use `selected_city` for city-specific badge/availability messaging.
- If `include_cities=false`, `selected_city` may still be present when city filter is used.
- API already falls back to English/base content when translation is missing.

## Suggested Frontend Data Mapping

- Listing cards:
  - `name`
  - `short_description`
  - `price_range.min/max`
  - `rating`, `review_count`
  - `selected_city.availability_status`
- Service detail page (until detail endpoint exists):
  - use `packages`, `faqs`, `cities`, `category`, `subcategory`

## Error Handling

- `404`: wrong API path (`/api` missing)
- `500`: DB config/schema mismatch or server error
- Empty `items`: valid response; no matches for filters

## Postman Smoke Tests (for FE devs)

All services:

```json
{}
```

Chennai pricing:

```json
{
  "locale": "en",
  "city_name": "Chennai"
}
```

Tamil fallback test:

```json
{
  "locale": "ta",
  "city_name": "Chennai"
}
```

## Prompt Engineering Templates (for AI-assisted FE implementation)

Use these prompts with ChatGPT/Codex/Claude to speed up implementation. Paste actual response JSON samples from UAT for best results.

### 1) Build service listing page

```text
Build a React page for a Pooja Services listing using this API:
POST https://uat.swadesiconnection.in/api/services/list

Requirements:
- Fetch on page load with JSON body { "locale": "en" }
- Support filters: city_name, category_slug, subcategory_slug
- Show service cards with name, short_description, price range, rating, review count
- If selected_city.availability_status is "limited", show a badge
- Render loading, empty, and error states
- Use semantic HTML and mobile-first responsive layout
- Keep code split into component + API helper + types/interfaces

Here is a sample response JSON:
[PASTE RESPONSE HERE]
```

### 2) Add locale + city integration

```text
Update this React services list implementation to:
- pass locale from app state
- pass city_name from selected city state
- refetch when locale or city changes
- preserve filters in URL query params
- show effective pricing from price_range and package.price
- handle API fallback metadata (locale.requested/resolved)

Use the existing code below and modify it directly:
[PASTE CODE HERE]
```

### 3) Create TypeScript types from API response

```text
Generate TypeScript interfaces for the response of POST /services/list.
Include nested types for:
- category
- subcategory
- cities
- selected_city
- price_range
- packages
- package procedures
- package inclusions
- faqs
- locale metadata

Output only code.
```

### 4) Build a service detail page from list payload

```text
Create a React service detail page component that consumes a single item from /services/list.
Requirements:
- hero section with service name and localized description
- city availability block using selected_city
- packages accordion with procedures and inclusions
- FAQ accordion
- robust handling for missing/null fields
- mobile and desktop layouts

Use this sample item JSON:
[PASTE SINGLE ITEM HERE]
```

## Recommended FE Rollout

1. Implement API client for `/services/list`
2. Implement list page with city + category filters
3. Add locale support in requests
4. Add detail page using list payload
5. Replace with dedicated detail endpoint later (when available)

## Environment Notes

- API base path defaults to `/api`
- UAT may have partial translations; fallback behavior is expected
- Keep `locale` in every request for deterministic behavior
