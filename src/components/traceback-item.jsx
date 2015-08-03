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

import {ImmutablePureComponent} from "../decorators"
// import config from "../config"
import model from "../model"
import Value from "./value"
// import VariableLink from "./variable-link"


@ImmutablePureComponent
export default class TracebackItem extends Component {
  static propTypes = {
    // TODO use immutable arrayOf(shape)
    $array: PropTypes.any.isRequired,
    $traceback: PropTypes.any.isRequired,
    $variableData: PropTypes.any,
    id: PropTypes.string.isRequired,
    isOpened: PropTypes.bool,
    onToggle: PropTypes.func.isRequired,
    variableErrorMessage: PropTypes.string,
  }
  handleClick = (event) => {
    event.preventDefault()
    const {$traceback, id, isOpened, onToggle} = this.props
    onToggle($traceback, id, !isOpened)
  }
  render = () => {
    const {$array, $traceback, $variableData, errorMessage, id, isOpened} = this.props
    const cellType = $traceback.get("cell_type")
    const entity = $traceback.get("entity")
    const label = $traceback.get("label")
    const name = $traceback.get("name")
    const period = $traceback.get("period")
    const entityKeyPlural = model.entitySymbolToKeyPlural(entity)
    return (
      <div className="panel panel-default" id={id}>
        <div className="clearfix panel-heading">
          <a href="#" onClick={this.handleClick} title={label}>
            <span
              aria-hidden="true"
              className={
                classNames("glyphicon", isOpened ? "glyphicon-chevron-down" : "glyphicon-chevron-right")
              }
            />
            {" "}
            {name}
            {" "}
            {period || "sans période"}
          </a>
          <div className="pull-right text-right">
            <ul className="list-inline">
              {
                $array.map((value, idx) => (
                  <li key={idx}>
                    <samp>
                      <Value title={`${entityKeyPlural}[${idx}]`} type={cellType} value={value} />
                    </samp>
                    {idx < $array.size - 1 && ", "}
                  </li>
                ))
              }
            </ul>
            <p className="text-muted">{entityKeyPlural}</p>
          </div>
        </div>
        {
          isOpened && (
            <div className="panel-body">
              {
                !$variableData ? (
                  <p>Chargement en cours…</p>
                ) : (
                  errorMessage ? (
                    <div className="alert alert-danger">
                      <p>
                        <strong>Erreur lors de l'appel de l'API !</strong>
                      </p>
                      <pre>{errorMessage}</pre>
                    </div>
                  ) : (
                    <pre>{JSON.stringify($variableData, null, 2)}</pre>
                  )
                //     <div style={{position: "absolute", right: 7, top: 5}}>
                //       <a
                //         href={config.legislationExplorerUrl + "/variables/" + this.props.name}
                //         rel="external"
                //         target="_blank"
                //         title="Ouvrir dans l'explorateur de variables, hors du cadre de cette simulation"
                //       >
                //         Page de la variable
                //       </a>
                //     </div>
                )
              }
            </div>
          )
        }
      </div>
    )
  }
  // renderConsumers = () => {
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
  // renderFormula = (formula) => {
  //   const variableId = model.buildVariableId(this.props.name, this.props.period)
  //   const accordionId = "accordion-" + variableId
  //   if (formula["@type"] === "DatedFormula") {
  //     return (
  //       <div>
  //         <h3>DatedFormula <small>Fonctions datées</small></h3>
  //         <p>Une ou plusieurs des formules ci-dessous sont appelées en fonction de la période demandée.</p>
  //         {formula.doc && formula.doc !== this.props.label && <p>{formula.doc}</p>}
  //         <div aria-multiselectable="true" className="panel-group" id={accordionId} role="tablist">
  //           {
  //             formula.dated_formulas.map((datedFormula, idx) => {
  //               var mainVariableId = accordionId + "-" + idx
  //               var headingId = mainVariableId + "-heading"
  //               return (
  //                 <div className="panel panel-default" key={idx}>
  //                   <div className="panel-heading" id={headingId} role="tab">
  //                     <h4 className="panel-title">
  //                       <a
  //                         aria-controls={mainVariableId}
  //                         aria-expanded="false"
  //                         data-parent={"#" + accordionId}
  //                         data-toggle="collapse"
  //                         href={"#" + mainVariableId}>
  //                         {datedFormula.start_instant + " – " + datedFormula.stop_instant}
  //                       </a>
  //                     </h4>
  //                   </div>
  //                   <div
  //                     aria-labelledby={headingId}
  //                     className={classNames({collapse: true, "panel-collapse ": true})}
  //                     id={mainVariableId}
  //                     role="tabpanel">
  //                     <div className="panel-body">
  //                       {this.renderFormula(datedFormula.formula)}
  //                     </div>
  //                   </div>
  //                 </div>
  //               )
  //             })
  //           }
  //         </div>
  //       </div>
  //     )
  //   } else if (formula["@type"] === "SimpleFormula") {
  //     var githubUrl = "https://github.com/openfisca/openfisca-france/tree/master/" +
  //       formula.module.split(".").join("/") + ".py#L" + formula.line_number + "-" +
  //       (formula.line_number + formula.source.trim().split("\n").length - 1)
  //     var sourceCodeId = model.guid()
  //     return (
  //       <div>
  //         {formula.doc && formula.doc !== this.props.label && <p>{formula.doc}</p>}
  //         <div>
  //           <h3>Variables d'entrée</h3>
  //           <table className="table">
  //             <thead>
  //               <tr>
  //                 <th>Nom</th>
  //                 <th>Période</th>
  //                 <th>Libellé</th>
  //                 <th>Entité</th>
  //                 {this.props.inputVariables && <th className="text-right">Valeur</th>}
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {
  //                 this.props.inputVariables && this.props.inputVariables.map((inputVariableData, idx) => {
  //                   var argumentName = inputVariableData[0],
  //                     argumentPeriod = inputVariableData[1]
  //                   var isComputed = argumentName in this.props.variableByName // Useful with some dated formulas.
  //                   var argumentValues = isComputed ? (
  //                     Array.isArray(this.props.variableByName[argumentName]) ?
  //                       this.props.variableByName[argumentName] :
  //                       this.props.variableByName[argumentName][argumentPeriod]
  //                   ) : null
  //                   // TODO index tracebacks before
  //                   var argumentTraceback = model.findTraceback(this.props.tracebacks, argumentName, argumentPeriod)
  //                   return argumentTraceback && (
  //                     <tr key={idx}>
  //                       <td>
  //                         <VariableLink name={argumentName} onOpen={this.props.onOpen} period={argumentPeriod}>
  //                           {argumentName}
  //                         </VariableLink>
  //                       </td>
  //                       <td>{argumentPeriod || "–"}</td>
  //                       <td>{argumentTraceback.label !== argumentName ? argumentTraceback.label : ""}</td>
  //                       <td>
  //                         <span className={
  //                           classNames("label", "label-" + model.getEntityBackgroundColor(argumentTraceback.entity))
  //                         }>
  //                           {argumentTraceback.entity}
  //                         </span>
  //                       </td>
  //                       <td>
  //                         {
  //                           argumentValues && (
  //                             <ul className="list-unstyled">
  //                               {
  //                                 argumentValues.map((value, valueIdx) => (
  //                                   <li className="text-right" key={valueIdx}>
  //                                     <samp>
  //                                       <Value
  //                                         isDefaultArgument={this.props.hasAllDefaultArguments}
  //                                         type={null}
  //                                         value={value}
  //                                       />
  //                                     </samp>
  //                                   </li>
  //                                 ))
  //                               }
  //                             </ul>
  //                           )
  //                         }
  //                       </td>
  //                     </tr>
  //                   )
  //                 })
  //               }
  //             </tbody>
  //           </table>
  //         </div>
  //         <h3>
  //           <a
  //             aria-controls={sourceCodeId}
  //             aria-expanded="false"
  //             data-target={"#" + sourceCodeId}
  //             data-toggle="collapse"
  //             href="#"
  //             onClick={function(event) { event.preventDefault() }}
  //             title="afficher / masquer"
  //           >
  //             Code source
  //           </a>
  //           <span> – <a href={githubUrl} rel="external" target="_blank">ouvrir dans GitHub</a></span>
  //         </h3>
  //         <pre className="collapse" id={sourceCodeId}>
  //           <code data-language="python">{formula.source}</code>
  //         </pre>
  //       </div>
  //     )
  //   }
  // }
  // renderPanelBodyContent = () => {
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
  //             {this.props.holder.formula && !this.props.usedPeriods && this.renderFormula(this.props.holder.formula)}
  //           </div>
  //         )
  //       }
  //       {this.props.consumerTracebacks && this.renderConsumers()}
  //     </div>
  //   )
  // }
  // renderUsedPeriods = () => {
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
