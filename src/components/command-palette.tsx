"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calendar, Settings, LayoutDashboard, Building, PlusCircle } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command" // We need to create this component
import { useFirestore, useFirestoreCollectionData, useUser } from "reactfire"
import { collection, query, where } from "firebase/firestore"
import { Brand } from "@/types/firestore"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { data: user } = useUser()
  const firestore = useFirestore()

  const brandsCollection = collection(firestore, 'brands');
  const brandsQuery = query(brandsCollection, where('ownerId', '==', user?.uid || ''));
  const { data: brands } = useFirestoreCollectionData(brandsQuery, { idField: 'id' });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
 
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/brands/new'))}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New Brand</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/calendar'))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
        </CommandGroup>
        
        {brands && brands.length > 0 && (
            <CommandGroup heading="Brands">
                {(brands as Brand[]).map(brand => (
                    <CommandItem
                        key={brand.id}
                        onSelect={() => runCommand(() => router.push(`/media-library/${brand.id}`))}
                    >
                        <Building className="mr-2 h-4 w-4" />
                        <span>{brand.name}</span>
                    </CommandItem>
                ))}
            </CommandGroup>
        )}

        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
