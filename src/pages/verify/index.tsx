import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { api } from '~/utils/api'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

export default function EmailVerifiedPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { error, isLoading } = api.auth.verify.useQuery(token)
  const {
    mutate,
    data: resendStatus,
    error: resendError,
    isLoading: isResendLoading,
  } = api.auth.resendVerify.useMutation()

  if (isLoading) {
    return <div></div>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Имэйл баталгаажуулалт амжилтгүй
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <p className="text-lg mb-4">{error.message}</p>
            <p className="text-sm text-gray-600 mb-4">Дахин оролдоно уу.</p>
            {resendStatus?.success === true && (
              <Alert className="mb-4">
                <Mail className="h-4 w-4" />
                <AlertTitle>
                  Дахин баталгаажуулах имэйл амжилттай илгээгдлээ
                </AlertTitle>
                <AlertDescription>
                  Имэйл хаягаа шалган баталгаажуулаарай.
                </AlertDescription>
              </Alert>
            )}
            {resendError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Алдаа гарлаа</AlertTitle>
                <AlertDescription>
                  Имэйл баталгаажуулахад алдаа гарлаа. Дахин оролдоно уу.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => mutate(token)} disabled={isResendLoading}>
              {isResendLoading
                ? 'Уншиж байна...'
                : 'Имэйл баталгаажуулах дахин илгээх'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Имэйл баталгаажлаа
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <p className="text-lg mb-4">
            Таны имэйл амжилттай баталгаажлаа. Бүртгэлээ баталгаажуулсанд
            баярлалаа.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Нүүр хуудас луу буцах</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
