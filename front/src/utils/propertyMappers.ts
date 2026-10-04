import { Property, PropertyLocation } from "@/interfaces/property";

export const mapPropertyToLocation = (prop: Property): PropertyLocation => ({
  id: prop.id,
  title: prop.title || prop.name,
  price: prop.price,
  lat: prop.lat ?? 0,
  lng: prop.lng ?? 0,
  image: prop.images?.[0],
  address: prop.location,
});

export const mapPropertiesToLocations = (properties: Property[]): PropertyLocation[] => {
  return properties
    .filter((prop) => typeof prop.lat === "number" && typeof prop.lng === "number")
    .map(mapPropertyToLocation);
};