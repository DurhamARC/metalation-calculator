(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function cleanData(data) {
    data = data.replace(/(\r\n|\n|\r)/gm, "").replace(/(\s\s)/gm, " ");
    data = data.replace(/"/g, '""');
    data = data.replace(/\u2206/g, "Delta ");
    return data;
}
function convertToPlainText(html) {
    // Create a new div element
    var tempDivElement = document.createElement("div");
    // Set the HTML content with the given value
    tempDivElement.innerHTML = html;
    // Retrieve the text property of the element
    return tempDivElement.textContent || tempDivElement.innerText || "";
}
// Quick and simple export target #tableId into a csv
function downloadTableAsCsv(tableId, separator) {
    if (separator === void 0) { separator = ","; }
    var table = document.getElementById(tableId);
    var rows = table.rows;
    // Construct csv
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
        var row = [];
        var cols = rows[i].cells;
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
            data = cleanData(data);
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    var explanation = [];
    var headings = rows[0].cells;
    for (var k = 0; k < headings.length; k++) {
        var spans = headings[k].getElementsByTagName("span");
        if (spans.length > 0) {
            var span = spans[0].innerHTML;
            var header = headings[k].innerText;
            header = cleanData(header);
            span = cleanData(span);
            span = convertToPlainText(span);
            explanation.push('"# ' + header + " = " + span + '"');
        }
    }
    csv.push(explanation.join("\n"));
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
window.addEventListener("DOMContentLoaded", function () {
    var metalTable = (document.getElementById("metalation-table"));
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

},{}]},{},[1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyIsInNyYy9tZXRhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLGlDQUFtQztBQUVuQyxJQUFNLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUUvQyxTQUFTLHNCQUFzQixDQUM3QixNQUFjLEVBQ2QsS0FBbUIsRUFDbkIsaUJBQXFDLEVBQ3JDLGtCQUF3QztJQUV4QyxJQUFNLEdBQUcsR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRCxJQUFNLEtBQUssR0FBcUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRSxJQUFNLElBQUksR0FBeUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvRCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNoQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM5RCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixLQUFLLENBQUMsRUFBRSxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUN6QyxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztJQUN0QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVUsS0FBSzs7UUFDOUMsSUFBTSxHQUFHLEdBQXNCLEtBQUssQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDO1FBQ25ELElBQUk7WUFDRixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN0QixJQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsSUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQUksR0FBQyxpQkFBaUIsSUFBRyxRQUFRLE1BQUcsQ0FBQztZQUNwRCxJQUFJLGtCQUFrQjtnQkFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0QsU0FBUyxFQUFFLENBQUM7U0FDYjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsSUFBSSxHQUFHLFNBQUEsQ0FBQztZQUNSLElBQUksQ0FBQyxZQUFZLFVBQVUsRUFBRTtnQkFDM0IsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7YUFDakI7aUJBQU07Z0JBQ0wsR0FBRyxHQUFHLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7YUFDdEM7WUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztZQUN2QixnQkFBZ0IsRUFBRSxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakIsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBQ0QsU0FBUyxtQkFBbUIsQ0FBQyxLQUFtQixFQUFFLEtBQXVCO0lBQ3ZFLElBQU0sR0FBRyxHQUF3QixLQUFLO1NBQ25DLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQyxTQUFTLEVBQUUsQ0FBQztJQUVmLElBQU0sWUFBWSxHQUFxQixRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZFLElBQU0sS0FBSyxHQUFxQixRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hFLFlBQVksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO0lBQy9CLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLFlBQVksQ0FBQyxFQUFFLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFDN0MsS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUMzQyxJQUFNLFNBQVMsR0FBeUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVyRSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFO1FBQ3RDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLFNBQVMsRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3BDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBTSxPQUFPLEdBQW9CLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEUsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2pDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUzQixJQUFNLFlBQVksR0FBeUIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNsRCxJQUFNLGFBQWEsR0FBRyxzQkFBc0IsQ0FDMUMsVUFBVSxFQUNWLEtBQUssRUFDTCxVQUFVLEVBQ1YsVUFBVSxFQUFFO1FBQ1YsSUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNYLENBQ3JCLFFBQVEsQ0FBQyxjQUFjLENBQUMscUJBQXFCLEdBQUcsRUFBRSxDQUFDLENBQ25ELENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDMUQsQ0FBQyxDQUNGLENBQUM7SUFDRixZQUFZLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXhDLElBQU0sV0FBVyxHQUF5QixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0QsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxFQUFFLEdBQUcscUJBQXFCLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUN4RCxXQUFXLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFckUsSUFBTSxPQUFPLEdBQXlCLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RCxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDeEMsSUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQ3JDLEtBQUssRUFDTCxLQUFLLEVBQ0wsNEJBQTRCLEVBQzVCLFVBQVUsRUFBRTtRQUNWLElBQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDZixDQUNqQixRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsQ0FDM0MsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN0RSxDQUFDLENBQ0YsQ0FBQztJQUVGLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFOUIsSUFBTSxZQUFZLEdBQXlCLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RCxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0QyxZQUFZLENBQUMsRUFBRSxHQUFHLGFBQWEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBQ2pELFlBQVksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLDRCQUE0QjtTQUN4RCxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ1YsUUFBUSxFQUFFLENBQUM7SUFFZCxJQUFNLFVBQVUsR0FBeUIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVELFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLFVBQVUsQ0FBQyxFQUFFLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDN0MsQ0FBQztBQUNELFNBQVMsV0FBVyxDQUFDLFdBQW9CLEVBQUUsS0FBbUI7SUFFMUQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FDckQsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDO0lBRXZCLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQ2hELENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQztJQUN6QixJQUFJLFdBQVcsRUFBRTtRQUNmLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUN4QjtTQUFNO1FBQ0wsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3JCO0lBQ0QsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxLQUFtQjtJQUNwQyxJQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBQ1AsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFFLENBQUMsS0FBSztRQUNqRSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzVCLFFBQVEsQ0FBQyxjQUFjLENBQUMscUJBQXFCLEdBQUcsRUFBRSxDQUFDLENBQUMsU0FBUztRQUMzRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzVCLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBRSxDQUFDLEtBQUs7UUFDNUQsS0FBSyxDQUFDLDBCQUEwQixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzlDLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQyxDQUFDLFNBQVM7UUFDbkQsS0FBSyxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM3RCxDQUFDO0FBRUQsU0FBUyxTQUFTO0lBQ2hCLElBQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBRWxELEtBQUssSUFBTSxFQUFFLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtRQUNwQyxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBTSxVQUFVLEdBQXlCLENBQ3ZDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUN4QyxDQUFDO1FBQ0YsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDO0tBQzlEO0lBRUQsSUFBTSxTQUFTLEdBQXlCLENBQ3RDLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FDNUMsQ0FBQztJQUNGLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUV2RCxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDaEYsQ0FBQztBQUVELFNBQVMsZ0JBQWdCO0lBQ3ZCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtRQUNqRSxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQztJQUNpQixRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBRSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDL0UsQ0FBQztBQUVELFNBQVMsS0FBSztJQUNaLEtBQUssSUFBTSxFQUFFLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtRQUNwQyxJQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWhDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQy9DLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNsQixDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDaEIsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN2QjtJQUNELFNBQVMsRUFBRSxDQUFDO0FBQ2QsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLElBQVk7SUFDN0IsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNuRSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3pDLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUNELFNBQVMsa0JBQWtCLENBQUMsSUFBWTtJQUN0QywyQkFBMkI7SUFDM0IsSUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyRCw0Q0FBNEM7SUFDNUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDaEMsNENBQTRDO0lBQzVDLE9BQU8sY0FBYyxDQUFDLFdBQVcsSUFBSSxjQUFjLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQztBQUN0RSxDQUFDO0FBRUQscURBQXFEO0FBQ3JELFNBQVMsa0JBQWtCLENBQUMsT0FBZSxFQUFFLFNBQWU7SUFBZiwwQkFBQSxFQUFBLGVBQWU7SUFDMUQsSUFBTSxLQUFLLEdBQXFCLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakUsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN4QixnQkFBZ0I7SUFDaEIsSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDcEMsSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxxRUFBcUU7WUFDckUsSUFBSSxJQUFJLFNBQUEsQ0FBQztZQUNULElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNyQixJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQzthQUN4QjtpQkFBTTtnQkFDTCxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzthQUMxQjtZQUNELHNFQUFzRTtZQUN0RSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLHNCQUFzQjtZQUN0QixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDNUI7UUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztLQUMvQjtJQUNELElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUN2QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hDLElBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2RCxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3BCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDOUIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNuQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsSUFBSSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZEO0tBQ0Y7SUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUVqQyxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pDLGNBQWM7SUFDZCxJQUFNLFFBQVEsR0FDWixTQUFTLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsTUFBTSxDQUFDO0lBQ3ZFLElBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxZQUFZLENBQ2YsTUFBTSxFQUNOLDhCQUE4QixHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUMvRCxDQUFDO0lBQ0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDeEMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2IsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRTtJQUMxQyxJQUFNLFVBQVUsR0FBcUIsQ0FDbkMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUM1QyxDQUFDO0lBQ0YsS0FBSyxJQUFNLEVBQUUsSUFBSSxZQUFZLENBQUMsTUFBTSxFQUFFO1FBQ3BDLElBQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3BDO0lBRUQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLEdBQUc7UUFDaEQsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUM7SUFFRixRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sR0FBRztRQUM3QyxLQUFLLEVBQUUsQ0FBQztJQUNWLENBQUMsQ0FBQztJQUVGLFNBQVMsRUFBRSxDQUFDO0FBQ2QsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQzlRSDs7R0FFRztBQUNIO0lBWUUsZUFDRSxJQUFZLEVBQ1osTUFBYyxFQUNkLFFBQWdCLEVBQ2hCLGFBQXFCO1FBRXJCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQywwQkFBMEIsR0FBRyxhQUFhLENBQUM7UUFDaEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztRQUNqQyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsYUFBYSxDQUFDO0lBQ2xELENBQUM7SUFFRCwrQkFBZSxHQUFmLFVBQWdCLFNBQWlCO1FBQy9CLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDdkQsQ0FBQztJQUVELDBCQUFVLEdBQVYsVUFBVyxHQUFXLEVBQUUsU0FBaUI7UUFDdkMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQUUsTUFBTSxJQUFJLFVBQVUsQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLENBQUM7UUFDakUsSUFBSSxHQUFHLEdBQUcsS0FBSyxJQUFJLEdBQUcsR0FBRyxJQUFJLEVBQUU7WUFDN0IsTUFBTSxJQUFJLFVBQVUsQ0FBQyxTQUFTLEdBQUcsaUNBQWlDLENBQUMsQ0FBQztTQUNyRTtJQUNILENBQUM7SUFFRCxzQkFBSSwyQkFBUTthQUFaO1lBQ0UsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3hCLENBQUM7YUFFRCxVQUFhLEdBQVc7WUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7WUFDckIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7OztPQU5BO0lBUUQsc0JBQUksbUNBQWdCO2FBQXBCO1lBQ0UsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDaEMsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSw2Q0FBMEI7YUFBOUI7WUFDRSxPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQztRQUMxQyxDQUFDO2FBRUQsVUFBK0IsR0FBVztZQUN4QyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQywyQkFBMkIsR0FBRyxHQUFHLENBQUM7WUFDdkMsSUFBSSxDQUFDLDZCQUE2QixHQUFHLElBQUksQ0FBQyxlQUFlLENBQ3ZELElBQUksQ0FBQywyQkFBMkIsQ0FDakMsQ0FBQztRQUNKLENBQUM7OztPQVJBO0lBVUQsc0JBQUksK0NBQTRCO2FBQWhDO1lBQ0UsT0FBTyxJQUFJLENBQUMsNkJBQTZCLENBQUM7UUFDNUMsQ0FBQzthQUVELFVBQWlDLEdBQVc7WUFDMUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDVixNQUFNLElBQUksVUFBVSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLDZCQUE2QixHQUFHLEdBQUcsQ0FBQztRQUMzQyxDQUFDOzs7T0FOQTtJQVFELDJCQUFXLEdBQVgsVUFBWSxHQUFnQjtRQUMxQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBRUQsOEJBQWMsR0FBZDtRQUNFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUM7SUFDcEUsQ0FBQztJQUVELDJCQUFXLEdBQVg7UUFDRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUN0QyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDO0lBQ3BFLENBQUM7SUFDSCxZQUFDO0FBQUQsQ0F2RkEsQUF1RkMsSUFBQTtBQXZGWSxzQkFBSztBQXlGbEIsSUFBTSxVQUFVLEdBQTRDO0lBQzFELENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDO0lBQ2hDLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDO0lBQ2hDLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO0lBQzVCLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQy9CLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO0lBQ2xDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO0lBQ2xDLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDO0NBQ2xDLENBQUM7QUFFRjtJQUdFO1FBQ0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsS0FBZ0IsVUFBVSxFQUFWLHlCQUFVLEVBQVYsd0JBQVUsRUFBVixJQUFVLEVBQUU7WUFBdkIsSUFBTSxDQUFDLG1CQUFBO1lBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBTyxLQUFLLFlBQUwsS0FBSywwQkFBSSxDQUFDLFlBQUMsQ0FBQztTQUNuRDtJQUNILENBQUM7SUFFRCx5Q0FBa0IsR0FBbEI7UUFDRSxJQUFNLG9CQUFvQixHQUE2QixFQUFFLENBQUM7UUFDMUQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLEtBQUssSUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUM1QixJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ2pDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUM1RCxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FDbkIsQ0FBQztZQUNGLFVBQVUsSUFBSSxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN4QztRQUVELElBQU0sV0FBVyxHQUE2QixFQUFFLENBQUM7UUFDakQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLEtBQUssSUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUM1QixXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7WUFDOUQsY0FBYyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQztRQUNELFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxjQUFjLENBQUM7UUFFdEMsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FqQ0EsQUFpQ0MsSUFBQTtBQWpDWSxvQ0FBWSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCAqIGFzIG1ldGFscyBmcm9tIFwiLi9tZXRhbHNcIjtcblxuY29uc3QgbWV0YWxEYXRhU2V0ID0gbmV3IG1ldGFscy5NZXRhbERhdGFTZXQoKTtcblxuZnVuY3Rpb24gY3JlYXRlTWV0YWxOdW1iZXJJbnB1dChcbiAgcHJlZml4OiBzdHJpbmcsXG4gIG1ldGFsOiBtZXRhbHMuTWV0YWwsXG4gIG1ldGFsUHJvcGVydHlOYW1lOiBrZXlvZiBtZXRhbHMuTWV0YWwsXG4gIGFkZGl0aW9uYWxPbkNoYW5nZTogKGlkOiBzdHJpbmcpID0+IHZvaWRcbikge1xuICBjb25zdCBkaXYgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgY29uc3QgaW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gIGNvbnN0IG1zZ1AgPSA8SFRNTFBhcmFncmFwaEVsZW1lbnQ+ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gIG1zZ1AuY2xhc3NMaXN0LmFkZChcImVycm9yLW1zZ1wiKTtcbiAgaW5wdXQudmFsdWUgPSBtZXRhbC5nZXRQcm9wZXJ0eShtZXRhbFByb3BlcnR5TmFtZSkudG9TdHJpbmcoKTtcbiAgaW5wdXQuY2xhc3NMaXN0LmFkZChwcmVmaXgpO1xuICBpbnB1dC5pZCA9IHByZWZpeCArIFwiX1wiICsgbWV0YWwuaWRTdWZmaXg7XG4gIGlucHV0LnR5cGUgPSBcIm51bWJlclwiO1xuICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGNvbnN0IHZhbCA9ICg8SFRNTElucHV0RWxlbWVudD5ldmVudC50YXJnZXQpLnZhbHVlO1xuICAgIHRyeSB7XG4gICAgICBtc2dQLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgIGNvbnN0IGZsb2F0VmFsID0gcGFyc2VGbG9hdCh2YWwpO1xuICAgICAgY29uc3QgbSA9IG1ldGFsRGF0YVNldC5tZXRhbHNbbWV0YWwuaWRTdWZmaXhdO1xuICAgICAgT2JqZWN0LmFzc2lnbihtLCB7IFttZXRhbFByb3BlcnR5TmFtZV06IGZsb2F0VmFsIH0pO1xuICAgICAgaWYgKGFkZGl0aW9uYWxPbkNoYW5nZSkgYWRkaXRpb25hbE9uQ2hhbmdlKG1ldGFsLmlkU3VmZml4KTtcbiAgICAgIGNhbGN1bGF0ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxldCBtc2c7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFJhbmdlRXJyb3IpIHtcbiAgICAgICAgbXNnID0gZS5tZXNzYWdlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbXNnID0gXCJJbnZhbGlkIHZhbHVlIFwiICsgaW5wdXQudmFsdWU7XG4gICAgICB9XG4gICAgICBtc2dQLnRleHRDb250ZW50ID0gbXNnO1xuICAgICAgY2xlYXJDYWxjdWxhdGlvbigpO1xuICAgIH1cbiAgfSk7XG4gIGRpdi5hcHBlbmQoaW5wdXQpO1xuICBkaXYuYXBwZW5kKG1zZ1ApO1xuICByZXR1cm4gZGl2O1xufVxuZnVuY3Rpb24gYXBwZW5kTWV0YWxUYWJsZVJvdyhtZXRhbDogbWV0YWxzLk1ldGFsLCB0YWJsZTogSFRNTFRhYmxlRWxlbWVudCkge1xuICBjb25zdCByb3c6IEhUTUxUYWJsZVJvd0VsZW1lbnQgPSB0YWJsZVxuICAgIC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRib2R5XCIpWzBdXG4gICAgLmluc2VydFJvdygpO1xuXG4gIGNvbnN0IHRvZ2dsZUJ1dHRvbiA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgY29uc3QgbGFiZWwgPSA8SFRNTExhYmVsRWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XG4gIHRvZ2dsZUJ1dHRvbi50eXBlID0gXCJjaGVja2JveFwiO1xuICB0b2dnbGVCdXR0b24uY2xhc3NMaXN0LmFkZChcInRvZ2dsZVwiKTtcbiAgdG9nZ2xlQnV0dG9uLmlkID0gXCJ0b2dnbGVfXCIgKyBtZXRhbC5pZFN1ZmZpeDtcbiAgbGFiZWwuaHRtbEZvciA9IFwidG9nZ2xlX1wiICsgbWV0YWwuaWRTdWZmaXg7XG4gIGNvbnN0IG1ldGFsQ2VsbCA9IDxIVE1MVGFibGVDZWxsRWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGhcIik7XG5cbiAgdG9nZ2xlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgIHRvZ2dsZU1ldGFsKHRoaXMuY2hlY2tlZCwgbWV0YWwpO1xuICAgIGNhbGN1bGF0ZSgpO1xuICB9KTtcblxuICBtZXRhbENlbGwuYXBwZW5kQ2hpbGQodG9nZ2xlQnV0dG9uKTtcbiAgbWV0YWxDZWxsLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgY29uc3QgbWV0YWxJRCA9IDxIVE1MU3BhbkVsZW1lbnQ+ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gIG1ldGFsSUQuaW5uZXJIVE1MID0gbWV0YWwuc3ltYm9sO1xuICBtZXRhbElELmNsYXNzTGlzdC5hZGQoXCJtZXRhbC1zeW1ib2xcIik7XG4gIG1ldGFsQ2VsbC5hcHBlbmRDaGlsZChtZXRhbElEKTtcbiAgcm93LmFwcGVuZENoaWxkKG1ldGFsQ2VsbCk7XG5cbiAgY29uc3QgYWZmaW5pdHlDZWxsOiBIVE1MVGFibGVDZWxsRWxlbWVudCA9IHJvdy5pbnNlcnRDZWxsKC0xKTtcbiAgYWZmaW5pdHlDZWxsLmNsYXNzTGlzdC5hZGQoXCJhZmZpbml0eVwiLCBcImdyb3VwZWRcIik7XG4gIGNvbnN0IGFmZmluaXR5SW5wdXQgPSBjcmVhdGVNZXRhbE51bWJlcklucHV0KFxuICAgIFwiYWZmaW5pdHlcIixcbiAgICBtZXRhbCxcbiAgICBcImFmZmluaXR5XCIsXG4gICAgZnVuY3Rpb24gKGlkKSB7XG4gICAgICBjb25zdCBtID0gbWV0YWxEYXRhU2V0Lm1ldGFsc1tpZF07XG4gICAgICAoPEhUTUxUYWJsZUNlbGxFbGVtZW50PihcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZXRhbGF0aW9uX2RlbHRhX2dfXCIgKyBpZClcbiAgICAgICkpLmlubmVyVGV4dCA9IG0ubWV0YWxhdGlvbkRlbHRhRy50b0ZpeGVkKDEpLnRvU3RyaW5nKCk7XG4gICAgfVxuICApO1xuICBhZmZpbml0eUNlbGwuYXBwZW5kQ2hpbGQoYWZmaW5pdHlJbnB1dCk7XG5cbiAgY29uc3QgbURlbHRhR0NlbGw6IEhUTUxUYWJsZUNlbGxFbGVtZW50ID0gcm93Lmluc2VydENlbGwoLTEpO1xuICBtRGVsdGFHQ2VsbC5jbGFzc0xpc3QuYWRkKFwiZ3JvdXBlZFwiLCBcInJpZ2h0LXNwYWNpbmdcIik7XG4gIG1EZWx0YUdDZWxsLmlkID0gXCJtZXRhbGF0aW9uX2RlbHRhX2dfXCIgKyBtZXRhbC5pZFN1ZmZpeDtcbiAgbURlbHRhR0NlbGwuaW5uZXJUZXh0ID0gbWV0YWwubWV0YWxhdGlvbkRlbHRhRy50b0ZpeGVkKDEpLnRvU3RyaW5nKCk7XG5cbiAgY29uc3QgYm1jQ2VsbDogSFRNTFRhYmxlQ2VsbEVsZW1lbnQgPSByb3cuaW5zZXJ0Q2VsbCgtMSk7XG4gIGJtY0NlbGwuY2xhc3NMaXN0LmFkZChcImJtY1wiLCBcImdyb3VwZWRcIik7XG4gIGNvbnN0IGJtY0lucHV0ID0gY3JlYXRlTWV0YWxOdW1iZXJJbnB1dChcbiAgICBcImJtY1wiLFxuICAgIG1ldGFsLFxuICAgIFwiYnVmZmVyZWRNZXRhbENvbmNlbnRyYXRpb25cIixcbiAgICBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGNvbnN0IG0gPSBtZXRhbERhdGFTZXQubWV0YWxzW2lkXTtcbiAgICAgICg8SFRNTElucHV0RWxlbWVudD4oXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWFfZGVsdGFfZ19cIiArIGlkKVxuICAgICAgKSkuaW5uZXJUZXh0ID0gbS5pbnRyYWNlbGx1bGFyQXZhaWxhYmxlRGVsdGFHLnRvRml4ZWQoMSkudG9TdHJpbmcoKTtcbiAgICB9XG4gICk7XG5cbiAgYm1jQ2VsbC5hcHBlbmRDaGlsZChibWNJbnB1dCk7XG5cbiAgY29uc3QgaWFEZWx0YUdDZWxsOiBIVE1MVGFibGVDZWxsRWxlbWVudCA9IHJvdy5pbnNlcnRDZWxsKC0xKTtcbiAgaWFEZWx0YUdDZWxsLmNsYXNzTGlzdC5hZGQoXCJncm91cGVkXCIpO1xuICBpYURlbHRhR0NlbGwuaWQgPSBcImlhX2RlbHRhX2dfXCIgKyBtZXRhbC5pZFN1ZmZpeDtcbiAgaWFEZWx0YUdDZWxsLmlubmVyVGV4dCA9IG1ldGFsLmludHJhY2VsbHVsYXJBdmFpbGFibGVEZWx0YUdcbiAgICAudG9GaXhlZCgxKVxuICAgIC50b1N0cmluZygpO1xuXG4gIGNvbnN0IHJlc3VsdENlbGw6IEhUTUxUYWJsZUNlbGxFbGVtZW50ID0gcm93Lmluc2VydENlbGwoLTEpO1xuICByZXN1bHRDZWxsLmNsYXNzTGlzdC5hZGQoXCJyZXN1bHRcIik7XG4gIHJlc3VsdENlbGwuaWQgPSBcInJlc3VsdF9cIiArIG1ldGFsLmlkU3VmZml4O1xufVxuZnVuY3Rpb24gdG9nZ2xlTWV0YWwod2lsbFR1cm5PZmY6IGJvb2xlYW4sIG1ldGFsOiBtZXRhbHMuTWV0YWwpIHtcbiAgKFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWZmaW5pdHlfXCIgKyBtZXRhbC5pZFN1ZmZpeCkgYXMgSFRNTElucHV0RWxlbWVudFxuICApLmRpc2FibGVkID0gd2lsbFR1cm5PZmY7XG4gIChcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJtY19cIiArIG1ldGFsLmlkU3VmZml4KSBhcyBIVE1MSW5wdXRFbGVtZW50XG4gICkuZGlzYWJsZWQgPSB3aWxsVHVybk9mZjtcbiAgaWYgKHdpbGxUdXJuT2ZmKSB7XG4gICAgbWV0YWwuc3dpdGNoT2ZmTWV0YWwoKTtcbiAgfSBlbHNlIHtcbiAgICBtZXRhbC5yZXNldFZhbHVlcygpO1xuICB9XG4gIHVwZGF0ZVJvdyhtZXRhbCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVJvdyhtZXRhbDogbWV0YWxzLk1ldGFsKSB7XG4gIGNvbnN0IGlkID0gbWV0YWwuaWRTdWZmaXg7XG4gICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFmZmluaXR5X1wiICsgaWQpKS52YWx1ZSA9XG4gICAgbWV0YWwuYWZmaW5pdHkudG9TdHJpbmcoKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZXRhbGF0aW9uX2RlbHRhX2dfXCIgKyBpZCkuaW5uZXJUZXh0ID1cbiAgICBtZXRhbC5tZXRhbGF0aW9uRGVsdGFHLnRvRml4ZWQoMSkudG9TdHJpbmcoKTtcbiAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm1jX1wiICsgaWQpKS52YWx1ZSA9XG4gICAgbWV0YWwuYnVmZmVyZWRNZXRhbENvbmNlbnRyYXRpb24udG9TdHJpbmcoKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpYV9kZWx0YV9nX1wiICsgaWQpLmlubmVyVGV4dCA9XG4gICAgbWV0YWwuaW50cmFjZWxsdWxhckF2YWlsYWJsZURlbHRhRy50b0ZpeGVkKDEpLnRvU3RyaW5nKCk7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZSgpIHtcbiAgY29uc3QgcmVzdWx0cyA9IG1ldGFsRGF0YVNldC5jYWxjdWxhdGVPY2N1cGFuY3koKTtcblxuICBmb3IgKGNvbnN0IGlkIGluIG1ldGFsRGF0YVNldC5tZXRhbHMpIHtcbiAgICBjb25zdCByID0gcmVzdWx0c1tpZF07XG4gICAgY29uc3QgcmVzdWx0Q2VsbCA9IDxIVE1MVGFibGVDZWxsRWxlbWVudD4oXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdF9cIiArIGlkKVxuICAgICk7XG4gICAgcmVzdWx0Q2VsbC5pbm5lckhUTUwgPSAociAqIDEwMCkudG9GaXhlZCgyKS50b1N0cmluZygpICsgXCIlXCI7XG4gIH1cblxuICBjb25zdCB0b3RhbENlbGwgPSA8SFRNTFRhYmxlQ2VsbEVsZW1lbnQ+KFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG90YWwtbWV0YWxhdGlvblwiKVxuICApO1xuICB0b3RhbENlbGwuaW5uZXJIVE1MID0gKHJlc3VsdHNbXCJ0b3RhbFwiXSAqIDEwMCkudG9GaXhlZCgyKS50b1N0cmluZygpICsgXCIlXCI7XG5cbiAgKDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvd25sb2FkLWJ0blwiKSkuZGlzYWJsZWQgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gY2xlYXJDYWxjdWxhdGlvbigpIHtcbiAgQXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicmVzdWx0XCIpKS5mb3JFYWNoKChjZWxsKSA9PiB7XG4gICAgY2VsbC5pbm5lckhUTUwgPSBcIk4vQVwiO1xuICB9KTtcbiAgKDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvd25sb2FkLWJ0blwiKSkuZGlzYWJsZWQgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiByZXNldCgpIHtcbiAgZm9yIChjb25zdCBpZCBpbiBtZXRhbERhdGFTZXQubWV0YWxzKSB7XG4gICAgY29uc3QgbSA9IG1ldGFsRGF0YVNldC5tZXRhbHNbaWRdO1xuICAgIChcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlX1wiICsgbS5pZFN1ZmZpeCkgYXMgSFRNTElucHV0RWxlbWVudFxuICAgICkuY2hlY2tlZCA9IGZhbHNlO1xuICAgIG0ucmVzZXRWYWx1ZXMoKTtcbiAgICB0b2dnbGVNZXRhbChmYWxzZSwgbSk7XG4gIH1cbiAgY2FsY3VsYXRlKCk7XG59XG5cbmZ1bmN0aW9uIGNsZWFuRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgZGF0YSA9IGRhdGEucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgXCJcIikucmVwbGFjZSgvKFxcc1xccykvZ20sIFwiIFwiKTtcbiAgZGF0YSA9IGRhdGEucmVwbGFjZSgvXCIvZywgJ1wiXCInKTtcbiAgZGF0YSA9IGRhdGEucmVwbGFjZSgvXFx1MjIwNi9nLCBcIkRlbHRhIFwiKTtcbiAgcmV0dXJuIGRhdGE7XG59XG5mdW5jdGlvbiBjb252ZXJ0VG9QbGFpblRleHQoaHRtbDogc3RyaW5nKSB7XG4gIC8vIENyZWF0ZSBhIG5ldyBkaXYgZWxlbWVudFxuICBjb25zdCB0ZW1wRGl2RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIC8vIFNldCB0aGUgSFRNTCBjb250ZW50IHdpdGggdGhlIGdpdmVuIHZhbHVlXG4gIHRlbXBEaXZFbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG4gIC8vIFJldHJpZXZlIHRoZSB0ZXh0IHByb3BlcnR5IG9mIHRoZSBlbGVtZW50XG4gIHJldHVybiB0ZW1wRGl2RWxlbWVudC50ZXh0Q29udGVudCB8fCB0ZW1wRGl2RWxlbWVudC5pbm5lclRleHQgfHwgXCJcIjtcbn1cblxuLy8gUXVpY2sgYW5kIHNpbXBsZSBleHBvcnQgdGFyZ2V0ICN0YWJsZUlkIGludG8gYSBjc3ZcbmZ1bmN0aW9uIGRvd25sb2FkVGFibGVBc0Nzdih0YWJsZUlkOiBzdHJpbmcsIHNlcGFyYXRvciA9IFwiLFwiKSB7XG4gIGNvbnN0IHRhYmxlID0gPEhUTUxUYWJsZUVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFibGVJZCk7XG4gIGNvbnN0IHJvd3MgPSB0YWJsZS5yb3dzO1xuICAvLyBDb25zdHJ1Y3QgY3N2XG4gIGNvbnN0IGNzdiA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByb3cgPSBbXTtcbiAgICBjb25zdCBjb2xzID0gcm93c1tpXS5jZWxscztcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNvbHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIC8vIENsZWFuIGlubmVydGV4dCB0byByZW1vdmUgbXVsdGlwbGUgc3BhY2VzIGFuZCBqdW1wbGluZSAoYnJlYWsgY3N2KVxuICAgICAgbGV0IGRhdGE7XG4gICAgICBjb25zdCBpbnB1dHMgPSBjb2xzW2pdLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW5wdXRcIik7XG4gICAgICBpZiAoaW5wdXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGF0YSA9IGlucHV0c1swXS52YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGEgPSBjb2xzW2pdLmlubmVyVGV4dDtcbiAgICAgIH1cbiAgICAgIC8vIFJlbW92ZSBsaW5lIGJyZWFrcyBhbmQgZXNjYXBlIGRvdWJsZS1xdW90ZSB3aXRoIGRvdWJsZS1kb3VibGUtcXVvdGVcbiAgICAgIGRhdGEgPSBjbGVhbkRhdGEoZGF0YSk7XG4gICAgICAvLyBQdXNoIGVzY2FwZWQgc3RyaW5nXG4gICAgICByb3cucHVzaCgnXCInICsgZGF0YSArICdcIicpO1xuICAgIH1cbiAgICBjc3YucHVzaChyb3cuam9pbihzZXBhcmF0b3IpKTtcbiAgfVxuICBjb25zdCBleHBsYW5hdGlvbiA9IFtdO1xuICBjb25zdCBoZWFkaW5ncyA9IHJvd3NbMF0uY2VsbHM7XG4gIGZvciAobGV0IGsgPSAwOyBrIDwgaGVhZGluZ3MubGVuZ3RoOyBrKyspIHtcbiAgICBjb25zdCBzcGFucyA9IGhlYWRpbmdzW2tdLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3BhblwiKTtcbiAgICBpZiAoc3BhbnMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IHNwYW4gPSBzcGFuc1swXS5pbm5lckhUTUw7XG4gICAgICBsZXQgaGVhZGVyID0gaGVhZGluZ3Nba10uaW5uZXJUZXh0O1xuICAgICAgaGVhZGVyID0gY2xlYW5EYXRhKGhlYWRlcik7XG4gICAgICBzcGFuID0gY2xlYW5EYXRhKHNwYW4pO1xuICAgICAgc3BhbiA9IGNvbnZlcnRUb1BsYWluVGV4dChzcGFuKTtcbiAgICAgIGV4cGxhbmF0aW9uLnB1c2goJ1wiIyAnICsgaGVhZGVyICsgXCIgPSBcIiArIHNwYW4gKyAnXCInKTtcbiAgICB9XG4gIH1cbiAgY3N2LnB1c2goZXhwbGFuYXRpb24uam9pbihcIlxcblwiKSk7XG5cbiAgY29uc3QgY3N2U3RyaW5nID0gY3N2LmpvaW4oXCJcXG5cIik7XG4gIC8vIERvd25sb2FkIGl0XG4gIGNvbnN0IGZpbGVuYW1lID1cbiAgICBcImV4cG9ydF9cIiArIHRhYmxlSWQgKyBcIl9cIiArIG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgKyBcIi5jc3ZcIjtcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICBsaW5rLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgbGluay5zZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIik7XG4gIGxpbmsuc2V0QXR0cmlidXRlKFxuICAgIFwiaHJlZlwiLFxuICAgIFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGNzdlN0cmluZylcbiAgKTtcbiAgbGluay5zZXRBdHRyaWJ1dGUoXCJkb3dubG9hZFwiLCBmaWxlbmFtZSk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gIGxpbmsuY2xpY2soKTtcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgY29uc3QgbWV0YWxUYWJsZSA9IDxIVE1MVGFibGVFbGVtZW50PihcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1ldGFsYXRpb24tdGFibGVcIilcbiAgKTtcbiAgZm9yIChjb25zdCBpZCBpbiBtZXRhbERhdGFTZXQubWV0YWxzKSB7XG4gICAgY29uc3QgbSA9IG1ldGFsRGF0YVNldC5tZXRhbHNbaWRdO1xuICAgIGFwcGVuZE1ldGFsVGFibGVSb3cobSwgbWV0YWxUYWJsZSk7XG4gIH1cblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvd25sb2FkLWJ0blwiKS5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgIGRvd25sb2FkVGFibGVBc0NzdihcIm1ldGFsYXRpb24tdGFibGVcIik7XG4gIH07XG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldC1idG5cIikub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXNldCgpO1xuICB9O1xuXG4gIGNhbGN1bGF0ZSgpO1xufSk7XG4iLCIvKipcbiAqIEFuIG9iamVjdCB0byBzdG9yZSB2YWx1ZXMgZm9yIGEgc2luZ2xlIG1ldGFsIGFuZCBjYWxjdWxhdGUgZGVsdGEgRyB2YWx1ZXNcbiAqL1xuZXhwb3J0IGNsYXNzIE1ldGFsIHtcbiAgbmFtZTogc3RyaW5nO1xuICBzeW1ib2w6IHN0cmluZztcbiAgX2FmZmluaXR5OiBudW1iZXI7XG4gIF9kZWZhdWx0QWZmaW5pdHk6IG51bWJlcjtcbiAgX21ldGFsYXRpb25EZWx0YUc6IG51bWJlcjtcbiAgX2J1ZmZlcmVkTWV0YWxDb25jZW50cmF0aW9uOiBudW1iZXI7XG4gIF9kZWZhdWx0TWV0YWxDb25jZW50cmF0aW9uOiBudW1iZXI7XG4gIF9pbnRyYWNlbGx1bGFyQXZhaWxhYmxlRGVsdGFHOiBudW1iZXI7XG4gIGlkU3VmZml4OiBzdHJpbmc7XG4gIHZhbGlkYXRvcjogdHlwZW9mIFByb3h5O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzeW1ib2w6IHN0cmluZyxcbiAgICBhZmZpbml0eTogbnVtYmVyLFxuICAgIGNvbmNlbnRyYXRpb246IG51bWJlclxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuc3ltYm9sID0gc3ltYm9sO1xuICAgIHRoaXMuYWZmaW5pdHkgPSBhZmZpbml0eTtcbiAgICB0aGlzLmJ1ZmZlcmVkTWV0YWxDb25jZW50cmF0aW9uID0gY29uY2VudHJhdGlvbjtcbiAgICB0aGlzLmlkU3VmZml4ID0gc3ltYm9sLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5fZGVmYXVsdEFmZmluaXR5ID0gYWZmaW5pdHk7XG4gICAgdGhpcy5fZGVmYXVsdE1ldGFsQ29uY2VudHJhdGlvbiA9IGNvbmNlbnRyYXRpb247XG4gIH1cblxuICBjYWxjdWxhdGVEZWx0YUcobW9sZVZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiAoOC4zMTQgKiAyOTguMTUgKiBNYXRoLmxvZyhtb2xlVmFsdWUpKSAvIDEwMDA7XG4gIH1cblxuICBjaGVja1JhbmdlKHZhbDogbnVtYmVyLCBmaWVsZE5hbWU6IHN0cmluZykge1xuICAgIGlmIChpc05hTih2YWwpKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihmaWVsZE5hbWUgKyBcIiBtdXN0IGJlIHNldFwiKTtcbiAgICBpZiAodmFsIDwgMWUtMzAgfHwgdmFsID4gMTAwMCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoZmllbGROYW1lICsgXCIgbXVzdCBiZSBiZXR3ZWVuIDFlLTMwIGFuZCAxMDAwXCIpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBhZmZpbml0eSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9hZmZpbml0eTtcbiAgfVxuXG4gIHNldCBhZmZpbml0eSh2YWw6IG51bWJlcikge1xuICAgIHRoaXMuY2hlY2tSYW5nZSh2YWwsIFwiQWZmaW5pdHlcIik7XG4gICAgdGhpcy5fYWZmaW5pdHkgPSB2YWw7XG4gICAgdGhpcy5fbWV0YWxhdGlvbkRlbHRhRyA9IHRoaXMuY2FsY3VsYXRlRGVsdGFHKHRoaXMuX2FmZmluaXR5KTtcbiAgfVxuXG4gIGdldCBtZXRhbGF0aW9uRGVsdGFHKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21ldGFsYXRpb25EZWx0YUc7XG4gIH1cblxuICBnZXQgYnVmZmVyZWRNZXRhbENvbmNlbnRyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYnVmZmVyZWRNZXRhbENvbmNlbnRyYXRpb247XG4gIH1cblxuICBzZXQgYnVmZmVyZWRNZXRhbENvbmNlbnRyYXRpb24odmFsOiBudW1iZXIpIHtcbiAgICB0aGlzLmNoZWNrUmFuZ2UodmFsLCBcIkJ1ZmZlcmVkIG1ldGFsIGNvbmNlbnRyYXRpb25cIik7XG4gICAgdGhpcy5fYnVmZmVyZWRNZXRhbENvbmNlbnRyYXRpb24gPSB2YWw7XG4gICAgdGhpcy5faW50cmFjZWxsdWxhckF2YWlsYWJsZURlbHRhRyA9IHRoaXMuY2FsY3VsYXRlRGVsdGFHKFxuICAgICAgdGhpcy5fYnVmZmVyZWRNZXRhbENvbmNlbnRyYXRpb25cbiAgICApO1xuICB9XG5cbiAgZ2V0IGludHJhY2VsbHVsYXJBdmFpbGFibGVEZWx0YUcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faW50cmFjZWxsdWxhckF2YWlsYWJsZURlbHRhRztcbiAgfVxuXG4gIHNldCBpbnRyYWNlbGx1bGFyQXZhaWxhYmxlRGVsdGFHKHZhbDogbnVtYmVyKSB7XG4gICAgaWYgKHZhbCA8PSAwKVxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJJbnRyYWNlbGx1bGFyIGF2YWlsYWJsZSDiiIZHIG11c3QgYmUgPiAwXCIpO1xuICAgIHRoaXMuX2ludHJhY2VsbHVsYXJBdmFpbGFibGVEZWx0YUcgPSB2YWw7XG4gIH1cblxuICBnZXRQcm9wZXJ0eShrZXk6IGtleW9mIE1ldGFsKSB7XG4gICAgcmV0dXJuIHRoaXNba2V5XTtcbiAgfVxuXG4gIHN3aXRjaE9mZk1ldGFsKCkge1xuICAgIHRoaXMuYWZmaW5pdHkgPSAxMDAwO1xuICAgIHRoaXMuYnVmZmVyZWRNZXRhbENvbmNlbnRyYXRpb24gPSB0aGlzLl9kZWZhdWx0TWV0YWxDb25jZW50cmF0aW9uO1xuICB9XG5cbiAgcmVzZXRWYWx1ZXMoKSB7XG4gICAgdGhpcy5hZmZpbml0eSA9IHRoaXMuX2RlZmF1bHRBZmZpbml0eTtcbiAgICB0aGlzLmJ1ZmZlcmVkTWV0YWxDb25jZW50cmF0aW9uID0gdGhpcy5fZGVmYXVsdE1ldGFsQ29uY2VudHJhdGlvbjtcbiAgfVxufVxuXG5jb25zdCBNRVRBTF9WQUxTOiBBcnJheTxbc3RyaW5nLCBzdHJpbmcsIG51bWJlciwgbnVtYmVyXT4gPSBbXG4gIFtcIk1hZ25lc2l1bVwiLCBcIk1nXCIsIDFlMywgMi43ZS0zXSxcbiAgW1wiTWFuZ2FuZXNlXCIsIFwiTW5cIiwgMWUzLCAyLjZlLTZdLFxuICBbXCJJcm9uXCIsIFwiRmVcIiwgMWUtNiwgNC44ZS04XSxcbiAgW1wiQ29iYWx0XCIsIFwiQ29cIiwgM2UtMTEsIDIuNWUtOV0sXG4gIFtcIk5pY2tlbFwiLCBcIk5pXCIsIDkuOGUtMTAsIDEuOGUtMTNdLFxuICBbXCJDb3BwZXJcIiwgXCJDdVwiLCAyLjRlLTE2LCAxLjJlLTE4XSxcbiAgW1wiWmluY1wiLCBcIlpuXCIsIDEuOWUtMTMsIDEuMTllLTEyXSxcbl07XG5cbmV4cG9ydCBjbGFzcyBNZXRhbERhdGFTZXQge1xuICBtZXRhbHM6IHsgW2lkOiBzdHJpbmddOiBNZXRhbCB9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubWV0YWxzID0ge307XG4gICAgZm9yIChjb25zdCBtIG9mIE1FVEFMX1ZBTFMpIHtcbiAgICAgIHRoaXMubWV0YWxzW21bMV0udG9Mb3dlckNhc2UoKV0gPSBuZXcgTWV0YWwoLi4ubSk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlT2NjdXBhbmN5KCk6IHsgW2lkOiBzdHJpbmddOiBudW1iZXIgfSB7XG4gICAgY29uc3QgZXhwU2NhbGVkRGlmZmVyZW5jZXM6IHsgW2lkOiBzdHJpbmddOiBudW1iZXIgfSA9IHt9O1xuICAgIGxldCB0b3RhbERpZmZzID0gMDtcbiAgICBmb3IgKGNvbnN0IGlkIGluIHRoaXMubWV0YWxzKSB7XG4gICAgICBjb25zdCBtID0gdGhpcy5tZXRhbHNbaWRdO1xuICAgICAgZXhwU2NhbGVkRGlmZmVyZW5jZXNbaWRdID0gTWF0aC5leHAoXG4gICAgICAgICgxMDAwICogKG0uaW50cmFjZWxsdWxhckF2YWlsYWJsZURlbHRhRyAtIG0ubWV0YWxhdGlvbkRlbHRhRykpIC9cbiAgICAgICAgICAoOC4zMTQgKiAyOTguMTUpXG4gICAgICApO1xuICAgICAgdG90YWxEaWZmcyArPSBleHBTY2FsZWREaWZmZXJlbmNlc1tpZF07XG4gICAgfVxuXG4gICAgY29uc3Qgb2NjdXBhbmNpZXM6IHsgW2lkOiBzdHJpbmddOiBudW1iZXIgfSA9IHt9O1xuICAgIGxldCB0b3RhbE9jY3VwYW5jeSA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IGlkIGluIHRoaXMubWV0YWxzKSB7XG4gICAgICBvY2N1cGFuY2llc1tpZF0gPSBleHBTY2FsZWREaWZmZXJlbmNlc1tpZF0gLyAoMSArIHRvdGFsRGlmZnMpO1xuICAgICAgdG90YWxPY2N1cGFuY3kgKz0gb2NjdXBhbmNpZXNbaWRdO1xuICAgIH1cbiAgICBvY2N1cGFuY2llc1tcInRvdGFsXCJdID0gdG90YWxPY2N1cGFuY3k7XG5cbiAgICByZXR1cm4gb2NjdXBhbmNpZXM7XG4gIH1cbn1cbiJdfQ==
