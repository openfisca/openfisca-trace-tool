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

import ExternalLink from "./external-link"


export default class GitHubLink extends Component {
  static defaultProps = {
    commitReference: "master",
    text: "GitHub",
    title: "Voir le fichier source sur GitHub",
  }
  static propTypes = {
    blobUrlPath: PropTypes.string,
    children: PropTypes.func,
    className: PropTypes.string,
    commitReference: PropTypes.string,
    endLineNumber: PropTypes.number,
    lineNumber: PropTypes.number,
    style: PropTypes.object,
    text: PropTypes.string,
    title: PropTypes.string,
  }
  buildHref = () => {
    const {blobUrlPath, commitReference, endLineNumber, lineNumber} = this.props
    var line = ""
    if (lineNumber) {
      line = `#L${lineNumber}`
    }
    if (endLineNumber) {
      line = `${line}-L${endLineNumber}`
    }
    return `https://github.com/openfisca/openfisca-france/blob/${commitReference}/${blobUrlPath}${line}`
  }
  render() {
    const {children, className, style, text, title} = this.props
    return (
      <ExternalLink
        className={className}
        href={this.buildHref()}
        style={style}
        title={title}
      >
        {children ? children(text) : text}
      </ExternalLink>
    )
  }
}
