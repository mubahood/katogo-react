// ===================================================================
// API CONFIGURATION - Moved to /src/app/constants/index.ts
// Use API_CONFIG instead of these direct exports
// ===================================================================

export const TIMEOUT = 8000;
export const MAX_RETRIES = 3;
export const DATE_FORMAT = "YYYY-MM-DD";
export const CURRENCY = "UGX";
export const LOCAL_MANIFEST = "LOCAL_MANIFEST";
export const CART_ITEMS = "CART_ITEMS";
export const LOCAL_DISTRICTS = "LOCAL_DISTRICTS";
export const APP_NAME = "UgFlix";
export const LOCAL_JOBSEEKER_MANIFEST = "LOCAL_JOBSEEKER_MANIFEST";

// Cache System Constants
export const CACHE_VERSION = "1.0.0";
export const CACHE_PREFIX = "BLITX_CACHE_";
export const CACHE_METADATA_KEY = "BLITX_CACHE_METADATA";

// Cache Keys for different data types
export const CACHE_KEYS = {
  CATEGORIES: `${CACHE_PREFIX}CATEGORIES`,
  MANIFEST: `${CACHE_PREFIX}MANIFEST`,
  PRODUCTS: `${CACHE_PREFIX}PRODUCTS`,
  PRODUCT_DETAILS: `${CACHE_PREFIX}PRODUCT_DETAILS`,
  VENDORS: `${CACHE_PREFIX}VENDORS`,
  SEARCH_RESULTS: `${CACHE_PREFIX}SEARCH`,
  FEATURED_PRODUCTS: `${CACHE_PREFIX}FEATURED`,
  BANNER_CATEGORIES: `${CACHE_PREFIX}BANNER_CATS`,
} as const;

// Cache Expiration Times (in milliseconds)
export const CACHE_DURATIONS = {
  CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours (very stable)
  MANIFEST: 12 * 60 * 60 * 1000, // 12 hours (app config)
  PRODUCTS: 2 * 60 * 60 * 1000, // 2 hours (moderate freshness)
  PRODUCT_DETAILS: 1 * 60 * 60 * 1000, // 1 hour (high freshness)
  VENDORS: 6 * 60 * 60 * 1000, // 6 hours (moderately stable)
  SEARCH_RESULTS: 30 * 60 * 1000, // 30 minutes (dynamic)
  FEATURED_PRODUCTS: 4 * 60 * 60 * 1000, // 4 hours (promotional content)
  BANNER_CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours (very stable)
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  MAX_STORAGE_SIZE: 50 * 1024 * 1024, // 50MB total cache limit
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // Run cleanup daily
  ENABLE_BACKGROUND_SYNC: true, // Enable background data refresh
  DEBUG_MODE: import.meta.env.MODE !== "production", // Disable in production
} as const;

// Debug Configuration
export const DEBUG_CONFIG = {
  ENABLE_CONSOLE_LOGS: import.meta.env.MODE === "development", // Only in development
  ENABLE_ANALYTICS_LOGS: false, // Disable analytics spam
  ENABLE_API_LOGS: false, // Disable API spam  
  ENABLE_PERFORMANCE_LOGS: false, // Disable performance spam
  LOG_LEVEL: import.meta.env.MODE === "production" ? "error" : "debug",
} as const;

// Service Initialization Guards
export const SERVICE_GUARDS = {
  ANALYTICS_INITIALIZED: false,
  CACHE_INITIALIZED: false,
  PERFORMANCE_INITIALIZED: false,
} as const;

