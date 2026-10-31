import React from 'react'
import Contactform from '../../Components/Contactform/Contactform'
import BreadCrumb from "../../Components/BreadCrumb/BreadCrumb"
import ContactBreadcrumb from '../../Components/ContactBreadcrumb/ContactBreadcrumb'

const Contact = () => {
  return (
    <div>
      <ContactBreadcrumb />
      <Contactform />
    </div>
  )
}

export default Contact