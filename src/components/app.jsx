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


import {Component} from "react"
import Immutable from "immutable"

import * as model from "../model"
import * as webservices from "../webservices"
import config from "../config"
import Layout from "./layout"
import SimulationEditor from "./simulation-editor"
import TracebacksList from "./tracebacks-list"


export default class App extends Component {
  calculate = () => {
    this.setState({isCalculateInProgress: true}, async () => {
      const {$simulationData} = this.state
      const simulationData = $simulationData.toJS()
      let calculateData
      let changeset = {isCalculateInProgress: false}
      try {
        // TODO Allow api_url GET param
        calculateData = await model.calculate(config.apiBaseUrl, simulationData)
      } catch (error) {
        let simulationErrorMessage = error.data ? JSON.stringify(error.data, null, 2) : error.message
        changeset = {
          ...changeset,
          $arrayByVariableNameByScenarioIdx: null,
          $tracebacksByScenarioIdx: null,
          simulationErrorMessage,
        }
        this.setState(changeset)
        return
      }
      let $tracebacksByScenarioIdx = Immutable.fromJS(calculateData.tracebacks).map(
        ($tracebacks) => $tracebacks.reverse()
      )
      changeset = {
        ...changeset,
        $arrayByVariableNameByScenarioIdx: Immutable.fromJS(calculateData.variables),
        $tracebacksByScenarioIdx,
        simulationErrorMessage: null,
      }
      this.setState(changeset)
    })
  }
  constructor(props) {
    super(props)
    this.state = {
      $arrayByVariableNameByScenarioIdx: null,
      $isOpenedByVariableId: Immutable.Map(),
      $parameterDataByName: Immutable.Map(),
      $simulationData: Immutable.fromJS(model.defaultSimulationData),
      $tracebacksByScenarioIdx: null,
      $variableDataByName: Immutable.Map(),
      $variableErrorMessageByName: Immutable.Map(),
      countryPackageGitHeadSha: null,
      isSimulationEditorValid: true,
      isCalculateInProgress: false,
      nameFilter: null,
      parametersFilePath: null,
      selectedScenarioIdx: 0,
      simulationErrorMessage: null,
      tracebacksLimit: 100,
    }
  }
  handleNameFilterChange = (event) => {
    const nameFilter = event.target.value
    this.setState({nameFilter})
  }
  handleSearchFormSubmit = (event) => {
    event.preventDefault()
    const {nameFilter} = this.state
    console.log(nameFilter)
  }
  handleSelectedScenarioIdxChange = (event) => {
    const selectedScenarioNumber = event.target.valueAsNumber
    const {$simulationData} = this.state
    const nbScenarios = $simulationData && $simulationData.get("scenarios") ?
      $simulationData.get("scenarios").size :
      null
    if (selectedScenarioNumber >= 0 && (nbScenarios === null || selectedScenarioNumber <= nbScenarios)) {
      this.setState({selectedScenarioIdx: selectedScenarioNumber - 1})
    }
  }
  handleSimulationEditorChange = (simulationData) => {
    const {selectedScenarioIdx} = this.state
    const $simulationData = Immutable.fromJS(simulationData)
    const nbScenarios = $simulationData && $simulationData.get("scenarios") ?
      $simulationData.get("scenarios").size :
      null
    let newSelectedScenarioIdx = selectedScenarioIdx
    if (nbScenarios === null) {
      newSelectedScenarioIdx = null
    } else if (selectedScenarioIdx + 1 > nbScenarios) {
      newSelectedScenarioIdx = 0
    }
    this.setState({
      $simulationData,
      isSimulationEditorValid: true,
      selectedScenarioIdx: newSelectedScenarioIdx,
    })
  }
  handleSimulationEditorJsonError = () => {
    this.setState({isSimulationEditorValid: false})
  }
  handleSimulationFormSubmit = (event) => {
    event.preventDefault()
    this.calculate()
  }
  handleTracebackItemToggle = async ($traceback, id, isOpened) => {
    const {$isOpenedByVariableId, $parameterDataByName, $variableDataByName, $variableErrorMessageByName} = this.state
    const name = $traceback.get("name")
    let changeset = {$isOpenedByVariableId: $isOpenedByVariableId.set(id, isOpened)}
    let $variableData = $variableDataByName.get(name)
    if (isOpened && !$variableData) {
      let variableData
      try {
        // TODO Allow api_url GET param
        variableData = await webservices.fetchVariable(config.apiBaseUrl, name)
      } catch (error) {
        let errorMessage = error.data ? JSON.stringify(error.data, null, 2) : error.message
        changeset = {
          ...changeset,
          $variableDataByName: $variableDataByName.set(name, null),
          $variableErrorMessageByName: $variableErrorMessageByName.set(name, errorMessage),
          countryPackageGitHeadSha: null,
        }
        this.setState(changeset)
        return
      }
      $variableData = Immutable.fromJS(variableData.variables[0])
      changeset = {
        ...changeset,
        $variableDataByName: $variableDataByName.set(name, $variableData),
        $variableErrorMessageByName: $variableErrorMessageByName.set(name, null),
        countryPackageGitHeadSha: variableData.country_package_git_head_sha,
      }
    }
    const $formula = $variableData && $variableData.get("formula")
    const period = $traceback.get("period")
    const formula = $formula ? model.getActualFormula($formula.toJS(), period) : null
    const parameterNames = formula && formula.parameters
    if (parameterNames) {
      const parametersData = await webservices.fetchParameters(config.apiBaseUrl, parameterNames)
      const $parametersData = Immutable.fromJS(parametersData)
      const $parameters = $parametersData.get("parameters")
      const parametersFilePath = $parametersData.get("parameters_file_path")
      changeset = {
        ...changeset,
        $parameterDataByName: $parameterDataByName.merge(
          $parameters
            .groupBy(($parameter) => $parameter.get("name"))
            .map(($parameters) => $parameters.first()),
        ),
        parametersFilePath,
      }
    }
    this.setState(changeset)
  }
  handleVariableOpen = (name, period) => {
    const {$tracebacksByScenarioIdx, selectedScenarioIdx, tracebacksLimit} = this.state
    const $tracebacks = $tracebacksByScenarioIdx && $tracebacksByScenarioIdx.get(selectedScenarioIdx)
    const tracebackIndex = $tracebacks.findIndex(($traceback) => $traceback.get("name") === name &&
      ($traceback.get("period") === null || $traceback.get("period") === period))
    if (tracebackIndex < tracebacksLimit) {
      const id = model.buildVariableId(name, period)
      const element = document.getElementById(id)
    }
    // var $link = $(event.target.hash)
    // if ($link.length) {
    //   location.hash = event.target.hash
    //   $(document.body).scrollTop($link.offset().top)
    // } else {
    //   console.error("This link has no target: " + event.target.hash)
    // }

    debugger
  }
  render() {
    const {
      $arrayByVariableNameByScenarioIdx,
      $isOpenedByVariableId,
      $parameterDataByName,
      $simulationData,
      $tracebacksByScenarioIdx,
      $variableDataByName,
      $variableErrorMessageByName,
      countryPackageGitHeadSha,
      isCalculateInProgress,
      isSimulationEditorValid,
      nameFilter,
      selectedScenarioIdx,
      simulationErrorMessage,
      tracebacksLimit,
    } = this.state
    const $selectedScenarioArrayByVariableName = $arrayByVariableNameByScenarioIdx &&
      $arrayByVariableNameByScenarioIdx.get(selectedScenarioIdx)
    const $selectedScenarioTracebacks = $tracebacksByScenarioIdx && $tracebacksByScenarioIdx.get(selectedScenarioIdx)
    let $tracebacks = $selectedScenarioTracebacks
    const nbScenarios = $simulationData && $simulationData.get("scenarios") ?
      $simulationData.get("scenarios").size :
      0
    return (
      <Layout>
        <div>
          <p>
            Cet outil présente les formules socio-fiscales intervenant dans le calcul d'un cas type,
            des valeurs de leurs paramètres et de leur résultat, dans l'ordre chronologique.
          </p>
          <form
            className="form"
            onSubmit={this.handleSimulationFormSubmit}
            role="form"
            style={{marginBottom: "1em"}}
          >
            <h4>Cas type et données d'entrée</h4>
            <SimulationEditor
              $data={$simulationData}
              isValid={isSimulationEditorValid}
              onChange={this.handleSimulationEditorChange}
              onJsonError={this.handleSimulationEditorJsonError}
            />
            <button
              accessKey="t"
              className="btn btn-primary"
              disabled={isCalculateInProgress || !$simulationData || !isSimulationEditorValid}
              style={{marginTop: "1em"}}
              type="submit"
            >
              {isCalculateInProgress ? "Trace en cours…" : "Tracer"}
            </button>
            {
              nbScenarios > 1 && (
                <div>
                  <label htmlFor="selectedScenarioIdx">
                    Scénario numéro
                  </label>
                  <input
                    id="selectedScenarioIdx"
                    max={nbScenarios}
                    min={1}
                    onChange={this.handleSelectedScenarioIdxChange}
                    type="number"
                    value={selectedScenarioIdx + 1}
                  />
                </div>
              )
            }
          </form>
          {
            simulationErrorMessage ? (
              <div className="alert alert-danger">
                <p>
                  <strong>Erreur lors de l'appel de l'API !</strong>
                </p>
                <pre>{simulationErrorMessage}</pre>
              </div>
            ) : (
              $tracebacks && $selectedScenarioArrayByVariableName && (
                <div>
                  <p>
                    {
                      `Cette simulation a fait intervenir ${$tracebacks.size}
                      variables d'entrée ou calculées.`
                    }
                  </p>
                  <form onSubmit={this.handleSearchFormSubmit}>
                    <input onChange={this.handleNameFilterChange} type="text" value={nameFilter} />
                    <input className="btn btn-default" type="submit" value="Chercher" />
                  </form>
                  <TracebacksList
                    $arrayByVariableName={$selectedScenarioArrayByVariableName}
                    $isOpenedByVariableId={$isOpenedByVariableId}
                    $parameterDataByName={$parameterDataByName}
                    $requestedVariableNames={$simulationData ? $simulationData.get("variables") : null}
                    $selectedScenarioData={
                      $simulationData && $simulationData.get("scenarios") ?
                        $simulationData.getIn(["scenarios", selectedScenarioIdx]) :
                        null
                    }
                    $tracebacks={$tracebacks}
                    $variableDataByName={$variableDataByName}
                    $variableErrorMessageByName={$variableErrorMessageByName}
                    countryPackageGitHeadSha={countryPackageGitHeadSha}
                    onOpen={this.handleVariableOpen}
                    onToggle={this.handleTracebackItemToggle}
                    tracebacksLimit={tracebacksLimit}
                  />
                  {
                    tracebacksLimit && $tracebacks.size > tracebacksLimit && (
                      <p>La liste a été tronquée, seuls les {tracebacksLimit} premiers éléments sont affichés.</p>
                    )
                  }
                </div>
              )
            )
          }
        </div>
      </Layout>
    )
  }
}
