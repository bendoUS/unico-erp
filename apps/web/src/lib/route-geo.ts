import { BORDER_KM, ITINERARIES, type Itinerary, type ItineraryName } from "./corridor-route";

// Outils de positionnement le long des itinéraires : à partir d'une distance
// en km depuis le Port de Lomé, on retrouve le point exact sur la route.

function haversine([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]) {
  const r = 6371;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

// Distance cumulée de chaque point, ramenée à la distance routière réelle
// (le tracé simplifié est un peu plus court que la route).
const CUMULATIVE = Object.fromEntries(
  (Object.entries(ITINERARIES) as [ItineraryName, Itinerary][]).map(([name, it]) => {
    const acc = [0];
    for (let i = 1; i < it.coords.length; i++) acc.push(acc[i - 1] + haversine(it.coords[i - 1], it.coords[i]));
    const scale = it.km / acc[acc.length - 1];
    return [name, acc.map((d) => d * scale)];
  }),
) as Record<ItineraryName, number[]>;

/** Itinéraire suivi pour une destination (Dapaong et Cinkassé sont sur le tronc commun). */
export function itineraryFor(destination: string): ItineraryName {
  if (destination === "Bamako" || destination === "Niamey") return destination;
  return "Ouagadougou";
}

/** Distance routière de la destination (km depuis le Port de Lomé). */
export function destinationKm(destination: string): number {
  if (destination === "Dapaong") return 630;
  if (destination === "Cinkassé") return BORDER_KM;
  return ITINERARIES[itineraryFor(destination)].km;
}

function locate(name: ItineraryName, km: number) {
  const cum = CUMULATIVE[name];
  const d = Math.max(0, Math.min(ITINERARIES[name].km, km));
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= d) lo = mid;
    else hi = mid;
  }
  const t = (d - cum[lo]) / (cum[hi] - cum[lo] || 1);
  const [x1, y1] = ITINERARIES[name].coords[lo];
  const [x2, y2] = ITINERARIES[name].coords[hi];
  return { lo, hi, point: [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t] as [number, number] };
}

/** Point [lng, lat] situé à `km` kilomètres du Port de Lomé sur un itinéraire. */
export function pointAtKm(name: ItineraryName, km: number): [number, number] {
  return locate(name, km).point;
}

/** Portion du tracé entre deux distances (pour dessiner le parcouru et le restant). */
export function sliceKm(name: ItineraryName, from: number, to: number): [number, number][] {
  if (to <= from) return [];
  const a = locate(name, from);
  const b = locate(name, to);
  return [a.point, ...ITINERARIES[name].coords.slice(a.hi, b.lo + 1), b.point];
}

/** « Entre Kara et Mango », ou « Kara » si le camion est à moins de 5 km. */
export function placeAtKm(name: ItineraryName, km: number): string {
  const cities = ITINERARIES[name].cities;
  const near = cities.find((c) => Math.abs(c.km - km) < 5);
  if (near) return near.city;
  const before = [...cities].reverse().find((c) => c.km < km);
  const after = cities.find((c) => c.km > km);
  if (!before || !after) return "Corridor";
  return `Entre ${before.city.replace("Port de ", "")} et ${after.city}`;
}

/** Ville d'arrivée d'une destination avec ses coordonnées. */
export function destinationCity(destination: string) {
  const name = itineraryFor(destination);
  return ITINERARIES[name].cities.find((c) => c.city === destination) ?? ITINERARIES[name].cities.at(-1)!;
}

/** Emprise de tous les itinéraires (pour la vue d'ensemble). */
export const ALL_BOUNDS = Object.values(ITINERARIES)
  .flatMap((it) => it.coords)
  .reduce(
    ([[w, s], [e, n]], [lng, lat]) =>
      [
        [Math.min(w, lng), Math.min(s, lat)],
        [Math.max(e, lng), Math.max(n, lat)],
      ] as [[number, number], [number, number]],
    [
      [180, 90],
      [-180, -90],
    ] as [[number, number], [number, number]],
  );
