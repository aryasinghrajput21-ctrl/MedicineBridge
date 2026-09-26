import { demoNearbySources, type NearbySource } from '@/data/demoData';

export function getNearbySources(): NearbySource[] {
  return demoNearbySources;
}

export function getNearbySourcesForMedicine(medicineId: string): NearbySource[] {
  // In demo mode, all sources carry all medicines
  void medicineId;
  return demoNearbySources;
}

export function requestLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message))
    );
  });
}

export function getGoogleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function getGoogleMapsEmbed(lat: number, lng: number): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
}
