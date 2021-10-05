(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metals = require("./metals");
function createMetalNumberInput(prefix, metal, metalPropertyName, additionalOnChange) {
    var div = document.createElement('div');
    var input = document.createElement('input');
    var msg_p = document.createElement('p');
    msg_p.classList.add('error_msg');
    input.value = metal.getProperty(metalPropertyName).toString();
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
        document.getElementById("ia_delta_g_" + id).innerText = m.intracellular_available_delta_G.toFixed(1).toString();
    });
    bmc_cell.appendChild(bmc_input);
    var ia_delta_g_cell = row.insertCell(-1);
    ia_delta_g_cell.id = "ia_delta_g_" + metal.id_suffix;
    ia_delta_g_cell.innerText = metal.intracellular_available_delta_G.toFixed(1).toString();
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
    Metal.prototype.getProperty = function (key) {
        return this[key];
    };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyIsInNyYy9tZXRhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLGlDQUFrQztBQUVsQyxTQUFTLHNCQUFzQixDQUFDLE1BQWUsRUFBRSxLQUFvQixFQUFFLGlCQUFxQyxFQUFFLGtCQUF3QztJQUNwSixJQUFNLEdBQUcsR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRCxJQUFNLEtBQUssR0FBcUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRSxJQUFNLEtBQUssR0FBeUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoRSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNoQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM5RCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixLQUFLLENBQUMsRUFBRSxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztJQUMxQyxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztJQUN0QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVMsS0FBSzs7UUFDN0MsSUFBTSxHQUFHLEdBQXNCLEtBQUssQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDO1FBQ25ELElBQUk7WUFDRixLQUFLLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN2QixJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0IsSUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FB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SSxFQUFFLElBQUksa0JBQVUsRUFBRTtRQUN6QixXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUM7UUFDakUsZUFBZSxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNwQztJQUNELFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxlQUFlLENBQUM7SUFFdkMsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQztBQXRCRCxnREFzQkMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgKiBhcyBtZXRhbHMgZnJvbSBcIi4vbWV0YWxzXCJcblxuZnVuY3Rpb24gY3JlYXRlTWV0YWxOdW1iZXJJbnB1dChwcmVmaXggOiBzdHJpbmcsIG1ldGFsIDogbWV0YWxzLk1ldGFsLCBtZXRhbFByb3BlcnR5TmFtZToga2V5b2YgbWV0YWxzLk1ldGFsLCBhZGRpdGlvbmFsT25DaGFuZ2U6IChpZDogc3RyaW5nKSA9PiB2b2lkKSB7XG4gIGNvbnN0IGRpdiA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29uc3QgaW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICBjb25zdCBtc2dfcCA9IDxIVE1MUGFyYWdyYXBoRWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gIG1zZ19wLmNsYXNzTGlzdC5hZGQoJ2Vycm9yX21zZycpXG4gIGlucHV0LnZhbHVlID0gbWV0YWwuZ2V0UHJvcGVydHkobWV0YWxQcm9wZXJ0eU5hbWUpLnRvU3RyaW5nKCk7XG4gIGlucHV0LmNsYXNzTGlzdC5hZGQocHJlZml4KTtcbiAgaW5wdXQuaWQgPSBwcmVmaXggKyAnXycgKyBtZXRhbC5pZF9zdWZmaXg7XG4gIGlucHV0LnR5cGUgPSAnbnVtYmVyJztcbiAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zdCB2YWwgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZXZlbnQudGFyZ2V0KS52YWx1ZTtcbiAgICB0cnkge1xuICAgICAgbXNnX3AudGV4dENvbnRlbnQgPSAnJztcbiAgICAgIHZhciBmbG9hdFZhbCA9IHBhcnNlRmxvYXQodmFsKTtcbiAgICAgIGNvbnN0IG0gPSBtZXRhbHMuYWxsX21ldGFsc1ttZXRhbC5pZF9zdWZmaXhdO1xuICAgICAgT2JqZWN0LmFzc2lnbihtLCB7IFttZXRhbFByb3BlcnR5TmFtZV06IGZsb2F0VmFsIH0pO1xuICAgICAgaWYgKGFkZGl0aW9uYWxPbkNoYW5nZSkgYWRkaXRpb25hbE9uQ2hhbmdlKG1ldGFsLmlkX3N1ZmZpeCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdmFyIG1zZztcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgUmFuZ2VFcnJvcikge1xuICAgICAgICBtc2cgPSBlLm1lc3NhZ2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtc2cgPSAnSW52YWxpZCB2YWx1ZSAnICsgaW5wdXQudmFsdWU7XG4gICAgICB9XG4gICAgICBtc2dfcC50ZXh0Q29udGVudCA9IG1zZztcbiAgICB9XG4gIH0pO1xuICBkaXYuYXBwZW5kKGlucHV0KTtcbiAgZGl2LmFwcGVuZChtc2dfcCk7XG4gIHJldHVybiBkaXY7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZE1ldGFsVGFibGVSb3cobWV0YWw6IG1ldGFscy5NZXRhbCwgdGFibGU6IEhUTUxUYWJsZUVsZW1lbnQpIHtcbiAgY29uc3Qgcm93OiBIVE1MVGFibGVSb3dFbGVtZW50ID0gdGFibGUuaW5zZXJ0Um93KHRhYmxlLnJvd3MubGVuZ3RoLTEpO1xuXG4gIHJvdy5pbnNlcnRDZWxsKC0xKS5vdXRlckhUTUwgPSBcIjx0aD5cIiArIG1ldGFsLnN5bWJvbCArIFwiPC90aD5cIjtcblxuICBjb25zdCBhZmZpbml0eV9jZWxsOiBIVE1MVGFibGVDZWxsRWxlbWVudCA9IHJvdy5pbnNlcnRDZWxsKC0xKTtcbiAgYWZmaW5pdHlfY2VsbC5jbGFzc0xpc3QuYWRkKCdhZmZpbml0eScpO1xuICBjb25zdCBhZmZpbml0eV9pbnB1dCA9IGNyZWF0ZU1ldGFsTnVtYmVySW5wdXQoJ2FmZmluaXR5JywgbWV0YWwsICdhZmZpbml0eScsIGZ1bmN0aW9uKGlkKSB7XG4gICAgY29uc3QgbSA9IG1ldGFscy5hbGxfbWV0YWxzW2lkXTtcbiAgICAoPEhUTUxUYWJsZUNlbGxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWV0YWxhdGlvbl9kZWx0YV9nX1wiICsgaWQpKS5pbm5lclRleHQgPSBtLm1ldGFsYXRpb25fZGVsdGFfRy50b0ZpeGVkKDEpLnRvU3RyaW5nKCk7XG4gIH0pO1xuICBhZmZpbml0eV9jZWxsLmFwcGVuZENoaWxkKGFmZmluaXR5X2lucHV0KTtcblxuICBjb25zdCBtX2RlbHRhX2dfY2VsbDogSFRNTFRhYmxlQ2VsbEVsZW1lbnQgPSByb3cuaW5zZXJ0Q2VsbCgtMSk7XG4gIG1fZGVsdGFfZ19jZWxsLmlkID0gXCJtZXRhbGF0aW9uX2RlbHRhX2dfXCIgKyBtZXRhbC5pZF9zdWZmaXg7XG4gIG1fZGVsdGFfZ19jZWxsLmlubmVyVGV4dCA9IG1ldGFsLm1ldGFsYXRpb25fZGVsdGFfRy50b0ZpeGVkKDEpLnRvU3RyaW5nKCk7XG5cbiAgY29uc3QgYm1jX2NlbGw6IEhUTUxUYWJsZUNlbGxFbGVtZW50ID0gcm93Lmluc2VydENlbGwoLTEpO1xuICBibWNfY2VsbC5jbGFzc0xpc3QuYWRkKCdibWMnKTtcbiAgY29uc3QgYm1jX2lucHV0ID0gY3JlYXRlTWV0YWxOdW1iZXJJbnB1dCgnYm1jJywgbWV0YWwsICdidWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uJywgZnVuY3Rpb24oaWQpIHtcbiAgICBjb25zdCBtID0gbWV0YWxzLmFsbF9tZXRhbHNbaWRdO1xuICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlhX2RlbHRhX2dfXCIgKyBpZCkpLmlubmVyVGV4dCA9IG0uaW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRy50b0ZpeGVkKDEpLnRvU3RyaW5nKCk7XG4gIH0pXG5cbiAgYm1jX2NlbGwuYXBwZW5kQ2hpbGQoYm1jX2lucHV0KTtcblxuICBjb25zdCBpYV9kZWx0YV9nX2NlbGw6IEhUTUxUYWJsZUNlbGxFbGVtZW50ID0gcm93Lmluc2VydENlbGwoLTEpO1xuICBpYV9kZWx0YV9nX2NlbGwuaWQgPSBcImlhX2RlbHRhX2dfXCIgKyBtZXRhbC5pZF9zdWZmaXg7XG4gIGlhX2RlbHRhX2dfY2VsbC5pbm5lclRleHQgPSBtZXRhbC5pbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HLnRvRml4ZWQoMSkudG9TdHJpbmcoKTtcblxuICBjb25zdCByZXN1bHRfY2VsbDogSFRNTFRhYmxlQ2VsbEVsZW1lbnQgPSByb3cuaW5zZXJ0Q2VsbCgtMSk7XG4gIHJlc3VsdF9jZWxsLmlkID0gXCJyZXN1bHRfXCIgKyBtZXRhbC5pZF9zdWZmaXg7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZSgpIHtcbiAgY29uc3QgcmVzdWx0cyA9IG1ldGFscy5jYWxjdWxhdGVPY2N1cGFuY3koKTtcblxuICBmb3IgKHZhciBpZCBpbiBtZXRhbHMuYWxsX21ldGFscykge1xuICAgIGNvbnN0IHIgPSByZXN1bHRzW2lkXTtcbiAgICBjb25zdCByZXN1bHRfY2VsbCA9IDxIVE1MVGFibGVDZWxsRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdF9cIiArIGlkKTtcbiAgICByZXN1bHRfY2VsbC5pbm5lckhUTUwgPSAociAqIDEwMCkudG9GaXhlZCgyKS50b1N0cmluZygpICsgJyUnO1xuICB9XG5cbiAgY29uc3QgdG90YWxfY2VsbCA9IDxIVE1MVGFibGVDZWxsRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvdGFsX21ldGFsYXRpb25cIik7XG4gIHRvdGFsX2NlbGwuaW5uZXJIVE1MID0gKHJlc3VsdHNbJ3RvdGFsJ10gKiAxMDApLnRvRml4ZWQoMikudG9TdHJpbmcoKSArICclJztcbn1cblxuLy8gUXVpY2sgYW5kIHNpbXBsZSBleHBvcnQgdGFyZ2V0ICN0YWJsZV9pZCBpbnRvIGEgY3N2XG5mdW5jdGlvbiBkb3dubG9hZFRhYmxlQXNDc3YodGFibGVfaWQ6IHN0cmluZywgc2VwYXJhdG9yOiBzdHJpbmcgPSAnLCcpIHtcbiAgICAvLyBTZWxlY3Qgcm93cyBmcm9tIHRhYmxlX2lkXG4gICAgdmFyIHJvd3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCd0YWJsZSMnICsgdGFibGVfaWQgKyAnIHRyJyk7XG4gICAgLy8gQ29uc3RydWN0IGNzdlxuICAgIHZhciBjc3YgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJvdyA9IFtdLCBjb2xzID0gPE5vZGVMaXN0T2Y8SFRNTFRhYmxlQ2VsbEVsZW1lbnQ+PnJvd3NbaV0ucXVlcnlTZWxlY3RvckFsbCgndGQsIHRoJyk7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29scy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgLy8gQ2xlYW4gaW5uZXJ0ZXh0IHRvIHJlbW92ZSBtdWx0aXBsZSBzcGFjZXMgYW5kIGp1bXBsaW5lIChicmVhayBjc3YpXG4gICAgICAgICAgICB2YXIgZGF0YTtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0cyA9IGNvbHNbal0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XG4gICAgICAgICAgICBpZiAoaW5wdXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgZGF0YSA9IGlucHV0c1swXS52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGEgPSBjb2xzW2pdLmlubmVyVGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlbW92ZSBsaW5lIGJyZWFrcyBhbmQgZXNjYXBlIGRvdWJsZS1xdW90ZSB3aXRoIGRvdWJsZS1kb3VibGUtcXVvdGVcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICcnKS5yZXBsYWNlKC8oXFxzXFxzKS9nbSwgJyAnKTtcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoL1wiL2csICdcIlwiJyk7XG4gICAgICAgICAgICAvLyBQdXNoIGVzY2FwZWQgc3RyaW5nXG4gICAgICAgICAgICByb3cucHVzaCgnXCInICsgZGF0YSArICdcIicpO1xuICAgICAgICB9XG4gICAgICAgIGNzdi5wdXNoKHJvdy5qb2luKHNlcGFyYXRvcikpO1xuICAgIH1cbiAgICB2YXIgY3N2X3N0cmluZyA9IGNzdi5qb2luKCdcXG4nKTtcbiAgICAvLyBEb3dubG9hZCBpdFxuICAgIHZhciBmaWxlbmFtZSA9ICdleHBvcnRfJyArIHRhYmxlX2lkICsgJ18nICsgbmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoKSArICcuY3N2JztcbiAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBsaW5rLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgbGluay5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfYmxhbmsnKTtcbiAgICBsaW5rLnNldEF0dHJpYnV0ZSgnaHJlZicsICdkYXRhOnRleHQvY3N2O2NoYXJzZXQ9dXRmLTgsJyArIGVuY29kZVVSSUNvbXBvbmVudChjc3Zfc3RyaW5nKSk7XG4gICAgbGluay5zZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJywgZmlsZW5hbWUpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgbGluay5jbGljaygpO1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKGV2ZW50KSA9PiB7XG4gIGNvbnN0IG1ldGFsX3RhYmxlID0gPEhUTUxUYWJsZUVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldGFsYXRpb25fdGFibGUnKTtcbiAgZm9yICh2YXIgaWQgaW4gbWV0YWxzLmFsbF9tZXRhbHMpIHtcbiAgICBjb25zdCBtID0gbWV0YWxzLmFsbF9tZXRhbHNbaWRdO1xuICAgIGFwcGVuZE1ldGFsVGFibGVSb3cobSwgbWV0YWxfdGFibGUpO1xuICB9XG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbGN1bGF0ZV9idG4nKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgY2FsY3VsYXRlKCk7XG4gICAgKDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZG93bmxvYWRfYnRuJykpLmRpc2FibGVkID0gZmFsc2U7XG4gIH07XG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rvd25sb2FkX2J0bicpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICBkb3dubG9hZFRhYmxlQXNDc3YoJ21ldGFsYXRpb25fdGFibGUnKTtcbiAgfTtcbn0pO1xuIiwiZXhwb3J0IGNsYXNzIE1ldGFsIHtcbiAgbmFtZTogc3RyaW5nO1xuICBzeW1ib2w6IHN0cmluZztcbiAgX2FmZmluaXR5OiBudW1iZXI7XG4gIF9tZXRhbGF0aW9uX2RlbHRhX0c6IG51bWJlcjtcbiAgX2J1ZmZlcmVkX21ldGFsX2NvbmNlbnRyYXRpb246IG51bWJlcjtcbiAgX2ludHJhY2VsbHVsYXJfYXZhaWxhYmxlX2RlbHRhX0c6IG51bWJlcjtcbiAgaWRfc3VmZml4OiBzdHJpbmc7XG4gIHZhbGlkYXRvcjogdHlwZW9mIFByb3h5O1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6c3RyaW5nLCBzeW1ib2w6c3RyaW5nLCBhZmZpbml0eTpudW1iZXIsIGNvbmNlbnRyYXRpb246bnVtYmVyKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnN5bWJvbCA9IHN5bWJvbDtcbiAgICB0aGlzLmFmZmluaXR5ID0gYWZmaW5pdHk7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uID0gY29uY2VudHJhdGlvbjtcbiAgICB0aGlzLmlkX3N1ZmZpeCA9IHN5bWJvbC50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgY2FsY3VsYXRlRGVsdGFHKG1vbGVfdmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIDguMzE0ICogMjk4LjE1ICogTWF0aC5sb2cobW9sZV92YWx1ZSkgLyAxMDAwO1xuICB9XG5cbiAgZ2V0IGFmZmluaXR5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2FmZmluaXR5O1xuICB9XG5cbiAgc2V0IGFmZmluaXR5KHZhbDpudW1iZXIpIHtcbiAgICBpZiAodmFsIDw9IDApIHRocm93IG5ldyBSYW5nZUVycm9yKFwiQWZmaW5pdHkgbXVzdCBiZSA+IDBcIik7XG4gICAgdGhpcy5fYWZmaW5pdHkgPSB2YWw7XG4gICAgdGhpcy5fbWV0YWxhdGlvbl9kZWx0YV9HID0gdGhpcy5jYWxjdWxhdGVEZWx0YUcodGhpcy5fYWZmaW5pdHkpO1xuICB9XG5cbiAgZ2V0IG1ldGFsYXRpb25fZGVsdGFfRygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tZXRhbGF0aW9uX2RlbHRhX0c7XG4gIH1cblxuICBnZXQgYnVmZmVyZWRfbWV0YWxfY29uY2VudHJhdGlvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9idWZmZXJlZF9tZXRhbF9jb25jZW50cmF0aW9uO1xuICB9XG5cbiAgc2V0IGJ1ZmZlcmVkX21ldGFsX2NvbmNlbnRyYXRpb24odmFsOm51bWJlcikge1xuICAgIGlmICh2YWwgPD0gMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJCdWZmZXJlZCBtZXRhbCBjb25jZW50cmF0aW9uIG11c3QgYmUgPiAwXCIpO1xuICAgIHRoaXMuX2J1ZmZlcmVkX21ldGFsX2NvbmNlbnRyYXRpb24gPSB2YWw7XG4gICAgdGhpcy5faW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRyA9IHRoaXMuY2FsY3VsYXRlRGVsdGFHKHRoaXMuX2J1ZmZlcmVkX21ldGFsX2NvbmNlbnRyYXRpb24pO1xuICB9XG5cbiAgZ2V0IGludHJhY2VsbHVsYXJfYXZhaWxhYmxlX2RlbHRhX0coKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faW50cmFjZWxsdWxhcl9hdmFpbGFibGVfZGVsdGFfRztcbiAgfVxuXG4gIHNldCBpbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HKHZhbDpudW1iZXIpIHtcbiAgICBpZiAodmFsIDw9IDApIHRocm93IG5ldyBSYW5nZUVycm9yKFwiSW50cmFjZWxsdWxhciBhdmFpbGFibGUg4oiGRyBtdXN0IGJlID4gMFwiKTtcbiAgICB0aGlzLl9pbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HID0gdmFsO1xuICB9XG5cbiAgZ2V0UHJvcGVydHkoa2V5OiBrZXlvZiBNZXRhbCkge1xuICAgIHJldHVybiB0aGlzW2tleV07XG4gIH1cblxufVxuXG5jb25zdCBtZXRhbF92YWxzOiBBcnJheTxbc3RyaW5nLCBzdHJpbmcsIG51bWJlciwgbnVtYmVyXT4gPSBbXG4gIFtcIk1hZ25lc2l1bVwiLCBcIk1nXCIsIDFFMywgMi43RS0zXSxcbiAgW1wiTWFuZ2FuZXNlXCIsIFwiTW5cIiwgMUUzLCAyLjZFLTZdLFxuICBbXCJJcm9uXCIsIFwiRmVcIiwgMUUtNiwgNC44RS04XSxcbiAgW1wiQ29iYWx0XCIsIFwiQ29cIiwgM0UtMTEsIDIuNUUtOV0sXG4gIFtcIk5pY2tlbFwiLCBcIk5pXCIsIDkuOEUtMTAsIDEuOEUtMTNdLFxuICBbXCJDb3BwZXJcIiwgXCJDdVwiLCAyLjRFLTE2LCAxLjJFLTE4XSxcbiAgW1wiWmluY1wiLCBcIlpuXCIsIDEuOUUtMTMsIDEuMTlFLTEyXSxcbl1cblxuZXhwb3J0IGNvbnN0IGFsbF9tZXRhbHM6IHsgW2lkOiBzdHJpbmddOiBNZXRhbDsgfSA9IHt9O1xuXG5mb3IgKHZhciBtIG9mIG1ldGFsX3ZhbHMpIHtcbiAgYWxsX21ldGFsc1ttWzFdLnRvTG93ZXJDYXNlKCldID0gbmV3IE1ldGFsKC4uLm0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlT2NjdXBhbmN5KCkge1xuICB2YXIgZXhwX3NjYWxlZF9kaWZmZXJlbmNlczogeyBbaWQ6IHN0cmluZ106IG51bWJlcjsgfSA9IHt9O1xuICB2YXIgdG90YWxfZGlmZnM6IG51bWJlciA9IDA7XG4gIGZvciAodmFyIGlkIGluIGFsbF9tZXRhbHMpIHtcbiAgICBjb25zdCBtID0gYWxsX21ldGFsc1tpZF07XG4gICAgZXhwX3NjYWxlZF9kaWZmZXJlbmNlc1tpZF0gPSBNYXRoLmV4cChcbiAgICAgIDEwMDAgKiAobS5pbnRyYWNlbGx1bGFyX2F2YWlsYWJsZV9kZWx0YV9HIC0gbS5tZXRhbGF0aW9uX2RlbHRhX0cpXG4gICAgICAvICg4LjMxNCAqIDI5OC4xNSlcbiAgICApO1xuICAgIHRvdGFsX2RpZmZzICs9IGV4cF9zY2FsZWRfZGlmZmVyZW5jZXNbaWRdO1xuICB9XG5cbiAgdmFyIG9jY3VwYW5jaWVzOiB7IFtpZDogc3RyaW5nXTogbnVtYmVyOyB9ID0ge307XG4gIHZhciB0b3RhbF9vY2N1cGFuY3k6IG51bWJlciA9IDA7XG5cbiAgZm9yICh2YXIgaWQgaW4gYWxsX21ldGFscykge1xuICAgIG9jY3VwYW5jaWVzW2lkXSA9IGV4cF9zY2FsZWRfZGlmZmVyZW5jZXNbaWRdIC8gKDEgKyB0b3RhbF9kaWZmcyk7XG4gICAgdG90YWxfb2NjdXBhbmN5ICs9IG9jY3VwYW5jaWVzW2lkXTtcbiAgfVxuICBvY2N1cGFuY2llc1sndG90YWwnXSA9IHRvdGFsX29jY3VwYW5jeTtcblxuICByZXR1cm4gb2NjdXBhbmNpZXM7XG59XG4iXX0=
