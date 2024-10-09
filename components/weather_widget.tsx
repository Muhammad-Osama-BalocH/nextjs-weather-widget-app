"use client";

import { useState, FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudyIcon, MapPinIcon, ThermometerIcon } from "lucide-react";

// Weather Data interface
interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  unit: string;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle weather search
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedLocation = location.trim();

    if (trimmedLocation === "") {
      setError("Please enter a valid location.");
      setWeather(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetching weather data from API
      const response = await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`
      );

      if (!response.ok) {
        throw new Error("City not found.");
      }

      const data = await response.json();
      const weatherData: WeatherData = {
        temperature: data.current.temp_c,
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C",
      };

      setWeather(weatherData);
    } catch (err) {
      setError("City not found. Please try again.");
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate temperature message
  function getTemperatureMessage(temperature: number, unit: string): string {
    if (unit === "C") {
      if (temperature < 0) {
        return `It's freezing at ${temperature}°C! Bundle up!`;
      } else if (temperature < 10) {
        return `It's quite cold at ${temperature}°C. Wear warm clothes.`;
      } else if (temperature < 20) {
        return `The temperature is ${temperature}°C. Comfortable for a light jacket.`;
      } else if (temperature < 30) {
        return `It's a pleasant ${temperature}°C. Enjoy the nice weather.`;
      } else {
        return `It's hot at ${temperature}°C. Stay hydrated!`;
      }
    } else {
      return `${temperature}°${unit}.`;
    }
  }

  // Function to get weather description message
  function getWeatherMessage(description: string): string {
    switch (description.toLocaleLowerCase()) {
      case "sunny":
        return "It's a beautiful sunny day!";
      case "partly cloudy":
        return "The sky is partly cloudy. A mix of sun and clouds.";
      case "rain":
        return "It's raining. Don't forget your umbrella!";
      case "snow":
        return "It's snowing. Bundle up and stay warm!";
      case "clear":
        return "The sky is clear. It's a nice day!";
      default:
        return description;
    }
  }

  // Function to get location message with day/night indicator
  function getLocationMessage(location: string): string {
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6;
    return `${location} ${isNight ? "at night" : "during the day"}`;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <Card className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <CardHeader className="mb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">Weather Widget</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Search for the current weather condition in your city
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter a city name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </form>
          {error && <div className="mt-4 text-red-500">{error}</div>}
          {weather && (
            <div className="mt-4 grid gap-4">
              <div className="flex items-center gap-2">
                <ThermometerIcon className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-semibold">{getTemperatureMessage(weather.temperature, weather.unit)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudyIcon className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-semibold">{getWeatherMessage(weather.description)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-semibold">{getLocationMessage(weather.location)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
