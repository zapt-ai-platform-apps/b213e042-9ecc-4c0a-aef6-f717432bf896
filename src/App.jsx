import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { supabase, createEvent } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from '@solidjs/router';

import Map from './components/Map';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [pickupLocation, setPickupLocation] = createSignal('');
  const [dropoffLocation, setDropoffLocation] = createSignal('');
  const [fareEstimate, setFareEstimate] = createSignal(null);
  const [loading, setLoading] = createSignal(false);
  const [drivers, setDrivers] = createSignal([]);
  const navigate = useNavigate();

  const checkUserSignedIn = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(() => {
    checkUserSignedIn();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (session?.user) {
          setUser(session.user);
          setCurrentPage('homePage');
        } else {
          setUser(null);
          setCurrentPage('login');
        }
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `/api/getDrivers?latitude=${latitude}&longitude=${longitude}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      } else {
        console.error('Error fetching drivers:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );
  };

  const estimateFare = async () => {
    if (!pickupLocation() || !dropoffLocation()) return;
    // Mock fare estimation
    setFareEstimate('$15.00');
  };

  const requestRide = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch('/api/requestRide', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupLocation: pickupLocation(),
          dropoffLocation: dropoffLocation(),
          fare: fareEstimate().replace('$', ''),
        }),
      });

      if (response.ok) {
        alert('تم طلب رحلتك بنجاح!');
        // Navigate to ride tracking page or reset form
      } else {
        console.error('Error requesting ride:', response.statusText);
      }
    } catch (error) {
      console.error('Error requesting ride:', error);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    estimateFare();
  });

  return (
    <div class="min-h-screen bg-gray-100 p-4">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-purple-600">
                تسجيل الدخول مع ZAPT
              </h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                تعرف على المزيد عن ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                showLinks={false}
                view="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-4xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-purple-600 cursor-pointer">
              رحلتك معنا
            </h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              تسجيل الخروج
            </button>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4 text-purple-600">
              طلب رحلة
            </h2>
            <div class="space-y-4">
              <input
                type="text"
                placeholder="موقع الالتقاء"
                value={pickupLocation()}
                onInput={(e) => setPickupLocation(e.target.value)}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
              />
              <input
                type="text"
                placeholder="موقع الوجهة"
                value={dropoffLocation()}
                onInput={(e) => setDropoffLocation(e.target.value)}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
              />
              <Show when={fareEstimate()}>
                <p class="text-gray-700">
                  الأجرة المقدرة: <span class="font-semibold">{fareEstimate()}</span>
                </p>
              </Show>
              <button
                onClick={requestRide}
                class={`w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                  loading() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading()}
              >
                {loading() ? 'جاري الطلب...' : 'طلب رحلة'}
              </button>
            </div>
          </div>

          <div class="mt-8">
            <h2 class="text-2xl font-bold mb-4 text-purple-600">
              السائقون القريبون
            </h2>
            <button
              onClick={fetchDrivers}
              class="mb-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            >
              {loading() ? 'جاري التحميل...' : 'عرض السائقين'}
            </button>
            <Map drivers={drivers()} />
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;