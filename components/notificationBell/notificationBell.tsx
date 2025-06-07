"use client";

import React, { useEffect, useState } from "react";
import {
  Popover,
  Button,
  Card,
  Avatar,
  Divider,
  PopoverTrigger,
  PopoverContent,
  Badge,
} from "@nextui-org/react";
import Icon from "../icon";
import { Get } from "@/lib/axios";
import { useTranslations } from "next-intl";

const NotificationBell = () => {
  const t = useTranslations("global.notifications");
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await Get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set interval to refetch every 5 minutes
    const interval = setInterval(() => {
      fetchNotifications();
    }, 300000); // 300,000 ms = 5 minutes

    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end">
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="light"
          aria-label="Notifications"
          className="relative"
        >
          <Badge
            content={notifications.length}
            isInvisible={notifications.length == 0}
            color="danger"
            shape="circle"
            placement="top-right"
          >
            <Icon name="bell-ring" />
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-2">
        <p className="mb-2">{t("notifications")}</p>
        <Divider />
        {notifications.length > 0 ? (
          <div className="space-y-2 mt-2">
            {notifications.map((notification:any) => (
              <Card
                key={notification.id}
                shadow="sm"
                className="p-2 flex items-center gap-3"
              >
                <div className="flex-1">
                  <p>{notification.title}</p>
                  <p>{notification.description}</p>
                </div>
                <p>{notification.time}</p>
              </Card>
            ))}
            <div className="w-full flex justify-center items-center">
              <Button
                color="secondary"
                className="w-full "
                size="sm"
                variant="solid"
              >
                {t("notificationButton")}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4">{t("noNotification")}</p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
