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


export default class AutosizedTextarea extends Component {
  static defaultProps = {
    minRows: 20,
    spellCheck: false,
  }
  static propTypes = {
    backgroundColor: PropTypes.string,
    disabled: PropTypes.bool,
    fontFamily: PropTypes.string,
    initialValue: PropTypes.string,
    minRows: PropTypes.number.isRequired,
    onChange: PropTypes.func,
    spellCheck: PropTypes.bool,
  }
  constructor(props) {
    super(props)
    this.state = {value: props.initialValue}
  }
  handleChange = (event) => {
    const {onChange} = this.props
    if (onChange) {
      const value = event.target.value
      this.setState({value}, () => onChange(value))
    }
  }
  render = () => {
    const {backgroundColor, disabled, fontFamily, minRows, spellCheck} = this.props
    const {value} = this.state
    const nbRows = value ? value.split("\n").length : 1
    return (
      <textarea
        className="form-control"
        disabled={disabled}
        onChange={this.handleChange}
        rows={Math.max(minRows, nbRows)}
        spellCheck={spellCheck}
        style={{
          backgroundColor,
          fontFamily,
        }}
        value={value}
      />
    )
  }
}
