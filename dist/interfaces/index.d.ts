export interface Localisation {
    long: number;
    lat: number;
}
export interface DateNow {
    day: number;
    month: number;
    year: number;
}
export declare type Radians = number;
export declare type Degrees = number;
export interface Config {
    method?: "MWL" | "ISNA" | "Egypt" | "Makkah" | "Karachi" | "Tehran" | "Jafari";
    madhab?: "hanafi" | "chafiism";
    date?: DateNow;
    timeZone?: number;
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
export declare type Time = "imsak" | "fajr" | "sunrise" | "dhuhr" | "asr" | "sunset" | "maghrib" | "isha" | "midnight";
export declare type Direction = "ccw" | undefined;
//# sourceMappingURL=index.d.ts.map