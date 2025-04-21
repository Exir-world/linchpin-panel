"use client";
import { Get } from "@/lib/axios";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useLocale } from "next-intl";
import React, { useEffect, useState } from "react";

interface DropdownItemType {
  key: string;
  label: string;
}

interface Organizationdropdown {
  //   selectedValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const Organizationdropdown = ({
  onChange,
  disabled = false,
}: Organizationdropdown) => {
  const [organizationList, setOrganizationList] = useState<DropdownItemType[]>(
    []
  );
  const locale = useLocale();

  const getOrgList = async () => {
    try {
      const res = await Get("/organization/admin/organizations", {
        headers: {
          "Accept-Language": locale,
        },
      });
      if (res.status === 200) {
        const list = res.data.map((el: any) => ({
          key: String(el.id),
          label: el.name,
        }));
        setOrganizationList(list);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [localValue, setLocalValue] = React.useState<string>(
    organizationList[0]?.key || ""
  );

  // در صورتی که مقدار props تغییر کرد، state محلی هم به‌روز می‌شود
  React.useEffect(() => {
    getOrgList();
    console.log(organizationList.find((item) => item.key === localValue));

    // setLocalValue(organizationList[0]?.key);
  }, []);

  const selectedKeys = React.useMemo(() => new Set([localValue]), [localValue]);

  const selectedLabel = organizationList.find(
    (item) => item.key === localValue
  )?.label;

  return (
    <Dropdown className="w-full" isDisabled={disabled}>
      <DropdownTrigger disabled={disabled}>
        <Button className="capitalize w-[80%] py-2" variant="bordered">
          {/* {organizationList.find((item) => item.key === localValue)?.label} */}
          {selectedLabel}
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
        {organizationList.map((item) => (
          <DropdownItem key={item.key}>{item.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default Organizationdropdown;
