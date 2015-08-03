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

import AutosizedTextarea from "./autosized-textarea"


export default class SimulationEditor extends Component {
  static defaultProps = {
    indentWidth: 2,
  }
  static propTypes = {
    data: PropTypes.object,
    indentWidth: PropTypes.number.isRequired,
    isValid: PropTypes.bool,
    onChange: PropTypes.func,
    onJsonError: PropTypes.func,
  }
  handleTextareaChange = (text) => {
    let data = null
    const {onChange, onJsonError} = this.props
    try {
      data = JSON.parse(text)
    } catch (error) {
      console.error(`JSON parse error: ${error.message}`)
      if (onJsonError) {
        onJsonError()
      }
      return
    }
    if (onChange) {
      onChange(data)
    }
  }
  render = () => {
    const {data, indentWidth, isValid} = this.props
    const value = JSON.stringify(data, null, indentWidth)
    return (
      <div style={{position: "relative"}}>
        <AutosizedTextarea
          backgroundColor={isValid ? null : "#FEEEEE"}
          fontFamily="monospace"
          initialValue={value}
          onChange={this.handleTextareaChange}
        />
        {
          !isValid && (
            <div
              className="label label-danger"
              style={{
                position: "absolute",
                right: "0.8em",
                top: "0.5em",
              }}
            >
              JSON parse error
            </div>
          )
        }
      </div>
    )
  }
}
