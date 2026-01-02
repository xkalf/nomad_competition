import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface CubeType {
  id: number
  name: string
}

interface CubeTypesFieldProps {
  value?: number[]
  onChange: (value: number[]) => void
  cubeTypes?: CubeType[]
}

export function CubeTypesField({
  value = [],
  onChange,
  cubeTypes = [],
}: CubeTypesFieldProps) {
  const handleCheckedChange = (cubeTypeId: number, checked: boolean) => {
    if (checked && !value.includes(cubeTypeId)) {
      onChange([...value, cubeTypeId])
    } else if (!checked && value.includes(cubeTypeId)) {
      onChange(value.filter((id) => id !== cubeTypeId))
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="block">Төрөл сонгох</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {cubeTypes.map((cubeType) => (
          <DropdownMenuCheckboxItem
            key={cubeType.id}
            checked={value.includes(cubeType.id)}
            onCheckedChange={(checked) =>
              handleCheckedChange(cubeType.id, checked)
            }
          >
            {cubeType.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
