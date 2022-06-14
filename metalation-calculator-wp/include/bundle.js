!function t(e,a,n){function l(r,o){if(!a[r]){if(!e[r]){var c="function"==typeof require&&require;if(!o&&c)return c(r,!0);if(i)return i(r,!0);var s=new Error("Cannot find module '"+r+"'");throw s.code="MODULE_NOT_FOUND",s}var u=a[r]={exports:{}};e[r][0].call(u.exports,(function(t){return l(e[r][1][t]||t)}),u,u.exports,t,e,a,n)}return a[r].exports}for(var i="function"==typeof require&&require,r=0;r<n.length;r++)l(n[r]);return l}({1:[function(t,e,a){"use strict";Object.defineProperty(a,"__esModule",{value:!0}),a.MetalationCalculator=void 0;var n=t("./metals");function l(t){return t=(t=(t=t.replace(/(\r\n|\n|\r)/gm,"").replace(/(\s\s)/gm," ")).replace(/"/g,'""')).replace(/\u2206/g,"Delta ")}function i(t){var e=document.createElement("div");return e.innerHTML=t,e.textContent||e.innerText||""}var r=function(){function t(t,e,a,l){var i=this;if(this.calculatorID=t,this.metalDataSet=new n.MetalDataSet(""),e)try{this.metalDataSet.title=e}catch(t){}if(this._calculatorDiv=document.getElementById(t),this._calculatorTable=this._calculatorDiv.getElementsByTagName("table")[0],this._calculatorDiv.getElementsByTagName("h3")[0].innerHTML=this.metalDataSet.title,l){var r=new URL(l);if(r.protocol==window.location.protocol&&r.hostname==window.location.hostname)this._calculatorDiv.getElementsByClassName("flask-image")[0].src=l+"/flask-logo.png"}for(var o in this.metalDataSet.metals){var c=this.metalDataSet.metals[o];if(a&&a[o])try{c.defaultMetalConcentration=a[o],c.bufferedMetalConcentration=a[o]}catch(t){}this.appendMetalTableRow(c)}this._downloadButton=this._calculatorDiv.getElementsByClassName("download-btn")[0],this._downloadButton.onclick=function(){i.downloadTableAsCsv()},this._resetButton=this._calculatorDiv.getElementsByClassName("reset-btn")[0],this._resetButton.onclick=function(){i.reset()},this.calculate()}return t.prototype.createMetalNumberInput=function(t,e,a,n){var l=this,i=document.createElement("div"),r=document.createElement("input"),o=document.createElement("p");return o.classList.add("error-msg"),r.value=e.getProperty(a).toString(),r.classList.add(t),r.id=this.calculatorID+"_"+t+"_"+e.idSuffix,r.type="number",r.addEventListener("change",(function(t){var i,c=t.target.value;try{o.textContent="";var s=parseFloat(c),u=l.metalDataSet.metals[e.idSuffix];Object.assign(u,((i={})[a]=s,i)),n&&n(e.idSuffix),l.calculate()}catch(t){var d=void 0;d=t instanceof RangeError?t.message:"Invalid value "+r.value,o.textContent=d,l.clearCalculation()}})),i.append(r),i.append(o),i},t.prototype.addSmallScreenLabel=function(t,e){var a=document.createElement("p");a.innerHTML=e+":",a.classList.add("small-screen-label"),t.appendChild(a)},t.prototype.appendMetalTableRow=function(t){var e=this,a=this._calculatorTable.getElementsByTagName("tbody")[0].insertRow(),n=this._calculatorTable.getElementsByTagName("thead")[0].getElementsByTagName("th"),l=document.createElement("input"),i=document.createElement("label");l.type="checkbox",l.classList.add("toggle"),l.id=this.calculatorID+"_toggle_"+t.idSuffix,i.htmlFor=this.calculatorID+"_toggle_"+t.idSuffix;var r=document.createElement("th");l.addEventListener("change",(function(){e.toggleMetal(l.checked,t),e.calculate()})),r.appendChild(l),r.appendChild(i);var o=document.createElement("span");o.innerHTML=t.symbol,o.classList.add("metal-symbol"),r.appendChild(o),a.appendChild(r);var c=a.insertCell(-1);c.classList.add("affinity","grouped"),this.addSmallScreenLabel(c,n[0].innerHTML);var s=this.createMetalNumberInput("affinity",t,"affinity",(function(t){var a=e.metalDataSet.metals[t];document.getElementById(e.calculatorID+"_metalation_delta_g_"+t).innerText=a.metalationDeltaG.toFixed(1).toString()}));c.appendChild(s);var u=a.insertCell(-1);u.classList.add("grouped","right-spacing"),this.addSmallScreenLabel(u,n[1].innerHTML);var d=document.createElement("span");d.id=this.calculatorID+"_metalation_delta_g_"+t.idSuffix,d.innerText=t.metalationDeltaG.toFixed(1).toString(),u.append(d);var f=a.insertCell(-1);f.classList.add("bmc","grouped"),this.addSmallScreenLabel(f,n[2].innerHTML);var m=this.createMetalNumberInput("bmc",t,"bufferedMetalConcentration",(function(t){var a=e.metalDataSet.metals[t];document.getElementById(e.calculatorID+"_ia_delta_g_"+t).innerText=a.intracellularAvailableDeltaG.toFixed(1).toString()}));f.appendChild(m);var h=a.insertCell(-1);h.classList.add("grouped"),this.addSmallScreenLabel(h,n[3].innerHTML);var p=document.createElement("span");p.id=this.calculatorID+"_ia_delta_g_"+t.idSuffix,p.innerText=t.intracellularAvailableDeltaG.toFixed(1).toString(),h.append(p);var g=a.insertCell(-1);this.addSmallScreenLabel(g,n[4].innerHTML);var v=document.createElement("span");v.classList.add("result"),v.id=this.calculatorID+"_result_"+t.idSuffix,g.append(v)},t.prototype.clearCalculation=function(){Array.from(this._calculatorTable.getElementsByClassName("result")).forEach((function(t){t.innerHTML="N/A"})),this._downloadButton.disabled=!0},t.prototype.calculate=function(){var t=this.metalDataSet.calculateOccupancy();for(var e in this.metalDataSet.metals){var a=t[e];document.getElementById(this.calculatorID+"_result_"+e).innerHTML=(100*a).toFixed(2).toString()+"%"}this._calculatorDiv.getElementsByClassName("total-metalation")[0].innerHTML=(100*t.total).toFixed(2).toString()+"%",this._downloadButton.disabled=!1},t.prototype.reset=function(){for(var t in this.metalDataSet.metals){var e=this.metalDataSet.metals[t];document.getElementById(this.calculatorID+"_toggle_"+e.idSuffix).checked=!1,e.resetValues(),this.toggleMetal(!1,e)}this.calculate()},t.prototype.toggleMetal=function(t,e){document.getElementById(this.calculatorID+"_affinity_"+e.idSuffix).disabled=t,document.getElementById(this.calculatorID+"_bmc_"+e.idSuffix).disabled=t,t?e.switchOffMetal():e.resetValues(),this.updateRow(e)},t.prototype.updateRow=function(t){var e=t.idSuffix;document.getElementById(this.calculatorID+"_affinity_"+e).value=t.affinity.toString(),document.getElementById(this.calculatorID+"_metalation_delta_g_"+e).innerText=t.metalationDeltaG.toFixed(1).toString(),document.getElementById(this.calculatorID+"_bmc_"+e).value=t.bufferedMetalConcentration.toString(),document.getElementById(this.calculatorID+"_ia_delta_g_"+e).innerText=t.intracellularAvailableDeltaG.toFixed(1).toString()},t.prototype.downloadTableAsCsv=function(t){void 0===t&&(t=",");var e=[],a=this.metalDataSet.calculateOccupancy();for(var n in this.metalDataSet.metals){var r=this.metalDataSet.metals[n],o=[r.symbol,r.affinity,r.metalationDeltaG.toFixed(1),r.bufferedMetalConcentration,r.intracellularAvailableDeltaG.toFixed(1),(100*a[n]).toFixed(2).toString()+"%"];e.push(o.join(t))}e.push(["Total Metalation","","","","",(100*a.total).toFixed(2).toString()+"%"]);for(var c=[],s=this._calculatorTable.rows[0].cells,u=[""],d=0;d<s.length;d++){var f=s[d].getElementsByTagName("span");if(f.length>0){var m=f[0].innerHTML,h=s[d].innerText;u.push(h),h=l(h),m=i(m=l(m)),c.push('"# '+h+" = "+m+'"')}}e.unshift(u.join(t)),e.push(c.join("\n"));var p=e.join("\n"),g="export_"+i(this.metalDataSet.title).replaceAll(" ","_")+"_"+(new Date).toLocaleDateString()+".csv",v=document.createElement("a");v.style.display="none",v.setAttribute("target","_blank"),v.setAttribute("href","data:text/csv;charset=utf-8,"+encodeURIComponent(p)),v.setAttribute("download",g),document.body.appendChild(v),v.click(),document.body.removeChild(v)},t}();a.MetalationCalculator=r},{"./metals":3}],2:[function(t,e,a){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var n=t("./calculator");window.setupCalculator=function(t,e,a,l){new n.MetalationCalculator(t,e,a,l)},window.addEventListener("DOMContentLoaded",(function(){!function(){var t=Array.from(document.getElementsByTagName("p")).filter((function(t){return"metalation-calculator-intro"===t.className}));if(t.length>1)for(var e=1;e<t.length;e++)t[e].style.display="none"}()}))},{"./calculator":1}],3:[function(t,e,a){"use strict";var n=this&&this.__spreadArray||function(t,e,a){if(a||2===arguments.length)for(var n,l=0,i=e.length;l<i;l++)!n&&l in e||(n||(n=Array.prototype.slice.call(e,0,l)),n[l]=e[l]);return t.concat(n||Array.prototype.slice.call(e))};Object.defineProperty(a,"__esModule",{value:!0}),a.MetalDataSet=a.Metal=void 0;var l=function(){function t(t,e,a,n){this.name=t,this.symbol=e,this.affinity=a,this.bufferedMetalConcentration=n,this.idSuffix=e.toLowerCase(),this._defaultAffinity=a,this._defaultMetalConcentration=n}return t.prototype.calculateDeltaG=function(t){return 8.314*298.15*Math.log(t)/1e3},t.prototype.checkRange=function(t,e){if(isNaN(t))throw new RangeError(e+" must be a valid number");if(t<1e-30||t>1e3)throw new RangeError(e+" must be between 1e-30 and 1000")},Object.defineProperty(t.prototype,"affinity",{get:function(){return this._affinity},set:function(t){this.checkRange(t,"Affinity"),this._affinity=t,this._metalationDeltaG=this.calculateDeltaG(this._affinity)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"metalationDeltaG",{get:function(){return this._metalationDeltaG},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"bufferedMetalConcentration",{get:function(){return this._bufferedMetalConcentration},set:function(t){this.checkRange(t,"Buffered metal concentration"),this._bufferedMetalConcentration=t,this._intracellularAvailableDeltaG=this.calculateDeltaG(this._bufferedMetalConcentration)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"defaultMetalConcentration",{set:function(t){this.checkRange(t,"Default buffered metal concentration"),this._defaultMetalConcentration=t},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"intracellularAvailableDeltaG",{get:function(){return this._intracellularAvailableDeltaG},set:function(t){if(t<=0)throw new RangeError("Intracellular available ∆G must be > 0");this._intracellularAvailableDeltaG=t},enumerable:!1,configurable:!0}),t.prototype.getProperty=function(t){return this[t]},t.prototype.switchOffMetal=function(){this.affinity=1e3,this.bufferedMetalConcentration=this._defaultMetalConcentration},t.prototype.resetValues=function(){this.affinity=this._defaultAffinity,this.bufferedMetalConcentration=this._defaultMetalConcentration},t}();a.Metal=l;var i=[["Magnesium","Mg",1e3,.0027],["Manganese","Mn",1e3,26e-7],["Iron","Fe",1e-6,48e-9],["Cobalt","Co",3e-11,2.5e-9],["Nickel","Ni",9.8e-10,18e-14],["Copper","Cu",24e-17,12e-19],["Zinc","Zn",19e-14,119e-14]],r=function(){function t(t){this.title=t,this.metals={};for(var e=0,a=i;e<a.length;e++){var r=a[e];this.metals[r[1].toLowerCase()]=new(l.bind.apply(l,n([void 0],r,!1)))}}return Object.defineProperty(t.prototype,"title",{get:function(){return this._title},set:function(t){var e=document.createElement("div");e.innerHTML=t,e.innerText!=t&&Array.from(e.children).forEach((function(e){if("EM"!=e.tagName)throw new Error("Invalid HTML string "+t)})),this._title=t},enumerable:!1,configurable:!0}),t.prototype.calculateOccupancy=function(){var t={},e=0;for(var a in this.metals){var n=this.metals[a];t[a]=Math.exp(1e3*(n.intracellularAvailableDeltaG-n.metalationDeltaG)/(8.314*298.15)),e+=t[a]}var l={},i=0;for(var a in this.metals)l[a]=t[a]/(1+e),i+=l[a];return l.total=i,l},t}();a.MetalDataSet=r},{}]},{},[2,3,1]);