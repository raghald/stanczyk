# Stańczyk

Stańczyk to edytor, który zamienia zdjęcia, wideo i bryły 3D w animowane obrazy z kropek: halftone, piksele, kropki, linie i ASCII. Działa jako aplikacja na Maca i Windowsa (z projektami) albo w przeglądarce, po polsku i po angielsku.

## Uruchomienie

**Aplikacja na Maca i Windowsa:** zainstaluj ją z instalatora (patrz „Instalatory” niżej).

**W przeglądarce:** otwórz `index.html` w aktualnej przeglądarce (najlepiej Chrome). Pliki `index.html`, `material.js`, `three3d.js`, `i18n-en.js` i `default-image.js` muszą leżeć w tym samym folderze. Wersja przeglądarkowa nie ma projektów.

## Domyślny obraz

Na start aplikacja pokazuje obraz Jana Matejki „Stańczyk” (1862, Muzeum Narodowe w Warszawie, domena publiczna) z presetem „Mozaika”. Plik źródłowy leży w `assets/`, a w aplikacji jest wbudowany w `default-image.js`.

## Projekty (aplikacja desktopowa)

- **Ekran projektów** po uruchomieniu: nowy projekt, otwieranie pliku i lista ostatnich projektów z miniaturami.
- **Nowy projekt** zaczyna się od ustawień sceny i nagrywania (proporcje, rozdzielczość, klatki, długość nagrania). Zmienisz je później w **Plik → Ustawienia projektu…** (⌘,) albo przyciskiem z suwakami na górnym pasku.
- **Plik → Nowy projekt** (⌘N), **Otwórz projekt…** (⌘O), **Otwórz ostatnie**, **Zapisz** (⌘S), **Zapisz jako…** (⇧⌘S), **Ekran projektów** (⇧⌘P).
- **Plik `.stanczyk`** zawiera ustawienia, zdjęcia (w oryginalnej jakości), modele 3D, sekwencję, kadry i miniaturę. Wideo jest zapisywane jako odnośnik do pliku na dysku.
- **Niezapisane zmiany** widać po kropce przy nazwie projektu; przy zamykaniu aplikacja pyta, czy je zapisać.
- **Dwuklik na pliku `.stanczyk`** w Finderze albo przeciągnięcie go na okno otwiera projekt.
- **PNG, wideo i kod na stronę** zapisujesz przez okno zapisu, w wybranym miejscu.

## Co potrafi

- **Style jednostek:** halftone, piksele, kropki, linie, ASCII; kształty: koło, kwadrat, romb, pierścień, krzyżyk, linia, znak.
- **Animacje:** przepływ, wir, fala, fala kolista, oddech, drganie, rozsypka, dryf; bezwładność, smugi, reakcja na kursor.
- **Bryły 3D:** wbudowane (kula, sześcian, torus, węzeł, walec, pierścień), tekst 3D (z polskimi znakami) i własne modele GLB/GLTF (także z animacją), OBJ i STL. Bryłę obracasz myszą na podglądzie, kółko przybliża kamerę; do tego autoobrót wokół wybranej osi, kierunek i siła światła, materiał (mat, połysk, metal albo z modelu) i „ton z głębi”, w którym bliższe części bryły mają mocniejszy ton. Wszystkie efekty działają na obracającej się bryle.
- **Sekwencje** z przejściami: Rozsypka, Przelot, Wir, Przepływ, Przenikanie. Elementem sekwencji może być zdjęcie, wideo albo bryła 3D (każda z własnymi ustawieniami). Kropki wędrują z jednego elementu na drugi.
- **Wejście i wyjście:** obiekt pojawia się z pustego kadru i znika w tych samych stylach.
- **Efekt LED:** poświata kropek, podświetlone tło i migotanie diod (preset „LED”).
- **Okno (maska):** ogranicza dowolny efekt do prostokąta, a dookoła pokazuje oryginalne zdjęcie albo kolor tła. Okno przesuwasz i skalujesz na podglądzie.
- **Kadr każdego zdjęcia:** pozycja i skala, także przez przeciąganie na podglądzie.
- **Eksport:** PNG, nagranie wideo (MP4 w Chrome, WebM w innych przeglądarkach) i „Kod na stronę”, czyli gotowy fragment HTML z animacją do wklejenia na dowolną stronę. Kod na stronę obejmuje zdjęcia i bryły 3D (z biblioteką three.js i modelem, ok. 800 KB więcej); wideo z sekwencji jest w nim pomijane.
- **Panel ustawień** po prawej można zwinąć do paska ikon; sekcje otwierają się wtedy w dymkach.
- **Język:** polski albo angielski (Ustawienia projektu → Język / Language). Aplikacja desktopowa domyślnie jest po polsku, wersja w przeglądarce wybiera język przeglądarki.

## Instalatory

```bash
npm install
npm run dist
```

W folderze `dist/` powstają:

