import { CubeTypesField } from '~/components/competitions/create/cube-types-field'
import { useCompetitionForm } from '~/components/competitions/create/use-competition-form'
import CreateButtons from '~/components/create-buttons'
import Layout from '~/components/layout'
import { DateTimeField } from '~/components/ui/datetime-field'
import { FileUploadField } from '~/components/ui/file-upload-field'
import { Form, FormFieldCustom } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/utils/api'

export default function CompetitionCreatePage() {
  const { form, onSubmit, isLoading } = useCompetitionForm()
  const { data: cubeTypes } = api.cubeTypes.getAll.useQuery({})

  return (
    <Layout>
      <h1 className="text-3xl font-bold">Тэмцээн бүртгэх</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-x-8 gap-y-4"
        >
          <FormFieldCustom
            control={form.control}
            name="name"
            label="Тэмцээний нэр"
            render={({ field }) => <Input {...field} />}
          />
          <FormFieldCustom
            control={form.control}
            name="address"
            label="Хаяг"
            render={({ field }) => <Textarea {...field} />}
          />
          <FormFieldCustom
            control={form.control}
            name="addressLink"
            label="Хаяг Линк"
            render={({ field }) => (
              <Input {...field} value={field.value ?? ''} />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="startDate"
            label="Тэмцээн эхлэх өдөр"
            render={({ field }) => <Input type="date" {...field} />}
          />
          <FormFieldCustom
            control={form.control}
            name="endDate"
            label="Тэмцээний дуусах өдөр"
            render={({ field }) => <Input type="date" {...field} />}
          />
          <FormFieldCustom
            control={form.control}
            name="cubeTypes"
            label="Төрөл"
            render={({ field }) => (
              <CubeTypesField
                value={field.value}
                onChange={field.onChange}
                cubeTypes={cubeTypes}
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="maxCompetitors"
            label="Тамирчны хязгаар"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="registerStartDate"
            label="Бүртгэл эхлэх хугацаа"
            render={({ field }) => (
              <DateTimeField value={field.value} onChange={field.onChange} />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="registerEndDate"
            label="Бүртгэл дуусах хугацаа"
            render={({ field }) => (
              <DateTimeField value={field.value} onChange={field.onChange} />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="contact"
            label="Холбоо барих мэдээлэл"
            render={({ field }) => (
              <Textarea {...field} value={field.value ?? ''} />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="registrationRequirments"
            label="Бүртгүүлэх шаардлага"
            render={({ field }) => (
              <Textarea {...field} value={field.value ?? ''} />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="baseFee"
            label="Бүртгэлийн хураамж"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="guestFee"
            label="Зочны хураамж"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="freeGuests"
            label="Үнэгүй оролцох зочин"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="image"
            label="Зураг"
            render={({ field }) => (
              <FileUploadField
                value={field.value}
                onChange={field.onChange}
                accept="image/*"
                folder="competitions"
                showPreview
                previewAlt="Зураг"
              />
            )}
          />
          <FormFieldCustom
            control={form.control}
            name="guideLines"
            label="Удирдамж"
            render={({ field }) => (
              <FileUploadField
                value={field.value}
                onChange={field.onChange}
                accept="application/pdf"
                folder="guidelines"
              />
            )}
          />
          <CreateButtons
            isLoading={isLoading}
            onSubmit={form.handleSubmit(onSubmit)}
          />
        </form>
      </Form>
    </Layout>
  )
}
