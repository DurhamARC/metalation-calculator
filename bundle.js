(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metals = require("./metals");
function createMetalNumberInput(prefix, metal, metalPropertyName, additionalOnChange) {
    var div = document.createElement('div');
    var input = document.createElement('input');
    var msg_p = document.createElement('p');
    msg_p.classList.add('error_msg');
    input.value = metal.buffered_metal_concentration.toString();
    input.classList.add(prefix);
    input.id = prefix + '_' + metal.id_suffix;
    input.type = 'number';
    input.addEventListener('change', function (event) {
        var _a;
        var val = event.target.value;
        try {
            msg_p.textContent = '';
            var floatVal = parseFloat(val);
            var m = metals.all_metals[metal.id_suffix];
            Object.assign(m, (_a = {}, _a[metalPropertyName] = floatVal, _a));
            if (additionalOnChange)
                additionalOnChange(metal.id_suffix);
        }
        catch (e) {
            var msg;
            if (e instanceof RangeError) {
                msg = e.message;
            }
            else {
                msg = 'Invalid value ' + input.value;
            }
            msg_p.textContent = msg;
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
    affinity_cell.classList.add('affinity');
    var affinity_input = createMetalNumberInput('affinity', metal, 'affinity', function (id) {
        var m = metals.all_metals[id];
        document.getElementById("metalation_delta_g_" + id).innerText = m.metalation_delta_G.toFixed(1).toString();
    });
    affinity_cell.appendChild(affinity_input);
    var m_delta_g_cell = row.insertCell(-1);
    m_delta_g_cell.id = "metalation_delta_g_" + metal.id_suffix;
    m_delta_g_cell.innerText = metal.metalation_delta_G.toFixed(1).toString();
    var bmc_cell = row.insertCell(-1);
    bmc_cell.classList.add('bmc');
    var bmc_input = createMetalNumberInput('bmc', metal, 'buffered_metal_concentration', function (id) {
        var m = metals.all_metals[id];
        document.getElementById("ia_delta_g_" + id).value = m.intracellular_available_delta_G.toString();
    });
    bmc_cell.appendChild(bmc_input);
    var ia_delta_g_cell = row.insertCell(-1);
    var ia_delta_g_input = createMetalNumberInput('ia_delta_g', metal, 'intracellular_available_delta_G', null);
    ia_delta_g_cell.appendChild(ia_delta_g_input);
    var result_cell = row.insertCell(-1);
    result_cell.id = "result_" + metal.id_suffix;
}
function calculate() {
    var results = metals.calculateOccupancy();
    for (var id in metals.all_metals) {
        var r = results[id];
        var result_cell = document.getElementById("result_" + id);
        result_cell.innerHTML = (r * 100).toFixed(2).toString() + '%';
    }
    var total_cell = document.getElementById("total_metalation");
    total_cell.innerHTML = (results['total'] * 100).toFixed(2).toString() + '%';
}
// Quick and simple export target #table_id into a csv
function downloadTableAsCsv(table_id, separator) {
    if (separator === void 0) { separator = ','; }
    // Select rows from table_id
    var rows = document.querySelectorAll('table#' + table_id + ' tr');
    // Construct csv
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        for (var j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            var data;
            var inputs = cols[j].getElementsByTagName('input');
            if (inputs.length > 0) {
                data = inputs[0].value;
            }
            else {
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
window.addEventListener('DOMContentLoaded', function (event) {
    var metal_table = document.getElementById('metalation_table');
    for (var id in metals.all_metals) {
        var m = metals.all_metals[id];
        appendMetalTableRow(m, metal_table);
    }
    document.getElementById('calculate_btn').onclick = function () {
        calculate();
        document.getElementById('download_btn').disabled = false;
    };
    document.getElementById('download_btn').onclick = function () {
        downloadTableAsCsv('metalation_table');
    };
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
        return 8.314 * 298.15 * Math.log(mole_value) / 1000;
    };
    Object.defineProperty(Metal.prototype, "affinity", {
        get: function () {
            return this._affinity;
        },
        set: function (val) {
            if (val <= 0)
                throw new RangeError("Affinity must be > 0");
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
            if (val <= 0)
                throw new RangeError("Buffered metal concentration must be > 0");
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
    return Metal;
}());
exports.Metal = Metal;
var metal_vals = [
    ["Magnesium", "Mg", 1E3, 2.7E-3],
    ["Manganese", "Mn", 1E3, 2.6E-6],
    ["Iron", "Fe", 1E-6, 4.8E-8],
    ["Cobalt", "Co", 3E-11, 2.5E-9],
    ["Nickel", "Ni", 9.8E-10, 1.8E-13],
    ["Copper", "Cu", 2.4E-16, 1.2E-18],
    ["Zinc", "Zn", 1.9E-13, 1.19E-12],
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
        var m_1 = exports.all_metals[id];
        exp_scaled_differences[id] = Math.exp(1000 * (m_1.intracellular_available_delta_G - m_1.metalation_delta_G)
            / (8.314 * 298.15));
        total_diffs += exp_scaled_differences[id];
    }
    var occupancies = {};
    var total_occupancy = 0;
    for (var id in exports.all_metals) {
        occupancies[id] = exp_scaled_differences[id] / (1 + total_diffs);
        total_occupancy += occupancies[id];
    }
    occupancies['total'] = total_occupancy;
    return occupancies;
}
exports.calculateOccupancy = calculateOccupancy;

},{}]},{},[1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyIsInNyYy9tZXRhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLGlDQUFrQztBQUVsQyxTQUFTLHNCQUFzQixDQUFDLE1BQWUsRUFBRSxLQUFvQixFQUFFLGlCQUF5QixFQUFFLGtCQUF3QztJQUN4SSxJQUFNLEdBQUcsR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRCxJQUFNLEtBQUssR0FBcUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRSxJQUFNLEtBQUssR0FBeUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoRSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNoQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1RCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixLQUFLLENBQUMsRUFBRSxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztJQUMxQyxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztJQUN0QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVMsS0FBSzs7UUFDN0MsSUFBTSxHQUFHLEdBQXNCLEtBQUssQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDO1FBQ25ELElBQUk7WUFDRixLQUFLLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN2QixJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0IsSUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFD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QUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0lBQ0QsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLGVBQWUsQ0FBQztJQUV2QyxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDO0FBdEJELGdEQXNCQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCAqIGFzIG1ldGFscyBmcm9tIFwiLi9tZXRhbHNcIlxuXG5mdW5jdGlvbiBjcmVhdGVNZXRhbE51bWJlcklucHV0KHByZWZpeCA6IHN0cmluZywgbWV0YWwgOiBtZXRhbHMuTWV0YWwsIG1ldGFsUHJvcGVydHlOYW1lOiBzdHJpbmcsIGFkZGl0aW9uYWxPbkNoYW5nZTogKGlkOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgY29uc3QgZGl2ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb25zdCBpbnB1dCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIGNvbnN0IG1zZ19wID0gPEhUTUxQYXJhZ3JhcGhFbGVtZW50PmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgbXNnX3AuY2xhc3NMaXN0LmFkZCgnZXJyb3JfbXNnJylcbiAgaW5wdXQudmFsdWUgPSBtZXRhbC5idWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uLnRvU3RyaW5nKCk7XG4gIGlucHV0LmNsYXNzTGlzdC5hZGQocHJlZml4KTtcbiAgaW5wdXQuaWQgPSBwcmVmaXggKyAnXycgKyBtZXRhbC5pZF9zdWZmaXg7XG4gIGlucHV0LnR5cGUgPSAnbnVtYmVyJztcbiAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zdCB2YWwgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZXZlbnQudGFyZ2V0KS52YWx1ZTtcbiAgICB0cnkge1xuICAgICAgbXNnX3AudGV4dENvbnRlbnQgPSAnJztcbiAgICAgIHZhciBmbG9hdFZhbCA9IHBhcnNlRmxvYXQodmFsKTtcbiAgICAgIGNvbnN0IG0gPSBtZXRhbHMuYWxsX21ldGFsc1ttZXRhbC5pZF9zdWZmaXhdO1xuICAgICAgT2JqZWN0LmFzc2lnbihtLCB7IFttZXRhbFByb3BlcnR5TmFtZV06IGZsb2F0VmFsIH0pO1xuICAgICAgaWYgKGFkZGl0aW9uYWxPbkNoYW5nZSkgYWRkaXRpb25hbE9uQ2hhbmdlKG1ldGFsLmlkX3N1ZmZpeCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdmFyIG1zZztcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgUmFuZ2VFcnJvcikge1xuICAgICAgICBtc2cgPSBlLm1lc3NhZ2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtc2cgPSAnSW52YWxpZCB2YWx1ZSAnICsgaW5wdXQudmFsdWU7XG4gICAgICB9XG4gICAgICBtc2dfcC50ZXh0Q29udGVudCA9IG1zZztcbiAgICB9XG4gIH0pO1xuICBkaXYuYXBwZW5kKGlucHV0KTtcbiAgZGl2LmFwcGVuZChtc2dfcCk7XG4gIHJldHVybiBkaXY7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZE1ldGFsVGFibGVSb3cobWV0YWw6IG1ldGFscy5NZXRhbCwgdGFibGU6IEhUTUxUYWJsZUVsZW1lbnQpIHtcbiAgY29uc3Qgcm93OiBIVE1MVGFibGVSb3dFbGVtZW50ID0gdGFibGUuaW5zZXJ0Um93KHRhYmxlLnJvd3MubGVuZ3RoLTEpO1xuXG4gIHJvdy5pbnNlcnRDZWxsKC0xKS5vdXRlckhUTUwgPSBcIjx0aD5cIiArIG1ldGFsLnN5bWJvbCArIFwiPC90aD5cIjtcblxuICBjb25zdCBhZmZpbml0eV9jZWxsOiBIVE1MVGFibGVDZWxsRWxlbWVudCA9IHJvdy5pbnNlcnRDZWxsKC0xKTtcbiAgYWZmaW5pdHlfY2VsbC5jbGFzc0xpc3QuYWRkKCdhZmZpbml0eScpO1xuICBjb25zdCBhZmZpbml0eV9pbnB1dCA9IGNyZWF0ZU1ldGFsTnVtYmVySW5wdXQoJ2FmZmluaXR5JywgbWV0YWwsICdhZmZpbml0eScsIGZ1bmN0aW9uKGlkKSB7XG4gICAgY29uc3QgbSA9IG1ldGFscy5hbGxfbWV0YWxzW2lkXTtcbiAgICAoPEhUTUxUYWJsZUNlbGxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWV0YWxhdGlvbl9kZWx0YV9nX1wiICsgaWQpKS5pbm5lclRleHQgPSBtLm1ldGFsYXRpb25fZGVsdGFfRy50b0ZpeGVkKDEpLnRvU3RyaW5nKCk7XG4gIH0pO1xuICBhZmZpbml0eV9jZWxsLmFwcGVuZENoaWxkKGFmZmluaXR5X2lucHV0KTtcblxuICBjb25zdCBtX2RlbHRhX2dfY2VsbDogSFRNTFRhYmxlQ2VsbEVsZW1lbnQgPSByb3cuaW5zZXJ0Q2VsbCgtMSk7XG4gIG1fZGVsdGFfZ19jZWxsLmlkID0gXCJtZXRhbGF0aW9uX2RlbHRhX2dfXCIgKyBtZXRhbC5pZF9zdWZmaXg7XG4gIG1fZGVsdGFfZ19jZWxsLmlubmVyVGV4dCA9IG1ldGFsLm1ldGFsYXRpb25fZGVsdGFfRy50b0ZpeGVkKDEpLnRvU3RyaW5nKCk7XG5cbiAgY29uc3QgYm1jX2NlbGw6IEhUTUxUYWJsZUNlbGxFbGVtZW50ID0gcm93Lmluc2VydENlbGwoLTEpO1xuICBibWNfY2VsbC5jbGFzc0xpc3QuYWRkKCdibWMnKTtcbiAgY29uc3QgYm1jX2lucHV0ID0gY3JlYXRlTWV0YWxOdW1iZXJJbnB1dCgnYm1jJywgbWV0YWwsICdidWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uJywgZnVuY3Rpb24oaWQpIHtcbiAgICBjb25zdCBtID0gbWV0YWxzLmFsbF9tZXRhbHNbaWRdO1xuICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlhX2RlbHRhX2dfXCIgKyBpZCkpLnZhbHVlID0gbS5pbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HLnRvU3RyaW5nKCk7XG4gIH0pXG5cbiAgYm1jX2NlbGwuYXBwZW5kQ2hpbGQoYm1jX2lucHV0KTtcblxuICBjb25zdCBpYV9kZWx0YV9nX2NlbGw6IEhUTUxUYWJsZUNlbGxFbGVtZW50ID0gcm93Lmluc2VydENlbGwoLTEpO1xuICBjb25zdCBpYV9kZWx0YV9nX2lucHV0ID0gY3JlYXRlTWV0YWxOdW1iZXJJbnB1dCgnaWFfZGVsdGFfZycsIG1ldGFsLCAnaW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRycsIG51bGwpO1xuICBpYV9kZWx0YV9nX2NlbGwuYXBwZW5kQ2hpbGQoaWFfZGVsdGFfZ19pbnB1dCk7XG5cbiAgY29uc3QgcmVzdWx0X2NlbGw6IEhUTUxUYWJsZUNlbGxFbGVtZW50ID0gcm93Lmluc2VydENlbGwoLTEpO1xuICByZXN1bHRfY2VsbC5pZCA9IFwicmVzdWx0X1wiICsgbWV0YWwuaWRfc3VmZml4O1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGUoKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBtZXRhbHMuY2FsY3VsYXRlT2NjdXBhbmN5KCk7XG5cbiAgZm9yICh2YXIgaWQgaW4gbWV0YWxzLmFsbF9tZXRhbHMpIHtcbiAgICBjb25zdCByID0gcmVzdWx0c1tpZF07XG4gICAgY29uc3QgcmVzdWx0X2NlbGwgPSA8SFRNTFRhYmxlQ2VsbEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRfXCIgKyBpZCk7XG4gICAgcmVzdWx0X2NlbGwuaW5uZXJIVE1MID0gKHIgKiAxMDApLnRvRml4ZWQoMikudG9TdHJpbmcoKSArICclJztcbiAgfVxuXG4gIGNvbnN0IHRvdGFsX2NlbGwgPSA8SFRNTFRhYmxlQ2VsbEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3RhbF9tZXRhbGF0aW9uXCIpO1xuICB0b3RhbF9jZWxsLmlubmVySFRNTCA9IChyZXN1bHRzWyd0b3RhbCddICogMTAwKS50b0ZpeGVkKDIpLnRvU3RyaW5nKCkgKyAnJSc7XG59XG5cbi8vIFF1aWNrIGFuZCBzaW1wbGUgZXhwb3J0IHRhcmdldCAjdGFibGVfaWQgaW50byBhIGNzdlxuZnVuY3Rpb24gZG93bmxvYWRUYWJsZUFzQ3N2KHRhYmxlX2lkOiBzdHJpbmcsIHNlcGFyYXRvcjogc3RyaW5nID0gJywnKSB7XG4gICAgLy8gU2VsZWN0IHJvd3MgZnJvbSB0YWJsZV9pZFxuICAgIHZhciByb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgndGFibGUjJyArIHRhYmxlX2lkICsgJyB0cicpO1xuICAgIC8vIENvbnN0cnVjdCBjc3ZcbiAgICB2YXIgY3N2ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByb3cgPSBbXSwgY29scyA9IDxOb2RlTGlzdE9mPEhUTUxUYWJsZUNlbGxFbGVtZW50Pj5yb3dzW2ldLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RkLCB0aCcpO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvbHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIC8vIENsZWFuIGlubmVydGV4dCB0byByZW1vdmUgbXVsdGlwbGUgc3BhY2VzIGFuZCBqdW1wbGluZSAoYnJlYWsgY3N2KVxuICAgICAgICAgICAgdmFyIGRhdGE7XG4gICAgICAgICAgICBjb25zdCBpbnB1dHMgPSBjb2xzW2pdLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpO1xuICAgICAgICAgICAgaWYgKGlucHV0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGRhdGEgPSBpbnB1dHNbMF0udmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkYXRhID0gY29sc1tqXS5pbm5lclRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZW1vdmUgbGluZSBicmVha3MgYW5kIGVzY2FwZSBkb3VibGUtcXVvdGUgd2l0aCBkb3VibGUtZG91YmxlLXF1b3RlXG4gICAgICAgICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpL2dtLCAnJykucmVwbGFjZSgvKFxcc1xccykvZ20sICcgJyk7XG4gICAgICAgICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpO1xuICAgICAgICAgICAgLy8gUHVzaCBlc2NhcGVkIHN0cmluZ1xuICAgICAgICAgICAgcm93LnB1c2goJ1wiJyArIGRhdGEgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgICBjc3YucHVzaChyb3cuam9pbihzZXBhcmF0b3IpKTtcbiAgICB9XG4gICAgdmFyIGNzdl9zdHJpbmcgPSBjc3Yuam9pbignXFxuJyk7XG4gICAgLy8gRG93bmxvYWQgaXRcbiAgICB2YXIgZmlsZW5hbWUgPSAnZXhwb3J0XycgKyB0YWJsZV9pZCArICdfJyArIG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgKyAnLmNzdic7XG4gICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgbGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGxpbmsuc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG4gICAgbGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LCcgKyBlbmNvZGVVUklDb21wb25lbnQoY3N2X3N0cmluZykpO1xuICAgIGxpbmsuc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGZpbGVuYW1lKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgIGxpbmsuY2xpY2soKTtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIChldmVudCkgPT4ge1xuICBjb25zdCBtZXRhbF90YWJsZSA9IDxIVE1MVGFibGVFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXRhbGF0aW9uX3RhYmxlJyk7XG4gIGZvciAodmFyIGlkIGluIG1ldGFscy5hbGxfbWV0YWxzKSB7XG4gICAgY29uc3QgbSA9IG1ldGFscy5hbGxfbWV0YWxzW2lkXTtcbiAgICBhcHBlbmRNZXRhbFRhYmxlUm93KG0sIG1ldGFsX3RhYmxlKTtcbiAgfVxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYWxjdWxhdGVfYnRuJykub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgIGNhbGN1bGF0ZSgpO1xuICAgICg8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rvd25sb2FkX2J0bicpKS5kaXNhYmxlZCA9IGZhbHNlO1xuICB9O1xuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb3dubG9hZF9idG4nKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgZG93bmxvYWRUYWJsZUFzQ3N2KCdtZXRhbGF0aW9uX3RhYmxlJyk7XG4gIH07XG59KTtcbiIsImV4cG9ydCBjbGFzcyBNZXRhbCB7XG4gIG5hbWU6IHN0cmluZztcbiAgc3ltYm9sOiBzdHJpbmc7XG4gIF9hZmZpbml0eTogbnVtYmVyO1xuICBfbWV0YWxhdGlvbl9kZWx0YV9HOiBudW1iZXI7XG4gIF9idWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uOiBudW1iZXI7XG4gIF9pbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HOiBudW1iZXI7XG4gIGlkX3N1ZmZpeDogc3RyaW5nO1xuICB2YWxpZGF0b3I6IHR5cGVvZiBQcm94eTtcblxuICBjb25zdHJ1Y3RvcihuYW1lOnN0cmluZywgc3ltYm9sOnN0cmluZywgYWZmaW5pdHk6bnVtYmVyLCBjb25jZW50cmF0aW9uOm51bWJlcikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zeW1ib2wgPSBzeW1ib2w7XG4gICAgdGhpcy5hZmZpbml0eSA9IGFmZmluaXR5O1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0YWxfY29uY2VudHJhdGlvbiA9IGNvbmNlbnRyYXRpb247XG4gICAgdGhpcy5pZF9zdWZmaXggPSBzeW1ib2wudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZURlbHRhRyhtb2xlX3ZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiA4LjMxNCAqIDI5OC4xNSAqIE1hdGgubG9nKG1vbGVfdmFsdWUpIC8gMTAwMDtcbiAgfVxuXG4gIGdldCBhZmZpbml0eSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9hZmZpbml0eTtcbiAgfVxuXG4gIHNldCBhZmZpbml0eSh2YWw6bnVtYmVyKSB7XG4gICAgaWYgKHZhbCA8PSAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIkFmZmluaXR5IG11c3QgYmUgPiAwXCIpO1xuICAgIHRoaXMuX2FmZmluaXR5ID0gdmFsO1xuICAgIHRoaXMuX21ldGFsYXRpb25fZGVsdGFfRyA9IHRoaXMuY2FsY3VsYXRlRGVsdGFHKHRoaXMuX2FmZmluaXR5KTtcbiAgfVxuXG4gIGdldCBtZXRhbGF0aW9uX2RlbHRhX0coKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWV0YWxhdGlvbl9kZWx0YV9HO1xuICB9XG5cbiAgZ2V0IGJ1ZmZlcmVkX21ldGFsX2NvbmNlbnRyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYnVmZmVyZWRfbWV0YWxfY29uY2VudHJhdGlvbjtcbiAgfVxuXG4gIHNldCBidWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uKHZhbDpudW1iZXIpIHtcbiAgICBpZiAodmFsIDw9IDApIHRocm93IG5ldyBSYW5nZUVycm9yKFwiQnVmZmVyZWQgbWV0YWwgY29uY2VudHJhdGlvbiBtdXN0IGJlID4gMFwiKTtcbiAgICB0aGlzLl9idWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uID0gdmFsO1xuICAgIHRoaXMuX2ludHJhY2VsbHVsYXJfYXZhaWxhYmxlX2RlbHRhX0cgPSB0aGlzLmNhbGN1bGF0ZURlbHRhRyh0aGlzLl9idWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uKTtcbiAgfVxuXG4gIGdldCBpbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2ludHJhY2VsbHVsYXJfYXZhaWxhYmxlX2RlbHRhX0c7XG4gIH1cblxuICBzZXQgaW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRyh2YWw6bnVtYmVyKSB7XG4gICAgaWYgKHZhbCA8PSAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIkludHJhY2VsbHVsYXIgYXZhaWxhYmxlIOKIhkcgbXVzdCBiZSA+IDBcIik7XG4gICAgdGhpcy5faW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRyA9IHZhbDtcbiAgfVxuXG59XG5cbmNvbnN0IG1ldGFsX3ZhbHM6IEFycmF5PFtzdHJpbmcsIHN0cmluZywgbnVtYmVyLCBudW1iZXJdPiA9IFtcbiAgW1wiTWFnbmVzaXVtXCIsIFwiTWdcIiwgMUUzLCAyLjdFLTNdLFxuICBbXCJNYW5nYW5lc2VcIiwgXCJNblwiLCAxRTMsIDIuNkUtNl0sXG4gIFtcIklyb25cIiwgXCJGZVwiLCAxRS02LCA0LjhFLThdLFxuICBbXCJDb2JhbHRcIiwgXCJDb1wiLCAzRS0xMSwgMi41RS05XSxcbiAgW1wiTmlja2VsXCIsIFwiTmlcIiwgOS44RS0xMCwgMS44RS0xM10sXG4gIFtcIkNvcHBlclwiLCBcIkN1XCIsIDIuNEUtMTYsIDEuMkUtMThdLFxuICBbXCJaaW5jXCIsIFwiWm5cIiwgMS45RS0xMywgMS4xOUUtMTJdLFxuXVxuXG5leHBvcnQgY29uc3QgYWxsX21ldGFsczogeyBbaWQ6IHN0cmluZ106IE1ldGFsOyB9ID0ge307XG5cbmZvciAodmFyIG0gb2YgbWV0YWxfdmFscykge1xuICBhbGxfbWV0YWxzW21bMV0udG9Mb3dlckNhc2UoKV0gPSBuZXcgTWV0YWwoLi4ubSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVPY2N1cGFuY3koKSB7XG4gIHZhciBleHBfc2NhbGVkX2RpZmZlcmVuY2VzOiB7IFtpZDogc3RyaW5nXTogbnVtYmVyOyB9ID0ge307XG4gIHZhciB0b3RhbF9kaWZmczogbnVtYmVyID0gMDtcbiAgZm9yICh2YXIgaWQgaW4gYWxsX21ldGFscykge1xuICAgIGNvbnN0IG0gPSBhbGxfbWV0YWxzW2lkXTtcbiAgICBleHBfc2NhbGVkX2RpZmZlcmVuY2VzW2lkXSA9IE1hdGguZXhwKFxuICAgICAgMTAwMCAqIChtLmludHJhY2VsbHVsYXJfYXZhaWxhYmxlX2RlbHRhX0cgLSBtLm1ldGFsYXRpb25fZGVsdGFfRylcbiAgICAgIC8gKDguMzE0ICogMjk4LjE1KVxuICAgICk7XG4gICAgdG90YWxfZGlmZnMgKz0gZXhwX3NjYWxlZF9kaWZmZXJlbmNlc1tpZF07XG4gIH1cblxuICB2YXIgb2NjdXBhbmNpZXM6IHsgW2lkOiBzdHJpbmddOiBudW1iZXI7IH0gPSB7fTtcbiAgdmFyIHRvdGFsX29jY3VwYW5jeTogbnVtYmVyID0gMDtcblxuICBmb3IgKHZhciBpZCBpbiBhbGxfbWV0YWxzKSB7XG4gICAgb2NjdXBhbmNpZXNbaWRdID0gZXhwX3NjYWxlZF9kaWZmZXJlbmNlc1tpZF0gLyAoMSArIHRvdGFsX2RpZmZzKTtcbiAgICB0b3RhbF9vY2N1cGFuY3kgKz0gb2NjdXBhbmNpZXNbaWRdO1xuICB9XG4gIG9jY3VwYW5jaWVzWyd0b3RhbCddID0gdG90YWxfb2NjdXBhbmN5O1xuXG4gIHJldHVybiBvY2N1cGFuY2llcztcbn1cbiJdfQ==
