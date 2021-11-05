# Metalation Calculator

This calculator is based on [Nature Communications 12 1195- (2021)](https://doi.org/10.1038/s41467-021-21479-8) and is supported by grant **BB/V006002/1** from the Biotechnology and Biological Sciences Research Council.

The calculator is available at https://durhamarc.github.io/metalation-calculator/.

If you spot any problems with the calculator, please [log an issue](https://github.com/DurhamARC/metalation-calculator/issues/new/choose) to help us improve it.

## Development

This is a work in progress, currently using TypeScript with gulp to generate a static website. GitHub Actions builds the `main` branch from the `typescript` directory and pushes the compiled site to GitHub Pages (on the `gh-pages` branch).


### TypeScript Calculator

Ensure you have [Node.js](https://nodejs.org/en/) and npm installed.

Run:

```bash
cd typescript
npm install
```

This should install the necessary npm packages, including gulp. See https://www.typescriptlang.org/docs/handbook/gulp.html
for further information on installing gulp.

Commands below should also be run from the `typescript` directory.

To compile the website with gulp, run:

```bash
gulp
```

To compile on-the-fly, run:

```bash
gulp watch
```

Open `dist/index.html` (from the `typescript` directory) to view the calculator.

The plan is to turn the calculator into a Wordpress Plugin so that the calculator can be added as a new block to a Wordpress page, with customisable default values.
