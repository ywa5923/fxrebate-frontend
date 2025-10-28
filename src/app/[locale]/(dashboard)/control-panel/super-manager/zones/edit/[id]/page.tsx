import { getZone } from '@/lib/zone-requests';
import { EditZoneForm } from './EditZoneForm';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, XCircle } from 'lucide-react';

interface EditZonePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditZonePage({ params }: EditZonePageProps) {
  const { id } = await params;
  const zoneId = parseInt(id);

  // Validate zone ID
  if (isNaN(zoneId)) {
    redirect('/en/control-panel/super-manager/zones');
  }

  // Fetch zone data
  const result = await getZone(zoneId);

  // Handle errors
  if (!result.success || !result.data) {
    return (
      <div className="flex-1 space-y-4 p-4 sm:p-0">
        <div className="flex items-center gap-4">
          <Link href="/en/control-panel/super-manager/zones">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Zones
            </Button>
          </Link>
        </div>
        
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Zone Not Found</h2>
            <p className="text-gray-600 mb-6">
              {result.message || 'The zone you are trying to edit does not exist.'}
            </p>
            <Link href="/en/control-panel/super-manager/zones">
              <Button>Return to Zones List</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EditZoneForm zone={result.data} />;
}

