import { getBrokerTypesAndCountries } from '@/lib/broker-requests';
import { RegisterBrokerForm } from './RegisterBrokerForm';

export default async function RegisterBrokerPage() {
  const meta = await getBrokerTypesAndCountries();
  return (
    <RegisterBrokerForm brokerTypes={meta.brokerTypes || []} countries={meta.countries || []} />
  );
}

