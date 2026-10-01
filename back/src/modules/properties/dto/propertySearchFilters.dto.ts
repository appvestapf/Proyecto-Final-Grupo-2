export interface PropertySearchFilters {
    keyword?: string;
    country?:string;
    city?:string;
    rentalType?:string;
    priceUnit?:string;
    minPrice?:number;
    maxPrice?:number;
    maxTotalPrice?:number;
    durationDays?:number;
    capacity?:number;
    rooms?:number;
    bathrooms?:number;
    isPetFriendly?:boolean;
    hasGarage?:boolean;
}