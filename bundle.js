(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metals = require("./metals");
function createMetalNumberInput(prefix, metal, metalPropertyName, additionalOnChange) {
    var div = document.createElement("div");
    var input = document.createElement("input");
    var msg_p = document.createElement("p");
    msg_p.classList.add("error_msg");
    input.value = metal.getProperty(metalPropertyName).toString();
    input.classList.add(prefix);
    input.id = prefix + "_" + metal.id_suffix;
    input.type = "number";
    input.addEventListener("change", function (event) {
        var _a;
        var val = event.target.value;
        try {
            msg_p.textContent = "";
            var floatVal = parseFloat(val);
            var m = metals.all_metals[metal.id_suffix];
            Object.assign(m, (_a = {}, _a[metalPropertyName] = floatVal, _a));
            if (additionalOnChange)
                additionalOnChange(metal.id_suffix);
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
            msg_p.textContent = msg;
            clearCalculation();
        }
    });
    div.append(input);
    div.append(msg_p);
    return div;
}
function appendMetalTableRow(metal, table) {
    var row = table.insertRow(table.rows.length - 1);
    row.insertCell(-1).outerHTML = "<th>" + metal.symbol + "</th>";
    var affinity_cell = row.insertCell(-1);
    affinity_cell.classList.add("affinity");
    var affinity_input = createMetalNumberInput("affinity", metal, "affinity", function (id) {
        var m = metals.all_metals[id];
        (document.getElementById("metalation_delta_g_" + id)).innerText = m.metalation_delta_G.toFixed(1).toString();
    });
    affinity_cell.appendChild(affinity_input);
    var m_delta_g_cell = row.insertCell(-1);
    m_delta_g_cell.id = "metalation_delta_g_" + metal.id_suffix;
    m_delta_g_cell.innerText = metal.metalation_delta_G.toFixed(1).toString();
    var bmc_cell = row.insertCell(-1);
    bmc_cell.classList.add("bmc");
    var bmc_input = createMetalNumberInput("bmc", metal, "buffered_metal_concentration", function (id) {
        var m = metals.all_metals[id];
        (document.getElementById("ia_delta_g_" + id)).innerText = m.intracellular_available_delta_G.toFixed(1).toString();
    });
    bmc_cell.appendChild(bmc_input);
    var ia_delta_g_cell = row.insertCell(-1);
    ia_delta_g_cell.id = "ia_delta_g_" + metal.id_suffix;
    ia_delta_g_cell.innerText = metal.intracellular_available_delta_G
        .toFixed(1)
        .toString();
    var result_cell = row.insertCell(-1);
    result_cell.classList.add("result");
    result_cell.id = "result_" + metal.id_suffix;
}
function calculate() {
    var results = metals.calculateOccupancy();
    for (var id in metals.all_metals) {
        var r = results[id];
        var result_cell = (document.getElementById("result_" + id));
        result_cell.innerHTML = (r * 100).toFixed(2).toString() + "%";
    }
    var total_cell = (document.getElementById("total_metalation"));
    total_cell.innerHTML = (results["total"] * 100).toFixed(2).toString() + "%";
    document.getElementById("download_btn").disabled = false;
}
function clearCalculation() {
    Array.from(document.getElementsByClassName("result")).forEach(function (cell) {
        cell.innerHTML = "N/A";
    });
    document.getElementById("download_btn").disabled = true;
}
// Quick and simple export target #table_id into a csv
function downloadTableAsCsv(table_id, separator) {
    if (separator === void 0) { separator = ","; }
    // Select rows from table_id
    var rows = document.querySelectorAll("table#" + table_id + " tr");
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
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    var csv_string = csv.join("\n");
    // Download it
    var filename = "export_" + table_id + "_" + new Date().toLocaleDateString() + ".csv";
    var link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv_string));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
