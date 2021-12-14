/**
 * An object to store values for a single metal and calculate delta G values
 */
export class Metal {
  name: string;
  symbol: string;
  _affinity: number;
  _defaultAffinity: number;
  _metalationDeltaG: number;
  _bufferedMetalConcentration: number;
  _defaultMetalConcentration: number;
  _intracellularAvailableDeltaG: number;
  idSuffix: string;
  validator: typeof Proxy;

  constructor(
    name: string,
    symbol: string,
    affinity: number,
    concentration: number
  ) {
    this.name = name;
    this.symbol = symbol;
    this.affinity = affinity;
    this.bufferedMetalConcentration = concentration;
    this.idSuffix = symbol.toLowerCase();
    this._defaultAffinity = affinity;
    this._defaultMetalConcentration = concentration;
  }

  calculateDeltaG(moleValue: number): number {
    return (8.314 * 298.15 * Math.log(moleValue)) / 1000;
  }

  checkRange(val: number, fieldName: string) {
    if (isNaN(val)) throw new RangeError(fieldName + " must be set");
    if (val < 1e-30 || val > 1000) {
      throw new RangeError(fieldName + " must be between 1e-30 and 1000");
    }
  }

  get affinity(): number {
    return this._affinity;
  }

  set affinity(val: number) {
    this.checkRange(val, "Affinity");
    this._affinity = val;
    this._metalationDeltaG = this.calculateDeltaG(this._affinity);
  }

  get metalationDeltaG(): number {
    return this._metalationDeltaG;
  }

  get bufferedMetalConcentration(): number {
    return this._bufferedMetalConcentration;
  }

  set bufferedMetalConcentration(val: number) {
    this.checkRange(val, "Buffered metal concentration");
    this._bufferedMetalConcentration = val;
    this._intracellularAvailableDeltaG = this.calculateDeltaG(
      this._bufferedMetalConcentration
    );
  }

  get intracellularAvailableDeltaG(): number {
    return this._intracellularAvailableDeltaG;
  }

  set intracellularAvailableDeltaG(val: number) {
    if (val <= 0)
      throw new RangeError("Intracellular available ∆G must be > 0");
    this._intracellularAvailableDeltaG = val;
  }

  getProperty(key: keyof Metal) {
    return this[key];
  }

  switchOffMetal() {
    this.affinity = 1000;
    this.bufferedMetalConcentration = this._defaultMetalConcentration;
  }

  resetValues() {
    this.affinity = this._defaultAffinity;
    this.bufferedMetalConcentration = this._defaultMetalConcentration;
  }
}

const METAL_VALS: Array<[string, string, number, number]> = [
  ["Magnesium", "Mg", 1e3, 2.7e-3],
  ["Manganese", "Mn", 1e3, 2.6e-6],
  ["Iron", "Fe", 1e-6, 4.8e-8],
  ["Cobalt", "Co", 3e-11, 2.5e-9],
  ["Nickel", "Ni", 9.8e-10, 1.8e-13],
  ["Copper", "Cu", 2.4e-16, 1.2e-18],
  ["Zinc", "Zn", 1.9e-13, 1.19e-12],
];

export class MetalDataSet {
  metals: { [id: string]: Metal };

  constructor() {
    this.metals = {};
    for (const m of METAL_VALS) {
      this.metals[m[1].toLowerCase()] = new Metal(...m);
    }
  }

  calculateOccupancy(): { [id: string]: number } {
    const expScaledDifferences: { [id: string]: number } = {};
    let totalDiffs = 0;
    for (const id in this.metals) {
      const m = this.metals[id];
      expScaledDifferences[id] = Math.exp(
        (1000 * (m.intracellularAvailableDeltaG - m.metalationDeltaG)) /
          (8.314 * 298.15)
      );
      totalDiffs += expScaledDifferences[id];
    }

    const occupancies: { [id: string]: number } = {};
    let totalOccupancy = 0;

    for (const id in this.metals) {
      occupancies[id] = expScaledDifferences[id] / (1 + totalDiffs);
      totalOccupancy += occupancies[id];
    }
    occupancies["total"] = totalOccupancy;

    return occupancies;
  }
}
