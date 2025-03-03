
import MyComponent from "@/components/MyComponent";
import {TranslationProvider} from "../components/providers/translations";

export const dynamic = "force-dynamic";
const getTranslations = async () => {
  const res = await fetch("http://localhost:8000/api/v1/locale_resources?key[eq]=brokers&group[eq]=page&lang[eq]=en",{next:{revalidate:7200}});
  const t= await res.json();
  return t.data[0].value;
}
export default async function   Home() {

  const t= await getTranslations();
  console.log("translations",t.main_header);
  return (
    <>Start zustand

    <TranslationProvider translations={t}>
     <MyComponent/>
    </TranslationProvider>
    
    </>
    
  )
}


