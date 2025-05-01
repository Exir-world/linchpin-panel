import React from "react";
import { Sidebar } from "./sidebar.styles";
import { Avatar, Tooltip } from "@nextui-org/react";
import { CompaniesDropdown } from "./companies-dropdown";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { PaymentsIcon } from "../icons/sidebar/payments-icon";
import { BalanceIcon } from "../icons/sidebar/balance-icon";
import { AccountsIcon } from "../icons/sidebar/accounts-icon";
import { CustomersIcon } from "../icons/sidebar/customers-icon";
import { ProductsIcon } from "../icons/sidebar/products-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { DevIcon } from "../icons/sidebar/dev-icon";
import { ViewIcon } from "../icons/sidebar/view-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
// import { CollapseItems } from "./collapse-items";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { FilterIcon } from "../icons/sidebar/filter-icon";
import { useSidebarContext } from "../layout/layout-context";
import { ChangeLogIcon } from "../icons/sidebar/changelog-icon";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Icon from "../icon";
import CollapseItems from "./collapse-items";

export const SidebarWrapper = () => {
  const pathname = usePathname().split("/")[2];
  const { collapsed, setCollapsed } = useSidebarContext();
  const t = useTranslations();

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}
      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>{/* <CompaniesDropdown /> */}</div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            <SidebarItem
              title={t("global.home")}
              icon={<HomeIcon />}
              href="/"
            />
            <SidebarMenu title={t("global.main-menu.mainMenu")}>
              <SidebarItem
                isActive={pathname === "employees"}
                title={t("global.main-menu.employees")}
                icon={<Icon name="users" classname="mx-1" />}
                href="/employees"
              />
              <SidebarItem
                isActive={pathname === "organizations"}
                title={t("global.main-menu.organizations")}
                icon={<CustomersIcon />}
                href="/organizations"
              />
              <SidebarItem
                isActive={pathname === "requests"}
                title={t("global.main-menu.requests")}
                href="/requests"
                icon={<PaymentsIcon />}
              />
              {/* <SidebarItem
                isActive={pathname === "/reports"}
                title={t("global.main-menu.reports")}
                href="/reports"
                icon={<ReportsIcon />}
              /> */}
              {/* <SidebarItem
                isActive={pathname === "salarySlip"}
                title={t("global.main-menu.salary-slip")}
                href="/salarySlip"
                icon={<CustomersIcon />}
              /> */}
              {/* <SidebarItem
                isActive={pathname === "properties"}
                title={t("global.main-menu.properties")}
                href="/properties"
                icon={<Icon name="file-sliders" classname="mx-1" />}
              /> */}
              <CollapseItems
                icon={<BalanceIcon />}
                items={[
                  {
                    label: t("global.main-menu.properties"),
                    href: "/properties",
                  },
                  {
                    label: t("global.main-menu.categories"),
                    href: "/properties/categories",
                  },
                  {
                    label: t("global.main-menu.reports"),
                    href: "/properties/reports",
                  },
                ]}
                title={t("global.main-menu.properties")}
              />
              {/* <SidebarItem
                isActive={pathname === "products"}
                title="Products"
                icon={<ProductsIcon />}
              /> */}
            </SidebarMenu>

            {/* <SidebarMenu title={t("global.main-menu.general")}>
              <SidebarItem
                isActive={pathname === "/developers"}
                title="Developers"
                icon={<DevIcon />}
              />
              <SidebarItem
                isActive={pathname === "/view"}
                title="View Test Data"
                icon={<ViewIcon />}
              />
              <SidebarItem
                isActive={pathname === "/settings"}
                title="Settings"
                icon={<SettingsIcon />}
              />
            </SidebarMenu> */}

            {/* <SidebarMenu title="Updates">
              <SidebarItem
                isActive={pathname === "/changelog"}
                title="Changelog"
                icon={<ChangeLogIcon />}
              />
            </SidebarMenu> */}
          </div>
          <div className={Sidebar.Footer()}>
            {/* <Tooltip content={"Settings"} color="primary">
              <div className="max-w-fit">
                <SettingsIcon />
              </div>
            </Tooltip>
            <Tooltip content={"Adjustments"} color="primary">
              <div className="max-w-fit">
                <FilterIcon />
              </div>
            </Tooltip>
            <Tooltip content={"Profile"} color="primary">
              <Avatar
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                size="sm"
              />
            </Tooltip> */}
          </div>
        </div>
      </div>
    </aside>
  );
};
