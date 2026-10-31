
import React from "react";

import Servicewhychooseus from "../../Components/Servicewhychooseus/Servicewhychooseus";
import Servicereview from "../../Components/Servicereview/Servicereview";
import Servicedetails from "../../Components/Servicedetails/Servicedetails";

import "./Service.css";
import ServiceBreadCrumb from "../../Components/ServiceBreadcumb/ServiceBreadcumb";

const Service = () => {
  return (
    <div className="service-page">
      <ServiceBreadCrumb/>
      <Servicewhychooseus />
      <Servicereview />
      <Servicedetails />
     
    </div>
  );
};

export default Service;
