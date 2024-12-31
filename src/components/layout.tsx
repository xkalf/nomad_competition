import Head from "next/head";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="space-y-4 p-2 md:p-8">
      <Head>
        <title>Nomad Competition</title>
      </Head>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}
