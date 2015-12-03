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

import {ImmutablePureComponent} from "../decorators"
import Value from "./value"


@ImmutablePureComponent
export default class ValuesArray extends Component {
  static propTypes = {
    $array: PropTypes.any.isRequired,
    $entities: PropTypes.any.isRequired,
    cellType: PropTypes.string,
    entityKeyPlural: PropTypes.string,
  }
  getValueTitle = (idx) => {
    const {$entities, entityKeyPlural} = this.props
    let title = `${entityKeyPlural}[${idx}]`
    const entityId = $entities.getIn([idx, "id"])
    if (entityId) {
      title += `, id=${entityId}`
    }
    return title
  }
  render() {
    const {$array, cellType} = this.props
    return (
      <span>
        <samp className="text-muted" style={{display: "inline-block", marginRight: "0.5em"}}>[</samp>
        <ul className="list-inline" style={{display: "inline-block"}}>
          {
            $array.map((value, idx) => (
              <li key={idx}>
                <samp>
                  <Value title={this.getValueTitle(idx)} type={cellType}>
                    {value}
                  </Value>
                </samp>
                {idx < $array.size - 1 && <span className="text-muted">, </span>}
              </li>
            ))
          }
        </ul>
        <samp className="text-muted" style={{display: "inline-block"}}>]</samp>
      </span>
    )
  }
}
