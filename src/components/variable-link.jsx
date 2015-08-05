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
    children: PropTypes.node.isRequired,
    name: PropTypes.string.isRequired,
    // onOpen: PropTypes.func.isRequired,
    period: PropTypes.string,
  }
  handleClick = (event) => {
    console.log("TODO VariableLink.handleClick", event)
    // event.preventDefault()
    // this.props.onOpen(this.props.name, this.props.period)
    // var $link = $(event.target.hash)
    // if ($link.length) {
    //   location.hash = event.target.hash
    //   $(document.body).scrollTop($link.offset().top)
    // } else {
    //   console.error("This link has no target: " + event.target.hash)
    // }
  }
  render() {
    const {children, name, period} = this.props
    const id = model.buildVariableId(name, period)
    return (
      <a href={"#" + id} onClick={this.handleClick}>
        {children}
      </a>
    )
  }
}
