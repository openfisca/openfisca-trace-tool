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

// import VariableLink from "./variable-link"
import {ImmutablePureComponent} from "../decorators"
import * as model from "../model"
import config from "../config"
import ExternalLink from "./external-link"
import Value from "./value"
import Variable from "./variable"


@ImmutablePureComponent
export default class TracebackItem extends Component {
  static propTypes = {
    // TODO use immutable arrayOf(shape)
    $array: PropTypes.any.isRequired,
    $consumerTracebacks: PropTypes.any,
    $requestedVariables: PropTypes.any.isRequired,
    $selectedScenarioData: PropTypes.any.isRequired,
    $traceback: PropTypes.any.isRequired,
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
      $array,
      $consumerTracebacks,
      $requestedVariables,
      $selectedScenarioData,
      $traceback,
      $variableData,
      countryPackageGitHeadSha,
      errorMessage,
      id,
      isOpened,
    } = this.props
    const cellType = $traceback.get("cell_type")
    const entitySymbol = $traceback.get("entity")
    const label = $traceback.get("label")
    const name = $traceback.get("name")
    const period = $traceback.get("period")
    const entityKeyPlural = model.entitySymbolToKeyPlural(entitySymbol)
    const $testCase = $selectedScenarioData.get("test_case")
    const $entities = $testCase.get(entityKeyPlural)
    return (
      <div className="panel panel-default" id={id}>
        <div className="clearfix panel-heading">
          <a href="#" onClick={this.handleToggleClick}>
            <span
              aria-hidden="true"
              className={
                classNames("glyphicon", isOpened ? "glyphicon-chevron-down" : "glyphicon-chevron-right")
              }
            />
            {" "}
            <abbr title={label}>{name}</abbr>
            {" "}
            {period || "(sans période)"}
          </a>
          <ExternalLink
            href={`${config.legislationExplorerBaseUrl}/variables/${name}`}
            style={{marginLeft: "1em"}}
            title="Ouvrir dans l'explorateur de variables"
          >
            ouvrir
          </ExternalLink>
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
            <p className="text-muted">{entityKeyPlural}</p>
          </div>
        </div>
        {
          isOpened && (
            <div className="panel-body">
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
                    $consumerTracebacks={$consumerTracebacks}
                    $requestedVariables={$requestedVariables}
                    $variableData={$variableData}
                    countryPackageGitHeadSha={countryPackageGitHeadSha}
                  />
                ) : (
                  <p>Chargement en cours…</p>
                )
              }
            </div>
          )
        }
      </div>
    )
  }
  // renderConsumers() {
  //   return (
  //     <div>
  //       <h3>Variables appelantes</h3>
  //       <ul className="computed-consumers">
  //         {
  //           this.props.consumerTracebacks.map((consumerTraceback, idx) => (
  //             <li key={idx}>
  //               <VariableLink
  //                 name={consumerTraceback.name}
  //                 onOpen={this.props.onOpen}
  //                 period={consumerTraceback.period}>
  //                 {consumerTraceback.name + " / " + consumerTraceback.period}
  //               </VariableLink>
  //               {` : ${consumerTraceback.label}`}
  //             </li>
  //           ))
  //         }
  //       </ul>
  //     </div>
  //   )
  // }
  // renderPanelBodyContent() {
  //   return (
  //     <div>
  //       {
  //         this.props.usedPeriods ? (
  //           this.renderUsedPeriods()
  //         ) : (
  //           <div>
  //             {
  //               (this.props.hasAllDefaultArguments || !this.props.isComputed) && (
  //                 <div>
  //                   {
  //                     this.props.hasAllDefaultArguments && (
  //                       <span className="label label-default">Valeurs par défaut</span>
  //                     )
  //                   }
  //                   {
  //                     !this.props.isComputed && (
  //                       <span className="label label-default">Variable d'entrée</span>
  //                     )
  //                   }
  //                 </div>
  //               )
  //             }
  //             {this.props.holder.formula && !this.props.usedPeriods &&
  //                this.renderFormula(this.props.holder.formula)}
  //           </div>
  //         )
  //       }
  //       {this.props.consumerTracebacks && this.renderConsumers()}
  //     </div>
  //   )
  // }
  // renderUsedPeriods() {
  //   return (
  //     <div>
  //       <h3>Valeurs extrapolées depuis</h3>
  //       <table className="table">
  //         <thead>
  //           <tr>
  //             <th>Nom</th>
  //             <th>Période</th>
  //             <th className="text-right">Valeur</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {
  //             this.props.usedPeriods.map((period, idx) => (
  //               <tr key={idx}>
  //                 <td>
  //                   <VariableLink name={this.props.name} onOpen={this.props.onOpen} period={period}>
  //                     {this.props.name}
  //                   </VariableLink>
  //                 </td>
  //                 <td>
  //                   {period}
  //                 </td>
  //                 <td>
  //                   <ul className="list-unstyled">
  //                     {
  //                       this.props.variableByName[this.props.name][period].map((value, valueIdx) => (
  //                         <li className="text-right" key={valueIdx}>
  //                           <samp>
  //                             <Value
  //                               isDefaultArgument={value === this.props.default}
  //                               type={this.props.cellType}
  //                               value={value}
  //                             />
  //                           </samp>
  //                         </li>
  //                       ))
  //                     }
  //                   </ul>
  //                 </td>
  //               </tr>
  //             ))
  //           }
  //         </tbody>
  //       </table>
  //     </div>
  //   )
  // }
}
