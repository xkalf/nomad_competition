import { FC } from 'react'
import { RouterOutputs } from '~/utils/api'
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

type User = RouterOutputs['auth']['me']

interface VerifyAccountProps {
  user: User
  token: string
}

export const VerifyAccountTemplate: FC<Readonly<VerifyAccountProps>> = ({
  user,
  token,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Имэйл баталгаажлаа</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://sepqgdowngdjrimbdsop.supabase.co/storage/v1/object/public/Storage/mail%20cover%20(1).png"
            width="170"
            height="50"
            alt="nomad team banner"
            style={logo}
          />
          <Text style={paragraph}>
            Сайна байна уу? {user.lastname[0]?.toUpperCase()}.{user.firstname},
          </Text>
          <Text style={paragraph}>
            Манай шооны тэмцээнд оролцохоор бүртгүүлсэнд баярлалаа. Таныг
            бидэнтэй хамт гайхалтай туршлага хүлээж байна гэж найдаж байна.
            Тэмцээнд амжилт хүсье!
          </Text>
          <Section style={btnContainer}>
            <Link
              style={button}
              target="_blank"
              href={`https://nomad-team.com/verify?${new URLSearchParams({
                token,
              })}`}
            >
              Баталгаажуулах
            </Link>
          </Section>
          <Text style={paragraph}>
            Хүндэтгэсэн,
            <br />
            Nomad Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
}

const logo = {
  margin: '0 auto',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
}

const btnContainer = {
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
}
