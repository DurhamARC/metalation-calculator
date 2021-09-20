export class Metal {
  name: string;
  symbol: string;
  affinity: number;
  metalation_delta_G: number;
  buffered_metal_concentration: number;
  intracellular_available_delta_G: number;
  id_suffix: string;

  constructor(name:string, symbol:string, affinity:number, concentration:number) {
    this.name = name;
    this.symbol = symbol;
    this.affinity = affinity;
    this.metalation_delta_G = this.calculateDeltaG(affinity);
    this.buffered_metal_concentration = concentration;
    this.intracellular_available_delta_G = this.calculateDeltaG(concentration);
    this.id_suffix = symbol.toLowerCase();
  }

  calculateDeltaG(mole_value: number): number {
    return 8.314 * 298.15 * Math.log(mole_value) / 1000;
  }
}

const metal_vals: Array<[string, string, number, number]> = [
  ["Magnesium", "Mg", 1E3, 2.7E-3],
  ["Manganese", "Mn", 1E3, 2.6E-6],
  ["Iron", "Fe", 1E-6, 4.8E-8],
  ["Cobalt", "Co", 3E-11, 2.5E-9],
  ["Nickel", "Ni", 9.8E-10, 1.8E-13],
  ["Copper", "Cu", 2.4E-16, 1.2E-18],
  ["Zinc", "Zn", 1.9E-13, 1.19E-12],
]

export const all_metals: { [id: string]: Metal; } = {};

for (var m of metal_vals) {
  all_metals[m[1].toLowerCase()] = new Metal(...m);
}

export function calculateOccupancy() {
  var exp_scaled_differences: { [id: string]: number; } = {};
  var total_diffs: number = 0;
  for (var id in all_metals) {
    const m = all_metals[id];
    exp_scaled_differences[id] = Math.exp(
      1000 * (m.intracellular_available_delta_G - m.metalation_delta_G)
      / (8.314 * 298.15)
    );
    total_diffs += exp_scaled_differences[id];
  }

  var occupancies: { [id: string]: number; } = {};
  var total_occupancy: number = 0;

  for (var id in all_metals) {
    occupancies[id] = exp_scaled_differences[id] / (1 + total_diffs);
    total_occupancy += occupancies[id];
  }
  occupancies['total'] = total_occupancy;

  return occupancies;
}
