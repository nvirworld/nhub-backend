// organize-imports-ignore
import React from 'react'
import { ShowPropertyProps } from 'adminjs'

const Decimal: React.FC<ShowPropertyProps> = props => {
  const value = props.record.params[props.property.name]
  if (value != null) {
    return <React.Fragment>{Number(value).toString()}</React.Fragment>
  }
  return <b></b>
}

export default Decimal
