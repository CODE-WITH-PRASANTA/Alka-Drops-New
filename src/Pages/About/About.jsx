import React from 'react';
import BreadCrumb from '../../Components/BreadCrumb/BreadCrumb';
import Aboutdeliveryservice from '../../Components/Aboutdeliveryservices/Aboutdeliveryservice';
import Aboutexperiencework from '../../Components/Aboutexperiencework/Aboutexperiencework';
import Aboutmeetourteam from '../../Components/Aboutmeetourteam/Aboutmeetourteam';
import Aboutclientfeedback from '../../Components/Aboutclientfeedback/Aboutclientfeedback';

const About = () => {
  return (
    <div>
      <BreadCrumb title="About Us" activePage="About Us" />
      <Aboutdeliveryservice />
      <Aboutexperiencework/>
      <Aboutmeetourteam/>
      <Aboutclientfeedback/>
    </div>
  );
};

export default About;