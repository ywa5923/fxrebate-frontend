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

async function getMatrixHeaders() {
  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/matrix/headers?broker_id[eq]=1&matrix_id[eq]=test&type[eq]=column&broker_id_strict[eq]=0",
      { next: { revalidate:0 } }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const responseData = await response.json()
    return responseData.data
  } catch (error) {
    console.error('Error fetching matrix headers:', error)
    throw error
  }
}




export default async function BrokerProfilePage() {
  const formSections = await getBrokerOptions()
  //url="http://localhost:8080/api/v1/matrix/headers?broker_id[eq]=1&matrix_id[eq]=test&type[eq]=column&broker_id_strict[eq]=0"
  //nst rowHeaders = ["Header 1", "Header 2", "Header 3"]
  const rowHeaders=[{
    name: "Header 1",
    options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]
  },
  {
    name: "Header 2",
    options: [{value: "USD", label: "USD2"}, {value: "EUR", label: "EUR2"}, {value: "GBP", label: "GBP2"}]
  },
  {
    name: "Header 3",
    options: [{value: "USD", label: "USD3"}, {value: "EUR", label: "EUR3"}, {value: "GBP", label: "GBP3"}]
  }
]
  const columnHeaders2 = await getMatrixHeaders()
 
  const columnHeaders3= [
    {
    name: "Column 1", 
    form_type: {
      name: "numberWithSelect", 
      items: [
        {
          name:"column_1_number",
          type: "number",
          placeholder: "Enter a number"
       }, 
        {
          name: "column_1_select", 
          type: "single-select", 
          options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]
        }
      ]
    }
   },
   {
    name: "Column 2", 
    form_type: {
      name: "number", 
      items: [{name: "column_2_number", type: "number", placeholder: "Enter a number"}]
    }
   },
   {
    name: "Column 3", 
    form_type: {
      name: "numberWithSelectWithSelect", 
      items: [
        {
          name:"column_3_number",
          type: "number",
          placeholder: "Enter a number"
       }, 
        {
          name: "column_3_select", 
          type: "single-select", 
          options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]
        },
        {
          name: "column_3_select_2", 
          type: "single-select", 
          options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]
        }
      ]
    }
   },
   {
    name: "Column 4", 
    form_type: {
      name: "text", 
      items: [{name: "column_4_text", type: "text", placeholder: "Enter a text"}]
    }
   },
   {
    name: "Column 5d", 
    form_type: {
      name: "textarea", 
      items: [{name: "column_5_textarea", type: "textarea", placeholder: "Enter a text"}]
    }
   },
   {
    name: "Column 6", 
    form_type: {
      name: "textareaWithNumericWithSelect", 
      items: [
        {name: "column_5_textarea", type: "textarea", placeholder: "Enter a text"},
        {name: "column_6_number", type: "number", placeholder: "Enter a number"},
        {name: "column_6_select", type: "single-select", options: [{value: "USD", label: "USD"}, {value: "EUR", label: "EUR"}, {value: "GBP", label: "GBP"}]}
      ]
    }
   }
 ]
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
        columnHeaders={columnHeaders2}
/>
 {/* <CreateMultiSelect />  */}
    </div>
  )
}
