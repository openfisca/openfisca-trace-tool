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

// import {setStatePerf} from "../perf"
import * as model from "../model"
import config from "../config"
import Layout from "./layout"
import SimulationEditor from "./simulation-editor"
import TracebacksList from "./tracebacks-list"
import webservices from "../webservices"


export default class App extends Component {
  calculate = () => {
    this.setState({isSimulationInProgress: true}, async () => {
      const {$simulationData} = this.state
      const simulationData = $simulationData.toJS()
      let data
      try {
        // TODO Allow api_url GET param
        data = await model.calculate(config.apiBaseUrl, simulationData)
      } catch (error) {
        let simulationErrorMessage = error.data ? JSON.stringify(error.data, null, 2) : error.message
        this.setState({
          $arrayByVariableNameByScenarioIdx: null,
          $tracebacksByScenarioIdx: null,
          isSimulationInProgress: false,
          simulationErrorMessage,
        })
        return
      }
      this.setState({
        $arrayByVariableNameByScenarioIdx: Immutable.fromJS(data.variables),
        $tracebacksByScenarioIdx: Immutable.fromJS(data.tracebacks),
        isSimulationInProgress: false,
        simulationErrorMessage: null,
      })
    })
  }
  constructor(props) {
    super(props)
    this.state = {
      $arrayByVariableNameByScenarioIdx: null,
      $consumerTracebacksByVariableId: Immutable.Map(),
      $isOpenedByVariableId: Immutable.Map(),
      $simulationData: Immutable.fromJS(model.defaultSimulationData),
      $tracebacksByScenarioIdx: null,
      $variableDataByName: Immutable.Map(),
      $variableErrorMessageByName: Immutable.Map(),
      countryPackageGitHeadSha: null,
      isSimulationEditorValid: true,
      isSimulationInProgress: false,
      selectedScenarioIdx: 0,
      simulationErrorMessage: null,
    }
  }
  fetchVariable = async (name, period, id) => {
    const {
      $consumerTracebacksByVariableId,
      $tracebacksByScenarioIdx,
      $variableDataByName,
      $variableErrorMessageByName,
      selectedScenarioIdx,
    } = this.state
    let data
    try {
      // TODO Allow api_url GET param
      data = await webservices.fetchVariable(config.apiBaseUrl, name)
    } catch (error) {
      let errorMessage = error.data ? JSON.stringify(error.data, null, 2) : error.message
      this.setState({
        $consumerTracebacksByVariableId: $consumerTracebacksByVariableId.set(id, null),
        $variableDataByName: $variableDataByName.set(name, null),
        $variableErrorMessageByName: $variableErrorMessageByName.set(name, errorMessage),
        countryPackageGitHeadSha: null,
      })
      return
    }
    const $selectedScenarioTracebacks = $tracebacksByScenarioIdx && $tracebacksByScenarioIdx.get(selectedScenarioIdx)
    const $consumerTracebacks = model.findConsumerTracebacks($selectedScenarioTracebacks, name, period)
    this.setState({
      $consumerTracebacksByVariableId: $consumerTracebacksByVariableId.set(id, $consumerTracebacks),
      $variableDataByName: $variableDataByName.set(name, Immutable.fromJS(data.variables[0])),
      $variableErrorMessageByName: $variableErrorMessageByName.set(name, null),
      countryPackageGitHeadSha: data.country_package_git_head_sha,
    })
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
  handleTracebackItemToggle = ($traceback, id, isOpened) => {
    const {$isOpenedByVariableId, $variableDataByName} = this.state
    const name = $traceback.get("name")
    if (isOpened && !$variableDataByName.includes(name)) {
      const period = $traceback.get("period"); // eslint-disable-line semi
      this.fetchVariable(name, period, id)
    }
    this.setState({$isOpenedByVariableId: $isOpenedByVariableId.set(id, isOpened)})
  }
  render() {
    const {
      $arrayByVariableNameByScenarioIdx,
      $consumerTracebacksByVariableId,
      $isOpenedByVariableId,
      $simulationData,
      $tracebacksByScenarioIdx,
      $variableDataByName,
      $variableErrorMessageByName,
      countryPackageGitHeadSha,
      isSimulationEditorValid,
      isSimulationInProgress,
      selectedScenarioIdx,
      simulationErrorMessage,
    } = this.state
    const $selectedScenarioarrayByVariableName = $arrayByVariableNameByScenarioIdx &&
      $arrayByVariableNameByScenarioIdx.get(selectedScenarioIdx)
    const $selectedScenarioTracebacks = $tracebacksByScenarioIdx && $tracebacksByScenarioIdx.get(selectedScenarioIdx)
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
              accessKey="s"
              className="btn btn-primary"
              disabled={isSimulationInProgress || !$simulationData || !isSimulationEditorValid}
              style={{marginTop: "1em"}}
              type="submit"
            >
              {isSimulationInProgress ? "Simulation en cours…" : "Simuler"}
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
              $selectedScenarioTracebacks && $selectedScenarioarrayByVariableName && (
                <div>
                  <p>
                    {
                      `Cette simulation a fait intervenir ${$selectedScenarioTracebacks.size}
                      variables d'entrée ou calculées.`
                    }
                  </p>
                  <TracebacksList
                    $arrayByVariableName={$selectedScenarioarrayByVariableName}
                    $consumerTracebacksByVariableId={$consumerTracebacksByVariableId}
                    $isOpenedByVariableId={$isOpenedByVariableId}
                    $requestedVariables={$simulationData ? $simulationData.get("variables") : null}
                    $selectedScenarioData={
                      $simulationData && $simulationData.get("scenarios") ?
                        $simulationData.getIn(["scenarios", selectedScenarioIdx]) :
                        null
                    }
                    $tracebacks={$selectedScenarioTracebacks}
                    $variableDataByName={$variableDataByName}
                    $variableErrorMessageByName={$variableErrorMessageByName}
                    countryPackageGitHeadSha={countryPackageGitHeadSha}
                    onToggle={this.handleTracebackItemToggle}
                  />
                </div>
              )
            )
          }
        </div>
      </Layout>
    )
  }
}
