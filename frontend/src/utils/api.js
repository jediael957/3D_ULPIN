const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetch3DParcels() {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/3d`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch 3D parcels:', err);
    return getFallbackParcelGeoJSON();
  }
}

export async function deleteParcelByUlpin(ulpin_3d) {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/ulpin/${encodeURIComponent(ulpin_3d)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to delete parcel block:', err);
    throw err;
  }
}

export async function autoDetectCityParcels() {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/auto-detect-city`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to auto-detect city parcels:', err);
    throw err;
  }
}

export async function fetchParcelByUlpin(ulpin_3d) {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/ulpin/${encodeURIComponent(ulpin_3d)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch parcel ledger:', err);
    return null;
  }
}

export async function generate3DUlpin(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/generate-ulpin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errBody = await res.json();
      throw new Error(errBody.detail || 'Failed to generate ULPIN');
    }
    return await res.json();
  } catch (err) {
    console.error('3D ULPIN generation error:', err);
    throw err;
  }
}

export async function fetchSpatialCertificate(ulpin_3d) {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/ulpin/${encodeURIComponent(ulpin_3d)}/certificate`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch spatial certificate:', err);
    return null;
  }
}

function getFallbackParcelGeoJSON() {
  return {
    "type": "FeatureCollection",
    "features": []
  };
}
