// organize-imports-ignore
import React from 'react'
import { ShowPropertyProps } from 'adminjs'

const Scanlink: React.FC<ShowPropertyProps> = props => {
  const address = props.record.params.address
  const scanUrl: string =
    address != null ? props.record.populated.networkId?.params?.scan ?? '' : ''

  if (scanUrl !== '') {
    return (
      <a target="_blank" href={`${scanUrl}/address/${address as string}`}>
        {address.slice(0, 6)}...{address.slice(-4)}
      </a>
    )
  } else {
    return <span></span>
  }
}

export default Scanlink
