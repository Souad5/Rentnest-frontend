"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type CalendarDay,
  type Modifiers,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  captionLayout?: "label" | "dropdown"
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      animate={false}
      className={cn(
        "group/calendar bg-background p-2 [--rdp-cell-size:2rem] [--rdp-today-color:var(--muted-foreground)]",
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (month) =>
          month.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: "relative flex flex-col gap-4 md:flex-row md:gap-6",
        month: "flex w-full flex-col gap-4",
        nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-(--rdp-cell-size) select-none p-0 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-(--rdp-cell-size) select-none p-0 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        ),
        month_caption:
          "flex h-(--rdp-cell-size) w-full items-center justify-center px-(--rdp-cell-size)",
        dropdowns:
          "flex h-(--rdp-cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
        dropdown_root: cn(
          buttonVariants({ variant: "ghost" }),
          "relative rounded-md px-1.5 has-focus:ring-3 has-focus:ring-ring/50"
        ),
        months_dropdown: "text-sm font-medium outline-none",
        years_dropdown: "text-sm font-medium outline-none",
        dropdown:
          "absolute inset-0 cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed",
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" &&
            "flex h-8 items-center justify-center gap-1 rounded-md text-sm",
          captionLayout === "dropdown" && "text-sm"
        ),
        weekdays: "flex",
        weekday:
          "flex size-(--rdp-cell-size) flex-1 items-center justify-center rounded-md text-[0.8rem] font-normal text-muted-foreground select-none",
        week_number: "w-(--rdp-cell-size) text-[0.8rem] text-muted-foreground",
        weeks: "mt-1 flex flex-col gap-1",
        week: "flex w-full mt-0.5",
        day: cn(
          "relative flex size-(--rdp-cell-size) flex-1 items-center justify-center text-sm",
          defaultClassNames.day
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-auto aspect-square w-full min-w-(--rdp-cell-size) flex-col gap-px rounded-md p-0 font-normal"
        ),
        month_grid: "w-full border-collapse",
        footer: "mt-4 flex flex-col items-center gap-1 px-8",
        selected: "bg-primary text-primary-foreground",
        today: "[&>button]:font-semibold [&>button]:text-primary",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground/50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeftIcon
              : orientation === "right"
                ? ChevronRightIcon
                : ChevronDownIcon
          return <Icon className="size-4" />
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<"button"> & {
  day: CalendarDay
  modifiers: Modifiers
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-modifiers={JSON.stringify(modifiers)}
      className={cn(
        "aspect-square size-auto min-w-(--rdp-cell-size) shrink-0 grow gap-px rounded-md p-0 font-normal leading-none select-none",
        modifiers.range_middle &&
          "!rounded-none bg-accent !text-accent-foreground hover:!bg-accent",
        modifiers.range_start &&
          "!rounded-r-none bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground",
        modifiers.range_end &&
          "!rounded-l-none bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground",
        modifiers.selected &&
          "!bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground focus-visible:!ring-primary/50",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
