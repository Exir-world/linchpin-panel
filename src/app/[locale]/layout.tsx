import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import { getLocale, getMessages } from "next-intl/server";
import { FontProvider } from "@/components/fontProvider/FontProvider";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const locale = await getLocale();
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();
  const dir = locale === "en" ? "ltr" : "rtl";

  return (
    <div dir={dir}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <FontProvider>


          {children}
        </FontProvider>
      </NextIntlClientProvider>
    </div>
  );
}
