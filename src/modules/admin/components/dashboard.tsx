import { ShowPropertyProps } from 'adminjs'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC<ShowPropertyProps> = props => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/ctrl/resources/PoolV4')
  })
  return <div></div>
}

export default Dashboard
