"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Feature, FeatureCollection } from "geojson";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { ChevronRightIcon, FileTextIcon, LocateFixedIcon, MapIcon, RouteIcon, XIcon } from "lucide-react";

import { WIDGET_CARD, WidgetHeader } from "@/components/dashboard/widget";
import { ITINERARIES } from "@/lib/corridor-route";
import type { Trip, TripStatus, Truck } from "@/lib/data";
import { ALL_BOUNDS, destinationCity, destinationKm, itineraryFor, placeAtKm, pointAtKm, sliceKm } from "@/lib/route-geo";
import { Button } from "@/components/ui/button";
import { useTms } from "@/lib/store";
import { truckKey } from "@/lib/fleet-store";
import { cn, formatNumber } from "@/lib/utils";

// Fond de carte OpenFreeMap (données OpenStreetMap) : gratuit, sans clé ni
// limite d'utilisation.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const PADDING = { top: 60, bottom: 40, left: 60, right: 90 };

// Démo : les positions GPS sont simulées. Un camion « En route » avance
// d'environ 0,4 km par seconde (temps accéléré) le long de son itinéraire.
const TICK_MS = 1000;
const KM_PER_TICK = 0.4;

// Vue d'ensemble : tous les itinéraires en pointillé, d'une seule couleur.
const OVERVIEW_COLOR = "#64748b";

// Couleurs vives attribuées aux camions (une par camion, jamais deux pareilles).
// Le bleu et l'orange des statuts (en route, frontière) en sont exclus pour éviter toute confusion.
const PALETTE = ["#dc2626", "#16a34a", "#9333ea", "#0891b2", "#c026d3", "#65a30d", "#0f766e", "#4338ca", "#be185d", "#7c2d12"];

/** Couleur de chaque camion : tirée de sa plaque, donc identique à chaque chargement. */
function assignColors(plates: string[]): Record<string, string> {
  const taken = new Set<number>();
  const colors: Record<string, string> = {};
  for (const plate of [...plates].sort()) {
    let h = 0;
    for (const c of plate) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    let i = h % PALETTE.length;
    while (taken.has(i) && taken.size < PALETTE.length) i = (i + 1) % PALETTE.length;
    taken.add(i);
    colors[plate] = PALETTE[i];
  }
  return colors;
}

const MARKER: Record<TripStatus, string> = {
  "En route": "border-blue-600 bg-blue-600 text-white",
  Frontière: "border-amber-500 bg-amber-500 text-white",
  "En chargement": "border-slate-300 bg-white text-slate-700",
  Terminé: "border-slate-300 bg-white text-slate-700",
};

const DOT: Record<TripStatus, string> = {
  "En route": "bg-blue-600",
  Frontière: "bg-amber-500",
  "En chargement": "bg-slate-400",
  Terminé: "bg-slate-400",
};

type Live = { km: number; speed: number };
type Tracked = { truck: Truck; trip: Trip };
type Bounds = [[number, number], [number, number]];

function baseSpeed(plate: string) {
  return 56 + ((plate.charCodeAt(3) + plate.charCodeAt(4)) % 14);
}

function boundsOf(coords: [number, number][]): Bounds {
  return coords.reduce<Bounds>(
    ([[w, s], [e, n]], [lng, lat]) => [
      [Math.min(w, lng), Math.min(s, lat)],
      [Math.max(e, lng), Math.max(n, lat)],
    ],
    [
      [180, 90],
      [-180, -90],
    ],
  );
}

/** Itinéraire complet de chaque camion (vue d'ensemble). */
function overviewFeatures(tracked: Tracked[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: tracked.map(({ truck, trip }) => ({
      type: "Feature",
      properties: { plate: truck.plate },
      geometry: { type: "LineString", coordinates: sliceKm(itineraryFor(trip.destination), 0, destinationKm(trip.destination)) },
    })),
  };
}

