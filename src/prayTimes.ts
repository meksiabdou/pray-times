import {
  Config,
  Degrees,
  Localisation,
  Radians,
  Direction,
} from "./interfaces";

class PrayTimes {
  private localisation: Localisation = {
    long: 0,
    lat: 0,
  };
  private dateNow: Date = new Date();
  private day: number = this.dateNow.getDate();
  private month: number = this.dateNow.getMonth() + 1;
  private year: number = this.dateNow.getFullYear();
  private alpha?: number = undefined;
  private declination?: number = undefined;
  private noon?: number = undefined;
  private utNoon?: number = undefined;
  private localNoon?: number = undefined;
  private methods = {
    MWL: {
      name: "Muslim World League",
      params: { fajr: 18, isha: 17 },
    },
    ISNA: {
      name: "Islamic Society of North America (ISNA)",
      params: { fajr: 15, isha: 15 },
    },
    Egypt: {
      name: "Egyptian General Authority of Survey",
      params: { fajr: 19.5, isha: 17.5 },
    },
    Makkah: {
      name: "Umm Al-Qura University, Makkah",
      params: { fajr: 18.5, isha: "90 min" },
    },
    Karachi: {
      name: "University of Islamic Sciences, Karachi",
      params: { fajr: 18, isha: 18 },
    },
    Tehran: {
      name: "Institute of Geophysics, University of Tehran",
      params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: "Jafari" },
    },
    Jafari: {
      name: "Shia Ithna-Ashari, Leva Institute, Qum",
      params: { fajr: 16, isha: 14, maghrib: 4, midnight: "Jafari" },
    },
  };

  private factors = {
    chafiism: 1,
    hanafi: 2,
  } as any;

  private config = {
    madhab: "chafiism",
    timeZone: 1,
    method: this.methods["MWL"],
  } as {
    madhab?: string;
    timeZone?: number;
    method: {
      name: string;
      params: { fajr: any; isha: any; maghrib: any; midnight: any };
    };
  };

  constructor(localisation: Localisation, config?: Config) {
    if (localisation) {
      this.localisation = localisation;
    }

    if (config && config.date?.day) {
      this.day = config.date?.day;
    }

    if (config && config.date?.month) {
      this.month = config.date.month;
    }

    if (config && config.date?.year) {
      this.year = config.date.year;
    }

    if (
      config?.madhab &&
      ["hanafi", "chafiism"].includes(config?.madhab?.toLowerCase())
    ) {
      (this.config as any).madhab = config?.madhab.toLowerCase();
    }

    if (config?.timeZone) {
      this.config.timeZone = config.timeZone;
    }

    if (config?.method && this.methods[config?.method]) {
      this.config.method = this.methods[config?.method] as any;
    }

    this.sunPosition();
  }

  getTimes = () => {
    try {
      const sunset = this.sunSet();
      const sunrise = this.sunRise();
      const fajr = this.fajrTime();
      return {
        times : {
          imsak: this.numbreToTime(this.imsakTime()),
          fajr: this.numbreToTime(fajr),
          sunrise: this.numbreToTime(sunrise),
          dhuhr: this.numbreToTime(this.dhuhrTime()),
          asr: this.numbreToTime(this.asrTime()),
          sunset: this.numbreToTime(sunset),
          maghrib: this.numbreToTime(this.maghribTime()),
          isha: this.numbreToTime(this.ishaTime()),
          midnight: this.numbreToTime(this.midnight(sunset, sunrise, fajr)),
        },
        method: this.config.method.name
      };
    } catch (error: any) {
      throw new Error(error);
    }
  };

  private midnight = (sunset: number, sunrise: number, fajr: number) => {
    if (this.config.method.params.midnight === "Jafari") {
      return sunset + this.fix(sunset - fajr, 24) / 2;
    }
    return sunset + (sunset - sunrise) / 2;
  };

  private julian = (): number => {
    if (this.month <= 2) {
      this.month = this.month + 12;
      this.year = this.year - 1;
    }

    const A = 367 * this.year;
    const B = Math.floor(
      (7 / 4) * (this.year + Math.floor((this.month + 9) / 12))
    );
    const C = Math.floor(275 * (this.month / 9));
    const D = this.day - 730531.5;
    return A - B + C + D;
  };

  private sunPosition = () => {
    try {
      const D = this.julian();
      const M = this.fixAngle(357.528 + 0.9856003 * D);
      const L = this.fixAngle(280.466 + 0.9856474 * D);
      const Lambda = this.fixAngle(
        L + 1.915 * this.sin(M) + 0.02 * this.sin(2 * M)
      );
      const obliquity = 23.44 - 0.0000004 * D;
      const starTime = 100.46 + 0.985647352 * D;
      const alpha = this.arctan(this.cos(obliquity) * this.tan(Lambda));
      const declination = this.arcsin(this.sin(obliquity) * this.sin(Lambda));
      this.alpha = this.fixAngle(alpha);
      this.alpha =
        this.alpha +
        90 * (Math.trunc(this.alpha / 90) - Math.trunc(this.alpha / 90));
      this.declination = declination;
      this.noon = this.fixAngle(this.alpha - starTime);
      this.utNoon = this.noon - this.localisation.long;
      this.localNoon = this.utNoon / 15 + (this.config.timeZone as number);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  protected numbreToTime = (n: number) => {
    const hours = Math.trunc(n);
    const minutes = Math.ceil((n - hours) * 60);
    return `${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }`;
  };

  private dhuhrTime = () => {
    try {
      return this.localNoon as number;
    } catch (error: any) {
      throw new Error(error);
    }
  };

  private asrAlt = () => {
    try {
      return this.arctan(
        this.factors[this.config.madhab as any] +
          this.tan(this.localisation.lat - (this.declination as number))
      );
    } catch (error: any) {
      throw new Error(error);
    }
  };

  private asrTime = () => {
    try {
      const asrAlt = this.asrAlt();
      return this.sunAngleTime(this.localNoon as number, 90 - asrAlt);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  protected arcCalc = (angle: Degrees = -0.8333) => {
    try {
      return this.arccos(
        (this.sin(angle) -
          this.sin(this.declination as number) *
            this.sin(this.localisation.lat)) /
          (this.cos(this.declination as number) *
            this.cos(this.localisation.lat))
      );
    } catch (error: any) {
      throw new Error(error);
    }
  };

  protected sunAngleTime = (
    time: number,
    angle?: Degrees,
    direction?: Direction
  ) => {
    try {
      return time + (direction === "ccw" ? -1 : 1) * (this.arcCalc(angle) / 15);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  private sunRise = () => {
    try {
      return this.sunAngleTime(this.localNoon as number, undefined, "ccw");
    } catch (error: any) {
      throw new Error(error);
    }
  };

  private sunSet = () => {
    try {
      return this.sunAngleTime(
        this.localNoon as number,
        this.config.method.params.maghrib || undefined
      );
    } catch (error: any) {
      throw new Error(error);
    }
  };

  private maghribTime = () => {
    return this.sunSet();
  };

  private ishaTime = () => {
    try {
      if (typeof this.config.method.params.isha === "string") {
        return (
          this.maghribTime() +
          Number(this.config.method.params.isha.replace(/\D/g, "")) / 60
        );
      }
      return this.sunAngleTime(
        this.localNoon as number,
        -this.config.method.params.isha
      );
    } catch (error: any) {
      throw new Error(error);
    }
  };

  private imsakTime = () => {
    try {
      return this.sunAngleTime(
        (this.localNoon as number) - 10 / 60,
        -this.config.method.params.fajr,
        "ccw"
      );
    } catch (error: any) {
      throw new Error(error);
    }
  };

  private fajrTime = () => {
    try {
      return this.sunAngleTime(
        this.localNoon as number,
        -this.config.method.params.fajr,
        "ccw"
      );
    } catch (error: any) {
      throw new Error(error);
    }
  };

  protected degreesToRadians = (d: Degrees): Radians => {
    return (d * Math.PI) / 180.0; // Radians
  };

  protected radiansToDegrees = (r: Radians): Degrees => {
    return (r * 180.0) / Math.PI; //Degrees
  };

  protected sin = (d: Degrees): Radians => {
    return Math.sin(this.degreesToRadians(d));
  };

  protected cos = (d: Degrees): Radians => {
    return Math.cos(this.degreesToRadians(d));
  };

  protected tan = (d: Degrees): Radians => {
    return Math.tan(this.degreesToRadians(d));
  };

  protected arcsin = (d: Degrees): Degrees => {
    return this.radiansToDegrees(Math.asin(d));
  };

  protected arccos = (d: Degrees): Degrees => {
    return this.radiansToDegrees(Math.acos(d));
  };

  protected arctan = (d: Degrees): Degrees => {
    return this.radiansToDegrees(Math.atan(d));
  };

  protected arccot = (x: number): Degrees => {
    return this.radiansToDegrees(Math.atan(1 / x));
  };

  protected fixAngle = (a: Degrees): Degrees => {
    return this.fix(a, 360);
  };

  protected fix = (a: number, b: number) => {
    a = a - b * Math.floor(a / b);
    return a < 0 ? a + b : a;
  };
}

export default PrayTimes;
