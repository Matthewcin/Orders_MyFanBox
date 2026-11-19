import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface InteractiveManualPinMapProps {
  lat: number;
  lng: number;
  title?: string;
  subtitle?: string;
  onPinChange: (newLat: number, newLng: number) => void;
  heightClass?: string;
}

export default function InteractiveManualPinMap({
  lat,
  lng,
  title,
  subtitle,
  onPinChange,
  heightClass = 'h-60'
}: InteractiveManualPinMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as Window & { L?: any };
    if (w.L) {
      setReady(true);
      return;
    }
    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js-cdn')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js-cdn';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setReady(true);
      document.body.appendChild(script);
    } else {
      const timer = setInterval(() => {
        if ((window as any).L) {
          setReady(true);
          clearInterval(timer);
        }
      }, 120);
      return () => clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 6.20892;
    const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : -75.56781;

    if (!mapRef.current) {
      const map = L.map(containerRef.current).setView([safeLat, safeLng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const marker = L.marker([safeLat, safeLng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onPinChange(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)));
      });

      map.on('click', (e: any) => {
        const cLat = Number(e.latlng.lat.toFixed(5));
        const cLng = Number(e.latlng.lng.toFixed(5));
        marker.setLatLng([cLat, cLng]);
        onPinChange(cLat, cLng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    } else {
      mapRef.current.setView([safeLat, safeLng], mapRef.current.getZoom() || 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([safeLat, safeLng]);
      }
    }

    if (markerRef.current) {
      markerRef.current.bindPopup(
        `<div style="font-family:sans-serif;font-size:12px;"><b>${title || 'Ubicación del Pedido'}</b><br/>${subtitle || ''}<br/><span style="font-family:monospace;font-size:11px;">📍 ${safeLat}, ${safeLng}</span></div>`
      );
    }
  }, [ready, lat, lng, title, subtitle]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
      <div ref={containerRef} className={`w-full ${heightClass} z-10`} />
      <div className="z-20 pointer-events-none absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-zinc-900/85 text-white text-[10px] font-medium shadow flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-emerald-400" />
        <span>Haz clic en la calle exacta o arrastra el marcador azul para mover el pin</span>
      </div>
    </div>
  );
}