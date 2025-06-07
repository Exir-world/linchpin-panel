import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Navbar,
  NavbarContent,
  useDisclosure,
} from "@nextui-org/react";
import React from "react";
import { BurguerButton } from "./burguer-button";
import LangSwitcher from "../langSwitcher";
import Icon from "../icon";
import { useTranslations } from "next-intl";
import { deleteCookie } from "cookies-next";
import useDir from "@/hooks/useDirection";
import NotificationBell from "../notificationBell/notificationBell";

interface Props {
  children: React.ReactNode;
}

export const NavbarWrapper = ({ children }: Props) => {
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const t = useTranslations();
  const handleLogout = () => {
    deleteCookie("linchpin-admin");
    window.location.href = "/login";
    onClose();
  };
  const dir = useDir();

  return (
    <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
      <Navbar
        isBordered
        className="w-full"
        classNames={{
          wrapper: "w-full max-w-full",
        }}
      >
        <NavbarContent className="md:hidden">
          <BurguerButton />
        </NavbarContent>
        <NavbarContent className="w-full max-md:hidden">
          {/* <Input
            startContent={<SearchIcon />}
            isClearable
            className="w-full"
            classNames={{
              input: "w-full",
              mainWrapper: "w-full",
            }}
            placeholder="Search..."
          /> */}
        </NavbarContent>
        <NavbarContent
          justify="end"
          className="w-fit data-[justify=end]:flex-grow-0"
        >
          <NotificationBell></NotificationBell>

          <LangSwitcher></LangSwitcher>
          <div className="flex items-center gap-2">
            <>
              <Modal isOpen={isOpen} onClose={onClose} dir={dir}>
                <ModalContent>
                  <ModalHeader>{t("global.logout")}</ModalHeader>
                  <ModalBody>{t("global.logoutConfirmation")}</ModalBody>
                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      {t("global.cancel")}
                    </Button>
                    <Button color="danger" onPress={handleLogout}>
                      {t("global.logout")}
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Button onPress={onOpen} isIconOnly variant="light">
                <Icon name="log-out" />
              </Button>
            </>
          </div>

          {/* <NotificationsDropdown />

          <div className="max-md:hidden">
            <SupportIcon />
          </div>

          <Link
            href="https://github.com/Siumauricio/nextui-dashboard-template"
            target={"_blank"}
          >
            <GithubIcon />
          </Link> */}
          {/* <NavbarContent>
            <UserDropdown />
          </NavbarContent> */}
        </NavbarContent>
      </Navbar>
      {children}
    </div>
  );
};
