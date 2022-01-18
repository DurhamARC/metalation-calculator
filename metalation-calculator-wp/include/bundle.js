(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    var toggleButton = document.createElement("input");
    var label = document.createElement("label");
    toggleButton.type = "checkbox";
    toggleButton.classList.add("toggle");
    toggleButton.id = "toggle_" + metal.idSuffix;
    label.htmlFor = "toggle_" + metal.idSuffix;
    var metalCell = document.createElement("th");
    toggleButton.addEventListener("change", function () {
        toggleMetal(this.checked, metal);
        calculate();
    });
    metalCell.appendChild(toggleButton);
    metalCell.appendChild(label);
    var metalID = document.createElement("span");
    metalID.innerHTML = metal.symbol;
    metalID.classList.add("metal-symbol");
    metalCell.appendChild(metalID);
    row.appendChild(metalCell);
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
function toggleMetal(willTurnOff, metal) {
    document.getElementById("affinity_" + metal.idSuffix).disabled = willTurnOff;
    document.getElementById("bmc_" + metal.idSuffix).disabled = willTurnOff;
    if (willTurnOff) {
        metal.switchOffMetal();
    }
    else {
        metal.resetValues();
    }
    updateRow(metal);
}
function updateRow(metal) {
    var id = metal.idSuffix;
    document.getElementById("affinity_" + id).value =
        metal.affinity.toString();
    document.getElementById("metalation_delta_g_" + id).innerText =
        metal.metalationDeltaG.toFixed(1).toString();
    document.getElementById("bmc_" + id).value =
        metal.bufferedMetalConcentration.toString();
    document.getElementById("ia_delta_g_" + id).innerText =
        metal.intracellularAvailableDeltaG.toFixed(1).toString();
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
    for (var id in metalDataSet.metals) {
        var m = metalDataSet.metals[id];
        document.getElementById("toggle_" + m.idSuffix).checked = false;
        m.resetValues();
        toggleMetal(false, m);
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
function hideParagraphCopies() {
    var paragraphs = Array.from(document.getElementsByTagName("p")).filter(function (e) { return e.className === "intro"; });
    if (paragraphs.length > 1) {
        paragraphs.shift();
        for (var x = 0; x < paragraphs.length; x++) {
            paragraphs[x].style.display = "none";
        }
    }
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
    hideParagraphCopies();
});

},{"./metals":2}],2:[function(require,module,exports){
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalDataSet = exports.Metal = void 0;
/**
 * An object to store values for a single metal and calculate delta G values
 */
var Metal = /** @class */ (function () {
    function Metal(name, symbol, affinity, concentration) {
        this.name = name;
        this.symbol = symbol;
        this.affinity = affinity;
        this.bufferedMetalConcentration = concentration;
        this.idSuffix = symbol.toLowerCase();
        this._defaultAffinity = affinity;
        this._defaultMetalConcentration = concentration;
    }
    Metal.prototype.calculateDeltaG = function (moleValue) {
        return (8.314 * 298.15 * Math.log(moleValue)) / 1000;
    };
    Metal.prototype.checkRange = function (val, fieldName) {
        if (isNaN(val))
            throw new RangeError(fieldName + " must be set");
        if (val < 1e-30 || val > 1000) {
            throw new RangeError(fieldName + " must be between 1e-30 and 1000");
        }
    };
    Object.defineProperty(Metal.prototype, "affinity", {
        get: function () {
            return this._affinity;
        },
        set: function (val) {
            this.checkRange(val, "Affinity");
            this._affinity = val;
            this._metalationDeltaG = this.calculateDeltaG(this._affinity);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Metal.prototype, "metalationDeltaG", {
        get: function () {
            return this._metalationDeltaG;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Metal.prototype, "bufferedMetalConcentration", {
        get: function () {
            return this._bufferedMetalConcentration;
        },
        set: function (val) {
            this.checkRange(val, "Buffered metal concentration");
            this._bufferedMetalConcentration = val;
            this._intracellularAvailableDeltaG = this.calculateDeltaG(this._bufferedMetalConcentration);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Metal.prototype, "intracellularAvailableDeltaG", {
        get: function () {
            return this._intracellularAvailableDeltaG;
        },
        set: function (val) {
            if (val <= 0)
                throw new RangeError("Intracellular available ∆G must be > 0");
            this._intracellularAvailableDeltaG = val;
        },
        enumerable: false,
        configurable: true
    });
    Metal.prototype.getProperty = function (key) {
        return this[key];
    };
    Metal.prototype.switchOffMetal = function () {
        this.affinity = 1000;
        this.bufferedMetalConcentration = this._defaultMetalConcentration;
    };
    Metal.prototype.resetValues = function () {
        this.affinity = this._defaultAffinity;
        this.bufferedMetalConcentration = this._defaultMetalConcentration;
    };
    return Metal;
}());
exports.Metal = Metal;
var METAL_VALS = [
    ["Magnesium", "Mg", 1e3, 2.7e-3],
    ["Manganese", "Mn", 1e3, 2.6e-6],
    ["Iron", "Fe", 1e-6, 4.8e-8],
    ["Cobalt", "Co", 3e-11, 2.5e-9],
    ["Nickel", "Ni", 9.8e-10, 1.8e-13],
    ["Copper", "Cu", 2.4e-16, 1.2e-18],
    ["Zinc", "Zn", 1.9e-13, 1.19e-12],
];
var MetalDataSet = /** @class */ (function () {
    function MetalDataSet() {
        this.metals = {};
        for (var _i = 0, METAL_VALS_1 = METAL_VALS; _i < METAL_VALS_1.length; _i++) {
            var m = METAL_VALS_1[_i];
            this.metals[m[1].toLowerCase()] = new (Metal.bind.apply(Metal, __spreadArray([void 0], m, false)))();
        }
    }
    MetalDataSet.prototype.calculateOccupancy = function () {
        var expScaledDifferences = {};
        var totalDiffs = 0;
        for (var id in this.metals) {
            var m = this.metals[id];
            expScaledDifferences[id] = Math.exp((1000 * (m.intracellularAvailableDeltaG - m.metalationDeltaG)) /
                (8.314 * 298.15));
            totalDiffs += expScaledDifferences[id];
        }
        var occupancies = {};
        var totalOccupancy = 0;
        for (var id in this.metals) {
            occupancies[id] = expScaledDifferences[id] / (1 + totalDiffs);
            totalOccupancy += occupancies[id];
        }
        occupancies["total"] = totalOccupancy;
        return occupancies;
    };
    return MetalDataSet;
}());
exports.MetalDataSet = MetalDataSet;

},{}]},{},[1,2]);
