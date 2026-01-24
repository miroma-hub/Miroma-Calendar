
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Navigation, Calendar as CalendarIcon, Globe, ChevronLeft, ChevronRight, Layers, Loader2, Info, X, User, Clock, Euro, Tag, Trash2, Zap, AlertCircle } from 'lucide-react';
import { format, parseISO, isAfter, isSameMonth, isSameDay, addMonths, subMonths, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import L from 'leaflet';
import { CalendarEvent } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const MapView: React.FC = () => {
  const { events, clients, calendarDate, setCalendarDate, updateEvent, deleteEvent } = useApp();
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const processedRef = useRef<Set<string>>(new Set());
  const lastZoomKeyRef = useRef<string>("");
  
  const [filterMode, setFilterMode] = useState<'day' | 'month' | 'all'>('month');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isDowngraded, setIsDowngraded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const allFutureEventsWithLocation = useMemo(() => {
    return events
      .filter(e => e.location && e.location.trim() !== '')
      .filter(e => isAfter(parseISO(e.end), new Date()))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [events]);

  const displayedEvents = useMemo(() => {
    if (filterMode === 'all') return allFutureEventsWithLocation;
    if (filterMode === 'day') return allFutureEventsWithLocation.filter(e => isSameDay(parseISO(e.start), calendarDate));
    return allFutureEventsWithLocation.filter(e => isSameMonth(parseISO(e.start), calendarDate));
  }, [allFutureEventsWithLocation, filterMode, calendarDate]);

  const getCoordinates = async (address: string) => {
    try {
      // Create a new instance right before use as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Localize lat/lng para: "${address}, Portugal". Responda JSON: {"lat": número, "lng": número}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER }
            },
            required: ["lat", "lng"]
          }
        }
      });
      setIsDowngraded(false);
      return response.text ? JSON.parse(response.text) : null;
    } catch (err: any) {
      setIsDowngraded(true);
      try {
        const query = encodeURIComponent(`${address}, Portugal`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      } catch (nomErr) {
        console.error("Erro geocodificação:", nomErr);
      }
      return null;
    }
  };

  useEffect(() => {
    if (mapElementRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapElementRef.current, {
        center: [39.5, -8.1],
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(mapInstanceRef.current);
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (filterMode !== 'day') {
      setIsGeocoding(false);
      return;
    }
    let active = true;
    const processVisibleMissing = async () => {
      const missing = displayedEvents.filter(e => !e.lat || !e.lng).filter(e => !processedRef.current.has(e.id));
      if (missing.length === 0) {
        setIsGeocoding(false);
        return;
      }
      setIsGeocoding(true);
      for (const event of missing) {
        if (!active) break;
        processedRef.current.add(event.id);
        const coords = await getCoordinates(event.location!);
        if (coords && active) {
          updateEvent(event.id, { lat: coords.lat, lng: coords.lng });
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      if (active) setIsGeocoding(false);
    };
    processVisibleMissing();
    return () => { active = false; };
  }, [displayedEvents, filterMode, updateEvent]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    // Fix: Use LatLngTuple[] to satisfy fitBounds type requirements (line 126)
    const bounds: L.LatLngTuple[] = [];
    displayedEvents.forEach(event => {
      if (event.lat && event.lng) {
        // Fix: Use LatLngTuple type (line 129)
        const coords: L.LatLngTuple = [event.lat, event.lng];
        bounds.push(coords);
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="relative flex items-center justify-center"><div class="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping"></div><div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div></div>`,
          iconSize: [24, 24], iconAnchor: [12, 12]
        });
        const marker = L.marker(coords, { icon: customIcon }).addTo(markersLayerRef.current!);
        const client = clients.find(c => c.id === event.clientId);
        const popupEl = document.createElement('div');
        popupEl.className = 'p-3 flex flex-col gap-2';
        popupEl.innerHTML = `<div class="mb-1"><h4 class="text-blue-400 font-black text-sm m-0">${event.title}</h4><p class="text-[10px] text-slate-400 font-bold m-0 uppercase">${client ? client.name : 'Individual'}</p></div><button id="btn-map-details-${event.id}" class="w-full bg-blue-600 text-white text-[9px] font-black uppercase py-2 rounded-xl">Ver Detalhes</button>`;
        marker.bindPopup(popupEl, { className: 'custom-popup', offset: [0, -5] });
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-map-details-${event.id}`);
          if (btn) btn.onclick = () => setSelectedEvent(event);
        });
      }
    });
    const currentZoomKey = `${calendarDate.toISOString()}-${filterMode}`;
    if (bounds.length > 0 && mapInstanceRef.current && lastZoomKeyRef.current !== currentZoomKey) {
      // Fix: fitBounds expects LatLngBoundsExpression, which includes LatLngTuple[] (line 148)
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      lastZoomKeyRef.current = currentZoomKey;
    }
  }, [displayedEvents, clients, calendarDate, filterMode]);

  const openInGPS = (event: CalendarEvent) => {
    const query = encodeURIComponent(`${event.location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in overflow-hidden relative">
      {isGeocoding && (
        <div className={`absolute top-8 left-1/2 -translate-x-1/2 z-[1000] backdrop-blur-xl border px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl transition-all ${isDowngraded ? 'bg-orange-950/90 border-orange-500/40' : 'bg-slate-900/90 border-blue-500/40'}`}>
          {isDowngraded ? <AlertCircle size={16} className="text-orange-400" /> : <Zap size={16} className="text-blue-400 animate-pulse" />}
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{isDowngraded ? 'Modo OSM Ativo' : 'Geo-AI Miroma Ativa'}</span>
        </div>
      )}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 z-10 flex-shrink-0">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-black gemini-gradient-text tracking-tighter">MAPA LOGÍSTICO</h2>
          <p className="text-slate-400 text-sm font-medium">Gestão inteligente de paragens.</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-800/40 rounded-xl p-1 border border-slate-700/30 backdrop-blur-md">
              <button onClick={() => setFilterMode('day')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterMode === 'day' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Dia</button>
              <button onClick={() => setFilterMode('month')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterMode === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Mês</button>
              <button onClick={() => setFilterMode('all')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterMode === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Tudo</button>
           </div>
           {(filterMode === 'day' || filterMode === 'month') && (
             <div className="flex items-center gap-2 bg-slate-800/40 rounded-xl px-4 border border-slate-700/30 backdrop-blur-md">
                <button onClick={() => setCalendarDate(filterMode === 'day' ? subDays(calendarDate, 1) : subMonths(calendarDate, 1))} className="text-slate-400"><ChevronLeft size={16}/></button>
                <span className="text-xs font-bold text-white min-w-[120px] text-center capitalize">{filterMode === 'day' ? format(calendarDate, "dd 'de' MMM", { locale: ptBR }) : format(calendarDate, 'MMMM yyyy', { locale: ptBR })}</span>
                <button onClick={() => setCalendarDate(filterMode === 'day' ? addDays(calendarDate, 1) : addMonths(calendarDate, 1))} className="text-slate-400"><ChevronRight size={16}/></button>
             </div>
           )}
        </div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
        <div className="flex-[2] rounded-[2.5rem] overflow-hidden border border-slate-700/30 relative z-0 bg-slate-950">
          <div ref={mapElementRef} className="w-full h-full" />
        </div>
        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 h-full lg:h-auto pb-6">
           <h3 className="text-[10px] font-black text-slate-500 uppercase px-2 mb-2 flex items-center justify-between"><span>Destinos ({displayedEvents.length})</span></h3>
           {displayedEvents.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800/50 rounded-[2.5rem] p-10 text-center italic min-h-[200px]">
                <Globe size={40} className="mb-4 opacity-10" /><p className="text-xs font-bold opacity-60">Sem locais mapeados.</p>
             </div>
           ) : (
             displayedEvents.map(event => (
               <div key={event.id} onClick={() => { if (event.lat && event.lng && mapInstanceRef.current) mapInstanceRef.current.flyTo([event.lat, event.lng], 16); }} className="bg-slate-800/10 backdrop-blur-md border border-slate-700/30 p-5 rounded-[2rem] hover:bg-slate-800/30 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm group-hover:text-blue-400 truncate mb-0.5">{event.title}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase truncate">{clients.find(c => c.id === event.clientId)?.name || 'Manual'}</p>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }} className="p-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600 transition-all"><Info size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); openInGPS(event); }} className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Navigation size={14}/></button>
                      </div>
                  </div>
                  <div className="flex items-start gap-3 text-[10px] text-slate-300 italic bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                     <MapPin size={12} className="flex-shrink-0 mt-0.5 text-blue-500/40" />
                     <span className="line-clamp-2">{event.location}</span>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
      {selectedEvent && (
        <div className="fixed inset-0 z-[3000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {(() => {
                    const client = clients.find(c => c.id === selectedEvent.clientId);
                    return (
                        <>
                        <div className={`h-36 bg-gradient-to-r from-blue-600 to-indigo-700 p-10 flex items-end relative`}><button onClick={() => setSelectedEvent(null)} className="absolute top-8 right-8 text-white/70 bg-black/30 p-3 rounded-full"><X size={22}/></button><div className="flex items-center gap-6"><div className="p-4 bg-white/20 rounded-2xl text-white"><CalendarIcon size={36} /></div><div><span className="text-[10px] uppercase font-black text-white/60 mb-1.5 block">Destino</span><h3 className="text-4xl font-black text-white leading-tight">{selectedEvent.title}</h3></div></div></div>
                        <div className="p-10 space-y-10 overflow-y-auto max-h-[60vh]"><div className="grid grid-cols-2 gap-10"><div className="space-y-6"><div><label className="text-[10px] uppercase text-slate-500 mb-2 block">Data</label><div className="flex items-center gap-3 text-white font-bold text-lg">{format(parseISO(selectedEvent.start), "dd 'de' MMMM, yyyy", {locale: ptBR})}</div></div></div><div className="space-y-6"><div><label className="text-[10px] uppercase text-slate-500 mb-2 block">Cliente</label><div className="flex items-center gap-3 text-white font-bold text-lg truncate">{client ? client.name : 'Individual'}</div></div></div></div><div className="bg-slate-800/30 border border-slate-700/30 rounded-[2rem] p-8 space-y-8"><div className="flex items-start gap-6"><MapPin size={24} className="text-red-400 mt-1" /><div><label className="text-[10px] uppercase text-slate-500 block mb-1">Localização</label><span className="text-slate-100 text-lg font-bold">{selectedEvent.location || 'A definir'}</span></div></div></div></div>
                        <div className="p-10 border-t border-slate-800/50 bg-slate-900/50 flex gap-6"><button onClick={() => setSelectedEvent(null)} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-2xl">Fechar</button></div>
                        </>
                    )
                })()}
            </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
