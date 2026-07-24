import { getCategoriesWithOptions } from "@/lib/getCategoriesWithOptions";
import { notFound, redirect } from "next/navigation";
import { AuthUser, Option, OptionCategory } from "@/types";

import { MyPromotions } from "./_Promotions";
import { MyContests } from "./_Contests";
import { MyEvaluationRules } from "./_EvaluationRules";
import { MyBrokerOptions } from "./_BrokerOptions";
import { MyChallengeCategories } from "./_ChallengeCategories";
import { MyRebates } from "./_Rebates";

import logger from "@/lib/logger";
import { getBrokerInfo, isAuthenticated } from "@/lib/auth-actions";

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
    return (
      <MyChallengeCategories
        brokerId={brokerId}
        is_admin={is_admin}
        can_edit={can_edit}
        can_manage={can_manage}
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
    return (
      <MyRebates
        brokerId={brokerId}
        is_admin={is_admin}
        can_edit={can_edit}
        categoriesWithOptions={categoriesWithOptions}
      />
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
