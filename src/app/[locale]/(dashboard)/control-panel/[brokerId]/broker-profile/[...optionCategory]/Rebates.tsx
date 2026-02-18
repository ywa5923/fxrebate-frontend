import { DynamicMatrix } from "@/components/ui/DynamicMatrix";
import { ColumnHeader, RowHeader, MatrixCell } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings} from "lucide-react";
import { cn } from "@/lib/utils"

export default function Rebates({
 
  rowHeaders, 
  columnHeaders, 
  initialMatrixData, 
  is_admin,
  brokerId
}: {
  
  rowHeaders: RowHeader[], 
  columnHeaders: ColumnHeader[], 
  initialMatrixData: MatrixCell[][], 
  is_admin: boolean,
  brokerId: number
}) {
  
  return (
    <div className="space-y-1 p-3 sm:p-6 bg-[#ffffff] dark:bg-gray-950">
      {/* Header Section */}
      <div className={cn("max-w-7xl mx-auto", is_admin && "border border-green-600 dark:border-green-500 rounded-lg")}>
        
        {/* Matrix Editor Card */}
        <Card className="shadow-none border-0 bg-[#ffffff] dark:bg-gray-900 rounded-lg">
          <CardHeader className="bg-[#ffffff] dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900 dark:text-gray-100">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {is_admin ? 'Admin Matrix Configuration' : 'Broker Matrix Configuration'}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Configure your rebates and rates matrix. Add or remove rows and columns as needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <DynamicMatrix 
              brokerId={brokerId}
              rowHeaders={rowHeaders}
              columnHeaders={columnHeaders}
              initialMatrix={initialMatrixData}
              is_admin={is_admin}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}