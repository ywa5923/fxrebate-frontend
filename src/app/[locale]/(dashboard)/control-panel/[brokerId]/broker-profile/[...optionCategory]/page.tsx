import { getCategoriesWithOptions } from "@/lib/getCategoriesWithOptions";
//import { getOptionsValues } from "@/lib/getOptionsValues";
import { Company, MatrixCell,  RegulatorList } from "@/types";
import { notFound, redirect } from "next/navigation";
//import { DynamicForm } from "@/components/DynamicForm";
import { AuthUser, Option, OptionCategory } from "@/types";
//import { getCompanies } from "@/lib/getCompanies";
//import Companies from "./Companies";
//import { getAccountTypes } from "@/lib/getAccountTypes";

//import { getAccountTypeUrls } from "@/lib/getAccountTypeUrls";

import Rebates from "./Rebates";
import { MyPromotions } from "./_Promotions";
import { MyContests } from "./_Contests";
import { MyEvaluationRules } from "./_EvaluationRules";
import { MyBrokerOptions } from "./_BrokerOptions";

//import { getChallengeCategories } from "@/lib/getChallengeCategories";
import ChallengeCategories from "@/components/ChallengeMatrix/ChallengeCategories";
import { ChallengeType } from "@/types/ChallengeType";
import logger from "@/lib/logger";
import { getBrokerInfo, isAuthenticated } from "@/lib/auth-actions";

import { apiClient } from "@/lib/api-client";

import { MatrixHeaders } from "@/types/Matrix";

import { ErrorMode, UseTokenAuth } from "@/lib/enums";
//import { canAdminBroker } from "@/lib/auth-actions";

//import ReferalLinksAndNotes from "./ReferalLinksAndNotes";
//import { AffiliateLinksData } from "@/types/Url";
import { DefaultChallengeCategoriesData } from "@/types/ChallengeType";
import { EmptyStateWithAction } from "@/components/EmptyStateWithAction";
import MyEvaluationSteps from "./_EvaluationSteps/MyEvaluationSteps";
import { MyAccountLinks } from "./_AccountLinks";
import { MyReferalsAndNotes } from "./_ReferalsAndNotes";
import { canEditBroker, canManageBroker, isAdminOfBroker } from "@/lib/permissions";
import { MyCompanies } from "./_Companies";

//http://localhost:3000/en/control-panel/broker-profile/1/general-information

