import { tv } from "@nextui-org/react";

export const SidebarWrapper = tv({
  base: [
    "bg-background h-full fixed w-64 shrink-0 z-[202]",
    "flex-col py-6 px-3",
    "transition-all duration-300 ease-in-out",
    "md:flex md:static md:h-full md:translate-x-0 md:z-auto",
  ],
  variants: {
    isRTL: {
      true: {
        base: "right-0 border-l border-divider",
        collapsed: {
          true: "translate-x-full",
          false: "translate-x-0"
        }
      },
      false: {
        base: "left-0 border-r border-divider",
        collapsed: {
          true: "-translate-x-full",
          false: "translate-x-0"
        }
      }
    }
  },
  compoundVariants: [
    {
      isRTL: true,
      collapsed: true,
      class: "translate-x-full"
    },
    {
      isRTL: false,
      collapsed: true,
      class: "-translate-x-full"
    }
  ],
  defaultVariants: {
    isRTL: false,
    collapsed: true
  }
});

export const Overlay = tv({
  base: [
    "fixed inset-0 z-[201] bg-black/50",
    "transition-opacity duration-300",
    "md:hidden"
  ],
  variants: {
    collapsed: {
      true: "opacity-0 pointer-events-none",
      false: "opacity-100 pointer-events-auto"
    }
  },
  defaultVariants: {
    collapsed: true
  }
});

export const Header = tv({
  base: "flex gap-8 items-center px-6",
});

export const Body = tv({
  base: "flex flex-col gap-6 mt-9 px-2",
});

export const Footer = tv({
  base: "flex items-center justify-center gap-6 pt-16 pb-8 px-8 md:pt-10 md:pb-0",
});

export const Sidebar = Object.assign(SidebarWrapper, {
  Header,
  Body,
  Overlay,
  Footer,
});
