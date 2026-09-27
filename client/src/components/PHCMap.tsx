import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { indiaStateCoordinates } from "../data/indiaStateCoordinates";

export interface MapStateEntry {
  name: string;
  phcCount: number;
  alertCount: number;
}

export default function PHCMap({ states }: { states: MapStateEntry[] }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: 420 }}>
      <MapContainer
        center={[22.9734, 78.6569]}
        zoom={4.5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {states.map((s) => {
          const coords = indiaStateCoordinates[s.name];
          if (!coords) return null;
          const healthy = s.alertCount === 0;
          return (
            <CircleMarker
              key={s.name}
              center={coords}
              radius={8 + Math.min(s.phcCount, 10) * 2}
              pathOptions={{
                color: healthy ? "#10b981" : "#ef4444",
                fillColor: healthy ? "#10b981" : "#ef4444",
                fillOpacity: 0.5,
              }}
            >
              <Popup>
                <strong>{s.name}</strong>
                <br />
                {s.phcCount} PHC{s.phcCount !== 1 ? "s" : ""}
                <br />
                {s.alertCount} alert{s.alertCount !== 1 ? "s" : ""}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}