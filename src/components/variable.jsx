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
import Immutable from "immutable"

import {ImmutablePureComponent} from "../decorators"
import * as model from "../model"
import config from "../config"
import ExternalLink from "./external-link"
import FormulaSource from "./formula-source"
import GitHubLink from "./github-link"
import Highlight from "./highlight"
import List from "./list"
import ValuesArray from "./values-array"
import VariableLink from "./variable-link"


@ImmutablePureComponent
export default class Variable extends Component {
  static propTypes = {
    // TODO use immutable arrayOf(shape)
    $arrayByVariableName: PropTypes.any.isRequired,
    $parameterDataByName: PropTypes.any.isRequired,
    $requestedVariableNames: PropTypes.any.isRequired,
    $testCase: PropTypes.any.isRequired,
    $traceback: PropTypes.any.isRequired,
    $tracebacks: PropTypes.any.isRequired,
    $variableData: PropTypes.any.isRequired,
    countryPackageGitHeadSha: PropTypes.string.isRequired,
    onOpen: PropTypes.func.isRequired,
  }
  render() {
    const {$traceback, $variableData, countryPackageGitHeadSha} = this.props
    const $formula = $variableData.get("formula")
    const label = $variableData.get("label")
    const module = $variableData.get("module")
    const name = $variableData.get("name")
    const line_number = $variableData.get("line_number")
    const period = $traceback.get("period")
    const formula = $formula ? model.getActualFormula($formula.toJS(), period) : null
    const formulaParameterNames = formula && formula.parameters
    const $tracebackInputVariablesData = $traceback.get("input_variables")
    const tracebackInputVariablesData = $tracebackInputVariablesData && $tracebackInputVariablesData.toJS()
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
        <hr />
        {this.renderVariableDefinitionsList()}
        {tracebackInputVariablesData && <hr />}
        {tracebackInputVariablesData && this.renderInputVariables(tracebackInputVariablesData)}
        {formulaParameterNames && <hr />}
        {formulaParameterNames && this.renderParameters(formulaParameterNames)}
        {formula && <hr />}
        {formula && this.renderFormula(formula)}
      </div>
    )
  }
  renderConsumerVariables = () => {
    const {$requestedVariableNames, $tracebacks, $variableData, onOpen} = this.props
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
                    <VariableLink
                      label={consumerLabel}
                      name={consumerName}
                      onOpen={onOpen}
                      period={consumerPeriod}
                    />
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
  renderFormula = (formula) => {
    const {$traceback, onOpen} = this.props
    const {line_number, module, source} = formula
    const $tracebackInputVariablesData = $traceback.get("input_variables")
    const tracebackInputVariablesData = $tracebackInputVariablesData && $tracebackInputVariablesData.toJS()
    return (
      <div>
        <h4>
          {
            formula.datedFormulaData ?
              this.renderFormulaHeading(formula.datedFormulaData) :
              "Formule de calcul"
          }
        </h4>
        <div style={{position: "relative"}}>
          <Highlight language="python">
            <FormulaSource inputVariablesData={tracebackInputVariablesData} onOpen={onOpen}>
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
  renderFormulaHeading = ({startInstant, stopInstant}) => {
    let heading
    if (startInstant && stopInstant) {
      heading = (
        <FormattedMessage
          message="Formule de calcul du {start} au {stop}"
          start={<FormattedDate format="short" value={startInstant} />}
          stop={<FormattedDate format="short" value={stopInstant} />}
        />
      )
    } else if (startInstant) {
      heading = (
        <FormattedMessage
          message="Formule de calcul depuis le {start}"
          start={<FormattedDate format="short" value={startInstant} />}
        />
      )
    } else if (stopInstant) {
      heading = (
        <FormattedMessage
          message="Formule de calcul jusqu'au {stop}"
          stop={<FormattedDate format="short" value={stopInstant} />}
        />
      )
    }
    return heading
  }
  renderInputVariables = (tracebackInputVariablesData) => {
    const {$arrayByVariableName, $testCase, $traceback, $tracebacks, onOpen} = this.props
    const cellType = $traceback.get("cell_type")
    const entitySymbol = $traceback.get("entity")
    const entityKeyPlural = model.entitySymbolToKeyPlural(entitySymbol)
    const $entities = $testCase.get(entityKeyPlural)
    return (
      <div>
        <h4>Variables d'entrée</h4>
          <table className="table table-striped">
          <thead>
            <tr>
              <th>Variable</th>
              <th className="text-right">Valeur</th>
            </tr>
          </thead>
          <tbody>
            {
              tracebackInputVariablesData.map(([name, period], idx) => {
                const inputVariableTraceback = model.findTraceback($tracebacks, name, period)
                const label = inputVariableTraceback && inputVariableTraceback.label
                const $arrayByPeriodOrArray = $arrayByVariableName.get(name)
                const $array = Immutable.List.isList($arrayByPeriodOrArray) ?
                  $arrayByPeriodOrArray :
                  $arrayByPeriodOrArray.get(period)
                return (
                  <tr key={idx}>
                    <td>
                      <VariableLink
                        label={label}
                        name={name}
                        onOpen={onOpen}
                        period={period}
                      />
                    </td>
                    <td className="text-right">
                      <ValuesArray
                        $array={$array}
                        $entities={$entities}
                        cellType={cellType}
                        entityKeyPlural={entityKeyPlural}
                      />
                      <div className="text-muted">{entityKeyPlural}</div>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
  renderParameters = (formulaParameterNames) => {
    const {$parameterDataByName} = this.props
    return (
      <div>
        <h4>Paramètres</h4>
        <List items={formulaParameterNames} type="inline">
          {
            (name) => {
              const $parameter = $parameterDataByName.get(name)
              const parameter = $parameter && $parameter.toJS()
              const description = parameter && parameter.description
              return (
                <ExternalLink
                  href={`${config.legislationExplorerBaseUrl}/parameters/${name}`}
                  title={description}
                >
                  {name}
                </ExternalLink>
              )
            }
          }
        </List>
      </div>
    )
  }
  renderVariableDefinitionsList = () => {
    const {countryPackageGitHeadSha, $variableData} = this.props
    const cerfa_field = $variableData.get("cerfa_field")
    const defaultValue = $variableData.get("default")
    const line_number = $variableData.get("line_number")
    const module = $variableData.get("module")
    const start = $variableData.get("start")
    const type = $variableData.get("@type")
    const url = $variableData.get("url")
    const val_type = $variableData.get("val_type")
    return (
      <dl className="dl-horizontal">
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
        <dd>
          <samp>
            {
              type === "Boolean" ?
                JSON.stringify(defaultValue) :
                defaultValue
            }
          </samp>
        </dd>
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
              let sourceCodeText = module
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
