export interface ParsedBaseMap {
  width: number
  height: number
  innerMarkup: string
}

// Estrae larghezza/altezza (dal viewBox) e il markup interno da una
// stringa SVG completa salvata in base_maps.svg_data, cosi' possiamo
// incorporarla dentro il <svg> della nostra mappa mantenendo lo stesso
// sistema di coordinate su cui si basano le posizioni normalizzate
// degli elementi (§36-38 della specifica).
export function parseBaseMapSvg(svgString: string): ParsedBaseMap {
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml')
  const svgEl = doc.documentElement

  const viewBox = svgEl.getAttribute('viewBox')
  let width = 1000
  let height = 1000

  if (viewBox) {
    const parts = viewBox.trim().split(/\s+/).map(Number)
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      width = parts[2]
      height = parts[3]
    }
  } else {
    width = Number(svgEl.getAttribute('width')) || width
    height = Number(svgEl.getAttribute('height')) || height
  }

  return { width, height, innerMarkup: svgEl.innerHTML }
}
