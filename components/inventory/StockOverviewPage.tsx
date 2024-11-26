'use client'

import { useState } from 'react'
import { KPICard } from '@/components/inventory/KPICard'
import { StockTable } from '@/components/inventory/StockTable'
import { Button } from '@/components/ui/button'
import { Package, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'

export function StockOverviewPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting data...')
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Stock Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Active Products" value="156" icon={<Package className="h-8 w-8" />} />
        <KPICard title="Total Stock Value" value="$125,460" icon={<DollarSign className="h-8 w-8" />} />
        <KPICard title="Low Stock Products" value="23" icon={<AlertTriangle className="h-8 w-8" />} />
        <KPICard title="Fully Allocated" value="15" icon={<CheckCircle className="h-8 w-8" />} />
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={handleExport}>Export Data</Button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <StockTable />
      )}
    </div>
  )
}