export default async function BrokerProfilePage({
  params,
}: {
  params: Promise<{ optionCategory: string[]; brokerId: string }>;
}) {
  let log = logger.child(
    "Dashboard/[brokerId]/Broker profile/[...optionCategory]/page.tsx",
  );

  const resolvedParams = await params;
  const brokerId = parseInt(resolvedParams.brokerId);
  const categoryId = resolvedParams.optionCategory[0];
  const categorySlug = resolvedParams.optionCategory[1];

  //========Check if user is authenticated and redirect to login if not======================
  const user: AuthUser | null = await isAuthenticated();
  if (!user) {
    log.info("User not authenticated, redirecting to login");
    redirect("/en");
  }

  //========Check if user can administer broker=============
  // // Get user permissions and broker context
  // const is_admin= await canAdminBroker(brokerId);
 // let is_admin = isAdminOfBroker(user, brokerInfo);

 // const is_admin = false;
  let brokerInfo = await getBrokerInfo(brokerId);
  let broker_type = brokerInfo.broker_type;
  
  let is_admin = isAdminOfBroker(user, brokerInfo);
  let can_edit = canEditBroker(user, brokerInfo);
  let can_manage = canManageBroker(user, brokerInfo);
 log.debug("User authenticated successfully", {
    user: user,
    is_admin: is_admin,
  });
  //========================End of security checks==============================================

  let language_code = "en";
  let zone_code = "eu";
  //brokertype: broker, props, crypto

  // Add a small delay to ensure cookies are available after redirect
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!categoryId) {
    log.error("No category ID provided");
    notFound();
  }

  const categoriesWithOptions = await getCategoriesWithOptions(
    "en",
    broker_type,
    brokerId
  );
  //TO DO: MAKE API CALL TO GET OPTIONS ONLY BY aPPLICABLEfOR FIELD
  //http://localhost:8080/api/v1/option-categories?broker_type=broker

  // Handle case where API returns empty data or different structure
  if (
    !categoriesWithOptions ||
    !Array.isArray(categoriesWithOptions) ||
    categoriesWithOptions.length === 0
  ) {
    log.error("Invalid broker options data:", categoriesWithOptions);
    notFound();
  }

  const matchedCategory = categoriesWithOptions.find(
    (category: OptionCategory) => {
      const matches = category.id == categoryId;
      return matches;
    },
  );

  if (!matchedCategory) {
    log.error("No matching broker options found for category ID", {
      categoryId: categoryId,
    });
    notFound();
  }

  if (categorySlug == "company-profiles") {
    
    return (<MyCompanies
      brokerId={brokerId}
      companyOptions={matchedCategory.options as Option[]}
      is_admin={is_admin}
      can_edit={can_edit}
      can_manage={can_manage}
    />)
  }
  if (categorySlug == "my-trading-accounts") {
    
    return (<MyAccountLinks
      brokerId={brokerId}
      accountOptions={matchedCategory.options as Option[]}
      is_admin={is_admin}
      can_edit={can_edit}
      can_manage={can_manage}
    />)
  }

  if (categorySlug == "promotions") {
    return (
      <MyPromotions
        brokerId={brokerId}
        promotionOptions={matchedCategory.options as Option[]}
        is_admin={is_admin}
        can_edit={can_edit}
        can_manage={can_manage}
      />
    );
  }

  if (categorySlug == "contests") {
    return (
      <MyContests
        brokerId={brokerId}
        contestOptions={matchedCategory.options as Option[]}
        is_admin={is_admin}
        can_edit={can_edit}
        can_manage={can_manage}
      />
    );
  }

  if (categorySlug === "evaluation-steps") {
    return (<MyEvaluationSteps
      brokerId={brokerId}
      evaluationOptions={matchedCategory.options as Option[]}
      is_admin={is_admin}
    />)
  }

  if (categorySlug == "challenge-matrix") {
    let brokerChallengeCategoriesUrl = `/challenges/categories/${brokerId}`;
    let defaultChallengeCategoriesUrl = `/challenges/default-categories`;
   
    const [
      brokerChallengeCategoriesResponse,
      defaultChallengeCategoriesResponse,
    ] = await Promise.all([
      apiClient<ChallengeType[]>(
        brokerChallengeCategoriesUrl,
        UseTokenAuth.Yes,
        {
          method: "GET",
          cache: "no-store",
        },
        ErrorMode.Return,
      ),
      apiClient<DefaultChallengeCategoriesData>(
        defaultChallengeCategoriesUrl,
        UseTokenAuth.Yes,
        {
          method: "GET",
          cache: "no-store",
        },
        ErrorMode.Return,
      ),
    ]);

    if (
      !brokerChallengeCategoriesResponse.success ||
      !defaultChallengeCategoriesResponse.success
    ) {
      log.error(
        "Error fetching broker challenge categories or default challenge categories",
        {
          context: {
            brokerChallengeCategories:
              brokerChallengeCategoriesResponse.message,
            defaultChallengeCategories:
              defaultChallengeCategoriesResponse.message,
          },
        },
      );
      notFound();
    }
    let brokerCategories = brokerChallengeCategoriesResponse.data ?? [];
    let defaultCategories =defaultChallengeCategoriesResponse.data?.default_challenge_categories ??[];
      
    
    let amountCurrencies = defaultChallengeCategoriesResponse.data?.amount_currencies ?? [];
      

    return (
      <ChallengeCategories
        key={brokerId}
        is_admin={is_admin}
        categories={brokerCategories}
        defaultCategories={defaultCategories}
        brokerId={brokerId}
        type="challenge"
        amountCurrencies={amountCurrencies}
      />
    );
  }

  if (categorySlug == "evaluation-rules") {
    return (
      <MyEvaluationRules
        brokerId={brokerId}
        is_admin={is_admin}
        can_edit={can_edit}
      />
    );
  }

  if (categorySlug == "referral-links-and-notes") {
  
    return (<MyReferalsAndNotes
      brokerId={brokerId}
      notesOptions={matchedCategory.options as Option[]}
      optionCategoryId={categoryId}
      is_admin={is_admin}
    />)
  }

  if (categorySlug == "rebates") {
    let headersFetchUrl = `/matrix/headers/${brokerId}?language=en&matrix_id=Matrix-1&broker_id_strict=0&with_account_type_columns=1`;
    let matrixDataFetchUrl = `/matrix/${brokerId}?matrix_name=Matrix-1`;

    const [headersResponse, matrixDataResponse] = await Promise.all([
      apiClient<MatrixHeaders>(
        headersFetchUrl,
        UseTokenAuth.Yes,
        { method: "GET", cache: "no-store" },
        ErrorMode.Return,
      ),
      apiClient<MatrixCell[][]>(
        matrixDataFetchUrl,
        UseTokenAuth.Yes,
        { method: "GET", cache: "no-store" },
        ErrorMode.Return,
      ),
    ]);
    if (!headersResponse.success || !matrixDataResponse.success) {
      log.error("Error fetching matrix headers or matrix data", {
        context: {
          hedears: headersResponse.message,
          matrixData: matrixDataResponse.message,
        },
      });
      notFound();
    }
    const columnHeaders = headersResponse.data?.columnHeaders ?? [];
    const rowHeaders = headersResponse.data?.rowHeaders ?? [];
    const initialMatrixData = matrixDataResponse.data ?? [];

    if (columnHeaders.length === 0) {
      let tradingAccountCategoryId = categoriesWithOptions.find(
        (category) => category.slug === "my-trading-accounts",
      )?.id;
      if (!tradingAccountCategoryId) {
        log.error("Trading account category not found", {
          context: { categoriesWithOptions: categoriesWithOptions },
        });
        notFound();
      }
      return (
        <EmptyStateWithAction
          messages={{
            title: "No Account Types Found",
            description:
              "You need to create account types before you can configure the rebates matrix.",
            buttonLabel: "Go to Account Types",
          }}
          href={`/en/control-panel/${brokerId}/broker-profile/${tradingAccountCategoryId}/my-trading-accounts`}
        />
      );
    }

    return (
      <>
        <Rebates
          rowHeaders={rowHeaders}
          columnHeaders={columnHeaders}
          initialMatrixData={initialMatrixData}
          is_admin={is_admin}
          brokerId={brokerId}
        />
        {is_admin && (
          <Rebates
            rowHeaders={rowHeaders}
            columnHeaders={columnHeaders}
            initialMatrixData={initialMatrixData}
            is_admin={false}
            brokerId={brokerId}
          />
        )}
      </>
    );
  } else {
    return (
      <MyBrokerOptions
        brokerId={brokerId}
        categoryId={categoryId}
        categorySlug={categorySlug}
        options={matchedCategory.options as Option[]}
        is_admin={is_admin}
        can_edit={can_edit}
      />
    );
  }
}
