# ezajkowska.pl

Strona psycholog Ewy Zajkowskiej (Gabinet Psychologiczny MindLab, Plewiska). Astro, statyczny build, hosting Cloudflare Pages.

## Edycja treści

- Dane kontaktowe, adres, link do rezerwacji, cennik: `src/config/site.ts`
  (puste `phone` / `email` = nie wyświetlają się na stronie).
- Teksty sekcji: `src/pages/index.astro`.
- Zdjęcia własne: `src/assets/`. Zdjęcia nastrojowe z Unsplash: `stock` w `src/config/site.ts`.

## Lokalnie

```
npm install
npm run dev      # podgląd z odświeżaniem
npm run build    # gotowa strona w dist/
```

## Cloudflare (Workers, połączone z GitHubem)

Ustawienia projektu w Cloudflare (Workers & Pages → Create → Import a repository → `ezajkowska`):

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Katalog ze stroną (`dist`) jest wskazany w `wrangler.jsonc`, więc w panelu nie ma pola „output directory”.

Strona działa pod adresem `ezajkowska.<konto>.workers.dev`. Po zakupie domeny: projekt → Settings → Domains & Routes → Add → Custom domain → `ezajkowska.pl` (i `www.ezajkowska.pl`). Najprościej, gdy domena ma DNS w Cloudflare.

Każdy push do `main` buduje i publikuje stronę automatycznie.
