import { Card, CardContent } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import Image from 'next/image'
import { api } from '~/utils/api'
import { getImageUrl } from '~/utils/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Medal } from 'lucide-react'
import { displayTime } from '~/utils/timeUtils'

export default function ProfilePage() {
  const { data: user } = api.auth.me.useQuery()
  const { data: personalRecords } = api.persons.getPersonalRecords.useQuery()

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="container px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {user?.firstname} {user?.lastname}
            </h1>
          </div>
          <Image
            src={user?.image ? getImageUrl(user.image) : '/placeholder.svg'}
            width={200}
            height={200}
            alt="Profile"
            className="rounded-lg object-cover"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-6">
        <h2 className="text-xl text-center mb-4 font-bold">Хувийн амжилт</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Төрөл</TableHead>
                  <TableHead>Синглэ</TableHead>
                  <TableHead>Дундаж</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personalRecords?.map((record) => (
                  <TableRow key={'pb' + record.cubeTypeId}>
                    <TableCell className="flex gap-4 items-center">
                      <Image
                        src={getImageUrl(record.cubeType?.image)}
                        alt={record.cubeType?.name ?? ''}
                        width={30}
                        height={30}
                      />
                      {record.cubeType?.name}
                    </TableCell>
                    <TableCell>{displayTime(record.best)}</TableCell>
                    <TableCell>{displayTime(record.average)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="container grid grid-cols-1 md:grid-cols-2">
        <div className="container px-4 py-6">
          <h2 className="text-xl text-center mb-4 font-fold">Медал</h2>
          <Card>
            <CardContent className="pt-6 text-center">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">
                      <Medal className="h-12 w-12 text-yellow-500 mx-auto" />
                    </TableHead>
                    <TableHead className="text-center">
                      <Medal className="h-12 w-12 text-gray-400 mx-auto" />
                    </TableHead>
                    <TableHead className="text-center">
                      <Medal className="h-12 w-12 text-amber-700 mx-auto" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>1</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="container px-4 py-6">
          <h2 className="text-xl text-center mb-4 font-fold">Рекорд</h2>
          <Card>
            <CardContent className="pt-6 text-center">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">WR</TableHead>
                    <TableHead className="text-center">CR</TableHead>
                    <TableHead className="text-center">NR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>1</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="container px-4 py-6">
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList>
            <TabsTrigger value="results">Үзүүлэлт</TabsTrigger>
            <TabsTrigger value="records">Рекорд</TabsTrigger>
          </TabsList>

          {/* Results */}
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тэмцээн</TableHead>
                      <TableHead>Раунд</TableHead>
                      <TableHead>Байр</TableHead>
                      <TableHead>Синглэ</TableHead>
                      <TableHead>Дундаж</TableHead>
                      <TableHead>Эвлүүлэлт</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>3x3x3 Cube</TableCell>
                      <TableCell>7.42</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Records */}
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Синглэ</TableHead>
                      <TableHead>Дундаж</TableHead>
                      <TableHead>Тэмцээн</TableHead>
                      <TableHead>Раунд</TableHead>
                      <TableHead>Эвлүүлэлт</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>3x3x3 Cube</TableCell>
                      <TableCell>7.42</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
