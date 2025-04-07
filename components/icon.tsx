import React from "react";
import { DynamicIcon } from "lucide-react/dynamic";

const Icon = ({ name }: any) => {
  return <DynamicIcon name={name} size={18} />;
};

export default Icon;
