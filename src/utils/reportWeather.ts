/** Supported languages for weather descriptions */
export type Language = "en" | "sv";

/**
 * Weather code mapping based on Open-Meteo WMO Weather interpretation codes.
 * @see https://open-meteo.com/en/docs#weather_variable_documentation
 */
const weatherCodeMap: Record<Language, Record<number, string>> = {
  en: {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  },
  sv: {
    0: "Klar himmel",
    1: "Mestadels klart",
    2: "Delvis molnigt",
    3: "Mulet",
    45: "Dimma",
    48: "Rimfrost dimma",
    51: "Lätt duggregn",
    53: "Måttligt duggregn",
    55: "Tätt duggregn",
    56: "Lätt underkylt duggregn",
    57: "Tätt underkylt duggregn",
    61: "Lätt regn",
    63: "Måttligt regn",
    65: "Kraftigt regn",
    66: "Lätt underkylt regn",
    67: "Kraftigt underkylt regn",
    71: "Lätt snöfall",
    73: "Måttligt snöfall",
    75: "Kraftigt snöfall",
    77: "Snökorn",
    80: "Lätta regnskurar",
    81: "Måttliga regnskurar",
    82: "Kraftiga regnskurar",
    85: "Lätta snöskurar",
    86: "Kraftiga snöskurar",
    95: "Åskväder",
    96: "Åskväder med lätt hagel",
    99: "Åskväder med kraftigt hagel",
  },
};

/**
 * Natural language weather descriptions for casual, conversational display.
 */
const naturalWeatherMap: Record<Language, Record<number, string>> = {
  en: {
    0: "sunny",
    1: "mostly sunny",
    2: "partly cloudy",
    3: "cloudy",
    45: "foggy",
    48: "foggy",
    51: "drizzly",
    53: "drizzly",
    55: "drizzly",
    56: "icy",
    57: "icy",
    61: "rainy",
    63: "rainy",
    65: "very rainy",
    66: "icy",
    67: "icy",
    71: "snowy",
    73: "snowy",
    75: "very snowy",
    77: "snowy",
    80: "rainy",
    81: "rainy",
    82: "very rainy",
    85: "snowy",
    86: "very snowy",
    95: "stormy",
    96: "stormy",
    99: "very stormy",
  },
  sv: {
    0: "soliga",
    1: "mestadels soliga",
    2: "delvis molniga",
    3: "molniga",
    45: "dimmiga",
    48: "dimmiga",
    51: "duggiga",
    53: "duggiga",
    55: "duggiga",
    56: "isiga",
    57: "isiga",
    61: "regniga",
    63: "regniga",
    65: "mycket regniga",
    66: "isiga",
    67: "isiga",
    71: "snöiga",
    73: "snöiga",
    75: "mycket snöiga",
    77: "snöiga",
    80: "regniga",
    81: "regniga",
    82: "mycket regniga",
    85: "snöiga",
    86: "mycket snöiga",
    95: "stormiga",
    96: "stormiga",
    99: "mycket stormiga",
  },
};

/** Response structure from Open-Meteo API current weather endpoint. */
interface WeatherResponse {
  current: {
    weather_code: number;
  };
}

/** Weather data with both detailed and natural language descriptions. */
interface WeatherData {
  /** Detailed weather description (e.g., "Overcast") */
  detailed: string;
  /** Natural language description (e.g., "cloudy") */
  natural: string;
}

/**
 * Fetch current weather data for Skellefteå from Open-Meteo API.
 * @param language - Language for weather descriptions ("en" or "sv")
 * @returns Promise resolving to weather data with both detailed and natural descriptions
 */
const fetchWeather = async (
  language: Language = "en",
): Promise<WeatherData> => {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=64.7507&longitude=20.9528&current=weather_code",
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WeatherResponse = await response.json();
    const weatherCode = data.current.weather_code;

    const fallbacks = {
      en: { detailed: "Clear sky", natural: "sunny" },
      sv: { detailed: "Klar himmel", natural: "soligt" },
    };

    return {
      detailed:
        weatherCodeMap[language][weatherCode] || fallbacks[language].detailed,
      natural:
        naturalWeatherMap[language][weatherCode] || fallbacks[language].natural,
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    const fallbacks = {
      en: { detailed: "Clear sky", natural: "sunny" },
      sv: { detailed: "Klar himmel", natural: "soligt" },
    };
    return fallbacks[language];
  }
};

/**
 * Get detailed weather description.
 * @param language - Language for weather description ("en" or "sv")
 * @returns Promise resolving to detailed weather string
 */
export const getWeather = async (
  language: Language = "en",
): Promise<string> => {
  const weather = await fetchWeather(language);
  return weather.detailed;
};

/**
 * Get natural language weather description.
 * @param language - Language for weather description ("en" or "sv")
 * @returns Promise resolving to natural language weather string
 */
export const getNaturalWeather = async (
  language: Language = "en",
): Promise<string> => {
  const weather = await fetchWeather(language);
  return weather.natural;
};

/**
 * Updates the #weather-sweden element with detailed weather description.
 * @param language - Language for weather description ("en" or "sv")
 */
export const updateDetailedWeather = async (
  language: Language = "en",
): Promise<void> => {
  const weatherElement = document.getElementById("weather-sweden");
  if (weatherElement) {
    const weather = await getWeather(language);
    weatherElement.textContent = weather;
  }
};

/**
 * Updates the #current-weather element with natural language weather description.
 * @param language - Language for weather description ("en" or "sv")
 */
export const updateNaturalWeather = async (
  language: Language = "en",
): Promise<void> => {
  const currentWeatherElement = document.getElementById("current-weather");
  if (currentWeatherElement) {
    const weather = await getNaturalWeather(language);
    currentWeatherElement.textContent = weather;
  }
};
