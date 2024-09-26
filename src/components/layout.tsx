import { useSession } from "next-auth/react";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import RegisterDialog from "./register-dialog";
import LoginDialog from "./login-dialog";
import Head from "next/head";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const { data: session } = useSession();
  return (
    <div className="space-y-4 p-2 md:p-8">
      <Head>
        <title>Nomad Competition</title>
      </Head>
      <div className="flex h-16 items-center justify-between px-4">
        <MainNav />
        <div className="hidden md:block">
          {session ? (
            <UserNav user={session.user} />
          ) : (
            <div className="flex space-x-2">
              <LoginDialog />
              <RegisterDialog />
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}
