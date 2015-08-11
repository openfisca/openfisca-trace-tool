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
import classNames from "classnames"
import Immutable from "immutable"

// import VariableLink from "./variable-link"
import {ImmutablePureComponent} from "../decorators"
import * as model from "../model"
import Value from "./value"
import Variable from "./variable"


@ImmutablePureComponent
export default class TracebackItem extends Component {
  static propTypes = {
    // TODO use immutable arrayOf(shape)
    $arrayByPeriodOrArray: PropTypes.any.isRequired,
    $parameterDataByName: PropTypes.any.isRequired,
    $requestedVariableNames: PropTypes.any.isRequired,
    $selectedScenarioData: PropTypes.any.isRequired,
    $traceback: PropTypes.any.isRequired,
    $tracebacks: PropTypes.any.isRequired,
    $variableData: PropTypes.any,
    countryPackageGitHeadSha: PropTypes.string,
    errorMessage: PropTypes.string,
    id: PropTypes.string.isRequired,
    isOpened: PropTypes.bool,
    onToggle: PropTypes.func.isRequired,
  }
  handleRetryClick = (event) => {
    event.preventDefault()
    const {$traceback, id, onToggle} = this.props
    onToggle($traceback, id, true)
  }
  handleToggleClick = (event) => {
    event.preventDefault()
    const {$traceback, id, isOpened, onToggle} = this.props
    onToggle($traceback, id, !isOpened)
  }
  render() {
    const {
      $arrayByPeriodOrArray,
      $parameterDataByName,
      $requestedVariableNames,
      $selectedScenarioData,
      $traceback,
      $tracebacks,
      $variableData,
      countryPackageGitHeadSha,
      errorMessage,
      id,
      isOpened,
    } = this.props
    function truncate(str, length) {
      const truncated = str.slice(0, length)
      return truncated.length < str.length ? truncated + "…" : truncated
    }
    const shortLabelMaxLength = 60
    const cellType = $traceback.get("cell_type")
    const entitySymbol = $traceback.get("entity")
    const label = $traceback.get("label")
    const name = $traceback.get("name")
    const period = $traceback.get("period")
    const entityKeyPlural = model.entitySymbolToKeyPlural(entitySymbol)
    const $testCase = $selectedScenarioData.get("test_case")
    const $entities = $testCase.get(entityKeyPlural)
    const $array = Immutable.List.isList($arrayByPeriodOrArray) ?
      $arrayByPeriodOrArray :
      $arrayByPeriodOrArray.get(period)
    return (
      <div className="panel panel-default" id={id}>
        <div className="clearfix panel-heading">
          <div className="pull-left">
            <a
              href="#"
              onClick={this.handleToggleClick}
              title={`${isOpened ? "Fermer" : "Ouvrir"} cette étape du calcul`}
            >
              <span
                aria-hidden="true"
                className={
                  classNames("glyphicon", isOpened ? "glyphicon-chevron-down" : "glyphicon-chevron-right")
                }
              />
              {" "}
              {name}
              {" "}
              {period || "(sans période)"}
            </a>
            {
              !isOpened && (
                <div className="text-muted">
                  {
                    label ?
                      (label.length <= shortLabelMaxLength ? label : truncate(label, shortLabelMaxLength)) : (
                        <span className="label label-warning">
                          aucun libellé
                        </span>
                      )
                  }
                </div>
              )
            }
          </div>
          <div className="pull-right text-right">
            <samp className="text-muted" style={{display: "inline-block", marginRight: "0.5em"}}>[</samp>
            <ul className="list-inline" style={{display: "inline-block"}}>
              {
                $array.map((value, idx) => (
                  <li key={idx}>
                    <samp>
                      <Value
                        title={() => {
                          let title = `${entityKeyPlural}[${idx}]`
                          const entityId = $entities.getIn([idx, "id"])
                          if (entityId) {
                            title += `, id=${entityId}`
                          }
                          return title
                        }()}
                        type={cellType}
                      >
                        {value}
                      </Value>
                    </samp>
                    {idx < $array.size - 1 && <span className="text-muted">, </span>}
                  </li>
                ))
              }
            </ul>
            <samp className="text-muted" style={{display: "inline-block"}}>]</samp>
            <div className="text-muted">{entityKeyPlural}</div>
          </div>
        </div>
        <div className={classNames("panel-body", {hide: !isOpened})}>
          {
            errorMessage ? (
              <div className="alert alert-danger">
                <p>
                  <strong>Erreur lors de l'appel de l'API !</strong>
                  <a href="#" onClick={this.handleRetryClick} style={{marginLeft: "1em"}}>
                    Réessayer
                  </a>
                </p>
                <pre>{errorMessage}</pre>
              </div>
            ) : $variableData && countryPackageGitHeadSha ? (
              <Variable
                $parameterDataByName={$parameterDataByName}
                $requestedVariableNames={$requestedVariableNames}
                $traceback={$traceback}
                $tracebacks={$tracebacks}
                $variableData={$variableData}
                countryPackageGitHeadSha={countryPackageGitHeadSha}
              />
            ) : null
          }
        </div>
      </div>
    )
  }
}
