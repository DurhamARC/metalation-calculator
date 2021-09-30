import * as metals from "./metals"

function createMetalNumberInput(prefix : string, metal : metals.Metal, metalPropertyName: string, additionalOnChange: (id: string) => void) {
  const div = <HTMLDivElement>document.createElement('div');
  const input = <HTMLInputElement>document.createElement('input');
  const msg_p = <HTMLParagraphElement>document.createElement('p');
  msg_p.classList.add('error_msg')
  input.value = metal.buffered_metal_concentration.toString();
  input.classList.add(prefix);
  input.id = prefix + '_' + metal.id_suffix;
  input.type = 'number';
  input.addEventListener('change', function(event) {
    const val = (<HTMLInputElement>event.target).value;
    try {
      msg_p.textContent = '';
      var floatVal = parseFloat(val);
      const m = metals.all_metals[metal.id_suffix];
      Object.assign(m, { [metalPropertyName]: floatVal });
      if (additionalOnChange) additionalOnChange(metal.id_suffix);
    } catch (e) {
      var msg;
      if (e instanceof RangeError) {
        msg = e.message;
      } else {
        msg = 'Invalid value ' + input.value;
      }
      msg_p.textContent = msg;
    }
  });
  div.append(input);
  div.append(msg_p);
  return div;
}

function appendMetalTableRow(metal: metals.Metal, table: HTMLTableElement) {
  const row: HTMLTableRowElement = table.insertRow(table.rows.length-1);

  row.insertCell(-1).outerHTML = "<th>" + metal.symbol + "</th>";

  const affinity_cell: HTMLTableCellElement = row.insertCell(-1);
  affinity_cell.classList.add('affinity');
  const affinity_input = createMetalNumberInput('affinity', metal, 'affinity', function(id) {
    const m = metals.all_metals[id];
    (<HTMLTableCellElement>document.getElementById("metalation_delta_g_" + id)).innerText = m.metalation_delta_G.toFixed(1).toString();
  });
  affinity_cell.appendChild(affinity_input);

  const m_delta_g_cell: HTMLTableCellElement = row.insertCell(-1);
  m_delta_g_cell.id = "metalation_delta_g_" + metal.id_suffix;
  m_delta_g_cell.innerText = metal.metalation_delta_G.toFixed(1).toString();

  const bmc_cell: HTMLTableCellElement = row.insertCell(-1);
  bmc_cell.classList.add('bmc');
  const bmc_input = createMetalNumberInput('bmc', metal, 'buffered_metal_concentration', function(id) {
    const m = metals.all_metals[id];
    (<HTMLInputElement>document.getElementById("ia_delta_g_" + id)).value = m.intracellular_available_delta_G.toString();
  })

  bmc_cell.appendChild(bmc_input);

  const ia_delta_g_cell: HTMLTableCellElement = row.insertCell(-1);
  const ia_delta_g_input = createMetalNumberInput('ia_delta_g', metal, 'intracellular_available_delta_G', null);
  ia_delta_g_cell.appendChild(ia_delta_g_input);

  const result_cell: HTMLTableCellElement = row.insertCell(-1);
  result_cell.id = "result_" + metal.id_suffix;
}

function calculate() {
  const results = metals.calculateOccupancy();

  for (var id in metals.all_metals) {
    const r = results[id];
    const result_cell = <HTMLTableCellElement>document.getElementById("result_" + id);
    result_cell.innerHTML = (r * 100).toFixed(2).toString() + '%';
  }

  const total_cell = <HTMLTableCellElement>document.getElementById("total_metalation");
  total_cell.innerHTML = (results['total'] * 100).toFixed(2).toString() + '%';
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
  for (var id in metals.all_metals) {
    const m = metals.all_metals[id];
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
