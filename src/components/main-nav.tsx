import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "~/lib/utils";

export function MainNav() {
  const router = useRouter();

  const data: {
    label: string;
    href: string;
  }[] = [
    {
      label: "Нүүр",
      href: "/",
    },
    {
      label: "Тэмцээн",
      href: "/competitions",
    },
  ];

  const isPage = (href: string) => router.pathname === href;

  return (
    <nav className="flex items-center space-x-4 border-b-black lg:space-x-6">
      {data.map((item) => (
        <Link
          className={cn(
            "hover:text-primary text-xl font-medium transition-colors",
            !isPage(item.href) && "text-muted-foreground",
          )}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
