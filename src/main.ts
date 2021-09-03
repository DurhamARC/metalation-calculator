interface Metal {
  name: string;
  symbol: string;
  affinity: number;
  buffered_metal_concentration: number;
  id_suffix: string;
}

class MetalFactory {
  static create(name:string, symbol:string, affinity:number, concentration:number) {
    var metal: Metal = {
      name: name,
      symbol: symbol,
      affinity: affinity,
      buffered_metal_concentration: concentration,
      id_suffix: symbol.toLowerCase()
    };
    return metal;
  }
}

const metals = [
  MetalFactory.create("Magnesium", "Mg", 1E3, 2.7E-3),
  MetalFactory.create("Manganese", "Mn", 1E3, 2.6E-6),
  MetalFactory.create("Iron", "Fe", 1E-6, 4.8E-8),
  MetalFactory.create("Cobalt", "Co", 3E-11, 2.5E-9),
  MetalFactory.create("Nickel", "Ni", 9.8E-10, 1.8E-13),
  MetalFactory.create("Copper", "Cu", 2.4E-16, 1.2E-18),
  MetalFactory.create("Zinc", "Zn", 1.9E-13, 1.19E-12),
]

function appendMetalTableRow(metal: Metal, table: HTMLTableElement) {
  const row: HTMLTableRowElement = table.insertRow(table.rows.length-1);

  row.insertCell(-1).outerHTML = "<th>" + metal.symbol + "</th>";

  const affinity_cell: HTMLTableCellElement = row.insertCell(-1);
  affinity_cell.classList.add('affinity');
  affinity_cell.innerHTML = '<input type="number" class="affinity" id="affinity_' + metal.id_suffix + '" value="'
    + metal.affinity + '"/>';

  const bmc_cell: HTMLTableCellElement = row.insertCell(-1);
  bmc_cell.classList.add('bmc');
  bmc_cell.innerHTML = '<input type="number" class="bmc" id="bmc_' + metal.id_suffix + '" value="'
    + metal.buffered_metal_concentration + '"/>';

  const result_cell: HTMLTableCellElement = row.insertCell(-1);
  result_cell.id = "result_" + metal.id_suffix;
}

function calculate() {
  for (var m of metals) {
    const affinity = (<HTMLInputElement>document.getElementById("affinity_" + m.id_suffix)).value;
    m.affinity = parseFloat(affinity); // TODO: validation!
    const bmc = (<HTMLInputElement>document.getElementById("bmc_" + m.id_suffix)).value;
    m.buffered_metal_concentration = parseFloat(bmc); // TODO: validation!
    const result_cell = <HTMLTableCellElement>document.getElementById("result_" + m.symbol.toLowerCase());
    // TODO: replace with real calculation!
    result_cell.innerHTML = (m.affinity + m.buffered_metal_concentration).toString();
  }
}

window.addEventListener('DOMContentLoaded', (event) => {
  const metal_table = <HTMLTableElement>document.getElementById('metalation_table');
  for (var m of metals) {
    appendMetalTableRow(m, metal_table);
  }

  document.getElementById('calculate_btn').onclick = function() {
    calculate();
  };
});
