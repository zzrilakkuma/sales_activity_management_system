import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KPICardProps {
  title: string
  value: string
  icon: React.ReactNode
}

export function KPICard({ title, value, icon }: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

