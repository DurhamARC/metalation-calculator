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

sudo npm install -g gulp-cli
```
Enter your password to install gulp globally as admin. See [Gulp](https://www.typescriptlang.org/docs/handbook/gulp.html).

All necessary packages should now be installed.

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

After making changes to the calculator, ensure you run `gulp wp` to update the files in the Wordpress plugin and commit
the modified files in `metalation-calculator-wp/include`.

### Wordpress Plugin

The Wordpress Plugin (currently a work in progress) allows Wordpress authors to add a calculator as a new block in a
Wordpress page. The aim is to allow authors to customise the default values.

To work on/test the plugin, follow the development instructions at https://developer.wordpress.org/block-editor/getting-started/devenv/ to set up a Wordpress development environment.

Then do:

```bash
cd metalation-calculator-wp
npm run build
wp-env start
```

You should then be able to access your local Wordpress instance at http://localhost:8888, and to log in at
http://localhost:8888/wp-admin.

Enable the **Metalation Calculator** plugin, then add a 'metalation calculator' block to a post or page to test it out.
