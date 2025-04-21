import React from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import clsx from "clsx";

const Icon = ({ name, classname }: any) => {
  return <DynamicIcon name={name} size={18} className={clsx(classname)} />;
};

export default Icon;
