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


import webservices from "./webservices"


export const defaultSimulationData = {
  "scenarios": [
    {
      "test_case": {
        "familles": [
          {"parents": ["ind0", "ind1"]},
        ],
        "foyers_fiscaux": [
          {"declarants": ["ind0", "ind1"]},
        ],
        "individus": [
          {"id": "ind0"},
          {"id": "ind1"},
        ],
        "menages": [
          {
            "personne_de_reference": "ind0",
            "conjoint": "ind1",
          },
        ],
      },
      "period": "2014",
    },
  ],
  "variables": ["revdisp"],
}


// API helpers

export async function calculate(apiBaseUrl, simulationData) {
  const simulationDataWithTrace = Object.assign({}, simulationData, {trace: true})
  let data = await webservices.calculate(apiBaseUrl, simulationDataWithTrace)
  return data
}


// Helpers

export function buildVariableId(variableName, variablePeriod) {
  var toValidBootstrapId = function(str) {
    return str.replace(":", "-")
  }
  return variablePeriod ? variableName + "-" + toValidBootstrapId(variablePeriod) : variableName
}


export function entitySymbolToKeyPlural(entitySymbol) {
  return {
    fam: "familles",
    foy: "foyers_fiscaux",
    ind: "individus",
    men: "menages",
  }[entitySymbol]
}


export function findConsumerTracebacks($tracebacks, name, period = null) {
  // Find tracebacks of variables which call the given variable at the given period.
  const $filteredTracebacks = $tracebacks.filter(($traceback) => {
    const $inputVariables = $traceback.get("input_variables")
    return $inputVariables && $inputVariables.size ?
      $inputVariables.find(($inputVariable) => {
        const [inputVariableName, inputVariablePeriod] = $inputVariable.toArray()
        return inputVariableName === name && (
          period === null || inputVariablePeriod === null || inputVariablePeriod === period
        )
      }) :
      false
  })
  return $filteredTracebacks.size ? $filteredTracebacks : null
}


// function findTraceback(tracebacks, name, period) {
//   // Find variable traceback at the given name and period.
//   // Assumes that a traceback exists only once for a given name and period, in the tracebacks list.
//   return tracebacks.find((traceback) => traceback.name === name &&
//     (traceback.period === null || traceback.period === period))
// }
//
//
// function findTracebacks(tracebacks, name, period) {  // jshint ignore:line
//   // Find variable traceback at the given name and period.
//   // Assumes that a traceback exists only once for a given name and period, in the tracebacks list.
//   return tracebacks.filter((traceback) => {
//     return traceback.name === name && (period === null || traceback.period === null || traceback.period === period)
//   })
// }


// function normalizePeriod(period) {
//   var dashMatches = period.match(/-/g)
//   if (dashMatches) {
//     var dashesCount = dashMatches.length
//     var monthPrefix = "month:"
//     if (dashesCount === 1 && period.startsWith(monthPrefix)) {
//       return period.slice(monthPrefix.length)
//     }
//   }
//   return period
// }
