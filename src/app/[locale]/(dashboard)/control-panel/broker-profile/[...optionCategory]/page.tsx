import { getCategoriesWithOptions } from "@/lib/getCategoriesWithOptions";
import { getOptionsValues } from "@/lib/getOptionsValues";
import { submitBrokerProfile } from "../actions";
import { notFound } from "next/navigation";
import { DynamicForm } from "@/components/DynamicForm";
import { Option, OptionCategory } from "@/types";
import { OptionValue } from "@/types";
import { getCompanies } from "@/lib/getCompanies";
import Companies from "./Companies";


export default async function BrokerProfilePage({ 
  params 
}: { 
  params: Promise<{ optionCategory: string[] }> 
}) {
 
  let brokerId = 200;
  let is_admin=false;
  let broker_type = 'broker';
  //brokertype: broker, props, crypto
 

  try {
    const resolvedParams = await params;
    const categoryId = resolvedParams.optionCategory[0];
    const categorySlug = resolvedParams.optionCategory[1];

    
    if (!categoryId) {
      console.log("No category ID provided");
      notFound();
    }

   // console.log("Looking for category ID:", categoryId);
   // console.log("Category ID type:", typeof categoryId);
    //locale is null for defualt langauge
   

    const categoriesWithOptions = await getCategoriesWithOptions('en',broker_type);
   

  
   
   
   // console.log("All broker options:", brokerOptionsWithCategories);
    
    // Handle case where API returns empty data or different structure
    if (!categoriesWithOptions || !Array.isArray(categoriesWithOptions)) {
      console.log("Invalid broker options data:", categoriesWithOptions);
      notFound();
    }
    
    if (categoriesWithOptions.length === 0) {
      console.log("No broker options available");
      notFound();
    }
    
    // // Log each option's ID and type for debugging
    // brokerOptionsWithCategories.forEach((option: any, index: number) => {
    //   console.log(`Option ${index}:`, {
    //     id: option.id,
    //     idType: typeof option.id,
    //     name: option.name,
    //     matchesCategoryId: option.id == categoryId // Use loose equality for type conversion
    //   });
    // });

    const matchedCategory = categoriesWithOptions.find(
      (category: OptionCategory) => {
        // Use loose equality to handle string vs number comparison
        const matches = category.id == categoryId;
        //console.log(`Checking option ${category.id} (${typeof category.id}) against categoryId ${categoryId} (${typeof categoryId}): ${matches}`);
        return matches;
      }
    );

    if (!matchedCategory) {
      console.log("No matching broker options found for category ID:", categoryId);
     // console.log("Available IDs:", brokerOptionsWithCategories.map((opt: any) => opt.id));
      notFound();
    }

    //let modelType=matchedCategory.options[0]?.applicable_for
    console.log("modelType========================================",categorySlug);

    let companies = null;
    if(categorySlug=='my-companies'){
      companies = await getCompanies(brokerId,null,null,'en');
      console.log("companies========================================",companies);
    }
    
    const optionsValues: OptionValue[] = await getOptionsValues(brokerId, "Brokers", categoryId, "en",null,true);

    // If this is the companies category, render the Companies component
    if(categorySlug=='my-companies' && companies){
      return (
        <Companies 
          broker_id={brokerId}
          companies={companies}
          options={matchedCategory.options as Option[]}
          is_admin={is_admin}
        />
      );
    }

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{matchedCategory.name}</h1>
        <DynamicForm 
          broker_id={brokerId}
          options={matchedCategory.options as Option[]} 
          optionsValues={optionsValues}
          action={submitBrokerProfile} 
          is_admin={is_admin}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading broker profile page:", error);
    throw error;
  }
}