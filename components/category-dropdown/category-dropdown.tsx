"use client";
import { Get } from "@/lib/axios";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

interface DropdownItemType {
  key: string;
  label: string;
}

interface Categorydropdown {
  //   selectedValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}
const CategoryDropdown = ({ onChange, disabled }: Categorydropdown) => {
  const [categoryList, setCategoryList] = useState<DropdownItemType[]>([]);
  const locale = useLocale();
  const t = useTranslations();

  const getCategories = async () => {
    try {
      const res = await Get("/property-categories", {
        headers: {
          "Accept-Language": locale,
        },
      });
      if (res.status === 200) {
        const list = res.data.map((el: any) => ({
          key: String(el.id),
          label: el.title,
        }));

        setCategoryList(list);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [localValue, setLocalValue] = React.useState<string>(
    categoryList[0]?.key || ""
  );

  // در صورتی که مقدار props تغییر کرد، state محلی هم به‌روز می‌شود
  React.useEffect(() => {
    getCategories();

    // setLocalValue(organizationList[0]?.key);
  }, []);

  const selectedKeys = React.useMemo(() => new Set([localValue]), [localValue]);

  const selectedLabel = categoryList.find(
    (item) => item.key === localValue
  )?.label;
  return (
    <div className=" gap-1 flex flex-col">
      <p className="text-sm">{t("global.categoryId")}</p>
      <Dropdown className="w-full" isDisabled={disabled}>
        <DropdownTrigger disabled={disabled}>
          <Button className="capitalize w-[80%] py-2" variant="bordered">
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
          {categoryList.map((item) => (
            <DropdownItem key={item.key}>{item.label}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default CategoryDropdown;
