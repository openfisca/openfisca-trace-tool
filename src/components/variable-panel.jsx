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


import {Component, PropTypes} from "react";


export default class VariablePanel extends Component {
  static propTypes = {
    cellType: PropTypes.string,
    computedConsumerTracebacks: PropTypes.array,
    default: PropTypes.any,
    entity: PropTypes.string.isRequired,
    extrapolatedConsumerTracebacks: PropTypes.array,
    hasAllDefaultArguments: PropTypes.bool,
    holder: PropTypes.object,
    holderError: PropTypes.string,
    isComputed: PropTypes.bool,
    inputVariables: PropTypes.array,
    isOpened: PropTypes.bool,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onToggle: PropTypes.func.isRequired,
    period: PropTypes.string,
    scenarioPeriod: PropTypes.string.isRequired,
    showDefaultFormulas: PropTypes.bool,
    simulationVariables: PropTypes.arrayOf(PropTypes.string).isRequired,
    tracebacks: PropTypes.array.isRequired,
    usedPeriods: PropTypes.array,
    values: PropTypes.array.isRequired,
    variableByName: PropTypes.object.isRequired,
  }
  handlePanelHeadingClick() {
    this.props.onToggle(this.props.name, this.props.period);
  }
  render() {
    return (
      <div
        className={classNames('panel', this.props.hasAllDefaultArguments ? 'panel-warning' : 'panel-default')}
        id={buildVariableId(this.props.name, this.props.period)}>
        {this.renderPanelHeading()}
        {
          this.props.isOpened && (
            <div className="panel-body" style={{position: 'relative'}}>
              {
                this.props.holderError ? (
                  <div className="alert alert-danger">
                    <p>
                      <strong>Erreur !</strong>
                    </p>
                    <pre style={{background: 'transparent', border: 0}}>{this.props.holderError}</pre>
                  </div>
                ) : (
                  this.props.holder ? this.renderPanelBodyContent() : (
                    <p>Chargement en cours...</p>
                  )
                )
              }
              <div style={{position: 'absolute', right: 7, top: 5}}>
                <a
                  href={window.variablesExplorerUrl + '/' + this.props.name}
                  rel="external"
                  target="_blank"
                  title="Ouvrir dans l'explorateur de variables, hors du cadre de cette simulation">
                  Page de la variable
                </a>
              </div>
            </div>
          )
        }
      </div>
    );
  }
  renderComputedConsumers() {
    return (
      <div>
        <h3>Formules appelantes</h3>
        <ul className="computed-consumers">
          {
            this.props.computedConsumerTracebacks.map(function(computedConsumerTraceback, idx) {
              var isVariableDisplayed = ! computedConsumerTraceback.default_input_variables || this.props.showDefaultFormulas;
              return (
                <li key={idx}>
                  {
                    isVariableDisplayed ? (
                      <VariableLink
                        name={computedConsumerTraceback.name}
                        onOpen={this.props.onOpen}
                        period={computedConsumerTraceback.period}>
                        {computedConsumerTraceback.name + ' / ' + computedConsumerTraceback.period}
                      </VariableLink>
                    ) : (
                      computedConsumerTraceback.name + ' / ' + computedConsumerTraceback.period
                    )
                  }
                  <span> : {computedConsumerTraceback.label}</span>
                </li>
              );
            }.bind(this))
          }
        </ul>
      </div>
    );
  }
  renderExtrapolatedConsumers() {
    return (
      <div>
        <h3>Formules appelantes extrapolées</h3>
        <ul className="extrapolated-consumers">
          {
            this.props.extrapolatedConsumerTracebacks.map(function(extrapolatedConsumerTraceback, idx) {
              var isVariableDisplayed = ! extrapolatedConsumerTraceback.default_input_variables ||
                this.props.showDefaultFormulas;
              return (
                <li key={idx}>
                  {
                    isVariableDisplayed ? (
                      <VariableLink
                        name={extrapolatedConsumerTraceback.name}
                        onOpen={this.props.onOpen}
                        period={extrapolatedConsumerTraceback.period}>
                        {extrapolatedConsumerTraceback.name + ' / ' + extrapolatedConsumerTraceback.period}
                      </VariableLink>
                    ) : (
                      extrapolatedConsumerTraceback.name + ' / ' + extrapolatedConsumerTraceback.period
                    )
                  }
                  <span> : {extrapolatedConsumerTraceback.label}</span>
                </li>
              );
            }.bind(this))
          }
        </ul>
      </div>
    );
  }
  renderFormula(formula) {
    var variableId = buildVariableId(this.props.name, this.props.period),
      accordionId = 'accordion-' + variableId;
    if (formula['@type'] === 'DatedFormula') {
      return (
        <div>
          <h3>DatedFormula <small>Fonctions datées</small></h3>
          <p>Une ou plusieurs des formules ci-dessous sont appelées en fonction de la période demandée.</p>
          {formula.doc && formula.doc != this.props.label && <p>{formula.doc}</p>}
          <div className="panel-group" id={accordionId} role="tablist" aria-multiselectable="true">
            {
              formula.dated_formulas.map(function(datedFormula, idx) {
                var mainVariableId = accordionId + '-' + idx;
                var headingId = mainVariableId + '-heading';
                return (
                  <div className="panel panel-default" key={idx}>
                    <div className="panel-heading" role="tab" id={headingId}>
                      <h4 className="panel-title">
                        <a
                          aria-controls={mainVariableId}
                          aria-expanded="false"
                          data-parent={'#' + accordionId}
                          data-toggle="collapse"
                          href={'#' + mainVariableId}>
                          {datedFormula.start_instant + ' – ' + datedFormula.stop_instant}
                        </a>
                      </h4>
                    </div>
                    <div
                      aria-labelledby={headingId}
                      className={classNames({collapse: true, 'panel-collapse ': true})}
                      id={mainVariableId}
                      role="tabpanel">
                      <div className="panel-body">
                        {this.renderFormula(datedFormula.formula)}
                      </div>
                    </div>
                  </div>
                );
              }.bind(this))
            }
          </div>
        </div>
      );
    } else if (formula['@type'] === 'SimpleFormula') {
      var githubUrl = 'https://github.com/openfisca/openfisca-france/tree/master/' +
        formula.module.split('.').join('/') + '.py#L' + formula.line_number + '-' +
        (formula.line_number + formula.source.trim().split('\n').length - 1);
      var sourceCodeId = guid();
      return (
        <div>
          {formula.doc && formula.doc != this.props.label && <p>{formula.doc}</p>}
          <div>
            <h3>Formules appelées</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Période</th>
                  <th>Libellé</th>
                  <th>Entité</th>
                  {this.props.inputVariables && <th className="text-right">Valeur</th>}
                </tr>
              </thead>
              <tbody>
                {
                  this.props.inputVariables && this.props.inputVariables.map(function(inputVariableData, idx) {
                    var argumentName = inputVariableData[0],
                      argumentPeriod = inputVariableData[1];
                    var isComputed = argumentName in this.props.variableByName; // Useful with some dated formulas.
                    var argumentValues = isComputed ? (
                      _.isArray(this.props.variableByName[argumentName]) ?
                        this.props.variableByName[argumentName] :
                        this.props.variableByName[argumentName][argumentPeriod]
                    ) : null;
                    // TODO index tracebacks before
                    var argumentTraceback = findTraceback(this.props.tracebacks, argumentName, argumentPeriod);
                    var isVariableDisplayed = ! argumentTraceback || ! argumentTraceback.default_input_variables ||
                      this.props.showDefaultFormulas;
                    return argumentTraceback && (
                      <tr key={idx}>
                        <td>
                          {
                            isVariableDisplayed ? (
                              <VariableLink name={argumentName} onOpen={this.props.onOpen} period={argumentPeriod}>
                                {argumentName}
                              </VariableLink>
                            ) : argumentName
                          }
                        </td>
                        <td>{argumentPeriod || '–'}</td>
                        <td>{argumentTraceback.label !== argumentName ? argumentTraceback.label : ''}</td>
                        <td>
                          <span className={
                            classNames('label', 'label-' + getEntityBackgroundColor(argumentTraceback.entity))
                          }>
                            {argumentTraceback.entity}
                          </span>
                        </td>
                        <td>
                          {
                            argumentValues && (
                              <ul className="list-unstyled">
                                {
                                  argumentValues.map(function(value, idx) {
                                    var isDefaultArgument = this.props.hasAllDefaultArguments ||
                                      this.props.argumentTracebackByName &&
                                      this.props.argumentTracebackByName[argumentName].default === value;
                                    var valueType = this.props.argumentTracebackByName &&
                                      this.props.argumentTracebackByName[argumentName] ?
                                      this.props.argumentTracebackByName[argumentName].cell_type :
                                      null;
                                    return (
                                      <li className="text-right" key={idx}>
                                        <samp>
                                          <Value
                                            isDefaultArgument={isDefaultArgument}
                                            type={valueType}
                                            value={value}
                                          />
                                        </samp>
                                      </li>
                                    );
                                  }.bind(this))
                                }
                              </ul>
                            )
                          }
                        </td>
                      </tr>
                    );
                  }.bind(this))
                }
              </tbody>
            </table>
          </div>
          <h3>
            <a
              aria-controls={sourceCodeId}
              aria-expanded='false'
              data-target={'#' + sourceCodeId}
              data-toggle="collapse"
              href='#'
              onClick={function(event) { event.preventDefault(); }}
              title='afficher / masquer'>
              Code source
            </a>
            <span> – <a href={githubUrl} rel="external" target="_blank">ouvrir dans GitHub</a></span>
          </h3>
          <pre className='collapse' id={sourceCodeId}>
            <code data-language="python">{formula.source}</code>
          </pre>
        </div>
      );
    }
  }
  renderPanelBodyContent() {
    return (
      <div>
        {
          _.contains(this.props.simulationVariables, this.props.name) &&
          this.props.period === this.props.scenarioPeriod && (
            <p><span className='label label-default'>Appel simulation</span></p>
          )
        }
        {
          this.props.usedPeriods ? (
            this.renderUsedPeriods()
          ) : (
            <div>
              {
                (this.props.hasAllDefaultArguments || ! this.props.isComputed) && (
                  <div>
                    {
                      this.props.hasAllDefaultArguments && (
                        <span className='label label-default'>Valeurs par défaut</span>
                      )
                    }
                    {
                      ! this.props.isComputed && (
                        <span className='label label-default'>Variable d'entrée</span>
                      )
                    }
                  </div>
                )
              }
              {
                this.props.holder.formula && ! this.props.usedPeriods &&
                  this.renderFormula(this.props.holder.formula)
              }
            </div>
          )
        }
        {this.props.computedConsumerTracebacks && this.renderComputedConsumers()}
        {this.props.extrapolatedConsumerTracebacks && this.renderExtrapolatedConsumers()}
      </div>
    );
  }
  renderPanelHeading() {
    return (
      <div className="panel-heading" onClick={this.handlePanelHeadingClick} style={{cursor: 'pointer'}}>
        <div className="row">
          <div className="col-sm-3">
            <span className={classNames('glyphicon', this.props.isOpened ? 'glyphicon-minus' : 'glyphicon-plus')}></span>
            <code>{this.props.name}</code>
          </div>
          <div className="col-sm-1">
            <small>{this.props.period || '–'}</small>
          </div>
          <div className="col-sm-5">
            {this.props.label}
          </div>
          <div className="col-sm-1">
            <span className={classNames('label', 'label-' + getEntityBackgroundColor(this.props.entity))}>
              {getEntityKeyPlural(this.props.entity)}
            </span>
          </div>
          <div className="col-sm-2">
            <ul className="list-unstyled">
              {
                this.props.values.map(function(value, idx) {
                  return (
                    <li className="text-right" key={idx}>
                      <samp>
                        <Value
                          isDefaultArgument={value === this.props.default}
                          type={this.props.cellType}
                          value={value}
                        />
                      </samp>
                    </li>
                  );
                }.bind(this))
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
  renderUsedPeriods() {
    var displayTransformationColumn = _.isNumber(this.props.values[0]);
    return (
      <div>
        <h3>Valeurs extrapolées depuis</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Période</th>
              <th className="text-right">Valeur</th>
              {displayTransformationColumn && <th>Transformation</th>}
            </tr>
          </thead>
          <tbody>
            {
              this.props.usedPeriods.map(function(period, idx) {
                var values = this.props.variableByName[this.props.name][period];
                var usedPeriodTraceback = findTraceback(this.props.tracebacks, this.props.name, period);
                var isVariableDisplayed = ! usedPeriodTraceback.default_input_variables ||
                  this.props.showDefaultFormulas;
                return (
                  <tr key={idx}>
                    <td>
                      {
                        isVariableDisplayed ? (
                          <VariableLink name={this.props.name} onOpen={this.props.onOpen} period={period}>
                            {this.props.name}
                          </VariableLink>
                        ) : this.props.name
                      }
                    </td>
                    <td>
                      {period}
                    </td>
                    <td>
                      <ul className="list-unstyled">
                        {
                          values.map(function(value, idx) {
                            return (
                              <li className="text-right" key={idx}>
                                <samp>
                                  <Value
                                    isDefaultArgument={value === this.props.default}
                                    type={this.props.cellType}
                                    value={value}
                                  />
                                </samp>
                              </li>
                            );
                          }.bind(this))
                        }
                      </ul>
                    </td>
                    {
                      displayTransformationColumn && (
                        <td>
                          <ul className="list-unstyled">
                            {
                              values.map(function(value, idx) {
                                return (
                                  <li key={idx}>
                                    <samp>
                                      {
                                        value === this.props.values[idx] ? (
                                          '='
                                        ) : (
                                          value > this.props.values[idx] ?
                                            '/ ' + (value / this.props.values[idx]).toLocaleString('fr') :
                                            '× ' + (this.props.values[idx] / value).toLocaleString('fr')
                                        )
                                      }
                                    </samp>
                                  </li>
                                );
                              }.bind(this))
                            }
                          </ul>
                        </td>
                      )
                    }
                  </tr>
                );
              }.bind(this))
            }
          </tbody>
        </table>
      </div>
    );
  }
}
