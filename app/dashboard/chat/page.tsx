"use client"

import * as React from "react"
import { Check, Plus, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { fetchUsers } from "@/services/userService"

export default function CardsChat() {
  const [open, setOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [dataUsers, setDataUsers] = React.useState<any[]>([])
  const [messages, setMessages] = React.useState<any[]>([])
  const [input, setInput] = React.useState("")
  const inputLength = input.trim().length

  React.useEffect(() => {
    fetchUsers()
      .then((users) => {
        setDataUsers(users)
        if (users.length > 0 && !selectedUser) {
          setSelectedUser(users[0])
          setMessages([
            {
              role: "agent",
              content: `Bonjour ${users[0].username}, comment puis-je vous aider ?`,
            },
          ])
        }
      })
      .catch(console.error)
  }, [])

  return (
    <>
      <div className="mt-2">
        {selectedUser && (
          <CardHeader className="flex flex-row items-center">
            <div className="flex items-center space-x-4 m-2">
              <Avatar>
                <AvatarImage src={selectedUser.avatar || undefined} alt="Image" />
                <AvatarFallback>{selectedUser.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="">
                <p className="text-sm font-medium leading-none">{selectedUser.username}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
              </div>
            </div>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="ml-auto rounded-full"
                    onClick={() => setOpen(true)}
                  >
                    <Plus />
                    <span className="sr-only">New message</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={10}>New message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}
              </div>
            ))}
          </div>
        </CardContent>
        {selectedUser && (
          <CardFooter>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (inputLength === 0) return
                setMessages([
                  ...messages,
                  {
                    role: "user",
                    content: input,
                  },
                ])
                setInput("")
              }}
              className="flex w-full items-center space-x-2 mt-4"
            >
              <Input
                id="message"
                placeholder="Type your message..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <Button type="submit" size="icon" disabled={inputLength === 0}>
                <Send />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 outline-none">
          <DialogHeader className="px-4 pb-4 pt-5">
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>
              Sélectionnez un utilisateur pour discuter.
            </DialogDescription>
          </DialogHeader>
          <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
            <CommandInput placeholder="Search user..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup className="p-2">
                {dataUsers.length > 0 && dataUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    className="flex items-center px-2"
                    onSelect={() => {
                      setSelectedUser(user);
                      setMessages([
                        {
                          role: "agent",
                          content: `Bonjour ${user.username}, comment puis-je vous aider ?`,
                        },
                      ]);
                      setOpen(false);
                    }}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar || undefined} alt="Image" />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <p className="text-sm font-medium leading-none">
                        {user.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.phone}
                      </p>
                    </div>
                    {selectedUser?.id === user.id && (
                      <Check className="ml-auto flex h-5 w-5 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
