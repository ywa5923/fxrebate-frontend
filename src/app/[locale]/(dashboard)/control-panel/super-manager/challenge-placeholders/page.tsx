import { ChallengeType } from "@/types";

import ChallengeCategories from "@/components/ChallengeMatrix/ChallengeCategories";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
export default async function ChallengePlaceholdersPage() {

   // const categories:ChallengeType[] = await getChallengeCategories('en');
    let ChallengeUrl = `/challenges/default-categories`;

    let challengeResponse = await apiClient<ChallengeType[]>(ChallengeUrl, UseTokenAuth.Yes, {
      method: "GET",
      cache: "no-store",
    }, ErrorMode.Throw);
    
    let defaultCategories = challengeResponse.data ?? [];
    
  return (
    <div className="flex-1 space-y-4">
  
      <ChallengeCategories brokerId={0} key={11} categories={defaultCategories}  type="placeholder" is_admin={false}/>
      
    </div>
  );
}