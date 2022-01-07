import * as metals from "./metals";

const metalDataSet = new metals.MetalDataSet();

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

  const toggleButton = <HTMLInputElement>document.createElement("input");
  const label = <HTMLLabelElement>document.createElement("label");
  toggleButton.type = "checkbox";
  toggleButton.classList.add("toggle");
  toggleButton.id = "toggle_" + metal.idSuffix;
  label.htmlFor = "toggle_" + metal.idSuffix;
  const metalCell = <HTMLTableCellElement>document.createElement("th");

  toggleButton.addEventListener("change", function () {
    toggleMetal(this.checked, metal);
    calculate();
  });

  metalCell.appendChild(toggleButton);
  metalCell.appendChild(label);
  const metalID = <HTMLSpanElement>document.createElement("span");
  metalID.innerHTML = metal.symbol;
  metalID.classList.add("metal-symbol");
  metalCell.appendChild(metalID);
  row.appendChild(metalCell);

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
function toggleMetal(willTurnOff: boolean, metal: metals.Metal) {
  (
    document.getElementById("affinity_" + metal.idSuffix) as HTMLInputElement
  ).disabled = willTurnOff;
  (
    document.getElementById("bmc_" + metal.idSuffix) as HTMLInputElement
  ).disabled = willTurnOff;
  if (willTurnOff) {
    metal.switchOffMetal();
  } else {
    metal.resetValues();
  }
  updateRow(metal);
}

function updateRow(metal: metals.Metal) {
  const id = metal.idSuffix;
  (<HTMLInputElement>document.getElementById("affinity_" + id)).value =
    metal.affinity.toString();
  document.getElementById("metalation_delta_g_" + id).innerText =
    metal.metalationDeltaG.toFixed(1).toString();
  (<HTMLInputElement>document.getElementById("bmc_" + id)).value =
    metal.bufferedMetalConcentration.toString();
  document.getElementById("ia_delta_g_" + id).innerText =
    metal.intracellularAvailableDeltaG.toFixed(1).toString();
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

  (<HTMLButtonElement>document.getElementById("download-btn")).disabled = false;
}

function clearCalculation() {
  Array.from(document.getElementsByClassName("result")).forEach((cell) => {
    cell.innerHTML = "N/A";
  });
  (<HTMLButtonElement>document.getElementById("download-btn")).disabled = true;
}

function reset() {
  for (const id in metalDataSet.metals) {
    const m = metalDataSet.metals[id];
    (
      document.getElementById("toggle_" + m.idSuffix) as HTMLInputElement
    ).checked = false;
    m.resetValues();
    toggleMetal(false, m);
  }
  calculate();
}

function cleanData(data: string) {
  data = data.replace(/(\r\n|\n|\r)/gm, "").replace(/(\s\s)/gm, " ");
  data = data.replace(/"/g, '""');
  data = data.replace(/\u2206/g, "Delta ");
  return data;
}
function convertToPlainText(html: string) {
  // Create a new div element
  const tempDivElement = document.createElement("div");
  // Set the HTML content with the given value
  tempDivElement.innerHTML = html;
  // Retrieve the text property of the element
  return tempDivElement.textContent || tempDivElement.innerText || "";
}

// Quick and simple export target #tableId into a csv
function downloadTableAsCsv(tableId: string, separator = ",") {
  const table = <HTMLTableElement>document.getElementById(tableId);
  const rows = table.rows;
  // Construct csv
  const csv = [];
  for (let i = 0; i < rows.length; i++) {
    const row = [];
    const cols = rows[i].cells;
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
      data = cleanData(data);
      // Push escaped string
      row.push('"' + data + '"');
    }
    csv.push(row.join(separator));
  }
  const explanation = [];
  const headings = rows[0].cells;
  for (let k = 0; k < headings.length; k++) {
    const spans = headings[k].getElementsByTagName("span");
    if (spans.length > 0) {
      let span = spans[0].innerHTML;
      let header = headings[k].innerText;
      header = cleanData(header);
      span = cleanData(span);
      span = convertToPlainText(span);
      explanation.push('"# ' + header + " = " + span + '"');
    }
  }
  csv.push(explanation.join("\n"));

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

  document.getElementById("download-btn").onclick = function () {
    downloadTableAsCsv("metalation-table");
  };

  document.getElementById("reset-btn").onclick = function () {
    reset();
  };

  calculate();
});
