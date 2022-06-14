# Metalation Calculator

This calculator is based on [Nature Communications 12 1195- (2021)](https://doi.org/10.1038/s41467-021-21479-8) and is supported by grant **BB/V006002/1** from the Biotechnology and Biological Sciences Research Council.

A single rendered calculator is available at https://durhamarc.github.io/metalation-calculator/, and a set of calculators for *E. coli* is available on the [MiB Elements of Bioremediation, Biomanufacturing and Bioenergy site](https://mib-nibb.webspace.durham.ac.uk/metalation-calculators/).

If you spot any problems with the calculator, please [log an issue](https://github.com/DurhamARC/metalation-calculator/issues/new/choose) to help us improve it.

Notes on security can be found in [security.md](security.md).

## Wordpress Plugin

The calculator can be installed as a Wordpress block plugin, allowing admin users can add a calculator to any page. The plugin can be installed by downloading the **metalation-calculator-wp.zip** file from the latest [release](https://github.com/DurhamARC/metalation-calculator/releases), and uploading the file to the Wordpress admin interface.

## Development

The code for the calculator is in two parts:

 * The `typescript` directory contains code for a static web app. It uses TypeScript with gulp to generate the static website. GitHub Actions builds the `main` branch from the `typescript` directory and pushes the compiled site to GitHub Pages (on the `gh-pages` branch).
 * The `metalation-calculator-wp` directory contains a Wordpress block plugin, which


### TypeScript Calculator

Ensure you have [Node.js](https://nodejs.org/en/) v16 and npm installed.

Run:

```
sudo npm install -g gulp-cli
```

Enter your password to install gulp globally as admin. See [Gulp](https://www.typescriptlang.org/docs/handbook/gulp.html) for further information.

To work within the `typescript` directory and install the necessary packages, run:

```bash
cd typescript
npm install
```

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

The Wordpress Plugin allows Wordpress authors to add a calculator as a new block in a Wordpress page, allowing Wordpress
authors to customise the default values for availability.

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

## Releases

To create a new release:

1. Update the version number in the following files in metalation-calculator-wp, e.g. if the previous version was 1.0.2 then use 1.0.3.
   - **block.json**
   - **metalation-calculator-wp.php**
   Commit and push the changes to main.
2. Create a new git tag from main, following the vX.Y.Z formatting (e.g. v1.0.3).
3. Push the tag to GitHub.
4. GitHub Actions should run on the tag push, including the jobs to create/upload/release the Wordpress plugin.
5. Go to the [releases](https://github.com/DurhamARC/metalation-calculator/releases) page and check that the release, including a file **metalation-calculator-wp.zip**, has been created.

To publish the updated plugin to https://mib-nibb.webspace.durham.ac.uk, contact the web team at Durham University CIS and give them the details of the new release.
