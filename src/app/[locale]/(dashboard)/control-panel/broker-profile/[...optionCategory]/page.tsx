import { getBrokerOptions } from "@/lib/getBrokerOptions";
import { submitBrokerProfile } from "../actions";
import { notFound } from "next/navigation";
import { DynamicForm } from "@/components/DynamicForm";
import { BrokerOptionCategory } from "@/lib/types";


export default async function BrokerProfilePage({ 
  params 
}: { 
  params: Promise<{ optionCategory: string[] }> 
}) {
  try {
    const resolvedParams = await params;
    const categoryId = resolvedParams.optionCategory[0];
    
    if (!categoryId) {
      console.log("No category ID provided");
      notFound();
    }

    console.log("Looking for category ID:", categoryId);
    console.log("Category ID type:", typeof categoryId);

    const brokerOptionsWithCategories = await getBrokerOptions<BrokerOptionCategory[]>("en");
    console.log("All broker options:", brokerOptionsWithCategories);
    
    // Handle case where API returns empty data or different structure
    if (!brokerOptionsWithCategories || !Array.isArray(brokerOptionsWithCategories)) {
      console.log("Invalid broker options data:", brokerOptionsWithCategories);
      notFound();
    }
    
    if (brokerOptionsWithCategories.length === 0) {
      console.log("No broker options available");
      notFound();
    }
    
    // Log each option's ID and type for debugging
    brokerOptionsWithCategories.forEach((option: any, index: number) => {
      console.log(`Option ${index}:`, {
        id: option.id,
        idType: typeof option.id,
        name: option.name,
        matchesCategoryId: option.id == categoryId // Use loose equality for type conversion
      });
    });

    const matchedCategory = brokerOptionsWithCategories.find(
      (category: BrokerOptionCategory) => {
        // Use loose equality to handle string vs number comparison
        const matches = category.id == categoryId;
        console.log(`Checking option ${category.id} (${typeof category.id}) against categoryId ${categoryId} (${typeof categoryId}): ${matches}`);
        return matches;
      }
    );

    if (!matchedCategory) {
      console.log("No matching broker options found for category ID:", categoryId);
      console.log("Available IDs:", brokerOptionsWithCategories.map((opt: any) => opt.id));
      notFound();
    }

    console.log("Found broker options:", matchedCategory);

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{matchedCategory.name}</h1>
        <DynamicForm 
          fields={matchedCategory.options} 
          onSubmit={submitBrokerProfile} 
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading broker profile page:", error);
    throw error;
  }
}