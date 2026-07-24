import ChallengeCategories from "@/components/ChallengeMatrix/ChallengeCategories";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";
import { ChallengeType } from "@/types/ChallengeType";
import { DefaultChallengeCategoriesData } from "@/types/ChallengeType";
import { notFound } from "next/navigation";

type Props = {
  brokerId: number;
  is_admin: boolean;
  can_edit: boolean;
  can_manage: boolean;
};

export default async function MyChallengeCategories({
  brokerId,
  is_admin,
  can_edit,
  can_manage,
}: Props) {
  const log = logger.child("MyChallengeCategories");
  const brokerChallengeCategoriesUrl = `/challenges/categories/${brokerId}`;
  const defaultChallengeCategoriesUrl = `/challenges/default-categories`;

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

  const brokerCategories = brokerChallengeCategoriesResponse.data ?? [];
  const defaultCategories =
    defaultChallengeCategoriesResponse.data?.default_challenge_categories ??
    [];
  const amountCurrencies =
    defaultChallengeCategoriesResponse.data?.amount_currencies ?? [];

  return (
    <ChallengeCategories
      key={brokerId}
      is_admin={is_admin}
      can_edit={can_edit}
      can_manage={can_manage}
      categories={brokerCategories}
      defaultCategories={defaultCategories}
      brokerId={brokerId}
      type="challenge"
      amountCurrencies={amountCurrencies}
    />
  );
}
