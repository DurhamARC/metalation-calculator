function calculate(formId: string) {
  let form = document.getElementById(formId);
  console.log("Calculated!")
}

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('calculate_btn').onclick = function() {
      calculate('metalation_form');
    };
});
