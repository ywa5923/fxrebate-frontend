import { getCategoriesWithOptions } from "@/lib/getCategoriesWithOptions";
import { getOptionsValues } from "@/lib/getOptionsValues";
import { MatrixCell } from "@/types";
import { notFound, redirect } from "next/navigation";
import { DynamicForm } from "@/components/DynamicForm";
import { AuthUser, Option, OptionCategory } from "@/types";
import { OptionValue } from "@/types";
import { getCompanies } from "@/lib/getCompanies";
import Companies from "./Companies";
import { getAccountTypes } from "@/lib/getAccountTypes";
import Accounts from "./Accounts";
import { getAccountTypeUrls } from "@/lib/getAccountTypeUrls";
import Company from "./Company";
import BrokerOptions from "./BrokerOptions";
import { getMatrixData, getMatrixHeaders } from "@/lib/matrix-requests";
import { DynamicMatrix } from "@/components/ui/DynamicMatrix";
import Rebates from "./Rebates";
import { getDynamicTable } from "@/lib/getDynamicTable";
import Promotions from "./Promotions";
import Contests from "./Contests";
import { getChallengeCategories } from "@/lib/getChallengeCategories";
import ChallengeCategories from "@/components/ChallengeMatrix/ChallengeCategories";
import { ChallengeType } from "@/types/ChallengeType";
import logger from "@/lib/logger";
import {  isAuthenticated} from "@/lib/auth-actions";
import { hasPermission } from "@/lib/permissions";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { MatrixHeaders } from "@/types/Matrix";


//http://localhost:3000/en/control-panel/broker-profile/1/general-information

export default async function BrokerProfilePage({ 
  params 
}: { 
  params: Promise<{ optionCategory: string[], brokerId: string }> 
}) {
 
  // Check authentication server-side
  
  
  // // Get user permissions and broker context
  // const is_admin = await isAdmin();
  // const brokerContext = await getBrokerContext();
  
  // if (!brokerContext) {
  //   logger.error('Broker context not found for user');
  //   redirect('/en');
  // }
  
  // console.log("user========================================", user);
  // let brokerId = brokerContext.broker_id;
  //let brokerId = 181;
  let is_admin = false;
  let broker_type = 'broker';//crypto, props, broker
  let language_code='en';
  let zone_code='eu';
  //brokertype: broker, props, crypto
 let pageLogger = logger.child('Dashboard/[brokerId]/Broker profile/[...optionCategory]/page.tsx');
 
 // Add a small delay to ensure cookies are available after redirect
 await new Promise(resolve => setTimeout(resolve, 100));

  try {
   // const user: AuthUser | null = await isAuthenticated();
    //if (!user) {
    //  pageLogger.info('User not authenticated, redirecting to login');
   // redirect('/en');
   // }

   // pageLogger.info('User authenticated', { user: user,permissions: user?.permissions?.[0]?.type });

    const resolvedParams = await params;
    const brokerId = parseInt(resolvedParams.brokerId);
    const categoryId = resolvedParams.optionCategory[0];
    const categorySlug = resolvedParams.optionCategory[1];

   // let is_admin=hasPermission(user, 'manage', 'broker', brokerId);
    
    if (!categoryId) {
      console.log("No category ID provided");
      notFound();
    }
  
    const categoriesWithOptions = await getCategoriesWithOptions('en',broker_type);
   
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


    //let accountType = null;
    // if(categorySlug=='my-account-types'){
    //   accountType = await getAccountTypes(brokerId,null,'en');
    
    // }
    
    //zone_code is null, so get only original data that is submitted by the broker and have zone_code null
    //there are the values submitted by the broker
    const optionsValues: OptionValue[] = await getOptionsValues(brokerId, "Brokers", categoryId, "en",null,true);

    //pageLogger.info('Options values fetched', { context: {json:JSON.stringify(optionsValues,null,2)} });

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
    if(categorySlug=='my-trading-accounts' ){
      let accountTypesLinks=await getAccountTypeUrls(brokerId,null,zone_code,language_code);
      let accountType = await getAccountTypes(brokerId,null,'en');

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

    if(categorySlug=='promotions' ){
      let promotions = await getDynamicTable('promotions',brokerId,null,'en');

      return (
        <Promotions 
          broker_id={brokerId}
          promotions={promotions}
          options={matchedCategory.options as Option[]}
          is_admin={is_admin}
        />
      );
    }



    if(categorySlug=='contests' ){
      let contests = await getDynamicTable('contests',brokerId,null,'en');
      
      return (
        <Contests 
          broker_id={brokerId}
          contests={contests}
          options={matchedCategory.options as Option[]}
          is_admin={is_admin}
        />
      );
    }

   
    if(categorySlug=='challenge-matrix' ){
      const categories:ChallengeType[] = await getChallengeCategories('en');
    
      return <ChallengeCategories key={brokerId} is_admin={is_admin} categories={categories} brokerId={brokerId} type="challenge"/>
    }
    
    if(categorySlug=='rebates'){

      // const searchParams = new URLSearchParams({
      //   "language[eq]": "en",
      //   "broker_id[eq]": brokerId.toString(),
      //   "matrix_id[eq]": "Matrix-1",
      //   "broker_id_strict[eq]": "0",
      // }).toString();
      // const headersUrl = `/matrix/headers?${searchParams.toString()}`;

      // pageLogger.debug("Fetching headers from:", { url: headersUrl });

      // const headearsResponse = await apiClient<MatrixHeaders>(headersUrl, true, {
      //   method: "GET",
      //   cache: "no-store",
      // });

      // if (!headearsResponse.success || !headearsResponse.data) {
      //   toast.error(headearsResponse.message);
      //   return;
      // }

      // const {columnHeaders, rowHeaders}= headearsResponse.data;
      
      const {columnHeaders, rowHeaders}= await getMatrixHeaders('en',brokerId, 'Matrix-1', 0)
      
      const initialMatrixData: MatrixCell[][] = await getMatrixData(brokerId, 'Matrix-1', is_admin)
     
     // "http://localhost:8080/api/v1/matrix/headers?broker_id[eq]=1&matrix_id[eq]=Matrix-1&broker_id_strict[eq]=0

      return (<>
        <Rebates rowHeaders={rowHeaders} columnHeaders={columnHeaders} initialMatrixData={initialMatrixData} is_admin={is_admin} brokerId={brokerId}/>
        {is_admin && <Rebates  rowHeaders={rowHeaders} columnHeaders={columnHeaders} initialMatrixData={initialMatrixData} is_admin={false} brokerId={brokerId}/>}
      </>
      );
    } else {

      return (
          <BrokerOptions 
            broker_id={brokerId}
            options={matchedCategory.options as Option[]} 
            optionsValues={optionsValues}
           // action={submitBrokerProfile} 
            is_admin={is_admin}
            entity_id={brokerId}
            entity_type="broker"
            category={categorySlug.replace('-',' ').toUpperCase()}
          />
        
      );
    }
  } catch (error) {
    console.error("Error loading broker profile page:", error);
    throw error;
  }
}