import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';
import type { WeatherCondition } from '../../data/types';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: 'sm' | 'md';
}

const sizeClass = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
} as const;

export function WeatherIcon({ condition, size = 'md' }: WeatherIconProps) {
  const cls = sizeClass[size];
  switch (condition) {
    case 'sunny':
      return <Sun className={`${cls} text-amber-500`} />;
    case 'partly-cloudy':
      return <Cloud className={`${cls} text-slate-500`} />;
    case 'cloudy':
      return <Cloud className={`${cls} text-slate-600`} />;
    case 'light-rain':
      return <CloudRain className={`${cls} text-blue-400`} />;
    case 'rain':
      return <CloudRain className={`${cls} text-blue-600`} />;
    case 'thunderstorm':
      return <CloudLightning className={`${cls} text-purple-600`} />;
    case 'snow':
      return <CloudSnow className={`${cls} text-sky-400`} />;
    case 'fog':
      return <CloudFog className={`${cls} text-slate-400`} />;
    default:
      return <Sun className={`${cls} text-amber-500`} />;
  }
}
