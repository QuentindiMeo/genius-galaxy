"use client";

import React from "react";

import useDropdownStore from "@/hooks/useDropdownStore";

type DropdownProps = React.ComponentPropsWithoutRef<"div">;

const Dropdown: React.FC<DropdownProps> = ({ ...props }) => {
  const { isOpen, toggle } = useDropdownStore();

  return (
    <div className="dropdown" {...props}>
      <button onClick={toggle}>Toggle Dropdown</button>
      {isOpen && <div className="dropdown-menu">Dropdown Menu</div>}
    </div>
  );
};

export default Dropdown;
