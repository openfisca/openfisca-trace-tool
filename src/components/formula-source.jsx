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

import VariableLink from "./variable-link"


export default class FormulaSource extends Component {
  static propTypes = {
    children: PropTypes.string.isRequired,
    inputVariablesData: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.string),
    ),
    onOpen: PropTypes.func.isRequired,
  }
  getSourceFragments = (source, inputVariablesData) => {
    return inputVariablesData.reduce((memo, inputVariableData) => {
      var idx = 0
      return memo.reduce((fragmentMemo, fragment) => {
        if (fragment.source) {
          const inputVariableFragments = this.getSourceFragmentsForInputVariable(fragment.source, inputVariableData)
          if (inputVariableFragments.length) {
            fragmentMemo.splice(idx, 1, ...inputVariableFragments)
          }
        }
        idx += 1
        return fragmentMemo
      }, memo)
    }, [{source}])
  }
  getSourceFragmentsForInputVariable = (source, inputVariableData) => {
    const [name, period] = inputVariableData
    const regexp = new RegExp(`['"](${name})['"]`, "g")
    var match
    var fragments = []
    while ((match = regexp.exec(source)) !== null) {
      const index = match.index + 1
      fragments = fragments.concat([
        {source: source.slice(0, index)},
        {inputVariable: {name, period}},
        {source: source.slice(index + name.length)},
      ])
    }
    return fragments
  }
  getSourceWithLinks = (source, inputVariablesData) => {
    const {onOpen} = this.props
    const sourceFragments = inputVariablesData ?
      this.getSourceFragments(source, inputVariablesData) :
      [{source}]
    return (
      <div>
        {
          sourceFragments.map((fragment, idx) => fragment.source ? (
            <span key={idx}>{fragment.source}</span>
          ) : fragment.inputVariable ? (
            <VariableLink
              key={idx}
              name={fragment.inputVariable.name}
              onOpen={onOpen}
              period={fragment.inputVariable.period}
            >
              <span
                aria-hidden="true"
                className="glyphicon glyphicon-link"
                style={{
                  color: "#2aa198", // Same color than Highlight.js variables.
                  marginRight: "0.3em",
                }}
              />
            <strong>{fragment.inputVariable.name}</strong>
            </VariableLink>
          ) : null)
        }
      </div>
    )
  }
  render() {
    const {inputVariablesData} = this.props
    const source = this.props.children
    return (
      <div style={{
        fontFamily: "monospace",
        fontSize: 12,
        overflowWrap: "normal",
        whiteSpace: "pre",
      }}>
        {this.getSourceWithLinks(source, inputVariablesData)}
      </div>
    )
  }
}
