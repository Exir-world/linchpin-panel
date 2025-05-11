import { Image } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import { useTranslations } from "next-intl";

interface Props {
  children: React.ReactNode;
}

export const AuthLayoutWrapper = ({ children }: Props) => {
  const t = useTranslations("global.auth.layout");

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex-col flex items-center justify-center p-6 relative">
        {/* Login Side Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        
        {/* Login Form Container */}
        <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl">
          {children}
        </div>
      </div>

      <div className="hidden my-10 md:block">
        <Divider orientation="vertical" className="bg-white/10" />
      </div>

      <div className="hidden md:flex flex-1 relative items-center justify-center p-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-24 h-24 bg-white/10 backdrop-blur-lg rounded-2xl rotate-12 z-0" />
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 backdrop-blur-lg rounded-2xl -rotate-12 z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 backdrop-blur-lg rounded-2xl rotate-45 z-0" />

        {/* Content */}
        <div className="space-y-6 text-center relative z-10">
          <h1 className="font-bold text-[45px] bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <div className="font-light text-slate-400 mt-4 max-w-md">
            <p className="text-lg mb-4">{t("welcome")}</p>
            <p className="text-sm">
              {t("description")}
            </p>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-lg p-4 rounded-xl border border-white/10">
              <div className="text-blue-400 mb-2">📊 {t("analytics.title")}</div>
              <p className="text-sm text-slate-300">{t("analytics.description")}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg p-4 rounded-xl border border-white/10">
              <div className="text-purple-400 mb-2">👥 {t("management.title")}</div>
              <p className="text-sm text-slate-300">{t("management.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
