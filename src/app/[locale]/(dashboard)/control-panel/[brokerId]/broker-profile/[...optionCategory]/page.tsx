import { getCategoriesWithOptions } from "@/lib/getCategoriesWithOptions";
//import { getOptionsValues } from "@/lib/getOptionsValues";
import { MatrixCell } from "@/types";
import { notFound, redirect } from "next/navigation";
//import { DynamicForm } from "@/components/DynamicForm";
import { AuthUser, Option, OptionCategory } from "@/types";
import { OptionValue } from "@/types";
//import { getCompanies } from "@/lib/getCompanies";
//import Companies from "./Companies";
//import { getAccountTypes } from "@/lib/getAccountTypes";
import Accounts from "./Accounts";
//import { getAccountTypeUrls } from "@/lib/getAccountTypeUrls";
import Company from "./Company";
import BrokerOptions from "./BrokerOptions";


import Rebates from "./Rebates";
//import { getDynamicTable } from "@/lib/getDynamicTable";
import Promotions from "./Promotions";
import Contests from "./Contests";
//import { getChallengeCategories } from "@/lib/getChallengeCategories";
import ChallengeCategories from "@/components/ChallengeMatrix/ChallengeCategories";
import { ChallengeType } from "@/types/ChallengeType";
import logger from "@/lib/logger";
import {  getBrokerInfo, isAuthenticated} from "@/lib/auth-actions";

import { apiClient } from "@/lib/api-client";

import { MatrixHeaders } from "@/types/Matrix";

import { DynamicTableRow } from "@/types";
import { AccountTypeLinks } from "@/types/AccountTypeLinks";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { canAdminBroker } from "@/lib/auth-actions";


//http://localhost:3000/en/control-panel/broker-profile/1/general-information

