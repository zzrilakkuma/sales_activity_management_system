'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'

export interface SearchParams {
  poNumber?: string
  customerName?: string
  dateRange?: DateRange
  allocation_status?: string
  tracking_status?: string
  amountRange?: {
    min?: number
    max?: number
  }
}

const ALLOCATION_STATUSES = [
  'PENDING',
  'CHECKING',
  'CHECKED',
  'PARTIALLY',
  'FULLY',
  'CANCELLED'
] as const

const TRACKING_STATUSES = [
  'ETD_TRACKING',
  'MAIL_TRACKING',
  'ALLOCATION_TRACKING'
] as const

const formSchema = z.object({
  poNumber: z.string().optional(),
  customerName: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  allocation_status: z.enum(['ALL', ...ALLOCATION_STATUSES]).optional(),
  tracking_status: z.enum(['ALL', ...TRACKING_STATUSES]).optional(),
  amountRange: z.object({
    min: z.number().min(0).optional().or(z.literal('')),
    max: z.number().min(0).optional().or(z.literal('')),
  }).optional(),
})

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poNumber: '',
      customerName: '',
      dateRange: undefined,
      allocation_status: 'ALL',
      tracking_status: 'ALL',
      amountRange: {
        min: undefined,
        max: undefined,
      }
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const cleanedValues = {
      ...values,
      allocation_status: values.allocation_status === 'ALL' ? undefined : values.allocation_status,
      tracking_status: values.tracking_status === 'ALL' ? undefined : values.tracking_status,
      amountRange: values.amountRange ? {
        min: values.amountRange.min === '' ? undefined : Number(values.amountRange.min),
        max: values.amountRange.max === '' ? undefined : Number(values.amountRange.max),
      } : undefined
    }
    onSearch(cleanedValues)
  }

  const handleReset = () => {
    form.reset()
    onSearch({})
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
                  onSelect={field.onChange}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allocation_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allocation Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    {ALLOCATION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tracking_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    {TRACKING_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_TRACKING', '')}
                      </SelectItem>
                    ))}
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
                  <Input 
                    type="number" 
                    placeholder="Min Amount" 
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === '' ? '' : Number(value))
                    }}
                  />
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
                  <Input 
                    type="number" 
                    placeholder="Max Amount" 
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === '' ? '' : Number(value))
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Search Orders</Button>
          <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
        </div>
      </form>
    </Form>
  )
}
