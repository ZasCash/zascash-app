import React from 'react';

const PageTitle = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};

export default PageTitle;