export default async function BrokerProfilePage({ 
  params 
}: { 
  params: Promise<{ optionCategory: string[], brokerId: string }> 
}) {
  let log = logger.child('Dashboard/[brokerId]/Broker profile/[...optionCategory]/page.tsx');
 
  const resolvedParams = await params;
  const brokerId = parseInt(resolvedParams.brokerId);
  const categoryId = resolvedParams.optionCategory[0];
  const categorySlug = resolvedParams.optionCategory[1];
  
  //========Check if user is authenticated and redirect to login if not======================
  const user: AuthUser | null = await isAuthenticated();
  if (!user) {
    log.info('User not authenticated, redirecting to login');
   redirect('/en');
   }


   //========Check if user can administer broker=============
  // // Get user permissions and broker context
   const is_admin= await canAdminBroker(brokerId);
   let brokerInfo = await getBrokerInfo(brokerId);
   let broker_type = brokerInfo.broker_type;
   console.log('User authenticated successfully', {user: user, is_admin: is_admin});
   //========================End of security checks==============================================
  
  let language_code='en';
  let zone_code='eu';
  //brokertype: broker, props, crypto

 
   // Add a small delay to ensure cookies are available after redirect
   await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!categoryId) {
      console.log("No category ID provided");
      notFound();
    }
  
    const categoriesWithOptions = await getCategoriesWithOptions('en',broker_type);
    //TO DO: MAKE API CALL TO GET OPTIONS ONLY BY aPPLICABLEfOR FIELD
    //http://localhost:8080/api/v1/option-categories?broker_type=broker
   
    // Handle case where API returns empty data or different structure
    if (!categoriesWithOptions || !Array.isArray(categoriesWithOptions) || categoriesWithOptions.length === 0) {
      log.error("Invalid broker options data:", categoriesWithOptions);
      notFound();
    }
    
    
    const matchedCategory = categoriesWithOptions.find(
      (category: OptionCategory) => {
        const matches = category.id == categoryId;
        return matches;
      }
    );

    if (!matchedCategory) {
      log.error("No matching broker options found for category ID", {categoryId: categoryId});
      notFound();
    }


    if(categorySlug=='company-profile'){
   
     let companiesFetchUrl = `/companies/${brokerId}?language_code=en`;
     let companiesResponse = await apiClient<DynamicTableRow[]>(companiesFetchUrl, true, {
      method: "GET",
      cache: "no-store",
     });
     if(!companiesResponse.success){
      notFound();
     }
     let companies = companiesResponse.data ?? [];
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
     
      let accountTypesLinksFetchUrl = `/urls/${brokerId}/account-type/all?language_code=en`;
      let accountTypesFetchUrl = `/account-types/${brokerId}?language_code=en`;
      
      const [accountTypesLinksResponse, accountTypesResponse] = await Promise.all([
        apiClient<AccountTypeLinks>(accountTypesLinksFetchUrl, UseTokenAuth.Yes, { method: "GET", cache: "no-store" }, ErrorMode.Return),
        apiClient<DynamicTableRow[]>(accountTypesFetchUrl, UseTokenAuth.Yes, { method: "GET", cache: "no-store" }, ErrorMode.Return),
      ]);
      if (!accountTypesLinksResponse.success || !accountTypesResponse.success) {
        log.error("Error fetching account types links or account types", {context: {accountTypesLinks:accountTypesLinksResponse.message, accountTypes:accountTypesResponse.message}});
        notFound();
      }
      const accountTypesLinks = accountTypesLinksResponse.data ?? null;
      const accountTypes = accountTypesResponse.data ?? [];
    
      
      return (
        <Accounts 
          broker_id={brokerId}
          accounts={accountTypes}
          options={matchedCategory.options as Option[]}
          is_admin={is_admin}
          linksGroupedByAccountId={accountTypesLinks?.links_grouped_by_account_id ?? {}}
          masterLinksGroupedByType={accountTypesLinks?.master_links_grouped_by_type ?? {}}
          linksGroups={accountTypesLinks?.links_groups ?? []}
        />
      );
    }

    if(categorySlug=='promotions' ){
     // let promotions = await getDynamicTable('promotions',brokerId,null,'en');
      let promotionFetchUrl = `/promotions/${brokerId}?language_code=en`;
      let promotionsResponse = await apiClient<DynamicTableRow[]>(promotionFetchUrl, true, {
        method: "GET",
        cache: "no-store",
      });
      if(!promotionsResponse.success){
        log.error("Error fetching promotions", {context: {promotions:promotionsResponse.message}});
        notFound();
      }
      let promotions = promotionsResponse.data ?? [];
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
      //let contests = await getDynamicTable('contests',brokerId,null,'en');
      let contestsFetchUrl = `/contests/${brokerId}?language_code=en`;
      let contestsResponse = await apiClient<DynamicTableRow[]>(contestsFetchUrl, true, {
        method: "GET",
        cache: "no-store",
      });
      if(!contestsResponse.success){
        log.error("Error fetching contests", {context: {contests:contestsResponse.message}});
        notFound();
      }
      let contests = contestsResponse.data ?? [];
      
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
      let brokerChallengeCategoriesUrl = `/challenges/categories/${brokerId}`;
      let  defaultChallengeCategoriesUrl = `/challenges/default-categories`;

      const [brokerChallengeCategoriesResponse, defaultChallengeCategoriesResponse] = await Promise.all([
        apiClient<ChallengeType[]>(brokerChallengeCategoriesUrl, UseTokenAuth.Yes, {
          method: "GET",
          cache: "no-store",
        }, ErrorMode.Return),
        apiClient<ChallengeType[]>(defaultChallengeCategoriesUrl, UseTokenAuth.Yes, {
          method: "GET",
          cache: "no-store",
        }, ErrorMode.Return),
      ]);
     
      if (!brokerChallengeCategoriesResponse.success || !defaultChallengeCategoriesResponse.success) {
        log.error("Error fetching broker challenge categories or default challenge categories", {context: {brokerChallengeCategories:brokerChallengeCategoriesResponse.message, defaultChallengeCategories:defaultChallengeCategoriesResponse.message}});
        notFound();
      }
      let brokerCategories = brokerChallengeCategoriesResponse.data ?? [];
      let defaultCategories = defaultChallengeCategoriesResponse.data ?? [];
     
  
    
      return <ChallengeCategories key={brokerId} is_admin={is_admin} categories={brokerCategories} defaultCategories={defaultCategories} brokerId={brokerId} type="challenge"/>
    }
    
    if(categorySlug=='rebates'){

      let headersFetchUrl = `/matrix/headers/${brokerId}?language=en&matrix_id=Matrix-1&broker_id_strict=0&with_account_type_columns=1`;
      let matrixDataFetchUrl = `/matrix/${brokerId}?matrix_name=Matrix-1`;


      const [headersResponse, matrixDataResponse] = await Promise.all([
        apiClient<MatrixHeaders>(headersFetchUrl, UseTokenAuth.Yes, { method: "GET", cache: "no-store" }, ErrorMode.Return),
        apiClient<MatrixCell[][]>(matrixDataFetchUrl, UseTokenAuth.Yes, { method: "GET", cache: "no-store" }, ErrorMode.Return),
      ]);
      if (!headersResponse.success || !matrixDataResponse.success) {
       
        log.error("Error fetching matrix headers or matrix data", {context: {hedears:headersResponse.message, matrixData:matrixDataResponse.message}});
        notFound();
      }
      const columnHeaders = headersResponse.data?.columnHeaders ?? [];
      const rowHeaders = headersResponse.data?.rowHeaders ?? [];
      const initialMatrixData = matrixDataResponse.data ?? [];

      if(columnHeaders.length === 0){
        let tradingAccountCategoryId = categoriesWithOptions.find(category => category.slug === 'my-trading-accounts')?.id;
        if(!tradingAccountCategoryId){
          log.error("Trading account category not found", {context: {categoriesWithOptions:categoriesWithOptions}});
          notFound();
        }
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No Account Types Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-5">
              You need to create account types before you can configure the rebates matrix.
            </p>
            <a
              href={`/en/control-panel/${brokerId}/broker-profile/${tradingAccountCategoryId}/my-trading-accounts`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 hover:bg-green-900 text-white text-sm font-medium transition-colors shadow-sm"
            >
              Go to Account Types
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        );
      }


      return (<>
        <Rebates rowHeaders={rowHeaders} columnHeaders={columnHeaders} initialMatrixData={initialMatrixData} is_admin={is_admin} brokerId={brokerId}/>
        {is_admin && <Rebates  rowHeaders={rowHeaders} columnHeaders={columnHeaders} initialMatrixData={initialMatrixData} is_admin={false} brokerId={brokerId}/>}
      </>
      );
    } else {

      //===============Return the options values for the broker table by category id===============

     let optionsValuesFetchUrl = `/option-values/${brokerId}?entity_type=Broker&language_code=en&category_id=${categoryId}`;
     let optionsValuesResponse = await apiClient<OptionValue[]>(optionsValuesFetchUrl, true, {
      method: "GET",
      cache: "no-store",
    });
    if(!optionsValuesResponse.success){
      log.error("Error fetching options values", {context: {optionsValues:optionsValuesResponse.message}});
      notFound();
    }
    let optionsValues = optionsValuesResponse.data ?? [];

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
 
}