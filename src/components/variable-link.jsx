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

import * as model from "../model"


export default class VariableLink extends Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    onOpen: PropTypes.func.isRequired,
    period: PropTypes.string,
  }
  handleClick = (event) => {
    const {name, onOpen, period} = this.props
    event.preventDefault()
    onOpen(name, period)
  }
  render() {
    const {children, label, name, period} = this.props
    const id = model.buildVariableId(name, period)
    return (
      <a href={"#" + id} onClick={this.handleClick}>
        {
          children || (
            <span>
              {label ? <abbr title={label}>{name}</abbr> : name}
              {" "}
              ({period || "sans période"})
            </span>
          )
        }
      </a>
    )
  }
}
