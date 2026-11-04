import { MapContainer, CircleMarker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// database (x, y)  ->  map [lat, lng]   (flip y so the entrance is at the top)
const toPos = (n) => [100 - n.y, n.x];

export default function MapView({ nodes, route, lang }) {
  const steps = route ? route.steps : [];
  const routeCodes = steps.map((s) => s.code);
  const startCode = steps.length ? steps[0].code : null;
  const endCode = steps.length ? steps[steps.length - 1].code : null;

  const colorOf = (code) => {
    if (code === startCode) return "green";
    if (code === endCode) return "red";
    if (routeCodes.includes(code)) return "#1976d2";
    return "#888";
  };

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={[[0, 0], [100, 100]]}
      minZoom={-1}
      maxZoom={4}
      style={{ height: 600, width: "100%", background: "#f4f4f4", marginTop: 20 }}
    >
      {steps.length > 1 && (
        <Polyline positions={steps.map(toPos)} pathOptions={{ color: "#1976d2", weight: 5 }} />
      )}

      {nodes.map((n) => {
        const inRoute = routeCodes.includes(n.code);
        const color = n.is_active ? colorOf(n.code) : "#e65100";
        const name = lang === "ta" ? n.name_ta : n.name_en;
        const suffix = n.is_active ? "" : lang === "ta" ? " (சேவையில் இல்லை)" : " (out of service)";
        return (
          <CircleMarker
            key={n.code + inRoute + n.is_active}
            center={toPos(n)}
            radius={inRoute ? 9 : 6}
            pathOptions={{ color, fillOpacity: 0.9 }}
          >
            <Tooltip permanent={inRoute || !n.is_active} direction="right">
              {name + suffix}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}