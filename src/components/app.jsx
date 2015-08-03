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
import immutable from "immutable"

import config from "../config"
import Layout from "./layout"
import model from "../model"
import SimulationEditor from "./simulation-editor"
import TracebacksList from "./tracebacks-list"
import webservices from "../webservices"


export default class App extends Component {
  calculate = () => {
    const {simulationData} = this.state
    this.setState({isSimulationInProgress: true}, async () => {
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
        $arrayByVariableNameByScenarioIdx: immutable.fromJS(data.variables),
        $tracebacksByScenarioIdx: immutable.fromJS(data.tracebacks),
        isSimulationInProgress: false,
        simulationErrorMessage: null,
      })
    })
  }
  constructor(props) {
    super(props)
    this.state = {
      $arrayByVariableNameByScenarioIdx: null,
      $isOpenedById: new immutable.Map(),
      $tracebacksByScenarioIdx: null,
      $variableDataByName: new immutable.Map(),
      $variableErrorMessageByName: new immutable.Map(),
      isSimulationEditorValid: true,
      isSimulationInProgress: false,
      selectedScenarioIdx: 0,
      simulationData: model.defaultSimulationData,
      simulationErrorMessage: null,
    }
  }
  fetchVariable = async (name) => {
    const {$variableDataByName, $variableErrorMessageByName} = this.state
    let data
    try {
      // TODO Allow api_url GET param
      data = await webservices.fetchVariable(config.apiBaseUrl, name)
    } catch (error) {
      let errorMessage = error.data ? JSON.stringify(error.data, null, 2) : error.message
      this.setState({
        $variableDataByName: $variableDataByName.set(name, null),
        $variableErrorMessageByName: $variableErrorMessageByName.set(name, errorMessage),
      })
      return
    }
    this.setState({
      $variableDataByName: $variableDataByName.set(name, data.variables[0]),
      $variableErrorMessageByName: $variableErrorMessageByName.set(name, null),
    })
  }
  handleSelectedScenarioIdxChange = (event) => {
    const selectedScenarioNumber = event.target.valueAsNumber
    const {simulationData} = this.state
    const nbScenarios = simulationData && simulationData.scenarios ?
      simulationData.scenarios.length :
      null
    if (selectedScenarioNumber >= 0 && (nbScenarios === null || selectedScenarioNumber <= nbScenarios)) {
      this.setState({selectedScenarioIdx: selectedScenarioNumber - 1})
    }
  }
  handleSimulationEditorChange = (simulationData) => {
    const {selectedScenarioIdx} = this.state
    const nbScenarios = simulationData && simulationData.scenarios ?
      simulationData.scenarios.length :
      null
    let newSelectedScenarioIdx = selectedScenarioIdx
    if (nbScenarios === null) {
      newSelectedScenarioIdx = null
    } else if (selectedScenarioIdx + 1 > nbScenarios) {
      newSelectedScenarioIdx = 0
    }
    this.setState({
      isSimulationEditorValid: true,
      selectedScenarioIdx: newSelectedScenarioIdx,
      simulationData,
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
    const {$isOpenedById, $variableDataByName} = this.state
    const name = $traceback.get("name")
    if (isOpened && !$variableDataByName.includes(name)) {
      this.fetchVariable(name)
    }
    this.setState({$isOpenedById: $isOpenedById.set(id, isOpened)})
  }
  render = () => {
    const {
      $arrayByVariableNameByScenarioIdx,
      $isOpenedById,
      $tracebacksByScenarioIdx,
      $variableDataByName,
      $variableErrorMessageByName,
      isSimulationEditorValid,
      isSimulationInProgress,
      selectedScenarioIdx,
      simulationData,
      simulationErrorMessage,
    } = this.state
    const $selectedScenarioarrayByVariableName = $arrayByVariableNameByScenarioIdx &&
      $arrayByVariableNameByScenarioIdx.get(selectedScenarioIdx)
    const $selectedScenarioTracebacks = $tracebacksByScenarioIdx && $tracebacksByScenarioIdx.get(selectedScenarioIdx)
    const nbScenarios = simulationData && simulationData.scenarios ?
      simulationData.scenarios.length :
      null
    return (
      <Layout>
        <div>
          <p>
            Cet outil présente les formules socio-fiscales intervenant dans le calcul d'un cas type,
            des valeurs de leurs paramètres et de leur résultat, dans l'ordre chronologique.
          </p>
          <form className="form" onSubmit={this.handleSimulationFormSubmit} role="form" style={{marginBottom: "1em"}}>
            <h4>Cas type et données d'entrée</h4>
            <SimulationEditor
              data={simulationData}
              isValid={isSimulationEditorValid}
              onChange={this.handleSimulationEditorChange}
              onJsonError={this.handleSimulationEditorJsonError}
            />
            <button
              accessKey="s"
              className="btn btn-primary"
              disabled={isSimulationInProgress || !isSimulationEditorValid}
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
                    $isOpenedById={$isOpenedById}
                    $tracebacks={$selectedScenarioTracebacks}
                    $variableDataByName={$variableDataByName}
                    $variableErrorMessageByName={$variableErrorMessageByName}
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
