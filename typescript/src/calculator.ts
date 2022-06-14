import * as metals from "./metals";

/**
Clean up text to display more reliably in CSVs
by removing newlines, quotes and delta symbols
and the delta symbol is replaced with the word "Delta"
as excel does not display unicode symbols correctly.
**/
function cleanData(data: string) {
  data = data.replace(/(\r\n|\n|\r)/gm, "").replace(/(\s\s)/gm, " ");
  data = data.replace(/"/g, '""');
  data = data.replace(/\u2206/g, "Delta ");
  return data;
}

/**
Convert an HTML string to plain text
This method was required to access the inner text within the tooltips as
the innerText method cannot access the header span's inner text due to their
visibility being hidden by default.
**/
function convertToPlainText(html: string) {
  // Create a new div element
  const tempDivElement = document.createElement("div");
  // Set the HTML content with the given value
  tempDivElement.innerHTML = html;
  // Retrieve the text property of the element
  return tempDivElement.textContent || tempDivElement.innerText || "";
}

/**
 * An object to create and manipulate a metalation calculator.
 * It should be created with an id for a div that contains the basic HTML layout from calculator.html
 */
export class MetalationCalculator {
  calculatorID: string;
  metalDataSet: metals.MetalDataSet;
  _calculatorDiv: HTMLDivElement;
  _calculatorTable: HTMLTableElement;
  _downloadButton: HTMLButtonElement;
  _resetButton: HTMLButtonElement;

  constructor(
    calculatorID: string,
    titleHtmlString: string,
    bmcVals: { [id: string]: number },
    imageDir: string
  ) {
    this.calculatorID = calculatorID;
    this.metalDataSet = new metals.MetalDataSet("");
    if (titleHtmlString) {
      try {
        this.metalDataSet.title = titleHtmlString;
      } catch {
        // Ignore error - title can be empty
      }
    }

    this._calculatorDiv = <HTMLDivElement>document.getElementById(calculatorID);
    this._calculatorTable =
      this._calculatorDiv.getElementsByTagName("table")[0];

    this._calculatorDiv.getElementsByTagName("h3")[0].innerHTML =
      this.metalDataSet.title;

    if (imageDir) {
      // Only set image src if it's on the current domain
      const imageDirURL = new URL(imageDir);
      if (
        imageDirURL.protocol == window.location.protocol &&
        imageDirURL.hostname == window.location.hostname
      ) {
        const imageElement = <HTMLImageElement>(
          this._calculatorDiv.getElementsByClassName("flask-image")[0]
        );
        imageElement.src = imageDir + "/flask-logo.png";
      }
    }

    // Add rows for each metal
    for (const id in this.metalDataSet.metals) {
      const m = this.metalDataSet.metals[id];

      // Set default BMC values
      if (bmcVals && bmcVals[id]) {
        try {
          m.defaultMetalConcentration = bmcVals[id];
          m.bufferedMetalConcentration = bmcVals[id];
        } catch {
          // Ignore: will use default value
        }
      }

      this.appendMetalTableRow(m);
    }

    this._downloadButton = <HTMLButtonElement>(
      this._calculatorDiv.getElementsByClassName("download-btn")[0]
    );
    this._downloadButton.onclick = () => {
      this.downloadTableAsCsv();
    };

    this._resetButton = <HTMLButtonElement>(
      this._calculatorDiv.getElementsByClassName("reset-btn")[0]
    );
    this._resetButton.onclick = () => {
      this.reset();
    };

    this.calculate();
  }

  /**
   * Creates a number input tied to a property of metals.Metal
   * Updates the Metal property when the input value is changed, and displays an error
   * if the new value is invalid.
   * Can also call an additional callback with the metal's idSuffix.
   */
  createMetalNumberInput(
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
    input.id = this.calculatorID + "_" + prefix + "_" + metal.idSuffix;
    input.type = "number";
    input.addEventListener("change", (event) => {
      const val = (<HTMLInputElement>event.target).value;
      try {
        msgP.textContent = "";
        const floatVal = parseFloat(val);
        const m = this.metalDataSet.metals[metal.idSuffix];
        Object.assign(m, { [metalPropertyName]: floatVal });
        if (additionalOnChange) additionalOnChange(metal.idSuffix);
        this.calculate();
      } catch (e) {
        let msg;
        if (e instanceof RangeError) {
          msg = e.message;
        } else {
          msg = "Invalid value " + input.value;
        }
        msgP.textContent = msg;
        this.clearCalculation();
      }
    });
    div.append(input);
    div.append(msgP);
    return div;
  }

  /**
   * Adds a row to this._calculatorTable for the given metal.
   */
  appendMetalTableRow(metal: metals.Metal) {
    const row: HTMLTableRowElement = this._calculatorTable
      .getElementsByTagName("tbody")[0]
      .insertRow();

    const toggleButton = <HTMLInputElement>document.createElement("input");
    const label = <HTMLLabelElement>document.createElement("label");
    toggleButton.type = "checkbox";
    toggleButton.classList.add("toggle");
    toggleButton.id = this.calculatorID + "_toggle_" + metal.idSuffix;
    label.htmlFor = this.calculatorID + "_toggle_" + metal.idSuffix;
    const metalCell = <HTMLTableCellElement>document.createElement("th");

    toggleButton.addEventListener("change", () => {
      this.toggleMetal(toggleButton.checked, metal);
      this.calculate();
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
    const affinityInput = this.createMetalNumberInput(
      "affinity",
      metal,
      "affinity",
      (id) => {
        const m = this.metalDataSet.metals[id];
        (<HTMLTableCellElement>(
          document.getElementById(
            this.calculatorID + "_metalation_delta_g_" + id
          )
        )).innerText = m.metalationDeltaG.toFixed(1).toString();
      }
    );
    affinityCell.appendChild(affinityInput);

    const mDeltaGCell: HTMLTableCellElement = row.insertCell(-1);
    mDeltaGCell.classList.add("grouped", "right-spacing");
    mDeltaGCell.id =
      this.calculatorID + "_metalation_delta_g_" + metal.idSuffix;
    mDeltaGCell.innerText = metal.metalationDeltaG.toFixed(1).toString();

    const bmcCell: HTMLTableCellElement = row.insertCell(-1);
    bmcCell.classList.add("bmc", "grouped");
    const bmcInput = this.createMetalNumberInput(
      "bmc",
      metal,
      "bufferedMetalConcentration",
      (id) => {
        const m = this.metalDataSet.metals[id];
        (<HTMLInputElement>(
          document.getElementById(this.calculatorID + "_ia_delta_g_" + id)
        )).innerText = m.intracellularAvailableDeltaG.toFixed(1).toString();
      }
    );

    bmcCell.appendChild(bmcInput);

    const iaDeltaGCell: HTMLTableCellElement = row.insertCell(-1);
    iaDeltaGCell.classList.add("grouped");
    iaDeltaGCell.id = this.calculatorID + "_ia_delta_g_" + metal.idSuffix;
    iaDeltaGCell.innerText = metal.intracellularAvailableDeltaG
      .toFixed(1)
      .toString();

    const resultCell: HTMLTableCellElement = row.insertCell(-1);
    resultCell.classList.add("result");
    resultCell.id = this.calculatorID + "_result_" + metal.idSuffix;
  }

  /**
   * Clears the current calculation values and disables the download button.
   * To be called when a value is invalid.
   */
  clearCalculation() {
    Array.from(this._calculatorTable.getElementsByClassName("result")).forEach(
      (cell) => {
        cell.innerHTML = "N/A";
      }
    );
    this._downloadButton.disabled = true;
  }

  /**
   * Calculates the metalation values and updates the results column
   */
  calculate() {
    const results = this.metalDataSet.calculateOccupancy();

    for (const id in this.metalDataSet.metals) {
      const r = results[id];
      const resultCell = <HTMLTableCellElement>(
        document.getElementById(this.calculatorID + "_result_" + id)
      );
      resultCell.innerHTML = (r * 100).toFixed(2).toString() + "%";
    }

    const totalCell = <HTMLTableCellElement>(
      this._calculatorDiv.getElementsByClassName("total-metalation")[0]
    );
    totalCell.innerHTML = (results["total"] * 100).toFixed(2).toString() + "%";

    this._downloadButton.disabled = false;
  }

  /**
   * Resets the calculator to its initial state
   */
  reset() {
    for (const id in this.metalDataSet.metals) {
      const m = this.metalDataSet.metals[id];
      (
        document.getElementById(
          this.calculatorID + "_toggle_" + m.idSuffix
        ) as HTMLInputElement
      ).checked = false;
      m.resetValues();
      this.toggleMetal(false, m);
    }
    this.calculate();
  }

  /**
   * Toggles a metal row on or off to disable/enable that metal
   */
  toggleMetal(willTurnOff: boolean, metal: metals.Metal) {
    (
      document.getElementById(
        this.calculatorID + "_affinity_" + metal.idSuffix
      ) as HTMLInputElement
    ).disabled = willTurnOff;
    (
      document.getElementById(
        this.calculatorID + "_bmc_" + metal.idSuffix
      ) as HTMLInputElement
    ).disabled = willTurnOff;
    if (willTurnOff) {
      metal.switchOffMetal();
    } else {
      metal.resetValues();
    }
    this.updateRow(metal);
  }

  /**
   * Updates a row with the current values of the given metal
   */
  updateRow(metal: metals.Metal) {
    const id = metal.idSuffix;
    (<HTMLInputElement>(
      document.getElementById(this.calculatorID + "_affinity_" + id)
    )).value = metal.affinity.toString();
    document.getElementById(
      this.calculatorID + "_metalation_delta_g_" + id
    ).innerText = metal.metalationDeltaG.toFixed(1).toString();
    (<HTMLInputElement>(
      document.getElementById(this.calculatorID + "_bmc_" + id)
    )).value = metal.bufferedMetalConcentration.toString();
    document.getElementById(this.calculatorID + "_ia_delta_g_" + id).innerText =
      metal.intracellularAvailableDeltaG.toFixed(1).toString();
  }

  /**
   * Downloads the table as a CSV
   */
  downloadTableAsCsv(separator = ",") {
    const rows = this._calculatorTable.rows;
    // Construct csv
    const csv = [];
    for (let i = 0; i < rows.length; i++) {
      const row = [];
      const cols = rows[i].cells;
      for (let j = 0; j < cols.length; j++) {
        // Clean innertext to remove multiple spaces and jumpline (break csv)
        let data;
        const inputs = Array.from(cols[j].getElementsByTagName("input")).filter(
          (e) => e.type == "number"
        );
        if (inputs.length > 0) {
          data = inputs[0].value;
        } else {
          data = cols[j].innerText;
        }
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
        let detailText = spans[0].innerHTML;
        let detailTextTitle = headings[k].innerText;
        detailTextTitle = cleanData(detailTextTitle);
        detailText = cleanData(detailText);
        detailText = convertToPlainText(detailText);
        explanation.push('"# ' + detailTextTitle + " = " + detailText + '"');
      }
    }
    csv.push(explanation.join("\n"));

    const csvString = csv.join("\n");
    // Download it
    const filename =
      "export_" +
      convertToPlainText(this.metalDataSet.title).replaceAll(" ", "_") +
      "_" +
      new Date().toLocaleDateString() +
      ".csv";
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
}
