import React from 'react'
import Team_whywechose from '../../Components/Team_whywechose/Team_whywechose'
import Team_Meet from '../../Components/Team_Meet/Team_Meet'
import TeambreadCrumb from '../../Components/Teambreadcrumb/Teambreadcrumb'

const Team = () => {
  return (
    <div>
      <TeambreadCrumb/>
      <Team_whywechose/>
     <Team_Meet/> 

    </div>
  )
}

export default Team