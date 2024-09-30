import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordResetInput, passwordResetSchema } from "~/utils/zod";
import { api } from "~/utils/api";
import { Form, FormFieldCustom } from "~/components/ui/form";
import { useRouter } from "next/router";
import { toast } from "~/components/ui/use-toast";
import { useSearchParams } from "next/navigation";

export default function PasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate, isLoading, error } = api.auth.passwordReset.useMutation({
    onSuccess: () => {
      toast({
        title: "Нууц үг амжилттай сэргээдлээ",
      });
      router.push("/");
    },
  });
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      token: searchParams.get("token") ?? "",
    },
  });

  const onSubmit = async (input: PasswordResetInput) => {
    mutate(input);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Нууц үг сэргээх
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <FormFieldCustom
                    className="pr-10"
                    label="Нууц үг"
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <FormFieldCustom
                  control={form.control}
                  name="passwordRe"
                  label="Нүүц үг давтах"
                  render={({ field }) => <Input type="password" {...field} />}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Алдаа гарлаа</AlertTitle>
                  <AlertDescription>{error?.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Уншиж байна..." : "Нууц үг сэргээх"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
