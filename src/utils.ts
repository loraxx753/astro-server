const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;



/** Normalize angle to [0, 360) degrees */
export function norm360(deg: number): number {
  return (deg % 360 + 360) % 360;
}

/** Julian Day from a JavaScript Date interpreted as UTC */
export function jdUTC(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1; // 1..12
  const d =
    date.getUTCDate() +
    (date.getUTCHours() +
      (date.getUTCMinutes() +
        (date.getUTCSeconds() + date.getUTCMilliseconds() / 1000) / 60) /
        60) /
      24;

  let Y = y;
  let M = m;
  if (m <= 2) {
    Y = y - 1;
    M = m + 12;
  }

  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 25);
  // Gregorian reform: valid for dates >= 1582-10-15 (Horizons output is mixed-calendar aware)
  const JD =
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    d +
    B -
    1524.5;

  return JD;
}

/**
 * Mean obliquity of the ecliptic (IAU 2006, arcseconds polynomial).
 * Input: JD(TT). Accuracy: ~0.1″ over several centuries.
 */
export function meanObliquityDeg(jdTT: number): number {
  const T = (jdTT - 2451545.0) / 36525.0; // Julian centuries TT from J2000.0
  const epsArcsec =
    84381.406 -
    46.836769 * T -
    0.0001831 * T * T +
    0.00200340 * T * T * T -
    5.76e-7 * T * T * T * T -
    4.34e-8 * T * T * T * T * T;
  return epsArcsec / 3600.0;
}

/**
 * Convert apparent RA/Dec (deg; equator/equinox of date) to ecliptic-of-date lon/lat (deg).
 * - raDeg, decDeg: apparent RA/Dec in **degrees** from Horizons (use the a-app pair).
 * - jdTT: Julian Day (TT). You can approximate jdTT ≈ jdUTC + ΔT/86400.
 * - opts.epsDeg: if provided, uses this obliquity (deg). Otherwise uses mean obliquity of date.
 *
 * Returns: { lon: [0,360), lat: [-90,90] } in **degrees**.
 */
export function raDecToEclipticOfDate(
  raDeg: number,
  decDeg: number,
  jdTT: number,
  opts: { epsDeg?: number } = {}
): { lon: number; lat: number } {
  const eps = (opts.epsDeg ?? meanObliquityDeg(jdTT)) * D2R;

  const α = raDeg * D2R;
  const δ = decDeg * D2R;

  // Equatorial unit vector
  const xeq = Math.cos(δ) * Math.cos(α);
  const yeq = Math.cos(δ) * Math.sin(α);
  const zeq = Math.sin(δ);

  // Rotate +ε about x-axis: equatorial -> ecliptic-of-date
  const xecl = xeq;
  const yecl = Math.cos(eps) * yeq + Math.sin(eps) * zeq;
  const zecl = -Math.sin(eps) * yeq + Math.cos(eps) * zeq;

  let lon = Math.atan2(yecl, xecl) * R2D;
  if (lon < 0) lon += 360;
  const lat = Math.asin(zecl) * R2D;

  return { lon: norm360(lon), lat };
}

/** Convenience: jdTT from jdUTC and ΔT (seconds). */
export function jdTTfromUTC(jdUtc: number, deltaT_sec: number): number {
  return jdUtc + deltaT_sec / 86400.0;
}
