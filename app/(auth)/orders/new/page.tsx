'use client'

import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Interfaces
interface OrderFormData {
  customerId: string
  poNumber: string
  orderDate: Date
  shippingTerm: string
  estimatedShipDate: Date
  items: {
    productId: string
    quantity: number
    unitPrice: number
    subtotal: number
  }[]
  documents: File[]
  notes: string
  totalAmount: number
}

interface CustomerOption {
  value: string
  label: string
}

interface ProductOption {
  value: string
  label: string
  unitPrice: number
  availableQty: number
}

// Sample Data
const customers: CustomerOption[] = [
  { value: '1', label: 'Customer A' },
  { value: '2', label: 'Customer B' }
]

const products: ProductOption[] = [
  { value: '1', label: 'Product X', unitPrice: 100, availableQty: 50 },
  { value: '2', label: 'Product Y', unitPrice: 200, availableQty: 30 }
]

// Zod Schema
const orderFormSchema = z.object({
  customerId: z.string({
    required_error: "Please select a customer.",
  }),
  poNumber: z.string().min(1, "PO Number is required."),
  orderDate: z.date({
    required_error: "Order date is required.",
  }),
  shippingTerm: z.string({
    required_error: "Please select a shipping term.",
  }),
  estimatedShipDate: z.date({
    required_error: "Estimated ship date is required.",
  }),
  items: z.array(z.object({
    productId: z.string({
      required_error: "Please select a product.",
    }),
    quantity: z.number().min(1, "Quantity must be at least 1."),
    unitPrice: z.number().min(0, "Unit price must be non-negative."),
    subtotal: z.number(),
  })).min(1, "At least one item is required."),
  documents: z.array(z.instanceof(File)),
  notes: z.string(),
  totalAmount: z.number(),
})

export default function NewOrderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: '',
      poNumber: '',
      orderDate: new Date(),
      shippingTerm: '',
      estimatedShipDate: new Date(),
      items: [{ productId: '', quantity: 1, unitPrice: 0, subtotal: 0 }],
      documents: [],
      notes: '',
      totalAmount: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchItems = form.watch("items")
  const totalAmount = watchItems.reduce((sum, item) => sum + item.subtotal, 0)

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log(data)
    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">New Order</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Order Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.value} value={customer.value}>
                          {customer.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="poNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="orderDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Order Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shippingTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Term</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping term" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FOB">FOB</SelectItem>
                      <SelectItem value="CIF">CIF</SelectItem>
                      <SelectItem value="EXW">EXW</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedShipDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Estimated Ship Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Order Items Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-wrap items-end gap-4 mb-4">
                <FormField
                  control={form.control}
                  name={`items.${index}.productId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          const product = products.find(p => p.value === value)
                          if (product) {
                            form.setValue(`items.${index}.unitPrice`, product.unitPrice)
                            form.setValue(`items.${index}.quantity`, 1)
                            form.setValue(`items.${index}.subtotal`, product.unitPrice)
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.value} value={product.value}>
                              {product.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const quantity = Number(e.target.value)
                            field.onChange(quantity)
                            const unitPrice = form.getValues(`items.${index}.unitPrice`)
                            form.setValue(`items.${index}.subtotal`, quantity * unitPrice)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const unitPrice = Number(e.target.value)
                            field.onChange(unitPrice)
                            const quantity = form.getValues(`items.${index}.quantity`)
                            form.setValue(`items.${index}.subtotal`, quantity * unitPrice)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.subtotal`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtotal</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} readOnly />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, subtotal: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>

          {/* Document Upload Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Document Upload</h2>
            <FormField
              control={form.control}
              name="documents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Documents</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG or GIF (MAX. 10MB)</p>
                        </div>
                        <input
                          id="dropzone-file"
                          type="file"
                          className="hidden"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(
e.target.files || [])
                            field.onChange([...field.value, ...files])
                          }}
                        />
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {field.value.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Uploaded Files:</h3>
                      <ul className="list-disc pl-5">
                        {field.value.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </div>

          {/* Notes Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Summary Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total Amount:</span>
              <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Order
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}