// Production Configuration
export const PRODUCTION_CONFIG = {
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_REPORTING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  API_TIMEOUT: 10000, // 10 seconds for production
  MAX_RETRY_ATTEMPTS: 2,
  ENABLE_SERVICE_WORKER: true,
} as const;

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "Full Time", label: "Full Time" },
  { value: "Part Time", label: "Part Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];

export const DB_TOKEN = "DB_TOKEN";
export const DB_LOGGED_IN_PROFILE = "DB_LOGGED_IN_PROFILE";
export const COUNTRIES = [
  { value: "UG", label: "Uganda" },
  { value: "AF", label: "Afghanistan" },
  { value: "AL", label: "Albania" },
  { value: "DZ", label: "Algeria" },
  { value: "AS", label: "American Samoa" },
  { value: "AD", label: "Andorra" },
  { value: "AO", label: "Angola" },
  { value: "AI", label: "Anguilla" },
  { value: "AQ", label: "Antarctica" },
  { value: "AG", label: "Antigua and Barbuda" },
  { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" },
  { value: "AW", label: "Aruba" },
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaijan" },
  { value: "BS", label: "Bahamas" },
  { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" },
  { value: "BB", label: "Barbados" },
  { value: "BY", label: "Belarus" },
  { value: "BE", label: "Belgium" },
  { value: "BZ", label: "Belize" },
  { value: "BJ", label: "Benin" },
  { value: "BM", label: "Bermuda" },
  { value: "BT", label: "Bhutan" },
  { value: "BO", label: "Bolivia" },
  { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BW", label: "Botswana" },
  { value: "BR", label: "Brazil" },
  { value: "BN", label: "Brunei Darussalam" },
  { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BI", label: "Burundi" },
  { value: "KH", label: "Cambodia" },
  { value: "CM", label: "Cameroon" },
  { value: "CA", label: "Canada" },
  { value: "CV", label: "Cape Verde" },
  { value: "KY", label: "Cayman Islands" },
  { value: "CF", label: "Central African Republic" },
  { value: "TD", label: "Chad" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" },
  { value: "KM", label: "Comoros" },
  { value: "CG", label: "Congo" },
  { value: "CD", label: "Congo, Democratic Republic" },
  { value: "CR", label: "Costa Rica" },
  { value: "CI", label: "Cote d'Ivoire" },
  { value: "HR", label: "Croatia" },
  { value: "CU", label: "Cuba" },
  { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" },
  { value: "DJ", label: "Djibouti" },
  { value: "DM", label: "Dominica" },
  { value: "DO", label: "Dominican Republic" },
  { value: "EC", label: "Ecuador" },
  { value: "EG", label: "Egypt" },
  { value: "SV", label: "El Salvador" },
  { value: "GQ", label: "Equatorial Guinea" },
  { value: "ER", label: "Eritrea" },
  { value: "EE", label: "Estonia" },
  { value: "ET", label: "Ethiopia" },
  { value: "FJ", label: "Fiji" },
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  { value: "GA", label: "Gabon" },
  { value: "GM", label: "Gambia" },
  { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" },
  { value: "GH", label: "Ghana" },
  { value: "GR", label: "Greece" },
  { value: "GD", label: "Grenada" },
  { value: "GU", label: "Guam" },
  { value: "GT", label: "Guatemala" },
  { value: "GN", label: "Guinea" },
  { value: "GW", label: "Guinea-Bissau" },
  { value: "GY", label: "Guyana" },
  { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" },
  { value: "HK", label: "Hong Kong" },
  { value: "HU", label: "Hungary" },
  { value: "IS", label: "Iceland" },
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" },
  { value: "IE", label: "Ireland" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" },
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japan" },
  { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "KE", label: "Kenya" },
  { value: "KI", label: "Kiribati" },
  { value: "KP", label: "Korea, Democratic People's Republic" },
  { value: "KR", label: "Korea, Republic" },
  { value: "KW", label: "Kuwait" },
  { value: "KG", label: "Kyrgyzstan" },
  { value: "LA", label: "Lao People's Democratic Republic" },
  { value: "LV", label: "Latvia" },
  { value: "LB", label: "Lebanon" },
  { value: "LS", label: "Lesotho" },
  { value: "LR", label: "Liberia" },
  { value: "LY", label: "Libya" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  { value: "MO", label: "Macao" },
  { value: "MK", label: "Macedonia" },
  { value: "MG", label: "Madagascar" },
  { value: "MW", label: "Malawi" },
  { value: "MY", label: "Malaysia" },
  { value: "MV", label: "Maldives" },
  { value: "ML", label: "Mali" },
  { value: "MT", label: "Malta" },
  { value: "MH", label: "Marshall Islands" },
  { value: "MR", label: "Mauritania" },
  { value: "MU", label: "Mauritius" },
  { value: "MX", label: "Mexico" },
  { value: "FM", label: "Micronesia" },
  { value: "MD", label: "Moldova" },
  { value: "MC", label: "Monaco" },
  { value: "MN", label: "Mongolia" },
  { value: "ME", label: "Montenegro" },
  { value: "MS", label: "Montserrat" },
  { value: "MA", label: "Morocco" },
  { value: "MZ", label: "Mozambique" },
  { value: "MM", label: "Myanmar" },
  { value: "NA", label: "Namibia" },
  { value: "NR", label: "Nauru" },
  { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" },
  { value: "NZ", label: "New Zealand" },
  { value: "NI", label: "Nicaragua" },
  { value: "NE", label: "Niger" },
  { value: "NG", label: "Nigeria" },
  { value: "NU", label: "Niue" },
  { value: "NF", label: "Norfolk Island" },
  { value: "MP", label: "Northern Mariana Islands" },
  { value: "NO", label: "Norway" },
  { value: "OM", label: "Oman" },
  { value: "PK", label: "Pakistan" },
  { value: "PW", label: "Palau" },
  { value: "PS", label: "Palestine" },
  { value: "PA", label: "Panama" },
  { value: "PG", label: "Papua New Guinea" },
  { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Peru" },
  { value: "PH", label: "Philippines" },
  { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" },
  { value: "PR", label: "Puerto Rico" },
  { value: "QA", label: "Qatar" },
  { value: "RO", label: "Romania" },
  { value: "RU", label: "Russian Federation" },
  { value: "RW", label: "Rwanda" },
  { value: "KN", label: "Saint Kitts and Nevis" },
  { value: "LC", label: "Saint Lucia" },
  { value: "VC", label: "Saint Vincent and the Grenadines" },
  { value: "WS", label: "Samoa" },
  { value: "SM", label: "San Marino" },
  { value: "ST", label: "Sao Tome and Principe" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "SN", label: "Senegal" },
  { value: "RS", label: "Serbia" },
  { value: "SC", label: "Seychelles" },
  { value: "SL", label: "Sierra Leone" },
  { value: "SG", label: "Singapore" },
  { value: "SK", label: "Slovakia" },
  { value: "SI", label: "Slovenia" },
  { value: "SB", label: "Solomon Islands" },
  { value: "SO", label: "Somalia" },
  { value: "ZA", label: "South Africa" },
  { value: "SS", label: "South Sudan" },
  { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" },
  { value: "SD", label: "Sudan" },
  { value: "SR", label: "Suriname" },
  { value: "SZ", label: "Swaziland" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "SY", label: "Syrian Arab Republic" },
  { value: "TW", label: "Taiwan" },
  { value: "TJ", label: "Tajikistan" },
  { value: "TZ", label: "Tanzania" },
  { value: "TH", label: "Thailand" },
  { value: "TL", label: "Timor-Leste" },
  { value: "TG", label: "Togo" },
  { value: "TO", label: "Tonga" },
  { value: "TT", label: "Trinidad and Tobago" },
  { value: "TN", label: "Tunisia" },
  { value: "TR", label: "Turkey" },
  { value: "TM", label: "Turkmenistan" },
  { value: "TV", label: "Tuvalu" },

  { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "VU", label: "Vanuatu" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Viet Nam" },
  { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
];
/*  
0517A1FF
and
F75E1EFF
*/
