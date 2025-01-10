import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { paymentAPI } from '../../lib/api';
import { toast } from 'sonner';
import { utils, writeFile } from 'xlsx';

interface ExportButtonProps {
  filters?: any;
}

export default function ExportButton({ filters }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await paymentAPI.exportPayments(filters);
      
      // Create workbook
      const wb = utils.book_new();
      const ws = utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      utils.book_append_sheet(wb, ws, 'Payments');
      
      // Generate filename with current date
      const filename = `payments-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      writeFile(wb, filename);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Failed to export payments:', error);
      toast.error('Failed to export payments');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {isExporting ? 'Exporting...' : 'Export'}
    </button>
  );
}