"use client";

import { LoginFormData } from "@/helpers/types";
import { Post } from "@/lib/axios";
import { Button, Input } from "@nextui-org/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "@/src/i18n/navigation";
import { Controller, useForm } from "react-hook-form";
import { getCookie, setCookie } from "cookies-next";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { addToast } from "@heroui/toast";
import { AxiosError } from "axios";

export const Login = () => {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      phoneNumber: "",
      password: "",
    },

    mode: "onChange",
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const res = await Post("/auth/login/admin", data, {
        headers: {
          "Accept-Language": locale || "fa",
        },
      });
      const token = res.data?.accessToken;
      setCookie("linchpin-admin", token);
      if (getCookie("linchpin-admin")) {
        router.replace("/");
      }
    } catch (err: AxiosError | any) {
      addToast({
        title: err.response?.data.message,
        color: "danger",
      });
    }
  };

  return (
    <>
      <div className="text-center text-[25px] font-bold mb-6">
        {t("global.auth.login")}
      </div>

      <form
        onSubmit={handleSubmit(handleLogin)}
        className="flex flex-col items-center gap-4"
      >
        <div className="">
          <label>{t("global.auth.phoneNumber")}</label>
          {/* <Input
            {...register("phoneNumber", {
              required: t("global.auth.formError.required"),
            })}
          ></Input>
          {errors.phoneNumber && (
            <span className="text-red-500 ">{errors.phoneNumber.message}</span>
          )} */}

          <Controller
            name="phoneNumber"
            control={control}
            rules={{ required: "Phone number is required" }}
            render={({ field, fieldState: { error } }) => (
              <>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={field.value}
                  defaultCountry="IR"
                  onChange={field.onChange}
                  className="bg-gray-50 h-10 rounded-lg p-1 !outline-white !ring-white  dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                {error && <p style={{ color: "red" }}>{error.message}</p>}
              </>
            )}
          />
        </div>
        <div>
          <label>{t("global.auth.password")}</label>
          <Input
            className="w-60"
            placeholder="****"
            {...register("password", {
              required: t("global.auth.formError.required"),
            })}
          ></Input>
          {errors.password && (
            <span className="text-red-500 ">{errors.password.message}</span>
          )}
        </div>
        <div className="p-2 flex justify-center">
          <Button type="submit" variant="bordered" color="primary">
            {t("global.auth.login")}
          </Button>
        </div>
      </form>

      <div className="font-light text-slate-400 mt-4 text-sm">
        Don&apos;t have an account ?{" "}
        <Link href="/register" className="font-bold">
          Register here
        </Link>
      </div>
    </>
  );
};
