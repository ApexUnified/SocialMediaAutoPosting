import React from "react";
import MainLogo from "../../assets/main-logo.png";

const Logo = () => {
  return (
    <>
      <img
        src={MainLogo}
        alt="Main Logo"
        className="w-[70px] h-[50px] rounded-2xl"
      />
    </>
  );
};

export default Logo;
