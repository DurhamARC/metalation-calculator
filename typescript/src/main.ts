import { MetalationCalculator } from "./calculator";

/**
This method is used to hide the instuctions paragraph for more than one
instances of the calculator.
**/
function hideParagraphCopies() {
  const paragraphs = Array.from(document.getElementsByTagName("p")).filter(
    (e) => e.className === "metalation-calculator-intro"
  );
  if (paragraphs.length > 1) {
    // set the display of the into paragrapghs to none except the first one
    for (let x = 1; x < paragraphs.length; x++) {
      paragraphs[x].style.display = "none";
    }
  }
}

/* global window */
declare global {
  interface Window {
    setupCalculator: (
      calculatorID: string,
      titleHtmlString: string,
      bmcVals: { [id: string]: number },
      imageDir: string
    ) => void;
  }
}

window.setupCalculator = function (
  calculatorID: string,
  titleHtmlString: string,
  bmcVals: { [id: string]: number },
  imageDir: string
) {
  new MetalationCalculator(calculatorID, titleHtmlString, bmcVals, imageDir);
};

window.addEventListener("DOMContentLoaded", () => {
  hideParagraphCopies();
});
