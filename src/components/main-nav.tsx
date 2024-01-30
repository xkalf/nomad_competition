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

  const adminPages: {
    label: string;
    href: string;
  }[] = [
      {
        label: "Шооны төрөл",
        href: "/cube-types",
      },
    ];

  const isPage = (href: string) => router.pathname === href;

  return (
    <nav className="flex items-center space-x-4 border-b-black lg:space-x-6">
      {data.map((item) => (
        <Link
          className={cn(
            "text-xl font-medium transition-colors hover:text-primary",
            !isPage(item.href) && "text-muted-foreground",
          )}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
      {adminPages.map((item) => (
        <Link
          className={cn(
            "text-xl font-medium transition-colors hover:text-primary",
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
