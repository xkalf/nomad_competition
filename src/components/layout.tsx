import { useSession } from "next-auth/react";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import RegisterDialog from "./register-dialog";
import LoginDialog from "./login-dialog";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const { data: session } = useSession();
  return (
    <div className="space-y-4 p-8">
      <div className="flex h-16 items-center justify-between px-4">
        <MainNav />
        {session ? (
          <UserNav user={session.user} />
        ) : (
          <div className="flex space-x-2">
            <LoginDialog />
            <RegisterDialog />
          </div>
        )}
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}
