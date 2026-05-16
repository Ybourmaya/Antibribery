import { useState, useEffect, useRef } from 'react';
import { MapPin, TrendingUp, AlertTriangle, Eye, TrendingDown } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { MapViewModal } from '../components/MapViewModal';
import { useLanguage } from '../../contexts/LanguageContext';

const regionData = [
  {
    name: 'Casablanca-Settat',
    reports: 58,
    risk: 'high',
    trend: '+15%',
    cities: ['Casablanca', 'Settat', 'Mohammedia', 'El Jadida'],
    coordinates: { lat: 33.5731, lng: -7.5898 },
  },
  {
    name: 'Rabat-Salé-Kénitra',
    reports: 42,
    risk: 'high',
    trend: '+8%',
    cities: ['Rabat', 'Salé', 'Kénitra', 'Témara'],
    coordinates: { lat: 34.0209, lng: -6.8416 },
  },
  {
    name: 'Fès-Meknès',
    reports: 35,
    risk: 'medium',
    trend: '+5%',
    cities: ['Fès', 'Meknès', 'Taza', 'Ifrane'],
    coordinates: { lat: 34.0181, lng: -5.0078 },
  },
  {
    name: 'Marrakech-Safi',
    reports: 38,
    risk: 'medium',
    trend: '+12%',
    cities: ['Marrakech', 'Safi', 'Essaouira', 'El Kelaa'],
    coordinates: { lat: 31.6295, lng: -7.9811 },
  },
  {
    name: 'Tanger-Tétouan-Al Hoceïma',
    reports: 31,
    risk: 'medium',
    trend: '+3%',
    cities: ['Tanger', 'Tétouan', 'Al Hoceïma', 'Larache'],
    coordinates: { lat: 35.7595, lng: -5.834 },
  },
  {
    name: "L'Oriental",
    reports: 18,
    risk: 'low',
    trend: '-2%',
    cities: ['Oujda', 'Nador', 'Berkane', 'Taourirt'],
    coordinates: { lat: 34.6814, lng: -1.9086 },
  },
  {
    name: 'Souss-Massa',
    reports: 26,
    risk: 'low',
    trend: '+1%',
    cities: ['Agadir', 'Inezgane', 'Taroudant', 'Tiznit'],
    coordinates: { lat: 30.4278, lng: -9.5981 },
  },
  {
    name: 'Drâa-Tafilalet',
    reports: 12,
    risk: 'low',
    trend: '-5%',
    cities: ['Errachidia', 'Ouarzazate', 'Zagora', 'Tinghir'],
    coordinates: { lat: 31.9314, lng: -4.4316 },
  },
  {
    name: 'Béni Mellal-Khénifra',
    reports: 22,
    risk: 'low',
    trend: '+4%',
    cities: ['Béni Mellal', 'Khénifra', 'Khouribga', 'Azilal'],
    coordinates: { lat: 32.3373, lng: -6.3498 },
  },
];

const riskColors = {
  high: 'bg-red-100 text-[#E24B4A] border-red-200',
  medium: 'bg-[#FEF3E2] text-[#EF9F27] border-[#EF9F27]/20',
  low: 'bg-green-100 text-[#639922] border-green-200',
};

const markerColors = {
  high: '#E24B4A',
  medium: '#EF9F27',
  low: '#639922',
};

function getRadius(reports: number) {
  return Math.max(14, Math.min(34, reports * 0.45));
}

