import React from 'react';

const FormInput = ({ label, type, name, placeholder, value, onChange, required }) => {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default FormInput;
