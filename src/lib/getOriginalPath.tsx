import { getTranslations } from "./getTranslations";

export async function getOriginalPath(
  pathSlugs: Array<string>,
  locale: string,
  zone: string
) {
  //get the translated links  from database as an obejct with the keys as the original paths
  const data = await getTranslations(locale, zone, "layout", "urls");
  const urls = data.urls;
  //Example of urls object bellow:{
  // "home":"acasa",
  // "about-us":"despre-noi"
  // }

  // Find the original key for a translated path
  const originalPathSlugs = pathSlugs.map((slug) => {
    for (const [key, translation] of Object.entries(urls)) {
      if (translation === slug) {
        return key;
      }
    }
    return slug; // Return original slug if no translation found
  });

  return originalPathSlugs.join("/");
}