| Plik | System |
|---|---|
| `Stanczyk-<wersja>-mac-arm64.dmg` | macOS, Mac z procesorem Apple (M1 i nowsze) |
| `Stanczyk-<wersja>-mac-x64.dmg` | macOS, Mac z procesorem Intel |
| `Stanczyk-<wersja>-win-x64-setup.exe` | Windows 10 i 11, 64-bit |

**macOS:** otwórz DMG i przeciągnij Stańczyka do Aplikacji. Aplikacja jest podpisana tylko lokalnie, bez notaryzacji Apple, więc przy pierwszym uruchomieniu na innym Macu pojawi się ostrzeżenie: kliknij aplikację prawym przyciskiem → Otwórz (na macOS 15 i nowszym: Ustawienia systemowe → Prywatność i ochrona → „Otwórz mimo to”).

**Windows:** uruchom instalator, wybierz folder i zainstaluj. Instalator nie ma podpisu Microsoft, więc SmartScreen pokaże „System Windows ochronił ten komputer”: kliknij „Więcej informacji” → „Uruchom mimo to”. Instalator tworzy skrót na pulpicie i w menu Start oraz kojarzy pliki `.stanczyk` z aplikacją.

Pozbycie się ostrzeżeń wymaga certyfikatów: Apple Developer ID (notaryzacja) i certyfikatu podpisu kodu dla Windows.

Inne polecenia:

- `npm start` uruchamia aplikację bez budowania.
- `npm run build` szybko buduje samo `Stanczyk.app` (bez DMG) do `dist/mac-arm64/`.
- `npm run dist:mac` / `npm run dist:win` budują instalatory tylko dla jednego systemu.
- `npm run smoke` przechodzi automatyczny scenariusz: sekwencja i preset, zapis projektu, nowy projekt, ponowne otwarcie, bryła 3D, zamknięcie z niezapisanymi zmianami.
- `npm run build:3d` buduje `three3d.js` (three.js, loadery modeli i scena 3D Stańczyka) ze źródła `src/three3d.js`.

## Technologie

- **Electron** daje okno, menu i dostęp do plików; okno aplikacji nie ma dostępu do Node, korzysta tylko z wąskiego mostu (`desktop/preload.js`).
- **WebGL 2** i shadery GLSL ES 3.0 rysują dziesiątki tysięcy kropek na karcie graficznej.
- **JavaScript** liczy ruch: szum Perlina, sprężyny, krzywe Béziera.
- **Canvas 2D** próbkuje jasność i kolor zdjęcia.
- **three.js** renderuje bryły i modele 3D do osobnego płótna, które silnik próbkuje w każdej klatce jak wideo.
- **Material Design 3** w wersji [Material Web](https://github.com/material-components/material-web) (Google). Komponenty są spakowane do `material.js` narzędziem esbuild (licencja Apache-2.0, nagłówki licencji zachowane w pliku).
- **MediaRecorder** nagrywa wideo, ResizeObserver i IntersectionObserver obsługują osadzanie na stronie.

## Pliki

| Plik | Zawartość |
|---|---|
| `index.html` | cała aplikacja: wygląd, interfejs, silnik animacji, eksport, projekty |
| `material.js` | spakowane komponenty Material Web 2.2.0 |
| `three3d.js` | spakowany three.js z loaderami i sceną 3D (wygenerowany przez `npm run build:3d`) |
| `i18n-en.js` | angielska wersja interfejsu (słownik) |
| `src/three3d.js` | źródło sceny 3D |
| `default-image.js` | domyślny obraz (Matejko, „Stańczyk”) jako data URL |
| `assets/` | plik źródłowy domyślnego obrazu |
| `desktop/main.js` | okno, menu, zapis i odczyt projektów, lista ostatnich projektów |
| `desktop/preload.js` | most między oknem a systemem plików |
| `desktop/smoke.js` | automatyczny test aplikacji (`npm run smoke`) |
| `build/` | ikony aplikacji (macOS i Windows) |
| `scripts/after-pack.js` | podpis lokalny aplikacji na Maca przed spakowaniem do DMG |
| `scripts/build-3d.js` | buduje `three3d.js` |
| `package.json` | zależności i konfiguracja budowania |

## Licencja

Stańczyk jest udostępniony na licencji [GNU GPL 3.0](LICENSE). Możesz go używać, zmieniać i rozpowszechniać, także komercyjnie, pod warunkiem że każda rozpowszechniana wersja (również zmieniona) będzie dostępna z kodem źródłowym na tej samej licencji.

Elementy z innymi licencjami:

- `material.js` — komponenty [Material Web](https://github.com/material-components/material-web) (Google), licencja Apache-2.0; nagłówki licencji są zachowane w pliku.
- `three3d.js` — [three.js](https://threejs.org) (licencja MIT) i krój Droid Sans (Google, licencja Apache-2.0) do tekstu 3D.
- Domyślny obraz — Jan Matejko, „Stańczyk” (1862), domena publiczna.
