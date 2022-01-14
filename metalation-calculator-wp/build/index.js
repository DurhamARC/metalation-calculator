!function(){"use strict";var e,t,a,n,l={944:function(e,t){var a=this&&this.__spreadArray||function(e,t,a){if(a||2===arguments.length)for(var n,l=0,r=t.length;l<r;l++)!n&&l in t||(n||(n=Array.prototype.slice.call(t,0,l)),n[l]=t[l]);return e.concat(n||Array.prototype.slice.call(t))};Object.defineProperty(t,"__esModule",{value:!0}),t.MetalDataSet=t.Metal=void 0;var n=function(){function e(e,t,a,n){this.name=e,this.symbol=t,this.affinity=a,this.bufferedMetalConcentration=n,this.idSuffix=t.toLowerCase(),this._defaultAffinity=a,this._defaultMetalConcentration=n}return e.prototype.calculateDeltaG=function(e){return 8.314*298.15*Math.log(e)/1e3},e.prototype.checkRange=function(e,t){if(isNaN(e))throw new RangeError(t+" must be a valid number");if(e<1e-30||e>1e3)throw new RangeError(t+" must be between 1e-30 and 1000")},Object.defineProperty(e.prototype,"affinity",{get:function(){return this._affinity},set:function(e){this.checkRange(e,"Affinity"),this._affinity=e,this._metalationDeltaG=this.calculateDeltaG(this._affinity)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"metalationDeltaG",{get:function(){return this._metalationDeltaG},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"bufferedMetalConcentration",{get:function(){return this._bufferedMetalConcentration},set:function(e){this.checkRange(e,"Buffered metal concentration"),this._bufferedMetalConcentration=e,this._intracellularAvailableDeltaG=this.calculateDeltaG(this._bufferedMetalConcentration)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"intracellularAvailableDeltaG",{get:function(){return this._intracellularAvailableDeltaG},set:function(e){if(e<=0)throw new RangeError("Intracellular available ∆G must be > 0");this._intracellularAvailableDeltaG=e},enumerable:!1,configurable:!0}),e.prototype.getProperty=function(e){return this[e]},e.prototype.switchOffMetal=function(){this.affinity=1e3,this.bufferedMetalConcentration=this._defaultMetalConcentration},e.prototype.resetValues=function(){this.affinity=this._defaultAffinity,this.bufferedMetalConcentration=this._defaultMetalConcentration},e}();t.Metal=n;var l=[["Magnesium","Mg",1e3,.0027],["Manganese","Mn",1e3,26e-7],["Iron","Fe",1e-6,48e-9],["Cobalt","Co",3e-11,2.5e-9],["Nickel","Ni",9.8e-10,18e-14],["Copper","Cu",24e-17,12e-19],["Zinc","Zn",19e-14,119e-14]],r=function(){function e(){this.metals={};for(var e=0,t=l;e<t.length;e++){var r=t[e];this.metals[r[1].toLowerCase()]=new(n.bind.apply(n,a([void 0],r,!1)))}}return e.prototype.calculateOccupancy=function(){var e={},t=0;for(var a in this.metals){var n=this.metals[a];e[a]=Math.exp(1e3*(n.intracellularAvailableDeltaG-n.metalationDeltaG)/(8.314*298.15)),t+=e[a]}var l={},r=0;for(var a in this.metals)l[a]=e[a]/(1+t),r+=l[a];return l.total=r,l},e}();t.MetalDataSet=r}},r={};function i(e){var t=r[e];if(void 0!==t)return t.exports;var a=r[e]={exports:{}};return l[e].call(a.exports,a,a.exports,i),a.exports}e=window.wp.blocks,t=window.wp.element,a=window.wp.blockEditor,n=window.wp.components,(0,e.registerBlockType)("create-block/metalation-calculator-wp",{edit:function(e){let{attributes:l,setAttributes:r}=e;const o=new(i(944).MetalDataSet),c=Object.keys(o.metals).map((e=>(0,t.createElement)("tr",{key:e},(0,t.createElement)("th",null,o.metals[e].symbol),(0,t.createElement)("td",null,o.metals[e].affinity),(0,t.createElement)("td",null,"-"),(0,t.createElement)("td",null,(0,t.createElement)(n.TextControl,{value:l.bmcVals[e],onChange:t=>function(e,t){const a=document.getElementById("msg_"+t);try{o.metals[t].bufferedMetalConcentration=e,a.style.display="none"}catch(t){let n;n=t instanceof RangeError?t.message:"Invalid value "+e,a.innerHTML=n,a.style.display="block"}const n={...l.bmcVals};n[t]=e,r({bmcVals:n})}(t,e)}),(0,t.createElement)("p",{className:"error-msg",id:"msg_"+e,style:{display:"none"}})),(0,t.createElement)("td",null,"-"),(0,t.createElement)("td",null,"-"))));return(0,t.createElement)("div",(0,a.useBlockProps)(),(0,t.createElement)("div",{className:"metalation-calculator"},(0,t.createElement)("p",null,"To predict the metalation state of a protein or molecule, fill in values in the table for as many determined metal affinities (and availabilities if known) as possible."),(0,t.createElement)("table",{id:"metalation-table"},(0,t.createElement)("thead",null,(0,t.createElement)("tr",null,(0,t.createElement)("td",null),(0,t.createElement)("th",null,"Metal Affinity (M)"),(0,t.createElement)("th",null,"∆G (kJ mol",(0,t.createElement)("sup",null,"-1"),")"),(0,t.createElement)("th",null,"Metal Availability (M)"),(0,t.createElement)("th",null,"Available ∆G (kJ mol",(0,t.createElement)("sup",null,"-1"),")"),(0,t.createElement)("th",null,"Occupancy"))),(0,t.createElement)("tbody",null,c),(0,t.createElement)("tfoot",null,(0,t.createElement)("tr",null,(0,t.createElement)("th",null,"Total Metalation"),(0,t.createElement)("td",null),(0,t.createElement)("td",null),(0,t.createElement)("td",null),(0,t.createElement)("td",null),(0,t.createElement)("th",{className:"result"},"-"))))))}})}();