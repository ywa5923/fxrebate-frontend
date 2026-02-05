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
    <div className="space-y-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className={cn("max-w-7xl mx-auto ", is_admin && "border-1 border-green-600")}>
        
        {/* Matrix Editor Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5" />
              {is_admin ? 'Admin Matrix Configuration' : 'Broker Matrix Configuration'}
            </CardTitle>
            <CardDescription>
              Configure your rebates and rates matrix. Add or remove rows and columns as needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
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