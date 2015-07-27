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


// Helpers, model and services functions.

function buildVariableId(variableName, variablePeriod) {
  var toValidBootstrapId = function(str) {
    return str.replace(':', '-');
  };
  return variablePeriod ? variableName + '-' + toValidBootstrapId(variablePeriod) : variableName;
}



function findConsumerTracebacks(tracebacks, name, period) {
  // Find formula tracebacks which call the given variable at the given period.
  var filteredTracebacks = _.filter(tracebacks, function(traceback) {
    if (traceback.input_variables && traceback.input_variables.length) {
      var inputVariable = _.find(traceback.input_variables, function(inputVariableData) {
        var argumentName = inputVariableData[0],
          argumentPeriod = inputVariableData[1];

        return argumentName === name && (
          period === null || argumentPeriod === null || argumentPeriod === period
        );
      });
      return inputVariable;
    } else {
      return false;
    }
  });
  return filteredTracebacks.length ? filteredTracebacks : null;
}


function findTraceback(tracebacks, name, period) {
  // Find variable traceback at the given name and period.
  // Assumes that a traceback exists only once for a given name and period, in the tracebacks list.
  return _.find(tracebacks, function(traceback) {
    return traceback.name === name && (traceback.period === null || traceback.period === period);
  });
}


function findTracebacks(tracebacks, name, period) {  // jshint ignore:line
  // Find variable traceback at the given name and period.
  // Assumes that a traceback exists only once for a given name and period, in the tracebacks list.
  return _.filter(tracebacks, function(traceback) {
    return traceback.name === name && (period === null || traceback.period === null || traceback.period === period);
  });
}


function getEntityBackgroundColor(entity) {
  return {
    fam: 'success',
    familles: 'success',
    foy: 'info',
    foyers_fiscaux: 'info',
    ind: 'primary',
    individus: 'primary',
    men: 'warning',
    menages: 'warning',
  }[entity] || entity;
}


function getEntityKeyPlural(entity) {
  return {
    fam: 'familles',
    foy: 'foyers fiscaux',
    ind: 'individus',
    men: 'ménages',
  }[entity] || entity;
}


function getQueryParameters(str) {
  return (str || document.location.search).replace(/(^\?)/,'').split("&")
    .map(function(n){return n = n.split("="),this[n[0]] = n[1],this;}.bind({}))[0];
}


var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();


function normalizePeriod(period) {
  var dashMatches = period.match(/-/g);
  if (dashMatches) {
    var dashesCount = dashMatches.length;
    var monthPrefix = 'month:';
    if (dashesCount === 1 && startsWith(period, monthPrefix)) {
      return period.slice(monthPrefix.length);
    }
  }
  return period;
}


function startsWith(str, startStr) {
  return str.indexOf(startStr) === 0;
}
