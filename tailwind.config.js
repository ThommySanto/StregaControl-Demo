/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Codifica cromatica per categoria (§40 della specifica).
        // Centralizzata qui cosi' resta coerente in tutta l'app
        // (mappa, filtri, legenda PDF).
        category: {
          allestimento: '#B4693E', // terracotta
          elettrico: '#D9A441',    // ambra
          audio: '#3E7CB1',        // blu
          luci: '#E8C547',         // giallo
          poi: '#5A5A5A',          // grigio neutro
        },
      },
    },
  },
  plugins: [],
}
