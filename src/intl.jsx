/*
OpenFisca -- A versatile microsimulation software
By: OpenFisca Team <contact@openfisca.fr>

Copyright (C) 2011, 2012, 2013, 2014, 2015 OpenFisca Team
https://github.com/openfisca

This file is part of OpenFisca.

OpenFisca is free software you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

OpenFisca is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


import {IntlMixin} from "react-intl"
import React from "react"

import App from "./components/app"


const IntlApp = React.createClass({
  mixins: [IntlMixin],
  render() {
    return (
      <App />
    )
  },
})


const intlData = {
  formats: {
    date: {
      short: {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      },
    },
  },
  locales: "fr-FR",
}


// shim for Intl needs to be loaded dynamically
// so we callback when we're done to represent
// some kind of "shimReady" event
function polyfillIntl(callback) {
  if (!window.Intl) {
    require(["intl/dist/Intl", "intl/locale-data/json/fr-FR.json"], ({Intl}, frJson) => {
      Intl.__addLocaleData(frJson)
      window.Intl = Intl
      callback()
    })
  } else {
    process.nextTick(callback)
  }
}


export default {IntlApp, intlData, polyfillIntl}
