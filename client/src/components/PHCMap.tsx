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
    <div className="h-125 w-full rounded-xl overflow-hidden">
      <MapContainer center={[22.5, 80]} zoom={5} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {states.map(({ name, phcCount, alertCount }) => {
          const coordinates = indiaStateCoordinates[name];
          if (!coordinates) return null;

          const color = alertCount > 0 ? "red" : "green";
          return (
            <CircleMarker
              key={name}
              center={coordinates}
              radius={Math.max(8, Math.min(phcCount / 10, 30))}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
            >
              <Popup>
                <strong>{name}</strong>
                <br />
                PHCs: {phcCount}
                <br />
                Alerts: {alertCount}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}