/** Lignes parcourues (pleines) et restantes (pointillées) de chaque camion, dans sa couleur. */
function routeFeatures(tracked: Tracked[], live: Record<string, Live>, colors: Record<string, string>) {
  const done: Feature[] = [];
  const todo: Feature[] = [];
  for (const { truck, trip } of tracked) {
    const name = itineraryFor(trip.destination);
    const km = live[truck.plate].km;
    const end = destinationKm(trip.destination);
    const props = { plate: truck.plate, color: colors[truck.plate] };
    const a = sliceKm(name, 0, km);
    const b = sliceKm(name, km, end);
    if (a.length > 1) done.push({ type: "Feature", properties: props, geometry: { type: "LineString", coordinates: a } });
    if (b.length > 1) todo.push({ type: "Feature", properties: props, geometry: { type: "LineString", coordinates: b } });
  }
  return {
    done: { type: "FeatureCollection", features: done } as FeatureCollection,
    todo: { type: "FeatureCollection", features: todo } as FeatureCollection,
  };
}

export function FleetMap({
  trucks,
  trips,
  onPick,
  visible = true,
}: {
  trucks: Truck[];
  trips: Trip[];
  onPick: (plate: string) => void;
  visible?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const onPickRef = useRef(onPick);
  const loadedRef = useRef(false);
  // Carte créée alors qu'elle était cachée : il faudra la recadrer à son apparition.
  const needsFitRef = useRef(false);
  const [focused, setFocused] = useState<string | null>(null);
  const focusedRef = useRef<string | null>(null);
  // La carte suit le camion sélectionné, jusqu'à ce qu'on la déplace soi-même.
  const followRef = useRef(false);
  const { settings } = useTms();

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);
  useEffect(() => {
    focusedRef.current = focused;
  }, [focused]);

  const tracked: Tracked[] = useMemo(
    () =>
      trucks.flatMap((truck) => {
        const trip = trips.find((x) => x.id === truck.tripId);
        return truck.corridorKm !== null && trip ? [{ truck, trip }] : [];
      }),
    [trucks, trips],
  );

  const colors = useMemo(() => assignColors(tracked.map((t) => t.truck.plate)), [tracked]);

  const [live, setLive] = useState<Record<string, Live>>(() =>
    Object.fromEntries(tracked.map(({ truck }) => [truck.plate, { km: truck.corridorKm!, speed: 0 }])),
  );
  const liveRef = useRef(live);
  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  // Destinations des camions suivis, avec le nombre de camions qui s'y rendent.
  const destinations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { trip } of tracked) counts.set(trip.destination, (counts.get(trip.destination) ?? 0) + 1);
    return [...counts.entries()].map(([destination, count]) => ({ ...destinationCity(destination), count }));
  }, [tracked]);

  // Simulation GPS : les camions en route avancent jusqu'à leur destination.
  useEffect(() => {
    if (!settings.liveGps) return;
    const id = window.setInterval(() => {
      setLive((prev) => {
        const next = { ...prev };
        for (const { truck, trip } of tracked) {
          if (trip.status !== "En route") continue;
          const target = destinationKm(trip.destination);
          const cur = prev[truck.plate];
          if (cur.km >= target) {
            next[truck.plate] = { km: target, speed: 0 };
            continue;
          }
          const jitter = Math.round(Math.sin(Date.now() / 3000 + truck.plate.charCodeAt(4)) * 3);
          next[truck.plate] = { km: Math.min(target, cur.km + KM_PER_TICK), speed: baseSpeed(truck.plate) + jitter };
        }
        return next;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [tracked, settings.liveGps]);

  // Création de la carte (une seule fois, côté navigateur).
  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;
    const extra: Marker[] = [];
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) return;
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        bounds: ALL_BOUNDS,
        fitBoundsOptions: { padding: PADDING },
        cooperativeGestures: true,
        attributionControl: { compact: true },
        locale: {
          "CooperativeGesturesHandler.WindowsHelpText": "Ctrl + molette pour zoomer sur la carte",
          "CooperativeGesturesHandler.MacHelpText": "⌘ + molette pour zoomer sur la carte",
          "CooperativeGesturesHandler.MobileHelpText": "Utilisez deux doigts pour déplacer la carte",
          "NavigationControl.ZoomIn": "Zoomer",
          "NavigationControl.ZoomOut": "Dézoomer",
          "NavigationControl.ResetBearing": "Remettre le nord en haut",
        },
      });
      mapRef.current = map;
      if (containerRef.current.clientWidth === 0) needsFitRef.current = true;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      // Déplacer la carte à la main arrête le suivi du camion.
      map.on("dragstart", () => {
        followRef.current = false;
      });

      map.on("load", () => {
        // Réseau desservi, en fond.
        map.addSource("network", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: Object.values(ITINERARIES).map((it) => ({
              type: "Feature" as const,
              properties: {},
              geometry: { type: "LineString" as const, coordinates: it.coords },
            })),
          },
        });
        map.addLayer({
          id: "network",
          type: "line",
          source: "network",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#e2e8f0", "line-width": 5 },
        });

        // Vue d'ensemble : itinéraire de chaque camion en pointillé, une seule couleur.
        map.addSource("overview", { type: "geojson", data: overviewFeatures(tracked) });
        map.addLayer({
          id: "overview",
          type: "line",
          source: "overview",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": OVERVIEW_COLOR, "line-width": 2, "line-dasharray": [2, 2], "line-opacity": 0.8 },
        });

        // Camion sélectionné : parcouru en plein et restant en pointillé, dans sa couleur.
        const { done, todo } = routeFeatures(tracked, liveRef.current, colors);
        map.addSource("todo", { type: "geojson", data: todo });
        map.addSource("done", { type: "geojson", data: done });
        const none = ["==", ["get", "plate"], ""] as maplibregl.FilterSpecification;
        map.addLayer({
          id: "todo",
          type: "line",
          source: "todo",
          filter: none,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ["get", "color"], "line-width": 3.5, "line-dasharray": [1.2, 1.6] },
        });
        map.addLayer({
          id: "done",
          type: "line",
          source: "done",
          filter: none,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ["get", "color"], "line-width": 5.5 },
        });
        loadedRef.current = true;
        applyFocusRef.current();
      });

      // Destinations : nom de la ville et nombre de camions attendus.
      destinations.forEach((d) => {
        const el = document.createElement("div");
        // Dapaong et Cinkassé sont collées à la frontière : leur étiquette passe à gauche.
        const side = d.city === "Dapaong" || d.city === "Cinkassé";
        el.className = cn("pointer-events-none flex items-center", side ? "flex-row-reverse gap-1" : "flex-col");
        const label = document.createElement("span");
        label.className = "rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-slate-800 shadow-sm";
        label.textContent = `${d.city} · ${d.count} camion${d.count > 1 ? "s" : ""}`;
        const dot = document.createElement("span");
        dot.className = cn("size-2.5 shrink-0 rounded-full border-2 border-white bg-slate-800 ring-1 ring-slate-300", !side && "mt-0.5");
        el.append(label, dot);
        const marker = side
          ? new maplibregl.Marker({ element: el, anchor: "right", offset: [5, d.city === "Dapaong" ? 10 : -8] })
          : new maplibregl.Marker({ element: el, anchor: "bottom", offset: [0, 5] });
        extra.push(marker.setLngLat(d.coord).addTo(map));
      });

      // Un repère par camion suivi.
      tracked.forEach(({ truck, trip }) => {
        const el = document.createElement("button");
        el.type = "button";
        el.title = `${truck.plate} · ${truck.driver} · vers ${trip.destination}`;
        el.textContent = truck.plate;
        el.className = cn(
          "cursor-pointer rounded-md border px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap shadow-sm transition-[transform,opacity] hover:scale-105",
          MARKER[trip.status],
        );
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          focusPlateRef.current(truck.plate);
        });
        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(pointAtKm(itineraryFor(trip.destination), truck.corridorKm!))
          .addTo(map);
        markers.set(truck.plate, marker);
      });
    })();

    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
      markers.clear();
      extra.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // À chaque position GPS : repères déplacés (empilés s'ils sont au même endroit) et tracés mis à jour.
  useEffect(() => {
    const byKm = new Map<number, string[]>();
    for (const { truck } of tracked) {
      const km = Math.round(live[truck.plate].km);
      byKm.set(km, [...(byKm.get(km) ?? []), truck.plate]);
    }
    for (const { truck, trip } of tracked) {
      const marker = markersRef.current.get(truck.plate);
      if (!marker) continue;
      const group = byKm.get(Math.round(live[truck.plate].km)) ?? [];
      marker.setLngLat(pointAtKm(itineraryFor(trip.destination), live[truck.plate].km));
      marker.setOffset([0, -group.indexOf(truck.plate) * 24]);
    }
    const map = mapRef.current;
    const followed = tracked.find((t) => t.truck.plate === focusedRef.current);
    if (map && followed && followRef.current) {
      map.easeTo({ center: pointAtKm(itineraryFor(followed.trip.destination), live[followed.truck.plate].km), duration: TICK_MS * 0.9 });
    }
    if (map && loadedRef.current) {
      const { done, todo } = routeFeatures(tracked, live, colors);
      (map.getSource("done") as GeoJSONSource | undefined)?.setData(done);
      (map.getSource("todo") as GeoJSONSource | undefined)?.setData(todo);
    }
  }, [live, tracked, colors]);

  // Camion sélectionné : son itinéraire apparaît dans sa couleur, les autres s'estompent.
  const applyFocus = () => {
    const map = mapRef.current;
    if (map && loadedRef.current) {
      const only = ["==", ["get", "plate"], focused ?? ""] as maplibregl.FilterSpecification;
      map.setFilter("done", only);
      map.setFilter("todo", only);
      map.setPaintProperty("overview", "line-opacity", focused ? ["case", ["==", ["get", "plate"], focused], 0, 0.3] : 0.8);
    }
    markersRef.current.forEach((m, plate) => {
      const el = m.getElement();
      const on = focused === plate;
      el.style.opacity = !focused || on ? "1" : "0.35";
      el.style.zIndex = on ? "10" : "";
      // Le repère du camion sélectionné prend la couleur de son tracé.
      el.style.backgroundColor = on ? colors[plate] : "";
      el.style.borderColor = on ? colors[plate] : "";
      el.style.color = on ? "#ffffff" : "";
    });
  };
  const applyFocusRef = useRef(applyFocus);
  useEffect(() => {
    applyFocusRef.current = applyFocus;
  });
  useEffect(() => {
    applyFocus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, colors]);

  // La carte a été cachée : elle doit recalculer sa taille quand elle réapparaît.
  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => {
      const map = mapRef.current;
      if (!map) return;
      map.resize();
      if (needsFitRef.current) {
        needsFitRef.current = false;
        map.fitBounds(ALL_BOUNDS, { padding: PADDING, duration: 0 });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [visible]);

  // Sélection d'un camion : zoom sur sa position, son itinéraire passe au premier plan.
  const focusPlate = (plate: string) => {
    const t = tracked.find((x) => x.truck.plate === plate);
    if (!t) return;
    setFocused(plate);
    followRef.current = true;
    const map = mapRef.current;
    map?.flyTo({
      center: pointAtKm(itineraryFor(t.trip.destination), liveRef.current[plate].km),
      zoom: Math.max(map.getZoom(), 9),
      duration: 1200,
    });
  };
  const focusPlateRef = useRef(focusPlate);
  useEffect(() => {
    focusPlateRef.current = focusPlate;
  });

  const showItinerary = ({ trip }: Tracked) => {
    followRef.current = false;
    const coords = sliceKm(itineraryFor(trip.destination), 0, destinationKm(trip.destination));
    mapRef.current?.fitBounds(boundsOf(coords), { padding: PADDING, duration: 1000 });
  };

  const resetView = () => {
    setFocused(null);
    followRef.current = false;
    mapRef.current?.fitBounds(ALL_BOUNDS, { padding: PADDING, duration: 1000 });
  };

  const selected = tracked.find((t) => t.truck.plate === focused) ?? null;

  return (
    <div className={cn(WIDGET_CARD, "rounded-none border-0 bg-transparent p-0")}>
      <WidgetHeader
        icon={<MapIcon className="size-6" />}
        title="Itinéraires en cours"
        subtitle={`${tracked.length} camions suivis par GPS · ${destinations.length} destinations`}
        color="blue"
        action={
          <button
            type="button"
            onClick={resetView}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            <LocateFixedIcon className="size-4" />
            Vue d&apos;ensemble
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 @5xl/main:grid-cols-[1fr_320px]">
        <div className="relative min-w-0">
          <div ref={containerRef} className="h-[600px] min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50" />
          {selected && (
            <div className="absolute bottom-3 left-3 z-10 flex w-[min(340px,calc(100%-24px))] flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <span className="mt-1 h-3 w-5 shrink-0 rounded-sm" style={{ backgroundColor: colors[selected.truck.plate] }} title="Couleur de son itinéraire" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">
                    {selected.truck.plate} <span className="font-normal text-slate-500">· {selected.truck.driver}</span>
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {placeAtKm(itineraryFor(selected.trip.destination), live[selected.truck.plate].km)} · vers {selected.trip.destination}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetView}
                  aria-label="Désélectionner le camion"
                  className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 border-slate-200 bg-white shadow-none" onClick={() => showItinerary(selected)}>
                  <RouteIcon className="size-3.5" />
                  Itinéraire complet
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 border-slate-200 bg-white shadow-none" onClick={() => focusPlate(selected.truck.plate)}>
                  <LocateFixedIcon className="size-3.5" />
                  Suivre
                </Button>
                <Button size="sm" className="flex-1 gap-1.5 bg-blue-600 text-white shadow-none hover:bg-blue-700" render={<Link href={`/flotte/${truckKey(selected.truck)}`} />}>
                  <FileTextIcon className="size-3.5" />
                  Fiche
                </Button>
              </div>
            </div>
          )}
        </div>

        <ul className="flex max-h-[600px] flex-col gap-2 overflow-y-auto">
          {tracked.map((t) => {
            const { truck, trip } = t;
            const pos = live[truck.plate];
            const name = itineraryFor(trip.destination);
            const end = destinationKm(trip.destination);
            const arrived = trip.status === "En route" && pos.km >= end;
            return (
              <li key={truck.plate}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    focused === truck.plate ? "border-2 bg-slate-50" : "border-slate-200",
                  )}
                  style={focused === truck.plate ? { borderColor: colors[truck.plate] } : undefined}
                >
                  <button type="button" onClick={() => focusPlate(truck.plate)} className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 text-left">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[trip.status])} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="shrink-0 font-semibold whitespace-nowrap text-slate-900">{truck.plate}</span>
                        <span className="min-w-0 truncate text-xs text-slate-500">
                          {truck.driver.split(" ")[0]} · vers {trip.destination}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {placeAtKm(name, pos.km)} · km {formatNumber(Math.round(pos.km))} sur {formatNumber(end)}
                      </span>
                      <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-slate-100">
                        <span className={cn("block h-full rounded-full", DOT[trip.status])} style={{ width: `${Math.min(100, (pos.km / end) * 100)}%` }} />
                      </span>
                      <span className="mt-1 block text-xs font-medium text-slate-700">
                        {arrived ? (
                          "Arrivé à destination"
                        ) : trip.status === "En route" && pos.speed > 0 ? (
                          <span className="tabular-nums">
                            {pos.speed} km/h · encore {formatNumber(Math.round(end - pos.km))} km
                          </span>
                        ) : trip.status === "Frontière" ? (
                          <span className="text-amber-700">À l&apos;arrêt, attente en douane</span>
                        ) : trip.status === "En route" ? (
                          "Démarrage…"
                        ) : (
                          "Chargement au port"
                        )}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPick(truck.plate)}
                    aria-label={`Aperçu du camion ${truck.plate}`}
                    className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed border-slate-500" /> Itinéraires en cours
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-1 w-5 overflow-hidden rounded">
            {PALETTE.slice(0, 4).map((c) => (
              <span key={c} className="flex-1" style={{ backgroundColor: c }} />
            ))}
          </span>
          Camion sélectionné : parcouru en plein, reste en pointillé, dans sa couleur
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-600" /> En route
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500" /> À la frontière
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-slate-400" /> Chargement au port
        </span>
      </div>
    </div>
  );
}
