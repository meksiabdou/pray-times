"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PrayTimes {
    constructor(localisation, config) {
        var _a, _b, _c, _d, _e;
        this.localisation = {
            long: 0,
            lat: 0,
        };
        this.dateNow = new Date();
        this.day = this.dateNow.getDate();
        this.month = this.dateNow.getMonth() + 1;
        this.year = this.dateNow.getFullYear();
        this.alpha = undefined;
        this.declination = undefined;
        this.noon = undefined;
        this.utNoon = undefined;
        this.localNoon = undefined;
        this.methods = {
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
        this.factors = {
            chafiism: 1,
            hanafi: 2,
        };
        this.config = {
            madhab: "chafiism",
            timeZone: 1,
            method: this.methods["MWL"],
        };
        this.getTimes = () => {
            try {
                const sunset = this.sunSet();
                const sunrise = this.sunRise();
                const fajr = this.fajrTime();
                return {
                    times: {
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
                    method: this.config.method.name,
                    timeFormat: "24H",
                };
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.midnight = (sunset, sunrise, fajr) => {
            if (this.config.method.params.midnight === "Jafari") {
                return sunset + this.fix(fajr - sunset, 24) / 2;
            }
            return sunset + this.fix(sunrise - sunset, 24) / 2;
        };
        this.adjustTimes = (time) => {
            if (time >= 24) {
                return "00";
            }
            return time;
        };
        this.julian = () => {
            if (this.month <= 2) {
                this.month = this.month + 12;
                this.year = this.year - 1;
            }
            const A = 367 * this.year;
            const B = Math.floor((7 / 4) * (this.year + Math.floor((this.month + 9) / 12)));
            const C = Math.floor(275 * (this.month / 9));
            const D = this.day - 730531.5;
            return A - B + C + D;
        };
        this.sunPosition = () => {
            try {
                const D = this.julian();
                const M = this.fixAngle(357.528 + 0.9856003 * D);
                const L = this.fixAngle(280.466 + 0.9856474 * D);
                const Lambda = this.fixAngle(L + 1.915 * this.sin(M) + 0.02 * this.sin(2 * M));
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
                this.localNoon = this.utNoon / 15 + this.config.timeZone;
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.numbreToTime = (n) => {
            const hours = Math.trunc(n);
            const minutes = Math.ceil((n - hours) * 60);
            return `${hours < 10 ? "0" + hours : this.adjustTimes(hours)}:${minutes < 10 ? "0" + minutes : minutes}`;
        };
        this.dhuhrTime = () => {
            try {
                return this.localNoon;
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.asrAlt = () => {
            try {
                return this.arctan(this.factors[this.config.madhab] +
                    this.tan(this.localisation.lat - this.declination));
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.asrTime = () => {
            try {
                const asrAlt = this.asrAlt();
                return this.sunAngleTime(this.localNoon, 90 - asrAlt);
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.arcCalc = (angle = -0.8333) => {
            try {
                return this.arccos((this.sin(angle) -
                    this.sin(this.declination) *
                        this.sin(this.localisation.lat)) /
                    (this.cos(this.declination) *
                        this.cos(this.localisation.lat)));
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.sunAngleTime = (time, angle, direction) => {
            try {
                return time + (direction === "ccw" ? -1 : 1) * (this.arcCalc(angle) / 15);
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.sunRise = () => {
            try {
                return this.sunAngleTime(this.localNoon, undefined, "ccw");
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.sunSet = () => {
            try {
                return this.sunAngleTime(this.localNoon, this.config.method.params.maghrib || undefined);
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.maghribTime = () => {
            return this.sunSet();
        };
        this.ishaTime = () => {
            try {
                if (typeof this.config.method.params.isha === "string") {
                    return (this.maghribTime() +
                        Number(this.config.method.params.isha.replace(/\D/g, "")) / 60);
                }
                return this.sunAngleTime(this.localNoon, -this.config.method.params.isha);
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.imsakTime = () => {
            try {
                return this.sunAngleTime(this.localNoon - 10 / 60, -this.config.method.params.fajr, "ccw");
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.fajrTime = () => {
            try {
                return this.sunAngleTime(this.localNoon, -this.config.method.params.fajr, "ccw");
            }
            catch (error) {
                throw new Error(error);
            }
        };
        this.degreesToRadians = (d) => {
            return (d * Math.PI) / 180.0; // Radians
        };
        this.radiansToDegrees = (r) => {
            return (r * 180.0) / Math.PI; //Degrees
        };
        this.sin = (d) => {
            return Math.sin(this.degreesToRadians(d));
        };
        this.cos = (d) => {
            return Math.cos(this.degreesToRadians(d));
        };
        this.tan = (d) => {
            return Math.tan(this.degreesToRadians(d));
        };
        this.arcsin = (d) => {
            return this.radiansToDegrees(Math.asin(d));
        };
        this.arccos = (d) => {
            return this.radiansToDegrees(Math.acos(d));
        };
        this.arctan = (d) => {
            return this.radiansToDegrees(Math.atan(d));
        };
        this.arccot = (x) => {
            return this.radiansToDegrees(Math.atan(1 / x));
        };
        this.fixAngle = (a) => {
            return this.fix(a, 360);
        };
        this.fix = (a, b) => {
            a = a - b * Math.floor(a / b);
            return a < 0 ? a + b : a;
        };
        if (localisation) {
            this.localisation = localisation;
        }
        if (config && ((_a = config.date) === null || _a === void 0 ? void 0 : _a.day)) {
            this.day = (_b = config.date) === null || _b === void 0 ? void 0 : _b.day;
        }
        if (config && ((_c = config.date) === null || _c === void 0 ? void 0 : _c.month)) {
            this.month = config.date.month;
        }
        if (config && ((_d = config.date) === null || _d === void 0 ? void 0 : _d.year)) {
            this.year = config.date.year;
        }
        if ((config === null || config === void 0 ? void 0 : config.madhab) &&
            ["hanafi", "chafiism"].includes((_e = config === null || config === void 0 ? void 0 : config.madhab) === null || _e === void 0 ? void 0 : _e.toLowerCase())) {
            this.config.madhab = config === null || config === void 0 ? void 0 : config.madhab.toLowerCase();
        }
        if (config === null || config === void 0 ? void 0 : config.timeZone) {
            this.config.timeZone = config.timeZone;
        }
        if ((config === null || config === void 0 ? void 0 : config.method) && this.methods[config === null || config === void 0 ? void 0 : config.method]) {
            this.config.method = this.methods[config === null || config === void 0 ? void 0 : config.method];
        }
        this.sunPosition();
    }
}
exports.default = PrayTimes;
//# sourceMappingURL=prayTimes.js.map