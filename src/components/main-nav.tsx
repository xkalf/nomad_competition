import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "~/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useMemo } from "react";
import LoginDialog from "./login-dialog";
import RegisterDialog from "./register-dialog";
import { UserNav } from "./user-nav";

export function MainNav() {
  const router = useRouter();
  const { data: session } = useSession();

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
  const pages = useMemo(() => {
    return [...data, ...(session?.user.isAdmin ? adminPages : [])];
  }, [session?.user.isAdmin]);

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {pages.map((item) => (
          <Link
            href={item.href}
            key={"nav" + item.href}
            className={cn(
              "transition-colors hover:text-foreground",
              isPage(item.href) ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="flex min-h-full flex-col gap-6 pb-4 text-lg font-medium">
            {pages.map((item) => (
              <Link
                href={item.href}
                className={cn(
                  "hover:text-foreground",
                  isPage(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
                key={"side" + item.href}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-auto flex flex-col gap-2">
              {session ? (
                <div className="text-end">
                  <UserNav user={session.user} />
                </div>
              ) : (
                <>
                  <LoginDialog />
                  <RegisterDialog />
                </>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
