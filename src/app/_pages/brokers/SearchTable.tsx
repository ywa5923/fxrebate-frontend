
import React from 'react'
import {Input} from "@/components/ui/input"
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
const SearchTable:React.FC = () => {

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = usePathname();
  const { replace } = useRouter();
  function handleSearch(term: string) {
   
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <>
    <Input
    placeholder="Filter brokers..."
    onChange={(e) => {
      handleSearch(e.target.value);
    }}
   className="max-w-sm"
  />
  </>
  )
}

export default SearchTable