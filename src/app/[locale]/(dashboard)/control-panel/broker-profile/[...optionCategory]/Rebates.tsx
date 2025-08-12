import { DynamicMatrix } from "@/components/ui/DynamicMatrix";
import { ColumnHeader, MatrixData, RowHeader } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, TrendingUp, DollarSign, Users } from "lucide-react";

export default function Rebates({
  rowHeaders, 
  columnHeaders, 
  initialMatrixData, 
  is_admin
}: {
  rowHeaders: RowHeader[], 
  columnHeaders: ColumnHeader[], 
  initialMatrixData: MatrixData, 
  is_admin: boolean
}) {
  
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rebates & Rates</h1>
                <p className="text-gray-600">Configure your broker rebates and commission rates</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${is_admin ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
              <Settings className="h-3 w-3 mr-1" />
              {is_admin ? "Admin Mode" : "Broker Mode"}
            </div>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-white text-gray-700 border-gray-300">
              <DollarSign className="h-3 w-3 mr-1" />
              Matrix Editor
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{rowHeaders.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Classes Of Instruments</p>
                  <p className="text-2xl font-bold text-gray-900">{columnHeaders.length}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Types</p>
                  <p className="text-2xl font-bold text-gray-900"></p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matrix Editor Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5" />
              Matrix Configuration
            </CardTitle>
            <CardDescription>
              Configure your rebates and rates matrix. Add or remove rows and columns as needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <DynamicMatrix 
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