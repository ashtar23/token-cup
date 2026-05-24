export const BASE_POINTS = 100;
export const STREAK_THRESHOLD = 3;
export const STREAK_MULTIPLIER = 1.5;
export const TEAM_TOKEN_MULTIPLIER = 2;

export const MATCH_WIN_POINTS = 10_000;
export const TOURNAMENT_WIN_POINTS = 50_000;

export const GOALS_RANGES: { label: string; value: string }[] = [
  { label: "0–1", value: "0-1" },
  { label: "2–3", value: "2-3" },
  { label: "4+", value: "4+" },
];

// Teams with Socios Fan Tokens — keyed by the full name football-data.org returns
export const TEAM_TOKEN_MAP: Record<string, string> = {
  Argentina: "ARG",
  Portugal: "POR",
  Brazil: "BRA",
  France: "FRA",
  Spain: "ESP",
  Germany: "GER",
  England: "ENG",
  Italy: "ITA",
  Poland: "POL",
  Mexico: "MEX",
  "South Korea": "KOR",
  "Korea Republic": "KOR",   // football-data.org name
  Turkey: "TUR",
  Türkiye: "TUR",            // football-data.org name
  Morocco: "MAR",
  "Ivory Coast": "CIV",
  "Côte d'Ivoire": "CIV",   // football-data.org name
};

// Lookup by FIFA TLA (3-letter code) — football-data.org always provides this
export const TLA_TOKEN_MAP: Record<string, string> = {
  ARG: "ARG",
  POR: "POR",
  BRA: "BRA",
  FRA: "FRA",
  ESP: "ESP",
  GER: "GER",
  ENG: "ENG",
  ITA: "ITA",
  POL: "POL",
  MEX: "MEX",
  KOR: "KOR",
  TUR: "TUR",
  MAR: "MAR",
  CIV: "CIV",
};

// Team flags keyed by the exact `name` football-data.org returns.
// We cover every WC 2026 participant + common alternate spellings
// (e.g. "United States" not "USA", "Türkiye" not "Turkey").
export const TEAM_FLAG: Record<string, string> = {
  // UEFA
  Albania: "🇦🇱",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  "Bosnia-Herzegovina": "🇧🇦",
  Bosnia: "🇧🇦",
  Croatia: "🇭🇷",
  Czechia: "🇨🇿",
  Denmark: "🇩🇰",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Greece: "🇬🇷",
  Hungary: "🇭🇺",
  Iceland: "🇮🇸",
  Ireland: "🇮🇪",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  "Northern Ireland": "🇬🇧",
  Norway: "🇳🇴",
  Poland: "🇵🇱",
  Portugal: "🇵🇹",
  Romania: "🇷🇴",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Serbia: "🇷🇸",
  Slovakia: "🇸🇰",
  Slovenia: "🇸🇮",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Turkey: "🇹🇷",
  Türkiye: "🇹🇷",
  Ukraine: "🇺🇦",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",

  // CONMEBOL
  Argentina: "🇦🇷",
  Bolivia: "🇧🇴",
  Brazil: "🇧🇷",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  Ecuador: "🇪🇨",
  Paraguay: "🇵🇾",
  Peru: "🇵🇪",
  Uruguay: "🇺🇾",
  Venezuela: "🇻🇪",

  // CONCACAF
  Canada: "🇨🇦",
  "Costa Rica": "🇨🇷",
  Cuba: "🇨🇺",
  Curaçao: "🇨🇼",
  "Dominican Republic": "🇩🇴",
  "El Salvador": "🇸🇻",
  Guatemala: "🇬🇹",
  Haiti: "🇭🇹",
  Honduras: "🇭🇳",
  Jamaica: "🇯🇲",
  Mexico: "🇲🇽",
  Panama: "🇵🇦",
  "Trinidad and Tobago": "🇹🇹",
  USA: "🇺🇸",
  "United States": "🇺🇸",

  // CAF
  Algeria: "🇩🇿",
  "Burkina Faso": "🇧🇫",
  Cameroon: "🇨🇲",
  "Cape Verde": "🇨🇻",
  "Cape Verde Islands": "🇨🇻",
  "Cabo Verde": "🇨🇻",
  "Congo DR": "🇨🇩",
  "DR Congo": "🇨🇩",
  Egypt: "🇪🇬",
  Ghana: "🇬🇭",
  "Ivory Coast": "🇨🇮",
  "Côte d'Ivoire": "🇨🇮",
  Mali: "🇲🇱",
  Morocco: "🇲🇦",
  Nigeria: "🇳🇬",
  Senegal: "🇸🇳",
  "South Africa": "🇿🇦",
  Tunisia: "🇹🇳",
  Zambia: "🇿🇲",
  Zimbabwe: "🇿🇼",

  // AFC
  Australia: "🇦🇺",
  Bahrain: "🇧🇭",
  China: "🇨🇳",
  "Hong Kong": "🇭🇰",
  India: "🇮🇳",
  Indonesia: "🇮🇩",
  Iran: "🇮🇷",
  "IR Iran": "🇮🇷",
  Iraq: "🇮🇶",
  Japan: "🇯🇵",
  Jordan: "🇯🇴",
  Kuwait: "🇰🇼",
  Lebanon: "🇱🇧",
  Malaysia: "🇲🇾",
  Oman: "🇴🇲",
  Palestine: "🇵🇸",
  Qatar: "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  "South Korea": "🇰🇷",
  "Korea Republic": "🇰🇷",
  Syria: "🇸🇾",
  Thailand: "🇹🇭",
  "United Arab Emirates": "🇦🇪",
  UAE: "🇦🇪",
  Uzbekistan: "🇺🇿",
  Vietnam: "🇻🇳",

  // OFC
  "New Zealand": "🇳🇿",
  Fiji: "🇫🇯",
};

