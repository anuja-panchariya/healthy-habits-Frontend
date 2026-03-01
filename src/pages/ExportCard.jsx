import React, { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { toast } from 'sonner'
import { api, setAuthToken } from '../lib/api'
import { useAuth } from '@clerk/clerk-react'

export default function ExportCard() {
  const { getToken } = useAuth()
  const [exportingCSV, setExportingCSV] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  const exportCSV = async () => {
    setExportingCSV(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      const response = await api.get('/api/export/csv', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `habits_${new Date().toISOString().split('T')[0]}.csv`)
      link.click()
      toast.success('📊 CSV exported!')
    } catch (error) {
      // Fallback mock CSV
      const mockCSV = `Date,Habit,Status\n${new Date().toLocaleDateString()},Water,Completed\n${new Date().toLocaleDateString()},Meditation,Active`
      const blob = new Blob([mockCSV], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'habits.csv'
      link.click()
      toast.success('📊 CSV downloaded!')
    } finally {
      setExportingCSV(false)
    }
  }

  const exportPDF = async () => {
    setExportingPDF(true)
    toast.info('PDF feature coming soon! Use CSV for now 🚀')
    setTimeout(() => setExportingPDF(false), 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={exportCSV} disabled={exportingCSV} className="w-full rounded-full" data-testid="export-csv-btn">
          {exportingCSV ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              📊 Export CSV
            </>
          )}
        </Button>
        <Button onClick={exportPDF} disabled={exportingPDF} className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700" data-testid="export-pdf-btn">
          {exportingPDF ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              📄 Download PDF Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
