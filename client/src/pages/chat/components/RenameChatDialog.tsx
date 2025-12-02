import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pen } from "lucide-react";
import { useState, useEffect } from "react";

export default function RenameChatDialog({
  onSubmit,
  disabled,
  currentName,
}: {
  onSubmit: (value: string) => void;
  disabled: boolean;
  currentName: string;
}) {
  const [value, setValue] = useState(currentName);

  useEffect(() => {
    setValue(currentName);
  }, [currentName]);

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            variant={"ghost"}
            className="w-full justify-start px-2! py-1.5! font-normal"
          >
            <Pen className="text-muted-foreground" />
            <span>Rename</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Make changes to your chat title here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title-1">title</Label>
              <Input
                id="title-1"
                name="title"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={disabled || value.trim() === ""}
              onClick={() => onSubmit(value)}
              className="hover:cursor-pointer"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
