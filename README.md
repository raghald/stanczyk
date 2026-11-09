# Kropkarnia

Edytor, który zamienia zdjęcia i wideo w animowane obrazy z kropek: halftone, piksele, kropki, linie i ASCII. Działa jako aplikacja na Maca (z projektami) albo w przeglądarce.

## Uruchomienie

**Aplikacja na Maca:** zbuduj ją raz (patrz niżej) i otwórz `dist/mac-arm64/Kropkarnia.app`. Możesz ją przeciągnąć do folderu Aplikacje.

**W przeglądarce:** otwórz `index.html` w aktualnej przeglądarce (najlepiej Chrome). Pliki `index.html` i `material.js` muszą leżeć w tym samym folderze. Wersja przeglądarkowa nie ma projektów.

## Projekty (aplikacja na Maca)

- **Ekran projektów** po uruchomieniu: nowy projekt, otwieranie pliku i lista ostatnich projektów z miniaturami.
- **Plik → Nowy projekt** (⌘N), **Otwórz projekt…** (⌘O), **Otwórz ostatnie**, **Zapisz** (⌘S), **Zapisz jako…** (⇧⌘S), **Ekran projektów** (⇧⌘P).
- **Plik `.kropkarnia`** zawiera ustawienia, zdjęcia (w oryginalnej jakości), sekwencję, kadry i miniaturę. Wideo jest zapisywane jako odnośnik do pliku na dysku.
- **Niezapisane zmiany** widać po kropce przy nazwie projektu; przy zamykaniu aplikacja pyta, czy je zapisać.
- **Dwuklik na pliku `.kropkarnia`** w Finderze albo przeciągnięcie go na okno otwiera projekt.
- **PNG, wideo i kod na stronę** zapisujesz przez okno zapisu, w wybranym miejscu.

## Co potrafi

- **Style jednostek:** halftone, piksele, kropki, linie, ASCII; kształty: koło, kwadrat, romb, pierścień, krzyżyk, linia, znak.
- **Animacje:** przepływ, wir, fala, fala kolista, oddech, drganie, rozsypka, dryf; bezwładność, smugi, reakcja na kursor.
- **Sekwencje zdjęć** z przejściami: Rozsypka, Przelot, Wir, Przepływ, Przenikanie. Kropki wędrują z jednego zdjęcia na drugie.
- **Wejście i wyjście:** obiekt pojawia się z pustego kadru i znika w tych samych stylach.
- **Efekt LED:** poświata kropek, podświetlone tło i migotanie diod (preset „LED”).
- **Okno (maska):** ogranicza dowolny efekt do prostokąta, a dookoła pokazuje oryginalne zdjęcie albo kolor tła. Okno przesuwasz i skalujesz na podglądzie.
- **Kadr każdego zdjęcia:** pozycja i skala, także przez przeciąganie na podglądzie.
- **Eksport:** PNG, nagranie wideo (MP4 w Chrome, WebM w innych przeglądarkach) i „Kod na stronę”, czyli gotowy fragment HTML z animacją do wklejenia na dowolną stronę.

## Budowanie aplikacji na Maca

Potrzebny jest Node.js (wersja 20 lub nowsza).

```bash
npm install
npm run build
```

Gotowa aplikacja trafia do `dist/mac-arm64/Kropkarnia.app` (Mac z procesorem Apple). Jest podpisana lokalnie, bez notaryzacji Apple: na tym Macu otwiera się normalnie, a na innym trzeba ją za pierwszym razem otworzyć przez prawy przycisk → Otwórz.

Inne polecenia:

- `npm start` uruchamia aplikację bez budowania paczki.
- `npm run smoke` przechodzi automatyczny scenariusz: sekwencja i preset, zapis projektu, nowy projekt, ponowne otwarcie, zamknięcie z niezapisanymi zmianami.

## Technologie

- **Electron** daje okno, menu i dostęp do plików; okno aplikacji nie ma dostępu do Node, korzysta tylko z wąskiego mostu (`desktop/preload.js`).
- **WebGL 2** i shadery GLSL ES 3.0 rysują dziesiątki tysięcy kropek na karcie graficznej.
- **JavaScript** liczy ruch: szum Perlina, sprężyny, krzywe Béziera.
- **Canvas 2D** próbkuje jasność i kolor zdjęcia.
- **Material Design 3** w wersji [Material Web](https://github.com/material-components/material-web) (Google). Komponenty są spakowane do `material.js` narzędziem esbuild (licencja Apache-2.0, nagłówki licencji zachowane w pliku).
- **MediaRecorder** nagrywa wideo, ResizeObserver i IntersectionObserver obsługują osadzanie na stronie.

## Pliki

| Plik | Zawartość |
|---|---|
| `index.html` | cała aplikacja: wygląd, interfejs, silnik animacji, eksport, projekty |
| `material.js` | spakowane komponenty Material Web 2.2.0 |
| `desktop/main.js` | okno, menu, zapis i odczyt projektów, lista ostatnich projektów |
| `desktop/preload.js` | most między oknem a systemem plików |
| `desktop/smoke.js` | automatyczny test aplikacji (`npm run smoke`) |
| `build/` | ikona aplikacji |
| `package.json` | zależności i konfiguracja budowania |
