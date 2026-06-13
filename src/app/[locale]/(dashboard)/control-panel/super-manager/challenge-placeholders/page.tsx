
import ChallengeCategories from "@/components/ChallengeMatrix/ChallengeCategories";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { DefaultChallengeCategoriesData } from "@/types/ChallengeType";
export default async function ChallengePlaceholdersPage() {

   // const categories:ChallengeType[] = await getChallengeCategories('en');
    let ChallengeUrl = `/challenges/default-categories`;

    let challengeResponse = await apiClient<DefaultChallengeCategoriesData>(ChallengeUrl, UseTokenAuth.Yes, {
      method: "GET",
      cache: "no-store",
    }, ErrorMode.Throw);
    
   // let defaultCategories = challengeResponse.data ?? [];
    let defaultCategories =challengeResponse.data?.default_challenge_categories ??[];
  return (
    <div className="flex-1 space-y-4">
  
      <ChallengeCategories brokerId={0} key={11} categories={defaultCategories}  type="placeholder" is_admin={false}/>
      
    </div>
  );
}