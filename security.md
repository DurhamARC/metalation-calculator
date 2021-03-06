# Notes on Security

## TypeScript web app

### Dependencies

`npm audit` shows up some issues when run in the Typescript directory due to packages used by our build tool gulp that have not been updated. However, the dependencies are for development only; what is deployed to the web server is a static site with no external JavaScript dependencies.

`npm audit --production` shows that there are no security issues with production dependencies, and is run in the CI.

### Input validation

The app is a static web application which has no interaction with any backend servers, so risks from invalid input are minimal.

Inputs both from user input fields and from `window` (e.g. set via Wordpress), are validated before being displayed (see [Metals.ts](typescript/Metals.ts)).

## Wordpress Plugin

The Wordpress Plugin's production dependencies are all official dependencies from Wordpress. There is a weekly task scheduled in CI to check for updates from Wordpress, which will fail and notify us if updates are required.

The plugin does not make any changes to the Wordpress access controls; it simply adds a block that any author can use on a page. It does not store any sensitive data. The block edit functions use standard Wordpress input fields which take care of attacks via SQL injection. The values entered are passed to the calculator the TypeScript Web App section, which validates them before they are displayed.

The block as shown to the public is a static web component which does not interact with the backend server (as in the typescript web app).
