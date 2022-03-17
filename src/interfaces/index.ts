export interface Localisation {
  long: number;
  lat: number;
}

export interface DateNow {
  day: number;
  month: number;
  year: number;
}

export type Radians = number;

export type Degrees = number;

export interface Config {
  method?:
    | "MWL"
    | "ISNA"
    | "Egypt"
    | "Makkah"
    | "Karachi"
    | "Tehran"
    | "Jafari";
  madhab?: "hanafi" | "chafiism";
  date?: DateNow;
  // timeZone?: number;
}

export interface Times {
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  midnight: string;
}

export type Time =
  | "imsak"
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "sunset"
  | "maghrib"
  | "isha"
  | "midnight";

export type Direction = "ccw" | undefined;
