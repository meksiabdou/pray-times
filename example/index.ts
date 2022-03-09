import PrayTimes, {Localisation, Config, Times} from "../dist";

const geolocalisation: Localisation = { lat: 35.2, long: -0.641389 };
const config: Config = { method: "MWL", madhab: "chafiism", timeZone: 1 };
const prayTimes = new PrayTimes(geolocalisation, config);
const times: Times = prayTimes.getTimes().times;


console.log(times);
