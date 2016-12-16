# Refactor of the Original Worldviewer Infographic Viewer

To view the current state of the refactor, go <a href="http://worldviewer.github.io/refactor/">here</a>.

<p align="center">
  <img src="https://github.com/worldviewer/refactor/blob/master/infographic-desktop.jpg" />
</p>

## Immediate Goals

- How much can I reduce load time, compared to the older version?
  Eliminate unused code
  Minify Javascript
  Asynchronous loading / other http2 optimizations
- How much can I reduce the total number of assets?
- Can I completely eliminate the inactive loading state?
- Set up a modern workflow
  Experiment with npm scripts
- Refactor into ES6 / SCSS
- Improve code readability
  Break up into modules and classes
  Reconsider variable and function naming
- Explore the possibility of a more responsive approach
  Can impress.js run on a mobile device?
  Is there an intuitive UI for smaller devices which extends desktop approach?
- Can I eliminate hardcoded URL's?

## Notes

"Uncaught ReferenceError: require is not defined": Babel will transpile ES6 -> ES5, but it will not perform the module bundling for you ...

http://stackoverflow.com/questions/31593694/do-i-need-require-js-when-i-use-babel

https://stackoverflow.com/questions/28125554/javascript-6to5-now-babel-export-module-usage

https://github.com/substack/browserify-handbook

jQuery Kinetic produces errors if I simply drop the code into the directory, but works fine if I add it via npm.  Presuming it's a dependency issue, moving on.

Materialize.css: This package runs into serious issues when bundling.  I've attempted to create a Browserify shim to address them, but each time I resolve one dependency error, I get another ...

// package.json

    {
      "name": "refactor",
      "version": "1.0.0",
      "description": "Original: http://worldviewer.github.io/, Refactor: http://worldviewer.github.io/refactor/",
      "main": "main.js",
      "scripts": {
        "postinstall": "cp ./src/lib/js/materialize.js ./node_modules/materialize-css/bin",
        "build": "npm run babel && npm run scss && npm run autoprefixer && npm run browserify",
        "babel": "babel src/js -d src/tmp",
        "scss": "node-sass --output-style compressed -o dist/css src/scss src/lib/scss",
        "autoprefixer": "postcss -u autoprefixer -r dist/css/*",
        "browserify": "browserify src/lib/js/* src/tmp/* -o dist/js/app.js"
      },
      "repository": {
        "type": "git",
        "url": "git+https://github.com/worldviewer/refactor.git"
      },
      "author": "Chris Reeve",
      "license": "ISC",
      "bugs": {
        "url": "https://github.com/worldviewer/refactor/issues"
      },
      "browserify": {
        "transform": [
          "browserify-shim"
        ]
      },
      "browserify-shim": {
        "materialize-js": {
          "exports": "Materialize",
          "depends": [
            "velocity:Vel",
            "jquery-js:jQuery",
            "pickadate-js:picker",
            "hammer-js:hammer"
          ]
        }
      },
      "browser": {
        "jquery-js": "./node_modules/jquery/dist/jquery.js",
        "materialize-js": "./node_modules/materialize-css/bin/materialize.js",
        "velocity": "./node_modules/velocity-animate/velocity.js",
        "pickadate-js": "./node_modules/pickadate/lib/picker.js",
        "hammer-js": "./node_modules/hammer/js/hammer.js"
      },
      "homepage": "https://github.com/worldviewer/refactor#readme",
      "dependencies": {
        "hammerjs": "^2.0.8",
        "jquery": "^3.1.1",
        "jquery.kinetic": "^2.1.1",
        "jquery.scrollto": "^2.1.2",
        "js-cookie": "^2.1.3",
        "pickadate": "^3.5.6",
        "scrollmagic": "^2.0.5",
        "velocity-animate": "^1.4.0",
        "materialize-css": "^0.97.8"
      },
      "devDependencies": {
        "autoprefixer": "^6.5.4",
        "babel-cli": "^6.18.0",
        "babel-preset-latest": "^6.16.0",
        "browserify": "^13.1.1",
        "browserify-shim": "^3.8.12",
        "node-sass": "^4.0.0",
        "postcss-cli": "^2.6.0"
      }
    }

// main.js

    import Infographic from './infographic.js';
    import Cookies from 'js-cookie';
    import ScrollMagic from 'scrollmagic';
    import scrollTo from 'jquery.scrollto';
    import jQuery from 'jquery';
    import Vel from 'velocity-animate';
    import Materialize from 'materialize-css';
    import picker from '../../node_modules/pickadate/lib/picker.js';
    import hammer from '../../node_modules/hammerjs/hammer.js';

This shim does indeed seem to get past most of the more typical errors that I've seen with this issue, but it does not fully resolve them.  Since I'd like to get on to other aspects of the refactor, I'm going to go ahead and revert to pulling Materialize in via script tag.

That worked, with some minor stylistic implications related to the new SCSS workflow (Materialize is overriding my list item styles).  So, I've added my own overrides to deal with that.

Now, I'm going to refactor the SCSS to reduce redundancy.

Noticing a few problems which were not occurring before ... (1) Arrow keys are not consistently working, (2) sidenav background colors are not consistently changing, (3) there's a flash of content when the page loads, and (4) the zooms are not consistently working (may be skipping slides).  This turned out to be a really easy fix: I had two copies of impress.js in my workflow: one in /dist/js/ and the other in src/lib/js, which was getting bundled with the rest of my code.  Removing the copy in src/lib/js fixed the problem.

Now, I can finally get to refactoring into ES6 modules ...

Split up mobile and desktop into separate files.  Eliminated redundant checks for device type.  Placed utility functions into a separate static class.  Nothing has blown up yet.

Noticing that some of the mobile functionality has evaporated.  Will get to that soon.

I've broken the desktop version into modules.  The most challenging part is the Keyboard class.  Something is not quite wired up correctly post-refactor, because the zooms are glitchy.  But, the desktop version is now infinitely more readable than it was.

Debugging ...

A few of the variables needed to be globals, so I turned them into Keyboard object properties.  That now works.

Now noticing an issue with interactions with the sideNav list items; doesn't always take me to the correct slide, and posts URL as ...

file:///Volumes/PRODUCTION/Database/code/worldviewer/refactor/index.html#undefined

Looks like I might want to contemplate a more general-purpose solution to these hashes.

Since January, I have adopted a standard template format for all of my controversy graphics, like here on the left:

<p align="center">
  <img src="https://github.com/worldviewer/refactor/blob/master/top-spot.jpg" />
</p>

I call this a "controversy card".  The idea with these cards is that I can construct them with HTML and CSS: The title, summary and circular annotation can all be overlayed onto the graphic in order to generate a controversy card.  It's expected that at a later time a graphic designer might have their way with this template.  This permits me to continue to fill out the controversy API content until that time.  At the current moment -- December 16, 2016 -- I have created 170 of these controversy cards.  The hope is to double that over the next year.

The point is that my index.html is very bloated at the moment -- since this is all client-side and there is no server-side templating.  I will be getting to the creation of this controversy API, but something that I can do in the near-term is to use Ajax calls to simulate the modularization of my HTML.  This could dramatically improve the HTML's readability, by separating the page's data from the structure.

Another thing I'd like to check on today is whether or not impress.js can be run on mobile devices.  When I looked into this a year ago, the answer appeared to be no.  I want to validate that once again, as I've seen a suggestion that it may be possible here ...

https://github.com/impress/impress.js/wiki/Mobile-support