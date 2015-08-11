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
import * as model from "../model"
import config from "../config"
import ExternalLink from "./external-link"
import FormulaSource from "./formula-source"
import GitHubLink from "./github-link"
import Highlight from "./highlight"
import List from "./list"
import VariableLink from "./variable-link"


@ImmutablePureComponent
export default class Variable extends Component {
  static propTypes = {
    // TODO use immutable arrayOf(shape)
    $parameterDataByName: PropTypes.any.isRequired,
    $requestedVariableNames: PropTypes.any.isRequired,
    $traceback: PropTypes.any.isRequired,
    $tracebacks: PropTypes.any.isRequired,
    $variableData: PropTypes.any.isRequired,
    countryPackageGitHeadSha: PropTypes.string.isRequired,
  }
  // getParameterValue = (parameter, instant) => {
  //   const type = parameter["@type"]
  //   const isBetween = item => item.start <= instant && item.stop >= instant
  //   if (type === "Parameter") {
  //     return (parameter.values.find(isBetween) || parameter.values[0]).value
  //   } else {
  //     // type === "Scale"
  //     return null
  //   }
  // }
  render() {
    const {$variableData, countryPackageGitHeadSha} = this.props
    const $formula = $variableData.get("formula")
    const formula = $formula && $formula.toJS()
    const label = $variableData.get("label")
    const module = $variableData.get("module")
    const name = $variableData.get("name")
    const line_number = $variableData.get("line_number")
    return (
      <div>
        <p>
          {
            label || (
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
        <p>
          <ExternalLink
            href={`${config.legislationExplorerBaseUrl}/variables/${name}`}
            title="Ouvrir dans l'explorateur de variables"
          >
            Explorateur de variables
          </ExternalLink>
        </p>
        {this.renderVariableDefinitionsList()}
        {formula && <hr />}
        {
          formula && (
            formula["@type"] === "DatedFormula" ?
              this.renderDatedFormula(formula) :
              this.renderSimpleFormula(formula)
          )
        }
      </div>
    )
  }
  renderConsumerVariables = () => {
    const {$requestedVariableNames, $tracebacks, $variableData} = this.props
    const label = $variableData.get("label")
    const name = $variableData.get("name")
    const period = $variableData.get("period")
    const $consumerTracebacks = model.findConsumerTracebacks($tracebacks, name, period)
    return [
      <dt key="dt">Variables appelantes</dt>,
      <dd key="dd">
        {
          $consumerTracebacks && $consumerTracebacks.size ? (
            <List
              items={$consumerTracebacks.sortBy(($consumerTraceback) => $consumerTraceback.get("name")).toArray()}
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
          ) : $requestedVariableNames.includes(name) ? (
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
  renderDatedFormula = (formula) => {
    return formula.dated_formulas.map((datedFormula, idx) => (
      <div key={idx}>
        <h4 style={{display: "inline-block"}}>
          {this.renderDatedFormulaHeading(datedFormula)}
        </h4>
        {this.renderFormula(datedFormula.formula)}
        <hr />
      </div>
    ))
  }
  renderDatedFormulaHeading = (formula) => {
    const {start_instant, stop_instant} = formula
    let heading
    if (start_instant && stop_instant) {
      heading = (
        <FormattedMessage
          message="Formule de calcul du {start} au {stop}"
          start={<FormattedDate format="short" value={start_instant} />}
          stop={<FormattedDate format="short" value={stop_instant} />}
        />
      )
    } else if (start_instant) {
      heading = (
        <FormattedMessage
          message="Formule de calcul depuis le {start}"
          start={<FormattedDate format="short" value={start_instant} />}
        />
      )
    } else if (stop_instant) {
      heading = (
        <FormattedMessage
          message="Formule de calcul jusqu'au {stop}"
          stop={<FormattedDate format="short" value={stop_instant} />}
        />
      )
    }
    return heading
  }
  renderFormula = (formula) => {
    const {$parameterDataByName, $traceback} = this.props
    const {line_number, module, source} = formula
    const $tracebackInputVariablesData = $traceback.get("input_variables")
    const tracebackInputVariablesData = $tracebackInputVariablesData && $tracebackInputVariablesData.toJS()
    const formulaParameterNames = formula.parameters
    return (
      <div>
        {
          (tracebackInputVariablesData || formulaParameterNames) && (
            <dl className="dl-horizontal">
              {tracebackInputVariablesData && <dt>Variables d'entrée</dt>}
              {
                tracebackInputVariablesData && (
                  <dd style={{marginBottom: "1em"}}>
                    <List items={tracebackInputVariablesData} type="inline">
                      {([name, period]) => <VariableLink name={name} period={period}>{name}</VariableLink>}
                    </List>
                  </dd>
                )
              }
              {formulaParameterNames && <dt>Paramètres</dt>}
              {
                formulaParameterNames && (
                  <dd>
                    <List items={formulaParameterNames} type="inline">
                      {
                        (parameterName) => {
                          const $parameter = $parameterDataByName.get(parameterName)
                          const parameter = $parameter && $parameter.toJS()
                          return parameter ? (
                            <span>
                              <ExternalLink params={{name: parameterName}} title={parameter.description} to="parameter">
                                {parameterName}
                              </ExternalLink>
                            </span>
                          ) : (
                            <span>
                              {parameterName}
                              {" "}
                              <span className="label label-warning">inexistant</span>
                            </span>
                          )
                        }
                      }
                    </List>
                  </dd>
                )
              }
            </dl>
          )
        }
        <div style={{position: "relative"}}>
          <Highlight language="python">
            <FormulaSource inputVariablesData={tracebackInputVariablesData}>
              {source}
            </FormulaSource>
          </Highlight>
          <GitHubLink
            blobUrlPath={`${module.split(".").join("/")}.py`}
            commitReference={this.props.countryPackageGitHeadSha}
            endLineNumber={line_number + source.trim().split("\n").length - 1}
            lineNumber={line_number}
            style={{
              position: "absolute",
              right: "0.5em",
              top: "0.3em",
            }}
          >
            {children => <small>{children}</small>}
          </GitHubLink>
        </div>
      </div>
    )
  }
  // renderParameterValue = (parameter) => {
  //   const {$traceback} = this.props
  //   const period = $traceback.get("period")
  //   debugger
  //   return (
  //     <samp>
  //       {this.getParameterValue(parameter, "TODO")}
  //     </samp>
  //   )
  // }
  renderSimpleFormula = (formula) => {
    return (
      <div>
        <h4 style={{display: "inline-block"}}>Formule de calcul</h4>
        {this.renderFormula(formula)}
      </div>
    )
  }
  renderVariableDefinitionsList = () => {
    const {countryPackageGitHeadSha, $variableData} = this.props
    const entityLabelByNamePlural = {
      familles: "Familles",
      foyers_fiscaux: "Foyers fiscaux",
      individus: "Individus",
      menages: "Ménages",
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
              <List items={$variableData.get("labels").entries().toArray()} type="unstyled">
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
