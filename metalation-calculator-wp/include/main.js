"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCalculator = void 0;
var metals = require("./metals");
var metalDataSet = new metals.MetalDataSet();
function createMetalNumberInput(prefix, metal, metalPropertyName, additionalOnChange) {
    var div = document.createElement("div");
    var input = document.createElement("input");
    var msgP = document.createElement("p");
    msgP.classList.add("error-msg");
    input.value = metal.getProperty(metalPropertyName).toString();
    input.classList.add(prefix);
    input.id = prefix + "_" + metal.idSuffix;
    input.type = "number";
    input.addEventListener("change", function (event) {
        var _a;
        var val = event.target.value;
        try {
            msgP.textContent = "";
            var floatVal = parseFloat(val);
            var m = metalDataSet.metals[metal.idSuffix];
            Object.assign(m, (_a = {}, _a[metalPropertyName] = floatVal, _a));
            if (additionalOnChange)
                additionalOnChange(metal.idSuffix);
            calculate();
        }
        catch (e) {
            var msg = void 0;
            if (e instanceof RangeError) {
                msg = e.message;
            }
            else {
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
function appendMetalTableRow(metal, table) {
    var row = table
        .getElementsByTagName("tbody")[0]
        .insertRow();
    row.insertCell(-1).outerHTML = "<th>" + metal.symbol + "</th>";
    var affinityCell = row.insertCell(-1);
    affinityCell.classList.add("affinity", "grouped");
    var affinityInput = createMetalNumberInput("affinity", metal, "affinity", function (id) {
        var m = metalDataSet.metals[id];
        (document.getElementById("metalation_delta_g_" + id)).innerText = m.metalationDeltaG.toFixed(1).toString();
    });
    affinityCell.appendChild(affinityInput);
    var mDeltaGCell = row.insertCell(-1);
    mDeltaGCell.classList.add("grouped", "right-spacing");
    mDeltaGCell.id = "metalation_delta_g_" + metal.idSuffix;
    mDeltaGCell.innerText = metal.metalationDeltaG.toFixed(1).toString();
    var bmcCell = row.insertCell(-1);
    bmcCell.classList.add("bmc", "grouped");
    var bmcInput = createMetalNumberInput("bmc", metal, "bufferedMetalConcentration", function (id) {
        var m = metalDataSet.metals[id];
        (document.getElementById("ia_delta_g_" + id)).innerText = m.intracellularAvailableDeltaG.toFixed(1).toString();
    });
    bmcCell.appendChild(bmcInput);
    var iaDeltaGCell = row.insertCell(-1);
    iaDeltaGCell.classList.add("grouped");
    iaDeltaGCell.id = "ia_delta_g_" + metal.idSuffix;
    iaDeltaGCell.innerText = metal.intracellularAvailableDeltaG
        .toFixed(1)
        .toString();
    var resultCell = row.insertCell(-1);
    resultCell.classList.add("result");
    resultCell.id = "result_" + metal.idSuffix;
}
function calculate() {
    var results = metalDataSet.calculateOccupancy();
    for (var id in metalDataSet.metals) {
        var r = results[id];
        var resultCell = (document.getElementById("result_" + id));
        resultCell.innerHTML = (r * 100).toFixed(2).toString() + "%";
    }
    var totalCell = (document.getElementById("total-metalation"));
    totalCell.innerHTML = (results["total"] * 100).toFixed(2).toString() + "%";
    document.getElementById("download-btn").disabled = false;
}
function clearCalculation() {
    Array.from(document.getElementsByClassName("result")).forEach(function (cell) {
        cell.innerHTML = "N/A";
    });
    document.getElementById("download-btn").disabled = true;
}
function reset() {
    metalDataSet = new metals.MetalDataSet();
    for (var id in metalDataSet.metals) {
        var m = metalDataSet.metals[id];
        document.getElementById("affinity_" + id).value =
            m.affinity.toString();
        (document.getElementById("metalation_delta_g_" + id)).innerText = m.metalationDeltaG.toFixed(1).toString();
        document.getElementById("bmc_" + id).value =
            m.bufferedMetalConcentration.toString();
        (document.getElementById("ia_delta_g_" + id)).innerText = m.intracellularAvailableDeltaG.toFixed(1).toString();
    }
    calculate();
}
// Quick and simple export target #tableId into a csv
function downloadTableAsCsv(tableId, separator) {
    if (separator === void 0) { separator = ","; }
    // Select rows from tableId
    var rows = document.querySelectorAll("table#" + tableId + " tr");
    // Construct csv
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
        var row = [];
        var cols = (rows[i].querySelectorAll("td, th"));
        for (var j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            var data = void 0;
            var inputs = cols[j].getElementsByTagName("input");
            if (inputs.length > 0) {
                data = inputs[0].value;
            }
            else {
                data = cols[j].innerText;
            }
            // Remove line breaks and escape double-quote with double-double-quote
            data = data.replace(/(\r\n|\n|\r)/gm, "").replace(/(\s\s)/gm, " ");
            data = data.replace(/"/g, '""');
            data = data.replace(/\u2206/g, "Delta ");
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    var csvString = csv.join("\n");
    // Download it
    var filename = "export_" + tableId + "_" + new Date().toLocaleDateString() + ".csv";
    var link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvString));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function setupCalculator(tableId) {
    var metalTable = document.getElementById(tableId);
    if (metalTable !== null) {
        for (var id in metalDataSet.metals) {
            var m = metalDataSet.metals[id];
            appendMetalTableRow(m, metalTable);
        }
        document.getElementById("download-btn").onclick = function () {
            downloadTableAsCsv("metalation-table");
        };
        document.getElementById("reset-btn").onclick = function () {
            reset();
        };
        calculate();
    }
}
exports.setupCalculator = setupCalculator;
window.addEventListener("DOMContentLoaded", function () {
    setupCalculator("metalation-table");
});