window.addEventListener("DOMContentLoaded", function () {
    var metal_table = (document.getElementById("metalation_table"));
    for (var id in metals.all_metals) {
        var m = metals.all_metals[id];
        appendMetalTableRow(m, metal_table);
    }
    document.getElementById("download_btn").onclick = function () {
        downloadTableAsCsv("metalation_table");
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
exports.calculateOccupancy = exports.all_metals = exports.Metal = void 0;
var Metal = /** @class */ (function () {
    function Metal(name, symbol, affinity, concentration) {
        this.name = name;
        this.symbol = symbol;
        this.affinity = affinity;
        this.buffered_metal_concentration = concentration;
        this.id_suffix = symbol.toLowerCase();
    }
    Metal.prototype.calculateDeltaG = function (mole_value) {
        return (8.314 * 298.15 * Math.log(mole_value)) / 1000;
    };
    Metal.prototype.checkRange = function (val, field_name) {
        if (isNaN(val))
            throw new RangeError(field_name + " must be set");
        if (val < 1e-30 || val > 1000) {
            throw new RangeError(field_name + " must be between 1e-30 and 1000");
        }
    };
    Object.defineProperty(Metal.prototype, "affinity", {
        get: function () {
            return this._affinity;
        },
        set: function (val) {
            this.checkRange(val, "Affinity");
            this._affinity = val;
            this._metalation_delta_G = this.calculateDeltaG(this._affinity);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Metal.prototype, "metalation_delta_G", {
        get: function () {
            return this._metalation_delta_G;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Metal.prototype, "buffered_metal_concentration", {
        get: function () {
            return this._buffered_metal_concentration;
        },
        set: function (val) {
            this.checkRange(val, "Buffered metal concentration");
            this._buffered_metal_concentration = val;
            this._intracellular_available_delta_G = this.calculateDeltaG(this._buffered_metal_concentration);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Metal.prototype, "intracellular_available_delta_G", {
        get: function () {
            return this._intracellular_available_delta_G;
        },
        set: function (val) {
            if (val <= 0)
                throw new RangeError("Intracellular available ∆G must be > 0");
            this._intracellular_available_delta_G = val;
        },
        enumerable: false,
        configurable: true
    });
    Metal.prototype.getProperty = function (key) {
        return this[key];
    };
    return Metal;
}());
exports.Metal = Metal;
var metal_vals = [
    ["Magnesium", "Mg", 1e3, 2.7e-3],
    ["Manganese", "Mn", 1e3, 2.6e-6],
    ["Iron", "Fe", 1e-6, 4.8e-8],
    ["Cobalt", "Co", 3e-11, 2.5e-9],
    ["Nickel", "Ni", 9.8e-10, 1.8e-13],
    ["Copper", "Cu", 2.4e-16, 1.2e-18],
    ["Zinc", "Zn", 1.9e-13, 1.19e-12],
];
exports.all_metals = {};
for (var _i = 0, metal_vals_1 = metal_vals; _i < metal_vals_1.length; _i++) {
    var m = metal_vals_1[_i];
    exports.all_metals[m[1].toLowerCase()] = new (Metal.bind.apply(Metal, __spreadArray([void 0], m, false)))();
}
function calculateOccupancy() {
    var exp_scaled_differences = {};
    var total_diffs = 0;
    for (var id in exports.all_metals) {
        var m = exports.all_metals[id];
        exp_scaled_differences[id] = Math.exp((1000 * (m.intracellular_available_delta_G - m.metalation_delta_G)) /
            (8.314 * 298.15));
        total_diffs += exp_scaled_differences[id];
    }
    var occupancies = {};
    var total_occupancy = 0;
    for (var id in exports.all_metals) {
        occupancies[id] = exp_scaled_differences[id] / (1 + total_diffs);
        total_occupancy += occupancies[id];
    }
    occupancies["total"] = total_occupancy;
    return occupancies;
}
exports.calculateOccupancy = calculateOccupancy;

},{}]},{},[1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyIsInNyYy9tZXRhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLGlDQUFtQztBQUVuQyxTQUFTLHNCQUFzQixDQUM3QixNQUFjLEVBQ2QsS0FBbUIsRUFDbkIsaUJBQXFDLEVBQ3JDLGtCQUF3QztJQUV4QyxJQUFNLEdBQUcsR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRCxJQUFNLEtBQUssR0FBcUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRSxJQUFNLEtBQUssR0FBeUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoRSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM5RCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixLQUFLLENBQUMsRUFBRSxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztJQUMxQyxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztJQUN0QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVUsS0FBSzs7UUFDOUMsSUFBTSxHQUFHLEdBQXNCLEtBQUssQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDO1FBQ25ELElBQUk7WUFDRixLQUFLLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN2QixJQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsSUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMs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QUFDLG1CQUFBO0lBQ1Ysa0JBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBTyxLQUFLLFlBQUwsS0FBSywwQkFBSSxDQUFDLFlBQUMsQ0FBQztDQUNsRDtBQUVELFNBQWdCLGtCQUFrQjtJQUNoQyxJQUFNLHNCQUFzQixHQUE2QixFQUFFLENBQUM7SUFDNUQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLEtBQUssSUFBTSxFQUFFLElBQUksa0JBQVUsRUFBRTtRQUMzQixJQUFNLENBQUMsR0FBRyxrQkFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ25DLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLCtCQUErQixHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2pFLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUNuQixDQUFDO1FBQ0YsV0FBVyxJQUFJLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNDO0lBRUQsSUFBTSxXQUFXLEdBQTZCLEVBQUUsQ0FBQztJQUNqRCxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUM7SUFFeEIsS0FBSyxJQUFNLEVBQUUsSUFBSSxrQkFBVSxFQUFFO1FBQzNCLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUNqRSxlQUFlLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0lBQ0QsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLGVBQWUsQ0FBQztJQUV2QyxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDO0FBdEJELGdEQXNCQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCAqIGFzIG1ldGFscyBmcm9tIFwiLi9tZXRhbHNcIjtcblxuZnVuY3Rpb24gY3JlYXRlTWV0YWxOdW1iZXJJbnB1dChcbiAgcHJlZml4OiBzdHJpbmcsXG4gIG1ldGFsOiBtZXRhbHMuTWV0YWwsXG4gIG1ldGFsUHJvcGVydHlOYW1lOiBrZXlvZiBtZXRhbHMuTWV0YWwsXG4gIGFkZGl0aW9uYWxPbkNoYW5nZTogKGlkOiBzdHJpbmcpID0+IHZvaWRcbikge1xuICBjb25zdCBkaXYgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgY29uc3QgaW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gIGNvbnN0IG1zZ19wID0gPEhUTUxQYXJhZ3JhcGhFbGVtZW50PmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICBtc2dfcC5jbGFzc0xpc3QuYWRkKFwiZXJyb3JfbXNnXCIpO1xuICBpbnB1dC52YWx1ZSA9IG1ldGFsLmdldFByb3BlcnR5KG1ldGFsUHJvcGVydHlOYW1lKS50b1N0cmluZygpO1xuICBpbnB1dC5jbGFzc0xpc3QuYWRkKHByZWZpeCk7XG4gIGlucHV0LmlkID0gcHJlZml4ICsgXCJfXCIgKyBtZXRhbC5pZF9zdWZmaXg7XG4gIGlucHV0LnR5cGUgPSBcIm51bWJlclwiO1xuICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGNvbnN0IHZhbCA9ICg8SFRNTElucHV0RWxlbWVudD5ldmVudC50YXJnZXQpLnZhbHVlO1xuICAgIHRyeSB7XG4gICAgICBtc2dfcC50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICBjb25zdCBmbG9hdFZhbCA9IHBhcnNlRmxvYXQodmFsKTtcbiAgICAgIGNvbnN0IG0gPSBtZXRhbHMuYWxsX21ldGFsc1ttZXRhbC5pZF9zdWZmaXhdO1xuICAgICAgT2JqZWN0LmFzc2lnbihtLCB7IFttZXRhbFByb3BlcnR5TmFtZV06IGZsb2F0VmFsIH0pO1xuICAgICAgaWYgKGFkZGl0aW9uYWxPbkNoYW5nZSkgYWRkaXRpb25hbE9uQ2hhbmdlKG1ldGFsLmlkX3N1ZmZpeCk7XG4gICAgICBjYWxjdWxhdGUoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsZXQgbXNnO1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBSYW5nZUVycm9yKSB7XG4gICAgICAgIG1zZyA9IGUubWVzc2FnZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1zZyA9IFwiSW52YWxpZCB2YWx1ZSBcIiArIGlucHV0LnZhbHVlO1xuICAgICAgfVxuICAgICAgbXNnX3AudGV4dENvbnRlbnQgPSBtc2c7XG4gICAgICBjbGVhckNhbGN1bGF0aW9uKCk7XG4gICAgfVxuICB9KTtcbiAgZGl2LmFwcGVuZChpbnB1dCk7XG4gIGRpdi5hcHBlbmQobXNnX3ApO1xuICByZXR1cm4gZGl2O1xufVxuXG5mdW5jdGlvbiBhcHBlbmRNZXRhbFRhYmxlUm93KG1ldGFsOiBtZXRhbHMuTWV0YWwsIHRhYmxlOiBIVE1MVGFibGVFbGVtZW50KSB7XG4gIGNvbnN0IHJvdzogSFRNTFRhYmxlUm93RWxlbWVudCA9IHRhYmxlLmluc2VydFJvdyh0YWJsZS5yb3dzLmxlbmd0aCAtIDEpO1xuXG4gIHJvdy5pbnNlcnRDZWxsKC0xKS5vdXRlckhUTUwgPSBcIjx0aD5cIiArIG1ldGFsLnN5bWJvbCArIFwiPC90aD5cIjtcblxuICBjb25zdCBhZmZpbml0eV9jZWxsOiBIVE1MVGFibGVDZWxsRWxlbWVudCA9IHJvdy5pbnNlcnRDZWxsKC0xKTtcbiAgYWZmaW5pdHlfY2VsbC5jbGFzc0xpc3QuYWRkKFwiYWZmaW5pdHlcIik7XG4gIGNvbnN0IGFmZmluaXR5X2lucHV0ID0gY3JlYXRlTWV0YWxOdW1iZXJJbnB1dChcbiAgICBcImFmZmluaXR5XCIsXG4gICAgbWV0YWwsXG4gICAgXCJhZmZpbml0eVwiLFxuICAgIGZ1bmN0aW9uIChpZCkge1xuICAgICAgY29uc3QgbSA9IG1ldGFscy5hbGxfbWV0YWxzW2lkXTtcbiAgICAgICg8SFRNTFRhYmxlQ2VsbEVsZW1lbnQ+KFxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1ldGFsYXRpb25fZGVsdGFfZ19cIiArIGlkKVxuICAgICAgKSkuaW5uZXJUZXh0ID0gbS5tZXRhbGF0aW9uX2RlbHRhX0cudG9GaXhlZCgxKS50b1N0cmluZygpO1xuICAgIH1cbiAgKTtcbiAgYWZmaW5pdHlfY2VsbC5hcHBlbmRDaGlsZChhZmZpbml0eV9pbnB1dCk7XG5cbiAgY29uc3QgbV9kZWx0YV9nX2NlbGw6IEhUTUxUYWJsZUNlbGxFbGVtZW50ID0gcm93Lmluc2VydENlbGwoLTEpO1xuICBtX2RlbHRhX2dfY2VsbC5pZCA9IFwibWV0YWxhdGlvbl9kZWx0YV9nX1wiICsgbWV0YWwuaWRfc3VmZml4O1xuICBtX2RlbHRhX2dfY2VsbC5pbm5lclRleHQgPSBtZXRhbC5tZXRhbGF0aW9uX2RlbHRhX0cudG9GaXhlZCgxKS50b1N0cmluZygpO1xuXG4gIGNvbnN0IGJtY19jZWxsOiBIVE1MVGFibGVDZWxsRWxlbWVudCA9IHJvdy5pbnNlcnRDZWxsKC0xKTtcbiAgYm1jX2NlbGwuY2xhc3NMaXN0LmFkZChcImJtY1wiKTtcbiAgY29uc3QgYm1jX2lucHV0ID0gY3JlYXRlTWV0YWxOdW1iZXJJbnB1dChcbiAgICBcImJtY1wiLFxuICAgIG1ldGFsLFxuICAgIFwiYnVmZmVyZWRfbWV0YWxfY29uY2VudHJhdGlvblwiLFxuICAgIGZ1bmN0aW9uIChpZCkge1xuICAgICAgY29uc3QgbSA9IG1ldGFscy5hbGxfbWV0YWxzW2lkXTtcbiAgICAgICg8SFRNTElucHV0RWxlbWVudD4oXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWFfZGVsdGFfZ19cIiArIGlkKVxuICAgICAgKSkuaW5uZXJUZXh0ID0gbS5pbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HLnRvRml4ZWQoMSkudG9TdHJpbmcoKTtcbiAgICB9XG4gICk7XG5cbiAgYm1jX2NlbGwuYXBwZW5kQ2hpbGQoYm1jX2lucHV0KTtcblxuICBjb25zdCBpYV9kZWx0YV9nX2NlbGw6IEhUTUxUYWJsZUNlbGxFbGVtZW50ID0gcm93Lmluc2VydENlbGwoLTEpO1xuICBpYV9kZWx0YV9nX2NlbGwuaWQgPSBcImlhX2RlbHRhX2dfXCIgKyBtZXRhbC5pZF9zdWZmaXg7XG4gIGlhX2RlbHRhX2dfY2VsbC5pbm5lclRleHQgPSBtZXRhbC5pbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HXG4gICAgLnRvRml4ZWQoMSlcbiAgICAudG9TdHJpbmcoKTtcblxuICBjb25zdCByZXN1bHRfY2VsbDogSFRNTFRhYmxlQ2VsbEVsZW1lbnQgPSByb3cuaW5zZXJ0Q2VsbCgtMSk7XG4gIHJlc3VsdF9jZWxsLmNsYXNzTGlzdC5hZGQoXCJyZXN1bHRcIik7XG4gIHJlc3VsdF9jZWxsLmlkID0gXCJyZXN1bHRfXCIgKyBtZXRhbC5pZF9zdWZmaXg7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZSgpIHtcbiAgY29uc3QgcmVzdWx0cyA9IG1ldGFscy5jYWxjdWxhdGVPY2N1cGFuY3koKTtcblxuICBmb3IgKGNvbnN0IGlkIGluIG1ldGFscy5hbGxfbWV0YWxzKSB7XG4gICAgY29uc3QgciA9IHJlc3VsdHNbaWRdO1xuICAgIGNvbnN0IHJlc3VsdF9jZWxsID0gPEhUTUxUYWJsZUNlbGxFbGVtZW50PihcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0X1wiICsgaWQpXG4gICAgKTtcbiAgICByZXN1bHRfY2VsbC5pbm5lckhUTUwgPSAociAqIDEwMCkudG9GaXhlZCgyKS50b1N0cmluZygpICsgXCIlXCI7XG4gIH1cblxuICBjb25zdCB0b3RhbF9jZWxsID0gPEhUTUxUYWJsZUNlbGxFbGVtZW50PihcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvdGFsX21ldGFsYXRpb25cIilcbiAgKTtcbiAgdG90YWxfY2VsbC5pbm5lckhUTUwgPSAocmVzdWx0c1tcInRvdGFsXCJdICogMTAwKS50b0ZpeGVkKDIpLnRvU3RyaW5nKCkgKyBcIiVcIjtcblxuICAoPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG93bmxvYWRfYnRuXCIpKS5kaXNhYmxlZCA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjbGVhckNhbGN1bGF0aW9uKCkge1xuICBBcnJheS5mcm9tKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJyZXN1bHRcIikpLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICBjZWxsLmlubmVySFRNTCA9IFwiTi9BXCI7XG4gIH0pO1xuICAoPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG93bmxvYWRfYnRuXCIpKS5kaXNhYmxlZCA9IHRydWU7XG59XG5cbi8vIFF1aWNrIGFuZCBzaW1wbGUgZXhwb3J0IHRhcmdldCAjdGFibGVfaWQgaW50byBhIGNzdlxuZnVuY3Rpb24gZG93bmxvYWRUYWJsZUFzQ3N2KHRhYmxlX2lkOiBzdHJpbmcsIHNlcGFyYXRvciA9IFwiLFwiKSB7XG4gIC8vIFNlbGVjdCByb3dzIGZyb20gdGFibGVfaWRcbiAgY29uc3Qgcm93cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0YWJsZSNcIiArIHRhYmxlX2lkICsgXCIgdHJcIik7XG4gIC8vIENvbnN0cnVjdCBjc3ZcbiAgY29uc3QgY3N2ID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJvdyA9IFtdO1xuICAgIGNvbnN0IGNvbHMgPSA8Tm9kZUxpc3RPZjxIVE1MVGFibGVDZWxsRWxlbWVudD4+KFxuICAgICAgcm93c1tpXS5xdWVyeVNlbGVjdG9yQWxsKFwidGQsIHRoXCIpXG4gICAgKTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNvbHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIC8vIENsZWFuIGlubmVydGV4dCB0byByZW1vdmUgbXVsdGlwbGUgc3BhY2VzIGFuZCBqdW1wbGluZSAoYnJlYWsgY3N2KVxuICAgICAgbGV0IGRhdGE7XG4gICAgICBjb25zdCBpbnB1dHMgPSBjb2xzW2pdLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW5wdXRcIik7XG4gICAgICBpZiAoaW5wdXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGF0YSA9IGlucHV0c1swXS52YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGEgPSBjb2xzW2pdLmlubmVyVGV4dDtcbiAgICAgIH1cbiAgICAgIC8vIFJlbW92ZSBsaW5lIGJyZWFrcyBhbmQgZXNjYXBlIGRvdWJsZS1xdW90ZSB3aXRoIGRvdWJsZS1kb3VibGUtcXVvdGVcbiAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sIFwiXCIpLnJlcGxhY2UoLyhcXHNcXHMpL2dtLCBcIiBcIik7XG4gICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpO1xuICAgICAgLy8gUHVzaCBlc2NhcGVkIHN0cmluZ1xuICAgICAgcm93LnB1c2goJ1wiJyArIGRhdGEgKyAnXCInKTtcbiAgICB9XG4gICAgY3N2LnB1c2gocm93LmpvaW4oc2VwYXJhdG9yKSk7XG4gIH1cbiAgY29uc3QgY3N2X3N0cmluZyA9IGNzdi5qb2luKFwiXFxuXCIpO1xuICAvLyBEb3dubG9hZCBpdFxuICBjb25zdCBmaWxlbmFtZSA9XG4gICAgXCJleHBvcnRfXCIgKyB0YWJsZV9pZCArIFwiX1wiICsgbmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoKSArIFwiLmNzdlwiO1xuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gIGxpbmsuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICBsaW5rLnNldEF0dHJpYnV0ZShcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcbiAgbGluay5zZXRBdHRyaWJ1dGUoXG4gICAgXCJocmVmXCIsXG4gICAgXCJkYXRhOnRleHQvY3N2O2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQoY3N2X3N0cmluZylcbiAgKTtcbiAgbGluay5zZXRBdHRyaWJ1dGUoXCJkb3dubG9hZFwiLCBmaWxlbmFtZSk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gIGxpbmsuY2xpY2soKTtcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgY29uc3QgbWV0YWxfdGFibGUgPSA8SFRNTFRhYmxlRWxlbWVudD4oXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZXRhbGF0aW9uX3RhYmxlXCIpXG4gICk7XG4gIGZvciAoY29uc3QgaWQgaW4gbWV0YWxzLmFsbF9tZXRhbHMpIHtcbiAgICBjb25zdCBtID0gbWV0YWxzLmFsbF9tZXRhbHNbaWRdO1xuICAgIGFwcGVuZE1ldGFsVGFibGVSb3cobSwgbWV0YWxfdGFibGUpO1xuICB9XG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkb3dubG9hZF9idG5cIikub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICBkb3dubG9hZFRhYmxlQXNDc3YoXCJtZXRhbGF0aW9uX3RhYmxlXCIpO1xuICB9O1xuXG4gIGNhbGN1bGF0ZSgpO1xufSk7XG4iLCJleHBvcnQgY2xhc3MgTWV0YWwge1xuICBuYW1lOiBzdHJpbmc7XG4gIHN5bWJvbDogc3RyaW5nO1xuICBfYWZmaW5pdHk6IG51bWJlcjtcbiAgX21ldGFsYXRpb25fZGVsdGFfRzogbnVtYmVyO1xuICBfYnVmZmVyZWRfbWV0YWxfY29uY2VudHJhdGlvbjogbnVtYmVyO1xuICBfaW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRzogbnVtYmVyO1xuICBpZF9zdWZmaXg6IHN0cmluZztcbiAgdmFsaWRhdG9yOiB0eXBlb2YgUHJveHk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN5bWJvbDogc3RyaW5nLFxuICAgIGFmZmluaXR5OiBudW1iZXIsXG4gICAgY29uY2VudHJhdGlvbjogbnVtYmVyXG4gICkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zeW1ib2wgPSBzeW1ib2w7XG4gICAgdGhpcy5hZmZpbml0eSA9IGFmZmluaXR5O1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0YWxfY29uY2VudHJhdGlvbiA9IGNvbmNlbnRyYXRpb247XG4gICAgdGhpcy5pZF9zdWZmaXggPSBzeW1ib2wudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZURlbHRhRyhtb2xlX3ZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiAoOC4zMTQgKiAyOTguMTUgKiBNYXRoLmxvZyhtb2xlX3ZhbHVlKSkgLyAxMDAwO1xuICB9XG5cbiAgY2hlY2tSYW5nZSh2YWw6IG51bWJlciwgZmllbGRfbmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKGlzTmFOKHZhbCkpIHRocm93IG5ldyBSYW5nZUVycm9yKGZpZWxkX25hbWUgKyBcIiBtdXN0IGJlIHNldFwiKTtcbiAgICBpZiAodmFsIDwgMWUtMzAgfHwgdmFsID4gMTAwMCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoZmllbGRfbmFtZSArIFwiIG11c3QgYmUgYmV0d2VlbiAxZS0zMCBhbmQgMTAwMFwiKTtcbiAgICB9XG4gIH1cblxuICBnZXQgYWZmaW5pdHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYWZmaW5pdHk7XG4gIH1cblxuICBzZXQgYWZmaW5pdHkodmFsOiBudW1iZXIpIHtcbiAgICB0aGlzLmNoZWNrUmFuZ2UodmFsLCBcIkFmZmluaXR5XCIpO1xuICAgIHRoaXMuX2FmZmluaXR5ID0gdmFsO1xuICAgIHRoaXMuX21ldGFsYXRpb25fZGVsdGFfRyA9IHRoaXMuY2FsY3VsYXRlRGVsdGFHKHRoaXMuX2FmZmluaXR5KTtcbiAgfVxuXG4gIGdldCBtZXRhbGF0aW9uX2RlbHRhX0coKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWV0YWxhdGlvbl9kZWx0YV9HO1xuICB9XG5cbiAgZ2V0IGJ1ZmZlcmVkX21ldGFsX2NvbmNlbnRyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYnVmZmVyZWRfbWV0YWxfY29uY2VudHJhdGlvbjtcbiAgfVxuXG4gIHNldCBidWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uKHZhbDogbnVtYmVyKSB7XG4gICAgdGhpcy5jaGVja1JhbmdlKHZhbCwgXCJCdWZmZXJlZCBtZXRhbCBjb25jZW50cmF0aW9uXCIpO1xuICAgIHRoaXMuX2J1ZmZlcmVkX21ldGFsX2NvbmNlbnRyYXRpb24gPSB2YWw7XG4gICAgdGhpcy5faW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRyA9IHRoaXMuY2FsY3VsYXRlRGVsdGFHKFxuICAgICAgdGhpcy5fYnVmZmVyZWRfbWV0YWxfY29uY2VudHJhdGlvblxuICAgICk7XG4gIH1cblxuICBnZXQgaW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HO1xuICB9XG5cbiAgc2V0IGludHJhY2VsbHVsYXJfYXZhaWxhYmxlX2RlbHRhX0codmFsOiBudW1iZXIpIHtcbiAgICBpZiAodmFsIDw9IDApXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIkludHJhY2VsbHVsYXIgYXZhaWxhYmxlIOKIhkcgbXVzdCBiZSA+IDBcIik7XG4gICAgdGhpcy5faW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRyA9IHZhbDtcbiAgfVxuXG4gIGdldFByb3BlcnR5KGtleToga2V5b2YgTWV0YWwpIHtcbiAgICByZXR1cm4gdGhpc1trZXldO1xuICB9XG59XG5cbmNvbnN0IG1ldGFsX3ZhbHM6IEFycmF5PFtzdHJpbmcsIHN0cmluZywgbnVtYmVyLCBudW1iZXJdPiA9IFtcbiAgW1wiTWFnbmVzaXVtXCIsIFwiTWdcIiwgMWUzLCAyLjdlLTNdLFxuICBbXCJNYW5nYW5lc2VcIiwgXCJNblwiLCAxZTMsIDIuNmUtNl0sXG4gIFtcIklyb25cIiwgXCJGZVwiLCAxZS02LCA0LjhlLThdLFxuICBbXCJDb2JhbHRcIiwgXCJDb1wiLCAzZS0xMSwgMi41ZS05XSxcbiAgW1wiTmlja2VsXCIsIFwiTmlcIiwgOS44ZS0xMCwgMS44ZS0xM10sXG4gIFtcIkNvcHBlclwiLCBcIkN1XCIsIDIuNGUtMTYsIDEuMmUtMThdLFxuICBbXCJaaW5jXCIsIFwiWm5cIiwgMS45ZS0xMywgMS4xOWUtMTJdLFxuXTtcblxuZXhwb3J0IGNvbnN0IGFsbF9tZXRhbHM6IHsgW2lkOiBzdHJpbmddOiBNZXRhbCB9ID0ge307XG5cbmZvciAoY29uc3QgbSBvZiBtZXRhbF92YWxzKSB7XG4gIGFsbF9tZXRhbHNbbVsxXS50b0xvd2VyQ2FzZSgpXSA9IG5ldyBNZXRhbCguLi5tKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZU9jY3VwYW5jeSgpOiB7IFtpZDogc3RyaW5nXTogbnVtYmVyIH0ge1xuICBjb25zdCBleHBfc2NhbGVkX2RpZmZlcmVuY2VzOiB7IFtpZDogc3RyaW5nXTogbnVtYmVyIH0gPSB7fTtcbiAgbGV0IHRvdGFsX2RpZmZzID0gMDtcbiAgZm9yIChjb25zdCBpZCBpbiBhbGxfbWV0YWxzKSB7XG4gICAgY29uc3QgbSA9IGFsbF9tZXRhbHNbaWRdO1xuICAgIGV4cF9zY2FsZWRfZGlmZmVyZW5jZXNbaWRdID0gTWF0aC5leHAoXG4gICAgICAoMTAwMCAqIChtLmludHJhY2VsbHVsYXJfYXZhaWxhYmxlX2RlbHRhX0cgLSBtLm1ldGFsYXRpb25fZGVsdGFfRykpIC9cbiAgICAgICAgKDguMzE0ICogMjk4LjE1KVxuICAgICk7XG4gICAgdG90YWxfZGlmZnMgKz0gZXhwX3NjYWxlZF9kaWZmZXJlbmNlc1tpZF07XG4gIH1cblxuICBjb25zdCBvY2N1cGFuY2llczogeyBbaWQ6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gIGxldCB0b3RhbF9vY2N1cGFuY3kgPSAwO1xuXG4gIGZvciAoY29uc3QgaWQgaW4gYWxsX21ldGFscykge1xuICAgIG9jY3VwYW5jaWVzW2lkXSA9IGV4cF9zY2FsZWRfZGlmZmVyZW5jZXNbaWRdIC8gKDEgKyB0b3RhbF9kaWZmcyk7XG4gICAgdG90YWxfb2NjdXBhbmN5ICs9IG9jY3VwYW5jaWVzW2lkXTtcbiAgfVxuICBvY2N1cGFuY2llc1tcInRvdGFsXCJdID0gdG90YWxfb2NjdXBhbmN5O1xuXG4gIHJldHVybiBvY2N1cGFuY2llcztcbn1cbiJdfQ==