// Pure Leaflet map — avoids react-leaflet v5 / React 18 concurrent mode bug
function MoroccoMap({ onRegionClick }: { onRegionClick: (region: typeof regionData[0]) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [31.5, -6.5],
        zoom: 5,
        scrollWheelZoom: true,
      });

      leafletMap.current = map;

      // Force Leaflet to recalculate tile positions after DOM settles
      setTimeout(() => map.invalidateSize(), 100);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      regionData.forEach((region) => {
        const color = markerColors[region.risk as keyof typeof markerColors];
        const radius = getRadius(region.reports);

        const circle = L.circleMarker([region.coordinates.lat, region.coordinates.lng], {
          radius,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map);

        circle.bindTooltip(
          `<strong>${region.name}</strong><br/>${region.reports} reports · <span style="color:${color};text-transform:capitalize">${region.risk} risk</span>`,
          { direction: 'top', offset: [0, -radius] }
        );

        circle.bindPopup(
          `<div style="min-width:180px">
            <p style="font-weight:700;margin-bottom:4px">${region.name}</p>
            <p style="margin:2px 0"><strong>Reports:</strong> ${region.reports}</p>
            <p style="margin:2px 0"><strong>Risk:</strong> <span style="color:${color};text-transform:capitalize">${region.risk}</span></p>
            <p style="margin:2px 0"><strong>Trend:</strong> ${region.trend}</p>
            <p style="margin:2px 0;font-size:12px;color:#666">${region.cities.join(', ')}</p>
          </div>`
        );

        circle.on('click', () => onRegionClick(region));
      });
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

export function MapView() {
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<typeof regionData[0] | null>(null);
  const [mapViewRegion, setMapViewRegion] = useState<typeof regionData[0] | null>(null);
  const [isMapViewOpen, setIsMapViewOpen] = useState(false);

  const handleMapViewClick = (region: typeof regionData[0]) => {
    setMapViewRegion(region);
    setIsMapViewOpen(true);
  };

  const totalReports = regionData.reduce((sum, r) => sum + r.reports, 0);
  const highRiskRegions = regionData.filter((r) => r.risk === 'high').length;
  const avgReports = Math.round(totalReports / regionData.length);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-semibold text-[#1a3a5c] mt-1">{totalReports}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk Regions</p>
                <p className="text-2xl font-semibold text-[#E24B4A] mt-1">{highRiskRegions}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#E24B4A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg per Region</p>
                <p className="text-2xl font-semibold text-[#1a3a5c] mt-1">{avgReports}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <Card className="lg:col-span-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1a3a5c]" />
              Morocco — Regional Risk Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 440, position: 'relative' }}>
              <MoroccoMap onRegionClick={setSelectedRegion} />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <div key={level} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: markerColors[level] }} />
                  <span className="text-sm text-gray-600 capitalize">{level} Risk</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              OpenStreetMap · Free, no API key · Click a bubble for details
            </p>
          </CardContent>
        </Card>

        {/* Region Details Panel */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>{selectedRegion ? 'Region Details' : 'Regional Statistics'}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRegion ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#1a3a5c] mb-2">{selectedRegion.name}</h3>
                  <Badge className={`${riskColors[selectedRegion.risk as keyof typeof riskColors]} border capitalize`}>
                    {selectedRegion.risk} Risk
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Reports</span>
                    <span className="font-semibold text-[#1a3a5c]">{selectedRegion.reports}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Trend</span>
                    <div className="flex items-center gap-1">
                      {selectedRegion.trend.startsWith('-') ? (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`font-semibold ${selectedRegion.trend.startsWith('-') ? 'text-green-600' : 'text-red-500'}`}>
                        {selectedRegion.trend}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Coordinates</span>
                    <span className="text-xs text-gray-500">
                      {selectedRegion.coordinates.lat.toFixed(4)}, {selectedRegion.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleMapViewClick(selectedRegion)}
                  className="w-full bg-[#1a3a5c] hover:bg-[#2a4a6c] text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('mapview.openButton')}
                </Button>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Major Cities</p>
                  <div className="space-y-2">
                    {selectedRegion.cities.map((city) => (
                      <div key={city} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{city}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="ghost" className="w-full text-gray-500 text-sm" onClick={() => setSelectedRegion(null)}>
                  ← Back to all regions
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {regionData.map((region) => (
                  <button
                    key={region.name}
                    onClick={() => setSelectedRegion(region)}
                    className="w-full text-left flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-[#1a3a5c] transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{region.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{region.reports} reports</p>
                    </div>
                    <Badge className={`${riskColors[region.risk as keyof typeof riskColors]} border capitalize`}>
                      {region.risk}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MapViewModal
        isOpen={isMapViewOpen}
        onClose={() => setIsMapViewOpen(false)}
        region={mapViewRegion}
      />
    </div>
  );
}
