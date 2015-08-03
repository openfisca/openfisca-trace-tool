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

import BreadCrumb from "./breadcrumb"
import NavBar from "./navbar"


export default class Layout extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }
  render = () => {
    return (
      <div>
        <a className="sr-only" href="#content">Sauter au contenu principal</a>
        <NavBar />
        <div className="container" id="content" style={{marginBottom: 100}}>
          <BreadCrumb />
          <div className="page-header">
            <h1>Outil de trace</h1>
          </div>
          {this.props.children}
        </div>
      </div>
    )
  }
}
