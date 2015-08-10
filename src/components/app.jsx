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
      // Fetch and open the first traceback item.
      const {selectedScenarioIdx} = this.state
      let {$isOpenedByVariableId} = this.state
      let $tracebacksByScenarioIdx = Immutable.fromJS(data.tracebacks).map(($tracebacks) => $tracebacks.reverse())
      const $firstTraceback = $tracebacksByScenarioIdx.get(selectedScenarioIdx).first()
      const name = $firstTraceback.get("name")
      const selectedScenarioPeriod = $simulationData.getIn(["scenarios", selectedScenarioIdx, "period"])
      const id = model.buildVariableId(name, selectedScenarioPeriod)
      const firstTracebackChangeset = await this.fetchVariable(name, selectedScenarioPeriod, id)
      $isOpenedByVariableId = $isOpenedByVariableId.set(id, true)
      this.setState({
        $arrayByVariableNameByScenarioIdx: Immutable.fromJS(data.variables),
        $isOpenedByVariableId,
        $tracebacksByScenarioIdx,
        isSimulationInProgress: false,
        simulationErrorMessage: null,
        ...firstTracebackChangeset,
      })
    })
  }
  constructor(props) {
    super(props)
    this.state = {
      $arrayByVariableNameByScenarioIdx: null,
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
  fetchVariable = async (name, period, id = null) => {
    const {$variableDataByName, $variableErrorMessageByName} = this.state
    if (id === null) {
      id = model.buildVariableId(name, period)
    }
    let data
    try {
      // TODO Allow api_url GET param
      data = await webservices.fetchVariable(config.apiBaseUrl, name)
    } catch (error) {
      let errorMessage = error.data ? JSON.stringify(error.data, null, 2) : error.message
      return {
        $variableDataByName: $variableDataByName.set(name, null),
        $variableErrorMessageByName: $variableErrorMessageByName.set(name, errorMessage),
        countryPackageGitHeadSha: null,
      }
    }
    return {
      $variableDataByName: $variableDataByName.set(name, Immutable.fromJS(data.variables[0])),
      $variableErrorMessageByName: $variableErrorMessageByName.set(name, null),
      countryPackageGitHeadSha: data.country_package_git_head_sha,
    }
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
    // TODO Assert there is at least 1 defined scenario.
    this.calculate()
  }
  handleTracebackItemToggle = async ($traceback, id, isOpened) => {
    const {$isOpenedByVariableId, $variableDataByName} = this.state
    const name = $traceback.get("name")
    let changeset = {$isOpenedByVariableId: $isOpenedByVariableId.set(id, isOpened)}
    if (isOpened && !$variableDataByName.has(name)) {
      const period = $traceback.get("period")
      changeset = Object.assign(changeset, await this.fetchVariable(name, period, id))
    }
    this.setState(changeset)
  }
  render() {
    const {
      $arrayByVariableNameByScenarioIdx,
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
    const $selectedScenarioArrayByVariableName = $arrayByVariableNameByScenarioIdx &&
      $arrayByVariableNameByScenarioIdx.get(selectedScenarioIdx)
    const $selectedScenarioTracebacks = $tracebacksByScenarioIdx && $tracebacksByScenarioIdx.get(selectedScenarioIdx)
    const tracebacksLimit = null
    // const tracebacksLimit = 50
    let $tracebacks = $selectedScenarioTracebacks
    if ($selectedScenarioTracebacks) {
      // const tracebacksLimit = null
      if (tracebacksLimit) {
        $tracebacks = $selectedScenarioTracebacks.slice(0, tracebacksLimit)
      }
    }
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
              $tracebacks && $selectedScenarioArrayByVariableName && (
                <div>
                  <p>
                    {
                      `Cette simulation a fait intervenir ${$tracebacks.size}
                      variables d'entrée ou calculées.`
                    }
                  </p>
                  <TracebacksList
                    $arrayByVariableName={$selectedScenarioArrayByVariableName}
                    $isOpenedByVariableId={$isOpenedByVariableId}
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
                    onToggle={this.handleTracebackItemToggle}
                  />
                  {
                    tracebacksLimit && $tracebacks.size < $selectedScenarioTracebacks.size && (
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
