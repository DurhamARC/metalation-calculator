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

// Quick and simple export target #table_id into a csv
function downloadTableAsCsv(table_id: string, separator: string = ',') {
    // Select rows from table_id
    var rows = document.querySelectorAll('table#' + table_id + ' tr');
    // Construct csv
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = <NodeListOf<HTMLTableCellElement>>rows[i].querySelectorAll('td, th');
        for (var j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            var data;
            const inputs = cols[j].getElementsByTagName('input');
            if (inputs.length > 0) {
              data = inputs[0].value;
            } else {
              data = cols[j].innerText;
            }
            // Remove line breaks and escape double-quote with double-double-quote
            data = data.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ');
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    var csv_string = csv.join('\n');
    // Download it
    var filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.addEventListener('DOMContentLoaded', (event) => {
  const metal_table = <HTMLTableElement>document.getElementById('metalation_table');
  for (var m of metals) {
    appendMetalTableRow(m, metal_table);
  }

  document.getElementById('calculate_btn').onclick = function() {
    calculate();
    (<HTMLButtonElement>document.getElementById('download_btn')).disabled = false;
  };

  document.getElementById('download_btn').onclick = function() {
    downloadTableAsCsv('metalation_table');
  };
});
