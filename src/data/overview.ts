export const weatherData = [
  { date: 'Apr 3', location: 'SF/Napa', high: 68, low: 52, condition: 'sunny' },
  { date: 'Apr 4', location: 'Napa', high: 72, low: 54, condition: 'sunny' },
  { date: 'Apr 5', location: 'Napa', high: 70, low: 53, condition: 'partly-cloudy' },
  { date: 'Apr 6', location: 'Yosemite', high: 62, low: 38, condition: 'partly-cloudy' },
  { date: 'Apr 7', location: 'Yosemite', high: 64, low: 40, condition: 'sunny' },
  { date: 'Apr 8', location: 'Carmel', high: 66, low: 50, condition: 'partly-cloudy' },
  { date: 'Apr 9', location: 'Carmel', high: 64, low: 51, condition: 'cloudy' },
  { date: 'Apr 10', location: 'Carmel', high: 63, low: 52, condition: 'light-rain' },
  { date: 'Apr 11', location: 'SF', high: 65, low: 54, condition: 'partly-cloudy' },
] as const;

export const dailySchedule = [
  { date: 'Fri Apr 3', base: 'Napa / Sonoma', logistics: 'Fly DCA → SFO → Drive SFO → Muir Woods → Napa/Sonoma', color: '#b8956d' },
  { date: 'Sat Apr 4', base: 'Napa / Sonoma', logistics: 'Stay Napa/Sonoma', color: '#b8956d' },
  { date: 'Sun Apr 5', base: 'Napa / Sonoma', logistics: 'Stay Napa/Sonoma', color: '#b8956d' },
  { date: 'Mon Apr 6', base: 'Yosemite Area', logistics: 'Checkout Napa → Drive Napa → Yosemite → Check-in Yosemite', color: '#5a8a6f' },
  { date: 'Tue Apr 7', base: 'Yosemite Area', logistics: 'Yosemite full day', color: '#5a8a6f' },
  { date: 'Wed Apr 8', base: 'Monterey / Carmel', logistics: 'Checkout Yosemite → Drive Yosemite → Monterey/Carmel → Check-in', color: '#4a7c8e' },
  { date: 'Thu Apr 9', base: 'Monterey / Carmel', logistics: 'Stay Monterey/Carmel', color: '#4a7c8e' },
  { date: 'Fri Apr 10', base: 'Monterey / Carmel', logistics: 'Stay Monterey/Carmel', color: '#4a7c8e' },
  { date: 'Sat Apr 11', base: '—', logistics: 'Checkout Monterey/Carmel → Drive to SFO → Fly home', color: '#64748b' },
] as const;

export const regionPhotos = [
  {
    label: 'Napa & Sonoma',
    alt: 'Napa Valley',
    src: 'https://images.unsplash.com/photo-1701624019104-d37423bd30bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXBhJTIwdmFsbGV5JTIwd2luZSUyMHZpbmV5YXJkJTIwc3Vuc2V0JTIwZ29sZGVufGVufDF8fHx8MTc3MTEwNjM1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    label: 'Yosemite',
    alt: 'Yosemite',
    src: 'https://images.unsplash.com/photo-1526837283165-8e18dae94c89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3NlbWl0ZSUyMGdyYW5pdGUlMjBtb3VudGFpbnMlMjB3YXRlcmZhbGx8ZW58MXx8fHwxNzcxMTA2MzU2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    label: 'Monterey & Carmel',
    alt: 'Carmel',
    src: 'https://images.unsplash.com/photo-1734186612578-60c86bcc212c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJtZWwlMjBjYWxpZm9ybmlhJTIwY29hc3QlMjBvY2VhbiUyMHdhdmVzfGVufDF8fHx8MTc3MTEwNjM1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
] as const;
