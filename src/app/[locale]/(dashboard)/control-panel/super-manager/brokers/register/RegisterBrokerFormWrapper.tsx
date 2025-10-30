import { getBrokerTypesAndCountries } from '@/lib/broker-requests';
import { RegisterBrokerForm } from './RegisterBrokerForm';

export async function RegisterBrokerFormWrapper() {
  const meta = await getBrokerTypesAndCountries();
  return (
    <RegisterBrokerForm brokerTypes={meta.brokerTypes || []} countries={meta.countries || []} />
  );
}


