import { Input } from "~/components/ui/input"
import type { FolderSelectType } from "~/server/db/schema"
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Search } from "lucide-react"

export function Header(props: { parents: FolderSelectType[] }) {
  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-xl font-semibold">My Drive</h1>
        </div>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search in Drive" className="pl-10 bg-muted border-none" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t">
        <div className="flex items-center gap-2">
          <nav>
            <ul className="flex items-center gap-1">
              {props.parents.map((folder, index) => (
                <div key={folder.id} className="flex">
                  <li>
                    <Link href={`${folder.id}`} className="text-muted-foreground p-0 h-auto">
                      {folder.name}
                    </Link>
                  </li>
                  {index + 1 < props.parents.length && <li className="text-muted-foreground mx-1">/</li>}
                </div>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
