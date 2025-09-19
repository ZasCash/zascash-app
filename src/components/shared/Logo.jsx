import React from 'react';

const Logo = ({ className }) => {
  return (
    <img
      src="https://storage.googleapis.com/hostinger-horizons-assets-prod/04c6e96a-41b3-44a3-9019-9ff2cd5a435e/e0326b607e912fa947aa3ea060f3781a.png"
      alt="ZasCash Logo"
      className={className || "h-12 w-auto"}
    />
  );
};

export default Logo;