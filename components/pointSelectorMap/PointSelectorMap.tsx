"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import Icon from "../icon";

// Fix marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationClicker({ onAddPoint }: any) {
  useMapEvents({
    click(e: any) {
      onAddPoint(e.latlng);
    },
  });
  return null;
}

export default function PointSelectorMap() {
  const [points, setPoints] = useState<any>([]);
  const t = useTranslations("");
  const addPoint = (latlng: any) => {
    setPoints([...points, latlng]);
  };

  const removePoint = (indexToRemove: any) => {
    setPoints((prev: any) =>
      prev.filter((_: any, idx: number) => idx !== indexToRemove)
    );
  };

  const sendToBackend = async () => {
    console.log(points);
  };

  return (
    <div className="pt-4">
      <MapContainer
        center={[35.6892, 51.389]} // Tehran coordinates
        zoom={13}
        style={{
          height: "500px",
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationClicker onAddPoint={addPoint} />
        {points.map((pos: any, idx: number) => (
          <Marker
            key={idx}
            position={pos}
            eventHandlers={{
              click: () => removePoint(idx),
            }}
          />
        ))}
      </MapContainer>
      <div className="py-3 w-full ">
        <Button
          onPress={sendToBackend}
          color="primary"
          isDisabled={points.length == 0}
        >
          <Icon name="calendar-check-2"></Icon>
          {t("global.reports.confirm")}
        </Button>
      </div>
    </div>
  );
}
