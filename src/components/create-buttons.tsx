import { useRouter } from "next/router";
import { Button } from "./ui/button";
import Link from "next/link";
import { BaseSyntheticEvent, useMemo } from "react";

const order = ["age-groups", "fees", "round", "groups"] as const;

type Props = {
  isLoading?: boolean;
  onSubmit?: (
    e?: BaseSyntheticEvent<object, unknown, unknown> | undefined,
  ) => Promise<void>;
};

export default function CreateButtons({ isLoading, onSubmit }: Props) {
  const router = useRouter();

  const curr = useMemo(
    () => order.findIndex((o) => o === router.pathname.split("/")[3]),
    [router.pathname],
  );

  return (
    <div className="flex space-x-2">
      {curr > 0 && (
        <Button type="button" variant={"outline"} asChild>
          <Link
            href={{
              pathname: `/competitions/create/${order[curr - 1]}`,
              query: router.query,
            }}
          >
            Буцах
          </Link>
        </Button>
      )}
      {curr < order.length - 1 && (
        <Button type="button" variant={"outline"} asChild>
          <Link
            href={{
              pathname: `/competitions/create/${order[curr + 1]}`,
              query: router.query,
            }}
          >
            Дараах
          </Link>
        </Button>
      )}
      {onSubmit && (
        <Button type="submit" disabled={isLoading} onClick={onSubmit}>
          Хадгалах
        </Button>
      )}
    </div>
  );
}
