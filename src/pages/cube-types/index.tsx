import Layout from "~/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/utils/api";
import CubeTypeForm from "./form";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { toast } from "~/components/ui/use-toast";

export default function CubeTypesPage() {
  const utils = api.useUtils();
  const [selected, setSelected] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const { data } = api.cubeTypes.getAll.useQuery();
  const { mutate: remove } = api.cubeTypes.delete.useMutation({
    onSuccess: () => {
      utils.cubeTypes.getAll.invalidate();
      toast({
        title: "Амжилттай устгалаа.",
      });
    },
    onError: (error) => {
      toast({
        title: "Алдаа гарлаа",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelected = (id: number) => () => {
    setSelected(id);
    setIsOpen(true);
  };
  const handleRemove = (id: number) => () => remove(id);

  return (
    <Layout>
      <CubeTypeForm
        current={data?.find((i) => i.id === selected)}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        reset={() => setSelected(0)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Нэр</TableHead>
            <TableHead>Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => (
            <TableRow>
              <TableCell>{item.name}</TableCell>
              <TableCell className="space-x-2">
                <Button onClick={handleSelected(item.id)}>Засах</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button>Устгах</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Устгахдаа итгэлтэй байна уу?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {item.name} төрлийг устгахдаа итгэлтэй байна уу?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemove(item.id)}>
                        Баталгаажуулах
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Layout>
  );
}
