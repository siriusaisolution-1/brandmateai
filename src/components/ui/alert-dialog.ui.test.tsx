import React from "react"
import { render, screen } from "@testing-library/react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "./alert-dialog"

describe("AlertDialog", () => {
  it("renders its title, description, and actions when open", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm action</AlertDialogTitle>
          <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

    expect(screen.getByText("Confirm action")).toBeInTheDocument()
    expect(screen.getByText("Are you sure?")).toBeInTheDocument()
    expect(screen.getByText("Continue")).toBeInTheDocument()
  })
})
