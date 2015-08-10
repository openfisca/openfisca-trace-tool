# OpenFisca Trace Tool

Trace tool for OpenFisca -- a versatile microsimulation free software

## Start

The first time only:

    npm install
    ./copy_assets.sh

To launch the web server:

    npm start

Then open http://localhost:2040/

## Production build

    npm run clean
    ./copy_assets.sh
    npm run build

Serve the contents of the `public` dir
(for example using [http-server](https://www.npmjs.com/package/http-server))):

    http-server public

Open `http://localhost:8080` in your browser.

## Code conventions

Identifiers of immutable variables or React components props start by `$`.
