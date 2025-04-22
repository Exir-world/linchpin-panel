"use client";
import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "../icons/sidebar/chevron-down-icon"; // Adjust path as needed
import clsx from "clsx";
import { useSidebarContext } from "../layout/layout-context"; // Adjust path as needed

interface LinkItem {
  label: string;
  href: string;
}

interface Props {
  icon: React.ReactNode;
  title: string;
  items: LinkItem[];
  className?: string;
  linkClassName?: string;
}

const CollapseItems: React.FC<Props> = ({
  icon,
  title,
  items,
  className,
  linkClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { collapsed } = useSidebarContext(); // Integrate with sidebar context

  const toggleCollapse = () => {
    if (!collapsed) {
      // Only toggle if sidebar is not collapsed
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className={clsx("w-full", className)}>
      {/* Toggle Button */}
      <button
        onClick={toggleCollapse}
        className={clsx(
          "flex items-center w-full px-4 py-2 text-left transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          isOpen && "bg-gray-50 dark:bg-gray-900"
        )}
        role="button"
        aria-expanded={isOpen}
        aria-controls={`collapse-${title}`}
        disabled={collapsed} // Disable toggle when sidebar is collapsed
      >
        <span className="mr-2">{icon}</span>
        <span className="flex-1 text-sm font-medium">{title}</span>
        <ChevronDownIcon
          className={clsx(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Collapsible Content */}
      <div
        id={`collapse-${title}`}
        className={clsx(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="flex flex-col gap-1 py-2">
          {items.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "block px-6 py-2 text-sm transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",

                  linkClassName
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollapseItems;
