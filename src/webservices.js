/*
OpenFisca -- A versatile microsimulation software
By: OpenFisca Team <contact@openfisca.fr>

Copyright (C) 2011, 2012, 2013, 2014, 2015 OpenFisca Team
https://github.com/openfisca

This file is part of OpenFisca.

OpenFisca is free software; you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

OpenFisca is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


const debug = require("debug")("app:webservices");


// Fetch polyfill

function loadFetch() {
  if (window.fetch) {
    return window.fetch;
  } else {
    require("whatwg-fetch");
    return window.fetch;
  }
}
var fetch = loadFetch();


// Generic fetch functions

function fetchJSON(url, options) {
  return loggedFetch(url, options).then(json);
}


function json(response) {
  return response.json();
}


function loggedFetch(url, ...args) {
  debug("About to fetch URL", url);
  return fetch(url, ...args);
}


// API fetch functions

function calculate(apiBaseUrl, simulationJson, onSuccess, onError) {
  // TODO
  const calculateUrl = apiBaseUrl + "/api/1/calculate";
  $.ajax(calculateUrl, {
    contentType: "application/json",
    data: JSON.stringify(simulationJson),
    dataType: "json",
    type: "POST",
    xhrFields: {
      withCredentials: true
    }
  })
  .done(function (data/*, textStatus, jqXHR*/) {
    onSuccess(data);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    onError(
      errorThrown && jqXHR.responseText ?
        errorThrown + ": " + jqXHR.responseText :
        errorThrown || jqXHR.responseText || "unknown"
    );
  });
}


function fetchField(apiBaseUrl, name, baseReforms, onSuccess, onError) {
  // TODO
  const fieldUrl = apiBaseUrl + "/api/1/field";
  $.ajax(fieldUrl, {
    data: {
      reform: baseReforms,
      variable: name,
    },
    dataType: "json",
    traditional: true,
    type: "GET",
    xhrFields: {
      withCredentials: true,
    },
  })
  .done(function(data/*, textStatus, jqXHR*/) {
    onSuccess(data);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    onError(
      errorThrown && jqXHR.responseText ?
        errorThrown + ": " + jqXHR.responseText :
        errorThrown || jqXHR.responseText || "unknown"
    );
  });
}


export default {fetchField};
