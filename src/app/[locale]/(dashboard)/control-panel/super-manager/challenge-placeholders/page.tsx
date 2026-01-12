import { ChallengeType } from "@/types/ChallengeType";
import { getChallengeCategories } from "@/lib/getChallengeCategories";
import ChallengeCategories from "@/components/ChallengeMatrix/ChallengeCategories";
export default async function ChallengePlaceholdersPage() {

    const categories:ChallengeType[] = await getChallengeCategories('en');
    
    
  return (
    <div className="flex-1 space-y-4">
  
      <ChallengeCategories key={11} categories={categories}  type="placeholder" is_admin={false}/>
      
    </div>
  );
}