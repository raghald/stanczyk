# Kropkarnia

Edytor, który zamienia zdjęcia i wideo w animowane obrazy z kropek: halftone, piksele, kropki, linie i ASCII. Działa w przeglądarce, bez serwera i bez instalacji.

## Uruchomienie

Otwórz `index.html` w aktualnej przeglądarce (najlepiej Chrome). Pliki `index.html` i `material.js` muszą leżeć w tym samym folderze.

## Co potrafi

- **Style jednostek:** halftone, piksele, kropki, linie, ASCII; kształty: koło, kwadrat, romb, pierścień, krzyżyk, linia, znak.
- **Animacje:** przepływ, wir, fala, fala kolista, oddech, drganie, rozsypka, dryf; bezwładność, smugi, reakcja na kursor.
- **Sekwencje zdjęć** z przejściami: Rozsypka, Przelot, Wir, Przepływ, Przenikanie. Kropki wędrują z jednego zdjęcia na drugie.
- **Wejście i wyjście:** obiekt pojawia się z pustego kadru i znika w tych samych stylach.
- **Kadr każdego zdjęcia:** pozycja i skala, także przez przeciąganie na podglądzie.
- **Eksport:** PNG, nagranie wideo (MP4 w Chrome, WebM w innych przeglądarkach) i „Kod na stronę”, czyli gotowy fragment HTML z animacją do wklejenia na dowolną stronę.

## Technologie

- **WebGL 2** i shadery GLSL ES 3.0 rysują dziesiątki tysięcy kropek na karcie graficznej.
- **JavaScript** liczy ruch: szum Perlina, sprężyny, krzywe Béziera.
- **Canvas 2D** próbkuje jasność i kolor zdjęcia.
- **Material Design 3** w wersji [Material Web](https://github.com/material-components/material-web) (Google). Komponenty są spakowane do `material.js` narzędziem esbuild (licencja Apache-2.0, nagłówki licencji zachowane w pliku).
- **MediaRecorder** nagrywa wideo, ResizeObserver i IntersectionObserver obsługują osadzanie na stronie.

## Pliki

| Plik | Zawartość |
|---|---|
| `index.html` | cała aplikacja: wygląd, interfejs, silnik animacji, eksport |
| `material.js` | spakowane komponenty Material Web 2.2.0 |
