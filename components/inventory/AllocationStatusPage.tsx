'use client'

import { useState } from 'react'
import { KPICard } from '@/components/inventory/KPICard'
import { AllocationTable } from '@/components/inventory/AllocationTable'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Package, Truck, Calendar, AlertTriangle } from 'lucide-react'

export function AllocationStatusPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting data to Excel...')
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Allocation Status</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Open Allocations" value="450" icon={<Package className="h-8 w-8" />} />
        <KPICard title="Pending Deliveries" value="85" icon={<Truck className="h-8 w-8" />} />
        <KPICard title="Today's Allocations" value="45" icon={<Calendar className="h-8 w-8" />} />
        <KPICard title="Delayed" value="12" icon={<AlertTriangle className="h-8 w-8" />} />
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={handleExport}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <AllocationTable />
      )}
    </div>
  )
}

