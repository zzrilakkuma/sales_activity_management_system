'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'

export interface SearchParams {
  poNumber?: string
  customerName?: string
  dateRange?: {
    from: Date
    to: Date
  }
  status?: string
  amountRange?: {
    min: number
    max: number
  }
}

const formSchema = z.object({
  poNumber: z.string().optional(),
  customerName: z.string().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  status: z.string().optional(),
  amountRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
})

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSearch(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="poNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter PO Number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Customer Name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Range</FormLabel>
                <DatePickerWithRange
                  selected={field.value}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      field.onChange({ from: range.from, to: range.to })
                    }
                  }}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amountRange.min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Min Amount" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amountRange.max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Max Amount" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Search Orders</Button>
      </form>
    </Form>
  )
}

