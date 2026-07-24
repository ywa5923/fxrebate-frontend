import { apiClient } from "@/lib/api-client";
import { Company,  RegulatorList, Option } from "@/types";
import { notFound } from "next/navigation";
import logger from "@/lib/logger";
import Companies from "./Companies";

type Props = {
    brokerId: number;
    is_admin: boolean;
    can_edit: boolean;
    can_manage: boolean;
    companyOptions: Option[];
}
export default async function MyCompanies({ brokerId,companyOptions, is_admin, can_edit, can_manage}: Props) {
    const log = logger.child("MyCompanies");
    let companiesFetchUrl = `/companies/${brokerId}?language_code=en`;
    const regulatorsFetchUrl = '/regulators/list';
    const [companiesResponse, regulatorsResponse] = await Promise.all([
      apiClient<Company[]>(
        companiesFetchUrl,
        true,
        {
          method: "GET",
          cache: "no-store",
        },
      ),
      apiClient<RegulatorList>(
        regulatorsFetchUrl,
        true,
        {
          method: "GET",
          cache: "no-store",
        },
      ),
    ]);
    if (!companiesResponse.success || !regulatorsResponse.success) {
      log.error("Error fetching companies or regulators", {
        context: {
          companies: companiesResponse.message,
          regulators: regulatorsResponse.message,
        },
      });
      notFound();
    }
    let companies = companiesResponse.data ?? [];
    let regulators = regulatorsResponse.data ?? [];
    return (
      <>
        
        <Companies
          broker_id={brokerId}
          companies={companies}
          regulatorsList={regulators}
          options={companyOptions}
          is_admin={is_admin}
          can_edit={can_edit}
          can_manage={can_manage}
        />
      </>
    );
}