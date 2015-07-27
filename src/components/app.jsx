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


import {addons, Component} from "react/addons";

import webservices from "../webservices";

const {update} = addons;


export default class App extends Component {
  calculate() {
    var onError = function(errorMessage) {
      this.setState({
        extrapolatedConsumerTracebacksByVariableId: null,
        simulationError: errorMessage,
        simulationInProgress: false,
        tracebacks: null,
        variableByName: null,
      });
      window.tracebacks = null; // DEBUG
    }.bind(this);
    var onSuccess = function(data) {
      var firstScenarioTracebacks = data.tracebacks["0"],
        firstSimulationVariables = data.variables["0"];
      window.tracebacks = firstScenarioTracebacks; // DEBUG
      this.setState({
        extrapolatedConsumerTracebacksByVariableId: this.findExtrapolatedConsumerTracebacksByVariableId(
          firstScenarioTracebacks
        ),
        simulationError: null,
        simulationInProgress: false,
        tracebacks: firstScenarioTracebacks,
        variableByName: firstSimulationVariables,
      });
    }.bind(this);
    this.setState({simulationInProgress: true}, function() {
      calculate(this.props.apiUrl, this.state.simulationJson, onSuccess, onError);
    });
  }
  constructor() {
    this.state = {
      showDefaultFormulas: false,
      simulationError: null,
      simulationInProgress: false,
      simulationJson: null,
      toggleStatusByVariableId: {},
      tracebacks: null,
      variableByName: null,
      variableHolderByName: {},
      variableHolderErrorByName: {},
    };
    super();
  }
  fetchField(variableName, baseReforms) {
    var onError = function(errorMessage) {
      var variableHolderChangeset = {};
      variableHolderChangeset[variableName] = null;
      var newVariableHolderByName = update(this.state.variableHolderByName, {$merge: variableHolderChangeset});
      var variableHolderErrorChangeset = {};
      variableHolderErrorChangeset[variableName] = errorMessage;
      var newVariableHolderErrorByName = update(
        this.state.variableHolderErrorByName,
        {$merge: variableHolderErrorChangeset}
      );
      this.setState({
        variableHolderByName: newVariableHolderByName,
        variableHolderErrorByName: newVariableHolderErrorByName,
      });
    }.bind(this);
    var onSuccess = function(data) {
      var variableHolderChangeset = {};
      variableHolderChangeset[variableName] = data.value;
      var newVariableHolderByName = update(this.state.variableHolderByName, {$merge: variableHolderChangeset});
      var variableHolderErrorChangeset = {};
      variableHolderErrorChangeset[variableName] = null;
      var newVariableHolderErrorByName = update(
        this.state.variableHolderErrorByName,
        {$merge: variableHolderErrorChangeset}
      );
      this.setState({
        variableHolderByName: newVariableHolderByName,
        variableHolderErrorByName: newVariableHolderErrorByName,
      });
    }.bind(this);
    webservices.fetchField(config.apiBaseUrl, variableName, baseReforms, onSuccess, onError);
  }
  findExtrapolatedConsumerTracebacksByVariableId(tracebacks) {
    var extrapolatedConsumerTracebacksByVariableId = {};
    tracebacks.forEach(function(traceback) {
      if (traceback.used_periods) {
        var extrapolatedConsumerTracebacks = tracebacks.filter(function(traceback1) {
          return traceback.name === traceback1.name && traceback1.used_periods &&
            _.contains(traceback1.used_periods, traceback.period);
        });
        var variableId = buildVariableId(traceback.name, traceback.period);
        extrapolatedConsumerTracebacksByVariableId[variableId] = extrapolatedConsumerTracebacks;
      }
    });
    return extrapolatedConsumerTracebacksByVariableId;
  }
  getSimulationJson(simulationText) {
    var simulationJson;
    try {
        simulationJson = JSON.parse(simulationText);
    } catch (error) {
        this.setState({simulationError: "JSON parse error: " + error.message});
        return;
    }
    simulationJson.trace = true;
    return simulationJson;
  }
  handleShowDefaultFormulasChange(event) {
    this.setState({showDefaultFormulas: event.target.checked});
  }
  handleSimulationFormSubmit(event) {
    event.preventDefault();
    this.setState({simulationJson: this.getSimulationJson(this.state.simulationText)}, function() {
      this.calculate();
    });
  }
  handleSimulationTextChange(event) {
    this.setState({
      simulationError: null,
      simulationText: event.target.value,
      tracebacks: null,
      variableByName: null,
      variableHolderByName: {},
      variableHolderErrorByName: {},
    }, function() {
      // Fetch holders for previously opened variables.
      _.map(this.state.toggleStatusByVariableId, function(variableInfos) {
        if ( ! (variableInfos.name in this.state.variableHolderByName)) {
          this.handleVariablePanelOpen(variableInfos.name, variableInfos.period);
        }
      }.bind(this));
    });
  }
  handleVariablePanelOpen(variableName, variablePeriod) {
    this.handleVariablePanelToggle(variableName, variablePeriod, true);
  }
  handleVariablePanelToggle(variableName, variablePeriod, forceValue) {
    var variableId = buildVariableId(variableName, variablePeriod);
    var toggleStatusByVariableIdChangeset = {};
    toggleStatusByVariableIdChangeset[variableId] = {
      isOpened: _.isUndefined(forceValue) ? ! this.state.toggleStatusByVariableId[variableId] : forceValue,
      name: variableName,
      period: variablePeriod,
    };
    var newToggleStatusByVariableId = update(
      this.state.toggleStatusByVariableId,
      {$merge: toggleStatusByVariableIdChangeset}
    );
    this.setState({toggleStatusByVariableId: newToggleStatusByVariableId});
    if (newToggleStatusByVariableId && ! (variableName in this.state.variableHolderByName)) {
      this.fetchField(variableName, this.state.simulationJson.base_reforms);
    }
  }
  render() {
    return (
      <div>
        {this.renderSimulationForm()}
        {
          this.state.simulationError ? (
            <div className="alert alert-danger">
              <p>
                <strong>Erreur à l"appel de l"API calculate !</strong>
              </p>
              <pre style={{background: "transparent", border: 0}}>{this.state.simulationError}</pre>
            </div>
          ) : (
            this.state.simulationInProgress ? (
              <div className="alert alert-info">
                <p>Simulation en cours...</p>
              </div>
            ) : (
              this.state.tracebacks && (
                <div>
                  {this.renderVariablesPanels()}
                  <p>{this.state.tracebacks.length + " formules et variables au total"}</p>
                </div>
              )
            )
          )
        }
      </div>
    );
  }
  renderSimulationForm() {
    var permaLinkParameters = getQueryParameters();
    permaLinkParameters.simulation = this.state.simulationJson;
    var permaLinkHref = "?" + $.param(permaLinkParameters);
    return (
      <form className="form" role="form" onSubmit={this.handleSimulationFormSubmit}>
        <div className="panel panel-default">
          <div className="panel-heading" role="tab" id="collapseSimulationTextHeading">
            <h4 className="panel-title">
              <a
                aria-controls="collapseSimulationText"
                aria-expanded="true"
                data-toggle="collapse"
                href="#collapseSimulationText">
                Appel de la simulation
              </a>
            </h4>
          </div>
          <div
            aria-expanded="true"
            aria-labelledby="collapseSimulationTextHeading"
            className="panel-collapse collapse"
            id="collapseSimulationText"
            role="tabpanel">
            <div className="panel-body">
              <p>
                {"URL de l\"API de simulation : " + this.props.apiUrl + "api/1/calculate "}
                (<a href={this.props.apiDocUrl + "#calculate"} rel="external" target="_blank">documentation</a>)
              </p>
              <p>Paramètre l"URL <code>api_url</code> (exemple : http://www.openfisca.fr/outils/trace?api_url=http://localhost:2000/)</p>
              <AutoSizedTextArea
                disabled={this.state.simulationInProgress}
                onChange={this.handleSimulationTextChange}
                value={this.state.simulationText}
              />
              <button className="btn btn-primary" type="submit">Simuler</button>
              <a href={permaLinkHref} rel="external" style={{marginLeft: "1em"}} target="_blank">Lien permanent</a>
            </div>
          </div>
        </div>
        <div className="checkbox">
          <label>
            <input
              onChange={this.handleShowDefaultFormulasChange}
              checked={this.props.showDefaultFormulas}
              type="checkbox"
            />
            Afficher aussi les formules appelées avec toutes les valeurs par défaut
          </label>
        </div>
      </form>
    );
  }
  renderVariablesPanels() {
    var scenario = this.state.simulationJson.scenarios[0];
    var scenarioPeriod = normalizePeriod(scenario.period || scenario.year.toString()),
      simulationVariables = this.state.simulationJson.variables;
    return (
      this.state.tracebacks.map(function(traceback, idx) {
        if (idx < this.state.tracebacks.length - 1 && traceback.default_input_variables && ! this.state.showDefaultFormulas) {
          return null;
        }
        var variable = this.state.variableByName[traceback.name];
        var variableId = buildVariableId(traceback.name, traceback.period);
        var values = _.isArray(variable) ? variable : variable[traceback.period];
        var toggleStatus = this.state.toggleStatusByVariableId[variableId];
        var isOpened = toggleStatus && toggleStatus.isOpened;
        return (
          <VariablePanel
            cellType={traceback.cell_type}
            computedConsumerTracebacks={
              isOpened ? findConsumerTracebacks(this.state.tracebacks, traceback.name, traceback.period) : null
            }
            default={traceback.default}
            entity={traceback.entity}
            extrapolatedConsumerTracebacks={
              this.state.extrapolatedConsumerTracebacksByVariableId &&
                this.state.extrapolatedConsumerTracebacksByVariableId[variableId]
            }
            hasAllDefaultArguments={traceback.default_input_variables}
            holder={this.state.variableHolderByName[traceback.name]}
            holderError={this.state.variableHolderErrorByName[traceback.name]}
            isComputed={traceback.is_computed}
            inputVariables={
              traceback.input_variables && traceback.input_variables.length ? traceback.input_variables : null
            }
            isOpened={isOpened}
            key={idx}
            label={traceback.label}
            name={traceback.name}
            onOpen={this.handleVariablePanelOpen}
            onToggle={this.handleVariablePanelToggle}
            period={traceback.period === null ? null : normalizePeriod(traceback.period)}
            scenarioPeriod={scenarioPeriod}
            showDefaultFormulas={this.state.showDefaultFormulas}
            simulationVariables={simulationVariables}
            tracebacks={this.state.tracebacks}
            usedPeriods={traceback.used_periods}
            values={values}
            variableByName={this.state.variableByName}
          />
        );
      }.bind(this))
    );
  }
}
