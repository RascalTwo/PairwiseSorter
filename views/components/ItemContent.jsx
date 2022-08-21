import React from 'react';

export default ({ name }) => <span className="item-name" data-item-name={JSON.stringify(name)}>{name}</span>