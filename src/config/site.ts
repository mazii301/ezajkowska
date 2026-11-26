// Wszystkie dane kontaktowe i cennik w jednym miejscu.
// Puste pole (np. phone: '') = element nie pojawia się na stronie.
export const site = {
  url: 'https://ezajkowska.pl',
  name: 'Ewa Zajkowska',
  role: 'Psycholog',
  title: 'Ewa Zajkowska – psycholog w Plewiskach i online',
  description:
    'Psycholog Ewa Zajkowska – konsultacje dla dorosłych i młodzieży w Gabinecie Psychologicznym MindLab w Plewiskach pod Poznaniem oraz online. Lęk, obniżony nastrój, kryzys emocjonalny, wsparcie dla rodziców.',
  practice: 'Gabinet Psychologiczny MindLab',
  street: 'ul. Zielarska 120c/7',
  postal: '62-064',
  city: 'Plewiska',
  region: 'wielkopolskie',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Zielarska+120c%2F7%2C+62-064+Plewiska',
  bookingUrl: 'https://www.znanylekarz.pl/profil/ewa-zajkowska',
  phone: '', // np. '+48 600 000 000'
  email: '', // np. 'kontakt@ezajkowska.pl'
  rating: { value: '5,0', count: 15 },
  payments: 'gotówka lub BLIK',
};

export const prices = [
  { name: 'Konsultacja psychologiczna w gabinecie', note: 'pierwsza i kolejne wizyty', price: '200 zł' },
  { name: 'Konsultacja psychologiczna online', note: 'z dowolnego miejsca', price: '200 zł' },
  { name: 'Interwencja kryzysowa', note: 'w gabinecie lub online', price: '200 zł' },
  { name: 'Konsultacja dla rodziców', note: 'gdy martwisz się o dziecko', price: '200 zł' },
];

// Zdjęcia z Unsplash ładowane z ich CDN (licencja Unsplash, autorzy w stopce).
export const stock = {
  leaves: { id: 'photo-1771086604156-5832dafe4854', author: 'bahareh moradian', href: 'https://unsplash.com/photos/mzBTIkHinRU', alt: 'Cienie liści na jasnej ścianie' },
  tea: { id: 'photo-1662038271111-5b1c0b4157e8', author: 'Aimee Giles', href: 'https://unsplash.com/photos/u1QfqxhsrXQ', alt: 'Kubek parującej herbaty w porannym świetle przy oknie' },
  path: { id: 'photo-1544039161-b0c20826c6f6', author: 'Marek Szturc', href: 'https://unsplash.com/photos/4CDdd1RCt6w', alt: 'Ścieżka prowadząca przez las we mgle' },
  journal: { id: 'photo-1579017308347-e53e0d2fc5e9', author: 'Marcos Paulo Prado', href: 'https://unsplash.com/photos/tcyW6Im5Uug', alt: 'Osoba zapisująca myśli w notesie' },
  fog: { id: 'photo-1487621167305-5d248087c724', author: 'Paul Pastourmatzis', href: 'https://unsplash.com/photos/KT3WlrL_bsg', alt: 'Drzewa we mgle o poranku' },
} as const;

export const unsplash = (id: string, w: number, h?: number) =>
  `https://images.unsplash.com/${id}?ixlib=rb-4.1.0&auto=format&fit=crop&q=70&w=${w}${h ? `&h=${h}` : ''}`;
export const unsplashSet = (id: string, ws: number[], ratio?: number) =>
  ws.map(w => `${unsplash(id, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', ');
