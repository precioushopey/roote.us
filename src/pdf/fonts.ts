import { Font } from '@react-pdf/renderer';
import libreFranklinRegular from '@expo-google-fonts/libre-franklin/400Regular/LibreFranklin_400Regular.ttf';
import libreFranklinBold from '@expo-google-fonts/libre-franklin/700Bold/LibreFranklin_700Bold.ttf';
import heeboRegular from '@expo-google-fonts/heebo/400Regular/Heebo_400Regular.ttf';
import heeboBold from '@expo-google-fonts/heebo/700Bold/Heebo_700Bold.ttf';

let registered = false;

/** Registers the two report fonts with @react-pdf/renderer. Idempotent — safe to call from every render. */
export function registerReportFonts(): void {
  if (registered) return;
  Font.register({
    family: 'Libre Franklin',
    fonts: [
      { src: libreFranklinRegular, fontWeight: 400 },
      { src: libreFranklinBold, fontWeight: 700 },
    ],
  });
  Font.register({
    family: 'Heebo',
    fonts: [
      { src: heeboRegular, fontWeight: 400 },
      { src: heeboBold, fontWeight: 700 },
    ],
  });
  registered = true;
}
