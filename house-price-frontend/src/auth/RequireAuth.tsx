// src/auth/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "./token";

interface Props {
  children: React.ReactElement;
}

const RequireAuth: React.FC<Props> = ({ children }) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname || "/" }}
      />
    );
  }

  return children;
};

export default RequireAuth;
