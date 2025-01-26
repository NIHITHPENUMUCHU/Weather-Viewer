import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, Sun, CloudRain, Wind, Search, Loader2, Droplets, ThermometerSun } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Fetch the API key from the environment variable
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
  console.log("API Key:", apiKey);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchWeather = async (city: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      setWeather(data);
      setSuggestions([]);
    } catch (err) {
      setError('Could not find weather for this city');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (input: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`
      );
      const data = await response.json();
      setSuggestions(data.map((item: any) => `${item.name}, ${item.country}`));
    } catch (err) {
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((input: string) => {
      if (input.length >= 3) {
        fetchSuggestions(input);
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const cityName = suggestion.split(',')[0];
    setQuery(suggestion);
    fetchWeather(cityName);
  };

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-24 h-24 text-gray-400 filter drop-shadow-lg" />;
    const id = weather.weather[0].id;
    if (id >= 200 && id < 300) return <CloudRain className="w-24 h-24 text-blue-400 animate-weather-bounce filter drop-shadow-lg" />;
    if (id >= 300 && id < 600) return <CloudRain className="w-24 h-24 text-blue-300 animate-weather-bounce filter drop-shadow-lg" />;
    if (id >= 600 && id < 700) return <CloudRain className="w-24 h-24 text-blue-200 animate-weather-bounce filter drop-shadow-lg" />;
    if (id >= 700 && id < 800) return <Wind className="w-24 h-24 text-gray-400 animate-weather-pulse filter drop-shadow-lg" />;
    if (id === 800) return <Sun className="w-24 h-24 text-yellow-400 animate-weather-spin filter drop-shadow-lg" />;
    return <Cloud className="w-24 h-24 text-gray-400 animate-weather-pulse filter drop-shadow-lg" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 animate-gradient-x">
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 transform transition-all duration-500 hover:scale-105">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 pointer-events-none" />
        
        <div className="flex items-center justify-center mb-8 animate-fade-in">
          <Cloud className="w-10 h-10 text-white mr-2 animate-float" />
          <h1 className="text-4xl font-bold text-white text-shadow">WeatherNow</h1>
        </div>

        <div className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for a city..."
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/70 transition-all"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>

          {suggestions.length > 0 && (
            <div className="absolute w-full mt-2 bg-white/20 backdrop-blur-xl rounded-xl overflow-hidden z-10 border border-white/30">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-white/30 cursor-pointer text-white transition-colors"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-white text-center mb-4 animate-shake bg-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}

        {weather && (
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              {getWeatherIcon()}
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 text-shadow-lg">
              {Math.round(weather.main.temp)}°C
            </h2>
            <p className="text-2xl text-white/90 mb-2 text-shadow">
              {weather.name}, {weather.sys.country}
            </p>
            <p className="text-white/80 capitalize text-shadow mb-6">
              {weather.weather[0].description}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20 transform transition-all hover:scale-105">
                <Droplets className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                <p className="text-sm text-white/70">Humidity</p>
                <p className="text-xl font-semibold text-white">
                  {weather.main.humidity}%
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20 transform transition-all hover:scale-105">
                <Wind className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                <p className="text-sm text-white/70">Wind Speed</p>
                <p className="text-xl font-semibold text-white">
                  {weather.wind.speed} m/s
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20 transform transition-all hover:scale-105">
                <ThermometerSun className="w-6 h-6 text-orange-300 mx-auto mb-2" />
                <p className="text-sm text-white/70">Feels Like</p>
                <p className="text-xl font-semibold text-white">
                  {Math.round(weather.main.feels_like)}°C
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20 transform transition-all hover:scale-105">
                <Cloud className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-white/70">Cloudiness</p>
                <p className="text-xl font-semibold text-white">
                  {weather.clouds.all}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
