(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalationCalculator = void 0;
var metals = require("./metals");
/**
Clean up text to display more reliably in CSVs
by removing newlines, quotes and delta symbols
and the delta symbol is replaced with the word "Delta"
as excel does not display unicode symbols correctly.
**/
function cleanData(data) {
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
function convertToPlainText(html) {
    // Create a new div element
    var tempDivElement = document.createElement("div");
    // Set the HTML content with the given value
    tempDivElement.innerHTML = html;
    // Retrieve the text property of the element
    return tempDivElement.textContent || tempDivElement.innerText || "";
}
/**
 * An object to create and manipulate a metalation calculator.
 * It should be created with an id for a div that contains the basic HTML layout from calculator.html
 */
var MetalationCalculator = /** @class */ (function () {
    function MetalationCalculator(calculatorID, titleHtmlString, bmcVals, imageDir) {
        var _this = this;
        this.calculatorID = calculatorID;
        this.metalDataSet = new metals.MetalDataSet("");
        if (titleHtmlString) {
            try {
                this.metalDataSet.title = titleHtmlString;
            }
            catch (_a) {
                // Ignore error - title can be empty
            }
        }
        this._calculatorDiv = document.getElementById(calculatorID);
        this._calculatorTable =
            this._calculatorDiv.getElementsByTagName("table")[0];
        this._calculatorDiv.getElementsByTagName("h3")[0].innerHTML =
            this.metalDataSet.title;
        if (imageDir) {
            // Only set image src if it's on the current domain
            var imageDirURL = new URL(imageDir);
            if (imageDirURL.protocol == window.location.protocol &&
                imageDirURL.hostname == window.location.hostname) {
                var imageElement = (this._calculatorDiv.getElementsByClassName("flask-image")[0]);
                imageElement.src = imageDir + "/flask-logo.png";
            }
        }
        // Add rows for each metal
        for (var id in this.metalDataSet.metals) {
            var m = this.metalDataSet.metals[id];
            // Set default BMC values
            if (bmcVals && bmcVals[id]) {
                try {
                    m.defaultMetalConcentration = bmcVals[id];
                    m.bufferedMetalConcentration = bmcVals[id];
                }
                catch (_b) {
                    // Ignore: will use default value
                }
            }
            this.appendMetalTableRow(m);
        }
        this._downloadButton = (this._calculatorDiv.getElementsByClassName("download-btn")[0]);
        this._downloadButton.onclick = function () {
            _this.downloadTableAsCsv();
        };
        this._resetButton = (this._calculatorDiv.getElementsByClassName("reset-btn")[0]);
        this._resetButton.onclick = function () {
            _this.reset();
        };
        this.calculate();
    }
    /**
     * Creates a number input tied to a property of metals.Metal
     * Updates the Metal property when the input value is changed, and displays an error
     * if the new value is invalid.
     * Can also call an additional callback with the metal's idSuffix.
     */
    MetalationCalculator.prototype.createMetalNumberInput = function (prefix, metal, metalPropertyName, additionalOnChange) {
        var _this = this;
        var div = document.createElement("div");
        var input = document.createElement("input");
        var msgP = document.createElement("p");
        msgP.classList.add("error-msg");
        input.value = metal.getProperty(metalPropertyName).toString();
        input.classList.add(prefix);
        input.id = this.calculatorID + "_" + prefix + "_" + metal.idSuffix;
        input.type = "number";
        input.addEventListener("change", function (event) {
            var _a;
            var val = event.target.value;
            try {
                msgP.textContent = "";
                var floatVal = parseFloat(val);
                var m = _this.metalDataSet.metals[metal.idSuffix];
                Object.assign(m, (_a = {}, _a[metalPropertyName] = floatVal, _a));
                if (additionalOnChange)
                    additionalOnChange(metal.idSuffix);
                _this.calculate();
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
                _this.clearCalculation();
            }
        });
        div.append(input);
        div.append(msgP);
        return div;
    };
    /**
     * Adds a label to the given element with a class that will be hidden
     * on large screens (to allow labels to be diplayed when tables are
     * collapsed)
     */
    MetalationCalculator.prototype.addSmallScreenLabel = function (element, innerHTML) {
        var label = document.createElement("p");
        label.innerHTML = innerHTML + ":";
        label.classList.add("small-screen-label");
        element.appendChild(label);
    };
    /**
     * Adds a row to this._calculatorTable for the given metal.
     */
    MetalationCalculator.prototype.appendMetalTableRow = function (metal) {
        var _this = this;
        var row = this._calculatorTable
            .getElementsByTagName("tbody")[0]
            .insertRow();
        var rowHeaders = this._calculatorTable
            .getElementsByTagName("thead")[0]
            .getElementsByTagName("th");
        var toggleButton = document.createElement("input");
        var label = document.createElement("label");
        toggleButton.type = "checkbox";
        toggleButton.classList.add("toggle");
        toggleButton.id = this.calculatorID + "_toggle_" + metal.idSuffix;
        label.htmlFor = this.calculatorID + "_toggle_" + metal.idSuffix;
        var metalCell = document.createElement("th");
        toggleButton.addEventListener("change", function () {
            _this.toggleMetal(toggleButton.checked, metal);
            _this.calculate();
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
        this.addSmallScreenLabel(affinityCell, rowHeaders[0].innerHTML);
        var affinityInput = this.createMetalNumberInput("affinity", metal, "affinity", function (id) {
            var m = _this.metalDataSet.metals[id];
            (document.getElementById(_this.calculatorID + "_metalation_delta_g_" + id)).innerText = m.metalationDeltaG.toFixed(1).toString();
        });
        affinityCell.appendChild(affinityInput);
        var mDeltaGCell = row.insertCell(-1);
        mDeltaGCell.classList.add("grouped", "right-spacing");
        this.addSmallScreenLabel(mDeltaGCell, rowHeaders[1].innerHTML);
        var mDeltaGSpan = document.createElement("span");
        mDeltaGSpan.id =
            this.calculatorID + "_metalation_delta_g_" + metal.idSuffix;
        mDeltaGSpan.innerText = metal.metalationDeltaG.toFixed(1).toString();
        mDeltaGCell.append(mDeltaGSpan);
        var bmcCell = row.insertCell(-1);
        bmcCell.classList.add("bmc", "grouped");
        this.addSmallScreenLabel(bmcCell, rowHeaders[2].innerHTML);
        var bmcInput = this.createMetalNumberInput("bmc", metal, "bufferedMetalConcentration", function (id) {
            var m = _this.metalDataSet.metals[id];
            (document.getElementById(_this.calculatorID + "_ia_delta_g_" + id)).innerText = m.intracellularAvailableDeltaG.toFixed(1).toString();
        });
        bmcCell.appendChild(bmcInput);
        var iaDeltaGCell = row.insertCell(-1);
        iaDeltaGCell.classList.add("grouped");
        this.addSmallScreenLabel(iaDeltaGCell, rowHeaders[3].innerHTML);
        var iaDeltaGSpan = document.createElement("span");
        iaDeltaGSpan.id = this.calculatorID + "_ia_delta_g_" + metal.idSuffix;
        iaDeltaGSpan.innerText = metal.intracellularAvailableDeltaG
            .toFixed(1)
            .toString();
        iaDeltaGCell.append(iaDeltaGSpan);
        var resultCell = row.insertCell(-1);
        this.addSmallScreenLabel(resultCell, rowHeaders[4].innerHTML);
        var resultSpan = document.createElement("span");
        resultSpan.classList.add("result");
        resultSpan.id = this.calculatorID + "_result_" + metal.idSuffix;
        resultCell.append(resultSpan);
    };
    /**
     * Clears the current calculation values and disables the download button.
     * To be called when a value is invalid.
     */
    MetalationCalculator.prototype.clearCalculation = function () {
        Array.from(this._calculatorTable.getElementsByClassName("result")).forEach(function (cell) {
            cell.innerHTML = "N/A";
        });
        this._downloadButton.disabled = true;
    };
    /**
     * Calculates the metalation values and updates the results column
     */
    MetalationCalculator.prototype.calculate = function () {
        var results = this.metalDataSet.calculateOccupancy();
        for (var id in this.metalDataSet.metals) {
            var r = results[id];
            var resultCell = (document.getElementById(this.calculatorID + "_result_" + id));
            resultCell.innerHTML = (r * 100).toFixed(2).toString() + "%";
        }
        var totalCell = (this._calculatorDiv.getElementsByClassName("total-metalation")[0]);
        totalCell.innerHTML = (results["total"] * 100).toFixed(2).toString() + "%";
        this._downloadButton.disabled = false;
    };
    /**
     * Resets the calculator to its initial state
     */
    MetalationCalculator.prototype.reset = function () {
        for (var id in this.metalDataSet.metals) {
            var m = this.metalDataSet.metals[id];
            document.getElementById(this.calculatorID + "_toggle_" + m.idSuffix).checked = false;
            m.resetValues();
            this.toggleMetal(false, m);
        }
        this.calculate();
    };
    /**
     * Toggles a metal row on or off to disable/enable that metal
     */
    MetalationCalculator.prototype.toggleMetal = function (willTurnOff, metal) {
        document.getElementById(this.calculatorID + "_affinity_" + metal.idSuffix).disabled = willTurnOff;
        document.getElementById(this.calculatorID + "_bmc_" + metal.idSuffix).disabled = willTurnOff;
        if (willTurnOff) {
            metal.switchOffMetal();
        }
        else {
            metal.resetValues();
        }
        this.updateRow(metal);
    };
    /**
     * Updates a row with the current values of the given metal
     */
    MetalationCalculator.prototype.updateRow = function (metal) {
        var id = metal.idSuffix;
        (document.getElementById(this.calculatorID + "_affinity_" + id)).value = metal.affinity.toString();
        document.getElementById(this.calculatorID + "_metalation_delta_g_" + id).innerText = metal.metalationDeltaG.toFixed(1).toString();
        (document.getElementById(this.calculatorID + "_bmc_" + id)).value = metal.bufferedMetalConcentration.toString();
        document.getElementById(this.calculatorID + "_ia_delta_g_" + id).innerText =
            metal.intracellularAvailableDeltaG.toFixed(1).toString();
    };
    /**
     * Downloads the table as a CSV
     */
    MetalationCalculator.prototype.downloadTableAsCsv = function (separator) {
        if (separator === void 0) { separator = ","; }
        // Construct csv from metal data
        var csv = [];
        var occupancies = this.metalDataSet.calculateOccupancy();
        for (var id in this.metalDataSet.metals) {
            var m = this.metalDataSet.metals[id];
            var data = [
                m.symbol,
                m.affinity,
                m.metalationDeltaG.toFixed(1),
                m.bufferedMetalConcentration,
                m.intracellularAvailableDeltaG.toFixed(1),
                (occupancies[id] * 100).toFixed(2).toString() + "%",
            ];
            csv.push(data.join(separator));
        }
        csv.push([
            "Total Metalation",
            "",
            "",
            "",
            "",
            (occupancies["total"] * 100).toFixed(2).toString() + "%",
        ]);
        // Extract user-friendly headings and explanations from table
        var rows = this._calculatorTable.rows;
        var explanation = [];
        var headings = rows[0].cells;
        var csvHeaders = [""];
        for (var k = 0; k < headings.length; k++) {
            // Ensure header cell is visible so innerText does not include tooltip
            var headingDisplay = headings[k].style.display;
            headings[k].style.display = "table-cell";
            var tooltips = headings[k].getElementsByClassName("tooltiptext");
            if (tooltips.length > 0) {
                var detailText = tooltips[0].innerHTML;
                detailText = cleanData(detailText);
                detailText = convertToPlainText(detailText);
                var detailTextTitle = headings[k].innerText;
                detailTextTitle = cleanData(detailTextTitle);
                if (!detailTextTitle) {
                    // Quick fix for Safari where the headingDisplay trick doesn't work
                    detailTextTitle = detailText;
                }
                else {
                    // Only add the explanation if header is not the full detail
                    explanation.push('"# ' + detailTextTitle + " = " + detailText + '"');
                }
                csvHeaders.push('"' + detailTextTitle + '"');
            }
            // Reset cell display
            headings[k].style.display = headingDisplay;
        }
        // Add main headings to top, explanations to bottom
        csv.unshift(csvHeaders.join(separator));
        csv.push(explanation.join("\n"));
        var csvString = csv.join("\n");
        // Download it
        var filename = "export_" +
            convertToPlainText(this.metalDataSet.title).replaceAll(" ", "_") +
            "_" +
            new Date().toLocaleDateString() +
            ".csv";
        var link = document.createElement("a");
        link.style.display = "none";
        link.setAttribute("target", "_blank");
        link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvString));
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return MetalationCalculator;
}());
exports.MetalationCalculator = MetalationCalculator;

},{"./metals":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var calculator_1 = require("./calculator");
/**
This method is used to hide the instuctions paragraph for more than one
instances of the calculator.
**/
function hideParagraphCopies() {
    var paragraphs = Array.from(document.getElementsByTagName("p")).filter(function (e) { return e.className === "metalation-calculator-intro"; });
    if (paragraphs.length > 1) {
        // set the display of the into paragrapghs to none except the first one
        for (var x = 1; x < paragraphs.length; x++) {
            paragraphs[x].style.display = "none";
        }
    }
}
window.setupCalculator = function (calculatorID, titleHtmlString, bmcVals, imageDir) {
    new calculator_1.MetalationCalculator(calculatorID, titleHtmlString, bmcVals, imageDir);
};
window.addEventListener("DOMContentLoaded", function () {
    hideParagraphCopies();
});

},{"./calculator":1}],3:[function(require,module,exports){
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
            throw new RangeError(fieldName + " must be a valid number");
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
    Object.defineProperty(Metal.prototype, "defaultMetalConcentration", {
        set: function (val) {
            this.checkRange(val, "Default buffered metal concentration");
            this._defaultMetalConcentration = val;
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
    function MetalDataSet(title) {
        this.title = title;
        this.metals = {};
        for (var _i = 0, METAL_VALS_1 = METAL_VALS; _i < METAL_VALS_1.length; _i++) {
            var m = METAL_VALS_1[_i];
            this.metals[m[1].toLowerCase()] = new (Metal.bind.apply(Metal, __spreadArray([void 0], m, false)))();
        }
    }
    Object.defineProperty(MetalDataSet.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (val) {
            // Check title doesn't contain any HTML tags apart from <em>
            var tempElement = document.createElement("div");
            tempElement.innerHTML = val;
            if (tempElement.innerText != val) {
                // There are HTML tags in provided title, so check for <em>
                Array.from(tempElement.children).forEach(function (element) {
                    if (element.tagName != "EM") {
                        throw new Error("Invalid HTML string " + val);
                    }
                });
            }
            this._title = val;
        },
        enumerable: false,
        configurable: true
    });
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

},{}]},{},[2,3,1]);