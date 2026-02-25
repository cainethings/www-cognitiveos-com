const DEFAULT_LOCALE = 'en';

const normalizeLocale = (locale) => {
  if (!locale || typeof locale !== 'string') return DEFAULT_LOCALE;
  return locale.toLowerCase().split('-')[0];
};

const readPath = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const interpolate = (value, vars) => {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  );
};

const getPreferredLocale = () => {
  if (typeof document !== 'undefined' && document.documentElement?.lang) {
    return normalizeLocale(document.documentElement.lang);
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return normalizeLocale(navigator.language);
  }
  return DEFAULT_LOCALE;
};

export const createTranslator = (translations, options = {}) => {
  const locale = normalizeLocale(options.locale || getPreferredLocale());
  const fallback = normalizeLocale(options.fallback || DEFAULT_LOCALE);
  const dictionary = translations[locale] || translations[fallback] || {};

  const t = (key, vars) => {
    const value = readPath(dictionary, key);
    if (typeof value !== 'string') return key;
    return interpolate(value, vars);
  };

  return { locale, t };
};

