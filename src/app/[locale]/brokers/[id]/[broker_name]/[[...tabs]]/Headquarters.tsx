'use client';

import { useEffect, useRef } from 'react';
import * as maptiler from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

interface HeadquartersProps {
  coordinates: string; // Format: "lat,long;lat,long;..."
}

export const Headquarters = ({ coordinates }: HeadquartersProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptiler.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Parse coordinates first to calculate initial center and zoom
    const points = coordinates.split(';').map(point => {
      const [lat, lng] = point.split(',').map(Number);
      return { lat, lng };
    });

    // Calculate center point
    const center = points.reduce((acc, point) => ({
      lat: acc.lat + point.lat / points.length,
      lng: acc.lng + point.lng / points.length
    }), { lat: 0, lng: 0 });

    // Initialize the map
    maptiler.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
    
    map.current = new maptiler.Map({
      container: mapContainer.current,
      style: maptiler.MapStyle.STREETS,
      center: [center.lng, center.lat],
      zoom: 2,
      navigationControl: true,
      touchZoomRotate: true,
      dragRotate: false,
      touchPitch: true,
    });

    // Wait for map to load
    map.current.on('load', () => {
      // Add markers for each point
      points.forEach((point, index) => {
        new maptiler.Marker({ color: '#FF0000' })
          .setLngLat([point.lng, point.lat])
          .addTo(map.current!);
      });

      // Fit bounds to show all markers with padding
      if (points.length > 0) {
        const bounds = new maptiler.LngLatBounds();
        points.forEach(point => {
          bounds.extend([point.lng, point.lat]);
        });
        
        // Adjust padding based on screen size
        const isMobile = window.innerWidth < 768;
        const padding = isMobile ? 20 : 50;
        const maxZoom = isMobile ? 12 : 15;
        
        map.current!.fitBounds(bounds, { 
          padding,
          maxZoom,
          duration: 0 // Instant zoom for better mobile experience
        });
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (map.current && points.length > 0) {
        const bounds = new maptiler.LngLatBounds();
        points.forEach(point => {
          bounds.extend([point.lng, point.lat]);
        });
        
        const isMobile = window.innerWidth < 768;
        const padding = isMobile ? 20 : 50;
        
        map.current.fitBounds(bounds, { 
          padding,
          duration: 0
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (map.current) {
        map.current.remove();
      }
    };
  }, [coordinates]);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-300">Headquarters</h2>
      <div className="w-full md:w-4/5 lg:w-3/5 h-[300px] sm:h-[400px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};
