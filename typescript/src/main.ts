import * as metals from "./metals";

let metalDataSet = new metals.MetalDataSet();

function createMetalNumberInput(
  prefix: string,
  metal: metals.Metal,
  metalPropertyName: keyof metals.Metal,
  additionalOnChange: (id: string) => void
) {
  const div = <HTMLDivElement>document.createElement("div");
  const input = <HTMLInputElement>document.createElement("input");
  const msgP = <HTMLParagraphElement>document.createElement("p");
  msgP.classList.add("error-msg");
  input.value = metal.getProperty(metalPropertyName).toString();
  input.classList.add(prefix);
  input.id = prefix + "_" + metal.idSuffix;
  input.type = "number";
  input.addEventListener("change", function (event) {
    const val = (<HTMLInputElement>event.target).value;
    try {
      msgP.textContent = "";
      const floatVal = parseFloat(val);
      const m = metalDataSet.metals[metal.idSuffix];
      Object.assign(m, { [metalPropertyName]: floatVal });
      if (additionalOnChange) additionalOnChange(metal.idSuffix);
      calculate();
    } catch (e) {
      let msg;
      if (e instanceof RangeError) {
        msg = e.message;
      } else {
        msg = "Invalid value " + input.value;
      }
      msgP.textContent = msg;
      clearCalculation();
    }
  });
  div.append(input);
  div.append(msgP);
  return div;
}
function appendMetalTableRow(metal: metals.Metal, table: HTMLTableElement) {
  const row: HTMLTableRowElement = table
    .getElementsByTagName("tbody")[0]
    .insertRow();

  row.insertCell(-1).outerHTML = "<th>" + metal.symbol + "</th>";

  const affinityCell: HTMLTableCellElement = row.insertCell(-1);
  affinityCell.classList.add("affinity", "grouped");
  const affinityInput = createMetalNumberInput(
    "affinity",
    metal,
    "affinity",
    function (id) {
      const m = metalDataSet.metals[id];
      (<HTMLTableCellElement>(
        document.getElementById("metalation_delta_g_" + id)
      )).innerText = m.metalationDeltaG.toFixed(1).toString();
    }
  );
  affinityCell.appendChild(affinityInput);

  const mDeltaGCell: HTMLTableCellElement = row.insertCell(-1);
  mDeltaGCell.classList.add("grouped", "right-spacing");
  mDeltaGCell.id = "metalation_delta_g_" + metal.idSuffix;
  mDeltaGCell.innerText = metal.metalationDeltaG.toFixed(1).toString();

  const bmcCell: HTMLTableCellElement = row.insertCell(-1);
  bmcCell.classList.add("bmc", "grouped");
  const bmcInput = createMetalNumberInput(
    "bmc",
    metal,
    "bufferedMetalConcentration",
    function (id) {
      const m = metalDataSet.metals[id];
      (<HTMLInputElement>(
        document.getElementById("ia_delta_g_" + id)
      )).innerText = m.intracellularAvailableDeltaG.toFixed(1).toString();
    }
  );

  bmcCell.appendChild(bmcInput);

  const iaDeltaGCell: HTMLTableCellElement = row.insertCell(-1);
  iaDeltaGCell.classList.add("grouped");
  iaDeltaGCell.id = "ia_delta_g_" + metal.idSuffix;
  iaDeltaGCell.innerText = metal.intracellularAvailableDeltaG
    .toFixed(1)
    .toString();

  const resultCell: HTMLTableCellElement = row.insertCell(-1);
  resultCell.classList.add("result");
  resultCell.id = "result_" + metal.idSuffix;
}

function calculate() {
  const results = metalDataSet.calculateOccupancy();

  for (const id in metalDataSet.metals) {
    const r = results[id];
    const resultCell = <HTMLTableCellElement>(
      document.getElementById("result_" + id)
    );
    resultCell.innerHTML = (r * 100).toFixed(2).toString() + "%";
  }

  const totalCell = <HTMLTableCellElement>(
    document.getElementById("total-metalation")
  );
  totalCell.innerHTML = (results["total"] * 100).toFixed(2).toString() + "%";

  (<HTMLButtonElement>document.getElementById("download_btn")).disabled = false;
}

function clearCalculation() {
  Array.from(document.getElementsByClassName("result")).forEach((cell) => {
    cell.innerHTML = "N/A";
  });
  (<HTMLButtonElement>document.getElementById("download_btn")).disabled = true;
}

function reset() {
  metalDataSet = new metals.MetalDataSet();
  for (const id in metalDataSet.metals) {
    const m = metalDataSet.metals[id];
    (<HTMLInputElement>document.getElementById("affinity_" + id)).value =
      m.affinity.toString();
    (<HTMLTableCellElement>(
      document.getElementById("metalation_delta_g_" + id)
    )).innerText = m.metalationDeltaG.toFixed(1).toString();
    (<HTMLInputElement>document.getElementById("bmc_" + id)).value =
      m.bufferedMetalConcentration.toString();
    (<HTMLTableCellElement>(
      document.getElementById("ia_delta_g_" + id)
    )).innerText = m.intracellularAvailableDeltaG.toFixed(1).toString();
  }
  calculate();
}

// Quick and simple export target #tableId into a csv
function downloadTableAsCsv(tableId: string, separator = ",") {
  // Select rows from tableId
  const rows = document.querySelectorAll("table#" + tableId + " tr");
  // Construct csv
  const csv = [];
  for (let i = 0; i < rows.length; i++) {
    const row = [];
    const cols = <NodeListOf<HTMLTableCellElement>>(
      rows[i].querySelectorAll("td, th")
    );
    for (let j = 0; j < cols.length; j++) {
      // Clean innertext to remove multiple spaces and jumpline (break csv)
      let data;
      const inputs = cols[j].getElementsByTagName("input");
      if (inputs.length > 0) {
        data = inputs[0].value;
      } else {
        data = cols[j].innerText;
      }
      // Remove line breaks and escape double-quote with double-double-quote
      data = data.replace(/(\r\n|\n|\r)/gm, "").replace(/(\s\s)/gm, " ");
      data = data.replace(/"/g, '""');
      // Push escaped string
      row.push('"' + data + '"');
    }
    csv.push(row.join(separator));
  }
  const csvString = csv.join("\n");
  // Download it
  const filename =
    "export_" + tableId + "_" + new Date().toLocaleDateString() + ".csv";
  const link = document.createElement("a");
  link.style.display = "none";
  link.setAttribute("target", "_blank");
  link.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvString)
  );
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.addEventListener("DOMContentLoaded", () => {
  const metalTable = <HTMLTableElement>(
    document.getElementById("metalation-table")
  );
  for (const id in metalDataSet.metals) {
    const m = metalDataSet.metals[id];
    appendMetalTableRow(m, metalTable);
  }

  document.getElementById("download_btn").onclick = function () {
    downloadTableAsCsv("metalation-table");
  };

  document.getElementById("reset_btn").onclick = function () {
    reset();
  };

  calculate();
});
