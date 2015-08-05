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

import {PureComponent} from "../decorators"


@PureComponent
export default class Value extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    title: PropTypes.string,
    type: PropTypes.string,
  }
  format(value, type) {
    if (value === "") {
      return "\"\""
    } else {
      let formattedValue
      if (typeof value === "number") {
        if (value === 0) {
          formattedValue = "0"
        } else {
          formattedValue = value.toFixed(2)
        }
        if (type === "monetary") {
          formattedValue += " €"
        }
      } else {
        formattedValue = value.toString()
      }
      return formattedValue
    }
  }
  render() {
    const {children, title, type} = this.props
    const formattedValue = this.format(children, type)
    return (
      <abbr title={title}>
        {formattedValue}
      </abbr>
    )
  }
}
