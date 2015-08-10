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


import {addons} from "react/addons"

import ImmutableRenderMixin from "react-immutable-render-mixin"


const {PureRenderMixin} = addons


export function ImmutablePureComponent(component) {
  component.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    const shouldComponentUpdate = this::ImmutableRenderMixin.shouldComponentUpdate(nextProps, nextState)
    // if (process.env.NODE_ENV === "development" && shouldComponentUpdate) {
    //   // TODO Check this code section is deleted in prod.
    //   debugger // eslint-disable-line
    //   this::ImmutableRenderMixin.shouldComponentUpdate(nextProps, nextState)
    // }
    return shouldComponentUpdate
  }
}


export function PureComponent(component) {
  component.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    return this::PureRenderMixin.shouldComponentUpdate(nextProps, nextState)
  }
}


export function StaticComponent(component) {
  component.prototype.shouldComponentUpdate = () => false
}
