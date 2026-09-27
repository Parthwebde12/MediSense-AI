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
      <MapContainer
        center={[22.5, 80]}
        zoom={5}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {states.map((state) => {
          const coordinates = indiaStateCoordinates[state.name];

          if (!coordinates) return null;

          return (
            <CircleMarker
              key={state.name}
              center={coordinates}
              radius={Math.max(
                8,
                Math.min(state.phcCount / 10, 30)
              )}
              pathOptions={{
                color: state.alertCount > 0 ? "red" : "green",
                fillColor: state.alertCount > 0 ? "red" : "green",
                fillOpacity: 0.6,
              }}
            >
              <Popup>
                <strong>{state.name}</strong>
                <br />
                PHCs: {state.phcCount}
                <br />
                Alerts: {state.alertCount}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}