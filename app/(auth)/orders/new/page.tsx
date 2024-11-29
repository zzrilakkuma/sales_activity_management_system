'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { Loader2, Plus, Trash2, Upload, CheckCircle2 } from 'lucide-react'
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
  estimatedShipDate: Date | null
  tracking_status: string[]
  allocation_status: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
    status: string
    notes?: string
    subtotal: number
  }[]
  notes?: string
  totalAmount: number
  documents?: File[]
}

interface CustomerOption {
  id: number
  name: string
  contactPerson: string
  email: string
  priceTerm: string
}

interface ProductOption {
  id: number
  model: string
  asusPn: string
  basePrice: number
  description?: string
  availableQuantity: number
}

const TRACKING_STATUSES = [
  'ETD_TRACKING',
  'MAIL_TRACKING',
  'ALLOCATION_TRACKING'
] as const

const ALLOCATION_STATUSES = [
  'PENDING',
  'CHECKING',
  'CHECKED',
  'PARTIALLY',
  'FULLY',
  'CANCELLED'
] as const

const ITEM_STATUSES = [
  'PENDING',
  'CHECKED',
  'ALLOCATED'
] as const

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
  estimatedShipDate: z.date().nullable(),
  tracking_status: z.array(z.enum(TRACKING_STATUSES)).default(['ALLOCATION_TRACKING']),
  allocation_status: z.enum(ALLOCATION_STATUSES).default('PENDING'),
  items: z.array(z.object({
    productId: z.string({
      required_error: "Please select a product.",
    }),
    quantity: z.number().min(1, "Quantity must be at least 1."),
    unitPrice: z.number().min(0, "Unit price must be non-negative."),
    status: z.enum(ITEM_STATUSES).default('PENDING'),
    notes: z.string().optional(),
    subtotal: z.number(),
  })).min(1, "At least one item is required."),
  notes: z.string().optional(),
  totalAmount: z.number(),
  documents: z.array(z.instanceof(File)).optional(),
})

export default function NewOrderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch customers and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [customersRes, productsRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products')
        ])
        
        if (!customersRes.ok || !productsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const customersData = await customersRes.json()
        const productsData = await productsRes.json()

        setCustomers(customersData)
        setProducts(productsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load customers and products. Please try refreshing the page.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: '',
      poNumber: '',
      orderDate: new Date(),
      shippingTerm: '',
      estimatedShipDate: null,
      tracking_status: ['ALLOCATION_TRACKING'],
      allocation_status: 'PENDING',
      items: [{
        productId: '',
        quantity: 1,
        unitPrice: 0,
        status: 'PENDING',
        notes: '',
        subtotal: 0
      }],
      notes: '',
      totalAmount: 0,
      documents: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchItems = form.watch("items")
  const totalAmount = watchItems.reduce((sum, item) => sum + item.subtotal, 0)

  const onProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id.toString() === productId)
    if (product) {
      form.setValue(`items.${index}.unitPrice`, product.basePrice)
      const quantity = form.getValues(`items.${index}.quantity`) || 1
      const totalAmount = calculateTotal(form.getValues('items'))
      form.setValue('totalAmount', totalAmount)
    }
  }

  const onQuantityChange = (index: number, quantity: number) => {
    const productId = form.getValues(`items.${index}.productId`)
    const product = products.find(p => p.id.toString() === productId)
    if (product) {
      const totalAmount = calculateTotal(form.getValues('items'))
      form.setValue('totalAmount', totalAmount)
    }
  }

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => {
      const quantity = item.quantity || 0
      const unitPrice = item.unitPrice || 0
      return sum + (quantity * unitPrice)
    }, 0)
  }

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create order')
      }

      const order = await response.json()
      console.log('Order created:', order)
      
      // Show success message
      setSuccess('Order created successfully!')
      
      // Reset form
      form.reset({
        customerId: '',
        poNumber: '',
        orderDate: new Date(),
        shippingTerm: '',
        estimatedShipDate: null,
        tracking_status: ['ALLOCATION_TRACKING'],
        allocation_status: 'PENDING',
        items: [{
          productId: '',
          quantity: 1,
          unitPrice: 0,
          status: 'PENDING',
          notes: '',
        }],
        notes: '',
        totalAmount: 0,
        documents: [],
      })
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 5000)
    } catch (error) {
      console.error('Error creating order:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">New Order</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            <span className="block sm:inline">{success}</span>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
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
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
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

            {/* Order Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="allocation_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allocation Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select allocation status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALLOCATION_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
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
                name="tracking_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Status</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange([value])}
                      defaultValue={field.value[0]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tracking status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRACKING_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_TRACKING', '')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Order Items Section */}
            <div className="space-y-4">
              <Label>Order Items</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border p-4 rounded-lg">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Product</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value)
                            onProductSelect(index, value)
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
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.model} - {product.asusPn}
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
                              const value = parseInt(e.target.value)
                              field.onChange(value)
                              onQuantityChange(index, value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.status`}
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
                            {ITEM_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
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
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Item notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({
                  productId: '',
                  quantity: 1,
                  unitPrice: 0,
                  status: 'PENDING',
                  notes: '',
                  subtotal: 0
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4">
              <Label>Documents</Label>
              <FormField
                control={form.control}
                name="documents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Documents</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          field.onChange(files)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {field.value && field.value.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Selected Files:</h3>
                        <ul className="list-disc pl-5">
                          {Array.from(field.value).map((file: File, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {file.name}
                            </li>
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
      )}
    </div>
  )
}