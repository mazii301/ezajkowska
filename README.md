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

## Cloudflare Pages (pierwsze wdrożenie)

1. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → wybierz repo `ezajkowska`.
2. Framework preset: **Astro**. Build command: `npm run build`. Output directory: `dist`.
3. Environment variable: `NODE_VERSION` = `22`.
4. Save and Deploy. Strona pojawi się pod adresem `ezajkowska.pages.dev` (ten adres ma `noindex`, żeby nie dublować domeny w Google).
5. Po zakupie domeny: projekt → Custom domains → `ezajkowska.pl` i `www.ezajkowska.pl`.
   Najprościej, gdy domena ma DNS w Cloudflare (dodaj domenę do Cloudflare i zmień serwery DNS u rejestratora).

Każdy push do `main` buduje i publikuje stronę automatycznie.
