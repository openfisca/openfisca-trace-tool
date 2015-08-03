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


import {Component, PropTypes} from "react"

import {ImmutablePureComponent} from "../decorators"
import model from "../model"
import TracebackItem from "./traceback-item"


@ImmutablePureComponent
export default class TracebacksList extends Component {
  static propTypes = {
    // TODO use immutable arrayOf(shape)
    $arrayByVariableName: PropTypes.any.isRequired,
    $isOpenedById: PropTypes.any.isRequired,
    $variableDataByName: PropTypes.any.isRequired,
    $variableErrorMessageByName: PropTypes.any.isRequired,
    $tracebacks: PropTypes.any.isRequired,
    onToggle: PropTypes.func.isRequired,
  }
  render = () => {
    const {
      $arrayByVariableName,
      $isOpenedById,
      $tracebacks,
      $variableDataByName,
      $variableErrorMessageByName,
      onToggle,
    } = this.props
    const tracebacksLimit = 500
    const $reverseTracebacks = $tracebacks.reverse().slice(0, tracebacksLimit)
    return (
      <ul className="list-unstyled">
        {
          $reverseTracebacks.map(($traceback, idx) => {
            const name = $traceback.get("name")
            const period = $traceback.get("period")
            const $arrayByPeriodOrArray = $arrayByVariableName.get(name)
            const $array = Array.isArray($arrayByPeriodOrArray.toJS()) ?
              $arrayByPeriodOrArray :
              $arrayByPeriodOrArray.get(period)
            const $variableData = $variableDataByName.get(name)
            const id = model.buildVariableId(name, period)
            const errorMessage = $variableErrorMessageByName.get(name)
            return (
              <li key={idx}>
                <TracebackItem
                  $array={$array}
                  $traceback={$traceback}
                  $variableData={$variableData}
                  errorMessage={errorMessage}
                  id={id}
                  isOpened={$isOpenedById.get(id)}
                  onToggle={onToggle}
                />
              </li>
            )
          })
        }
        {
          $reverseTracebacks.size < $tracebacks.size && (
            <p>La liste a été tronquée, seuls les {tracebacksLimit} premiers éléments sont affichés.</p>
          )
        }
      </ul>
    )
  }
}