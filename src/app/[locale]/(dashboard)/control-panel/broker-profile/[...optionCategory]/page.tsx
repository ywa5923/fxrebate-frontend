import { getCategoriesWithOptions } from "@/lib/getCategoriesWithOptions";
import { getOptionsValues } from "@/lib/getOptionsValues";
import { submitBrokerProfile } from "../actions";
import { notFound } from "next/navigation";
import { DynamicForm } from "@/components/DynamicForm";
import { Option, OptionCategory } from "@/types";
import { OptionValue } from "@/types";
import { getCompanies } from "@/lib/getCompanies";
import Companies from "./Companies";
import { getAccountTypes } from "@/lib/getAccountTypes";
import Accounts from "./Accounts";
import { getAccountTypeUrls } from "@/lib/getAccountTypeUrls";
import Company from "./Company";

export default async function BrokerProfilePage({ 
  params 
}: { 
  params: Promise<{ optionCategory: string[] }> 
}) {
 
  let brokerId = 204;
  let is_admin=false;
  let broker_type = 'broker';//crypto, props, broker
  let language_code='en';
  let zone_code='eu';
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


    
    let accountType = null;
    if(categorySlug=='my-account-types'){
      accountType = await getAccountTypes(brokerId,null,'en');
      console.log("accountType========================================",accountType);
    }
    
    //for broker and admin zone_code is null, get only options values without zone_code,
    //there are the values submitted by the broker
    const optionsValues: OptionValue[] = await getOptionsValues(brokerId, "Brokers", categoryId, "en",null,true);

    // If this is the companies category, render the Companies component
    if(categorySlug=='my-companies'){
      //get original companies option vlaues submitted by the broker which have zone_code null
      //comanies also contains options values for the companies
      let  companies = await getCompanies(brokerId,null,null,'en');
    
      return (
        <>
          <Company
            broker_id={brokerId}
            company={companies[0] ?? null}
            options={matchedCategory.options as Option[]}
            is_admin={is_admin}
          />
          {/*
          <Companies 
            broker_id={brokerId}
            companies={companies}
            options={matchedCategory.options as Option[]}
            is_admin={is_admin}
          />
          */}
        </>
      );
    }
    if(categorySlug=='my-account-types' && accountType){
      let accountTypesLinks=await getAccountTypeUrls(brokerId,null,zone_code,language_code);

     // console.log("accountTypesUrls========================================",accountTypesLinks);
     
      return (
        <Accounts 
          broker_id={brokerId}
          accounts={accountType}
          options={matchedCategory.options as Option[]}
          is_admin={is_admin}
          linksGroupedByAccountId={accountTypesLinks.links_grouped_by_account_id ?? {}}
          masterLinksGroupedByType={accountTypesLinks.master_links_grouped_by_type ?? {}}
          linksGroups={accountTypesLinks.links_groups ?? []}
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
          entity_id={brokerId}
          entity_type="Broker"
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading broker profile page:", error);
    throw error;
  }
}