import { useEffect, useRef } from 'react';
import { X, Eye, MapPin, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useLanguage } from '../../contexts/LanguageContext';

interface MapViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: {
    name: string;
    coordinates: { lat: number; lng: number };
    cities: string[];
  } | null;
}

function ModalMap({ lat, lng, name, cities }: { lat: number; lng: number; name: string; cities: string[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up any existing map on this div
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }

    import('leaflet').then((L) => {
      if (!mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 9,
        scrollWheelZoom: true,
      });

      leafletMap.current = map;

      // Force tile recalculation after DOM settles
      setTimeout(() => map.invalidateSize(), 100);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<strong>${name}</strong><br/>${cities.join(', ')}`)
        .openPopup();
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [lat, lng, name]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

export function MapViewModal({ isOpen, onClose, region }: MapViewModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !region) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-[#1a3a5c]" />
            <div>
              <h2 className="text-xl font-semibold text-[#1a3a5c]">
                {t('mapview.title')} - {region.name}
              </h2>
              <p className="text-sm text-gray-600">
                {t('mapview.citiesPrefix')} {region.cities.join(', ')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <Alert className="border-yellow-200 bg-transparent">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              <strong>{t('common.privacyNotice')}:</strong> {t('mapview.privacyNotice')}
            </AlertDescription>
          </Alert>
        </div>

        <div className="h-[500px]">
          <ModalMap
            lat={region.coordinates.lat}
            lng={region.coordinates.lng}
            name={region.name}
            cities={region.cities}
          />
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <MapPin className="inline w-4 h-4 mr-1" />
            {t('mapview.note')}
          </div>
          <Button onClick={onClose} className="bg-[#1a3a5c] hover:bg-[#2a4a6c]">
            {t('mapview.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
