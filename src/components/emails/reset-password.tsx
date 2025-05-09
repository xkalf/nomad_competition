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

interface ResetPasswordProps {
  user: User
  token: string
}

export const ResetPasswordTemplate: FC<Readonly<ResetPasswordProps>> = ({
  user,
  token,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Нууц үг сэргээх</Preview>
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
            Таны нууц үгийг сэргээх хүсэлт ирсэн байна. Доорх холбоосоор орж,
            шинэ нууц үг тохируулах боломжтой.
          </Text>
          <Section style={btnContainer}>
            <Link
              style={button}
              target="_blank"
              href={`https://nomad-team.com/password?${new URLSearchParams({
                token,
              })}`}
            >
              Нууц үг сэргээх
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

const logo = {
  margin: '0 auto',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
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
