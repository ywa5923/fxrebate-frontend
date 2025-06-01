import { DynamicForm } from "@/components/DynamicForm"
import { submitBrokerProfile } from "./actions"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { DynamicMatrix } from "@/components/ui/DynamicMatrix"
import { CreateSelect } from "@/components/CreateSelect"
import { CreateMultiSelect } from "@/components/CreateMultiSelect"
interface FormField {
  id: number
  slug: string
  name: string
  data_type: string
  form_type: string
  options?: { value: string; label: string }[]
  required?: boolean
  description?: string
  placeholder?: string
  tooltip?: string
}

async function getBrokerOptions() {
  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/broker_options?language[eq]=en&all_columns[eq]=1&broker_type[eq]=brokers",
      { next: { revalidate:0 } } // Revalidate every hour
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const responseData = await response.json()
    
    console.log(responseData)
    
    return responseData.data; // Fallback to original format if structure is different
  } catch (error) {
    console.error('Error fetching broker options:', error)
    throw error
  }
}

export default async function BrokerProfilePage() {
  const formSections = await getBrokerOptions()
  const rowHeaders = ["Header 1", "Header 2", "Header 3"]
  const columnHeaders = [{value: "Column 1", type: "numberWithReferenceWithUnit", units: ["USD", "EUR", "GBP"], references: ["Reference 1", "Reference 2", "Reference 3"]}, {value: "Column 2", type: "numberWithUnit", units: ["USD", "EUR", "GBP"]}, {value: "Column 3", type: "numberWithUnit", units: ["USD", "EUR", "GBP"]}]

  return (
    <div className="container mx-auto p-6">s
      <h1 className="text-2xl font-bold mb-6">Broker Profile</h1>
      {
        formSections.map((section: any) => (
          <Accordion key={section.id} type="single" collapsible>
            <AccordionItem value={section.id}>
              <AccordionTrigger><h2 className="text-xl font-bold mb-2 text-gray-800 bg-gray-100 p-2 rounded-md">{section.name}</h2></AccordionTrigger>
              <AccordionContent>
                <DynamicForm fields={section.options} onSubmit={submitBrokerProfile} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))
      }
     <DynamicMatrix 
       rowHeaders={rowHeaders}
        columnHeaders={columnHeaders}
/>
 <CreateMultiSelect /> 
    </div>
  )
}
