import { onMount } from 'solid-js';

function Map(props) {
  let mapElement;

  onMount(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY
      }`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  });

  const initializeMap = () => {
    const map = new google.maps.Map(mapElement, {
      center: { lat: 0, lng: 0 },
      zoom: 14,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setCenter({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );

    props.drivers.forEach((driver) => {
      new google.maps.Marker({
        position: { lat: driver.latitude, lng: driver.longitude },
        map,
        title: driver.name,
      });
    });
  };

  return (
    <div
      ref={mapElement}
      class="w-full h-64 bg-gray-200 rounded-lg shadow-md"
    ></div>
  );
}

export default Map;