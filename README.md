# @meksiabdou/pray-times

>

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## System Require

- Windows - Linux - MacOs
- NodeJs [Download](https://nodejs.org/en/download/)
- Npm
- Typescript

## Install

```bash
$ npm install https://github.com/meksiabdou/pray-times
```

or

```bash
$ yarn add https://github.com/meksiabdou/pray-times
```

## Usage

```js
import PrayTimes from "@meksiabdou/pray-times/dist";
```

### Parameters

| Name | Type | Default Value |
|:------:|:------:|:---------------:|
| localisation | {lat : number, long: number} | {lat : 0, long: 0} |
| config | {method : string, madhab: string, date: {day: number; month: number; year: number}} | {method : "MWL", madhab: "chafiism", date: {day: 10; month: 3; year: 2022}} |


### Example

```ts
import PrayTimes, { Config, Localisation } from "@meksiabdou/pray-times/dist";

const geolocalisation:Localisation  =  { lat: 35.2, long: 0.641389 };
const config:Config  =  { method: "MWL", madhab: "chafiism"};

const prayTime = new PrayTimes(geolocalisation, config);

console.log(prayTime.getTimes())

```

## License

MIT © [meksiabdou](https://github.com/meksiabdou)
