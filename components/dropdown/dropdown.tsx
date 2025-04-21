"use client";
import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";

interface DropdownItemType {
  key: string;
  label: string;
}

interface CustomDropdownProps {
  dropdownItems: DropdownItemType[];
  selectedValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function CustomDropdown({
  dropdownItems,
  selectedValue,
  onChange,
  disabled = false,
}: CustomDropdownProps) {
  // استفاده از state محلی برای ذخیره مقدار انتخاب شده
  const [localValue, setLocalValue] = React.useState<string>(
    selectedValue || dropdownItems[0]?.key || ""
  );

  // در صورتی که مقدار props تغییر کرد، state محلی هم به‌روز می‌شود
  React.useEffect(() => {
    if (selectedValue !== undefined) {
      setLocalValue(selectedValue);
    }
  }, [selectedValue]);

  const selectedKeys = React.useMemo(() => new Set([localValue]), [localValue]);

  return (
    <Dropdown size="lg" className="w-full" isDisabled={disabled}>
      <DropdownTrigger disabled={disabled}>
        <Button
          className="capitalize w-[80%] py-2"
          variant="bordered"
          size="lg"
        >
          {dropdownItems.find((item) => item.key === localValue)?.label ||
            localValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Dynamic Dropdown"
        selectedKeys={selectedKeys}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(keys) => {
          if (disabled) return;
          const newKey = Array.from(keys)[0];
          // به‌روزرسانی state محلی به صورت همزمان
          setLocalValue(newKey as string);
          if (onChange && newKey) {
            onChange(newKey as string);
          }
        }}
      >
        {dropdownItems.map((item) => (
          <DropdownItem key={item.key}>{item.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
