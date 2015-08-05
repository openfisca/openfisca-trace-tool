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
import {FormattedDate, FormattedMessage} from "react-intl"

import {ImmutablePureComponent} from "../decorators"
import ExternalLink from "./external-link"
import GitHubLink from "./github-link"
import List from "./list"
import VariableLink from "./variable-link"


@ImmutablePureComponent
export default class Variable extends Component {
  static propTypes = {
    // TODO use immutable arrayOf(shape)
    $consumerTracebacks: PropTypes.any,
    $requestedVariables: PropTypes.any.isRequired,
    $variableData: PropTypes.any.isRequired,
    countryPackageGitHeadSha: PropTypes.string.isRequired,
  }
  render() {
    const {$variableData, countryPackageGitHeadSha} = this.props
    const label = $variableData.get("label")
    const module = $variableData.get("module")
    const line_number = $variableData.get("line_number")
    return (
      <div>
        <p>
          {
            label && label !== name ?
              label : (
                <span className="label label-warning">
                  aucun libellé
                  <GitHubLink
                    blobUrlPath={`${module.split(".").join("/")}.py`}
                    commitReference={countryPackageGitHeadSha}
                    lineNumber={line_number}
                    style={{marginLeft: "1em"}}
                    text="ajouter"
                    title="Ajouter un libellé via GitHub"
                  />
                </span>
              )
          }
        </p>
        {this.renderVariableDefinitionsList()}
        <hr />
        {
          // formula && (
          //   formula["@type"] === "DatedFormula" ?
          //     this.renderDatedFormula(formula) :
          //     this.renderSimpleFormula(formula)
          // )
        }
      </div>
    )

    // // const variableId = model.buildVariableId(this.props.name, this.props.period)
    // if (formula["@type"] === "DatedFormula") {
    //   return (
    //     <div>
    //       <h3>DatedFormula <small>Fonctions datées</small></h3>
    //       <p>Une ou plusieurs des formules ci-dessous sont appelées en fonction de la période demandée.</p>
    //       {formula.doc && formula.doc !== this.props.label && <p>{formula.doc}</p>}
    //       <div aria-multiselectable="true" className="panel-group" id={accordionId} role="tablist">
    //         {
    //           formula.dated_formulas.map((datedFormula, idx) => {
    //             var mainVariableId = accordionId + "-" + idx
    //             var headingId = mainVariableId + "-heading"
    //             return (
    //               <div className="panel panel-default" key={idx}>
    //                 <div className="panel-heading" id={headingId} role="tab">
    //                   <h4 className="panel-title">
    //                     <a
    //                       aria-controls={mainVariableId}
    //                       aria-expanded="false"
    //                       data-parent={"#" + accordionId}
    //                       data-toggle="collapse"
    //                       href={"#" + mainVariableId}>
    //                       {datedFormula.start_instant + " – " + datedFormula.stop_instant}
    //                     </a>
    //                   </h4>
    //                 </div>
    //                 <div
    //                   aria-labelledby={headingId}
    //                   className={classNames({collapse: true, "panel-collapse ": true})}
    //                   id={mainVariableId}
    //                   role="tabpanel">
    //                   <div className="panel-body">
    //                     {this.renderFormula(datedFormula.formula)}
    //                   </div>
    //                 </div>
    //               </div>
    //             )
    //           })
    //         }
    //       </div>
    //     </div>
    //   )
    // } else if (formula["@type"] === "SimpleFormula") {
    //   var githubUrl = "https://github.com/openfisca/openfisca-france/tree/master/" +
    //     formula.module.split(".").join("/") + ".py#L" + formula.line_number + "-" +
    //     (formula.line_number + formula.source.trim().split("\n").length - 1)
    //   var sourceCodeId = model.guid()
    //   return (
    //     <div>
    //       {formula.doc && formula.doc !== this.props.label && <p>{formula.doc}</p>}
    //       <div>
    //         <h3>Variables d'entrée</h3>
    //         <table className="table">
    //           <thead>
    //             <tr>
    //               <th>Nom</th>
    //               <th>Période</th>
    //               <th>Libellé</th>
    //               <th>Entité</th>
    //               {this.props.inputVariables && <th className="text-right">Valeur</th>}
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {
    //               this.props.inputVariables && this.props.inputVariables.map((inputVariableData, idx) => {
    //                 var argumentName = inputVariableData[0],
    //                   argumentPeriod = inputVariableData[1]
    //                 var isComputed = argumentName in this.props.variableByName // Useful with some dated formulas.
    //                 var argumentValues = isComputed ? (
    //                   Array.isArray(this.props.variableByName[argumentName]) ?
    //                     this.props.variableByName[argumentName] :
    //                     this.props.variableByName[argumentName][argumentPeriod]
    //                 ) : null
    //                 // TODO index tracebacks before
    //                 var argumentTraceback = model.findTraceback(this.props.tracebacks, argumentName, argumentPeriod)
    //                 return argumentTraceback && (
    //                   <tr key={idx}>
    //                     <td>
    //                       <VariableLink name={argumentName} onOpen={this.props.onOpen} period={argumentPeriod}>
    //                         {argumentName}
    //                       </VariableLink>
    //                     </td>
    //                     <td>{argumentPeriod || "–"}</td>
    //                     <td>{argumentTraceback.label !== argumentName ? argumentTraceback.label : ""}</td>
    //                     <td>
    //                       <span className={
    //                         classNames("label", "label-" + model.getEntityBackgroundColor(argumentTraceback.entity))
    //                       }>
    //                         {argumentTraceback.entity}
    //                       </span>
    //                     </td>
    //                     <td>
    //                       {
    //                         argumentValues && (
    //                           <ul className="list-unstyled">
    //                             {
    //                               argumentValues.map((value, valueIdx) => (
    //                                 <li className="text-right" key={valueIdx}>
    //                                   <samp>
    //                                     <Value
    //                                       isDefaultArgument={this.props.hasAllDefaultArguments}
    //                                       type={null}
    //                                       value={value}
    //                                     />
    //                                   </samp>
    //                                 </li>
    //                               ))
    //                             }
    //                           </ul>
    //                         )
    //                       }
    //                     </td>
    //                   </tr>
    //                 )
    //               })
    //             }
    //           </tbody>
    //         </table>
    //       </div>
    //       <h3>
    //         <a
    //           aria-controls={sourceCodeId}
    //           aria-expanded="false"
    //           data-target={"#" + sourceCodeId}
    //           data-toggle="collapse"
    //           href="#"
    //           onClick={function(event) { event.preventDefault() }}
    //           title="afficher / masquer"
    //         >
    //           Code source
    //         </a>
    //         <span> – <a href={githubUrl} rel="external" target="_blank">ouvrir dans GitHub</a></span>
    //       </h3>
    //       <pre className="collapse" id={sourceCodeId}>
    //         <code data-language="python">{formula.source}</code>
    //       </pre>
    //     </div>
    //   )
    // }
  }
  renderConsumerVariables = () => {
    const {$consumerTracebacks, $requestedVariables, $variableData} = this.props
    const label = $variableData.get("label")
    const name = $variableData.get("name")
    return [
      <dt key="dt">Variables appelantes</dt>,
      <dd key="dd">
        {
          $consumerTracebacks && $consumerTracebacks.size ? (
            <List
              items={$consumerTracebacks.sortBy(($consumerTraceback) => $consumerTraceback.get("name"))}
              type="inline"
            >
              {
                ($consumerTraceback) => {
                  const consumerLabel = $consumerTraceback.get("label")
                  const consumerName = $consumerTraceback.get("name")
                  const consumerPeriod = $consumerTraceback.get("period")
                  return (
                    <VariableLink name={consumerName} period={consumerPeriod}>
                      <abbr title={consumerLabel}>{consumerName}</abbr>
                      {" "}
                      {consumerPeriod || "(sans période)"}
                    </VariableLink>
                  )
                }
              }
            </List>
          ) : $requestedVariables.includes(name) ? (
            <p>
              <FormattedMessage
                message="aucune car la variable {name} a été directement requêtée"
                name={<abbr title={label}>{name}</abbr>}
              />
            </p>
          ) : (
            <p>
              <FormattedMessage
                message="aucune pourtant la variable {name} n'a pas été directement requêtée"
                name={<abbr title={label}>{name}</abbr>}
              />
              {" "}
              <span className="label label-danger">anomalie</span>
            </p>
          )
        }
      </dd>,
    ]
  }
  renderVariableDefinitionsList = () => {
    const {countryPackageGitHeadSha, $variableData} = this.props
    const entityLabelByNamePlural = {
      familles: "Famille",
      foyers_fiscaux: "Foyer fiscal",
      individus: "Individu",
      menages: "Ménage",
    }
    const cerfa_field = $variableData.get("cerfa_field")
    const defaultValue = $variableData.get("default")
    const entity = $variableData.get("entity")
    const line_number = $variableData.get("line_number")
    const module = $variableData.get("module")
    const start = $variableData.get("start")
    const type = $variableData.get("@type")
    const url = $variableData.get("url")
    const val_type = $variableData.get("val_type")
    return (
      <dl className="dl-horizontal">
        <dt>Entité</dt>
        <dd>{entityLabelByNamePlural[entity]}</dd>
        <dt>Type</dt>
        <dd>
          <code>{type}</code>
          {val_type && ` (${val_type})`}
        </dd>
        {type === "Enumeration" && <dt>Libellés</dt>}
        {
          type === "Enumeration" && (
            <dd>
              <List items={$variableData.get("labels").entries()} type="unstyled">
                {(entry) => `${entry[0]} = ${entry[1]}`}
              </List>
            </dd>
          )
        }
        <dt>Valeur par défaut</dt>
        <dd><samp>{defaultValue}</samp></dd>
        {
          cerfa_field && [
            <dt key="dt">Cases CERFA</dt>,
            <dd key="dd">
              {
                typeof cerfa_field === "string" ?
                  cerfa_field :
                  Object.values(cerfa_field).join(", ")
              }
            </dd>,
          ]
        }
        {
          start && [
            <dt key="dt">Démarre le</dt>,
            <dd key="dd">
              <FormattedDate format="short" value={start} />
            </dd>,
          ]
        }
        {
          url && [
            <dt key="dt">URL externe</dt>,
            <dd key="dd">
              <ExternalLink href={url}>
                {url}
              </ExternalLink>
            </dd>,
          ]
        }
        <dt>Code source</dt>
        <dd>
          {
            () => {
              var sourceCodeText = module
              if (line_number) {
                sourceCodeText += ` ligne ${line_number}`
              }
              return sourceCodeText
            }()
          }
          <GitHubLink
            blobUrlPath={`${module.split(".").join("/")}.py`}
            commitReference={countryPackageGitHeadSha}
            lineNumber={line_number}
            style={{marginLeft: "1em"}}
          >
            {children => <small>{children}</small>}
          </GitHubLink>
        </dd>
        {this.renderConsumerVariables()}
      </dl>
    )
  }
}
