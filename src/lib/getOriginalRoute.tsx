
import { getTranslations } from "./getTranslations";

type RouteMap = Record<string, string>;

export async function getOriginalRoute(
  path: string,
  locale: string,
  zone: string
) {
  const pathWithoutLocale = path.replace(`/${locale}`, "");
  if(pathWithoutLocale === "") {
    return `/${locale}`;
  }
  //get the translated links  from database as an obejct with the keys as the original paths
  const data = await getTranslations(locale, zone, "layout", "route-maps");

  const routeMap = data["route-maps"] as RouteMap;

  //Example of data object bellow:
  //{
  //  "route-maps": {
  //    "brokers": "courtiers",
  //    "/brokers/:brokerId/:brokerName": "/courtiers/:brokerId/:brokerName",
  //  }
  //}

  // Find the original key for a translated path

  for (const [destination, source] of Object.entries(routeMap)) {
    // Create a regex pattern to match the dynamic parameters in the source path
    const regex = new RegExp(
      "^" + source.replace(/:([a-zA-Z0-9_]+)/g, "([^/]+)") + "$"
    );

    const match = pathWithoutLocale.match(regex);

    if (match) {
      // Extract dynamic parameters from the match
      const dynamicParams = match.slice(1); // First capture group will hold the dynamic params

      // Rewrite the destination path with the dynamic parameters
      let rewrittenPath = destination;

      // Replace dynamic segments in the destination path with matched dynamic parameters
      const paramNames = (
        source.match(/:([a-zA-Z0-9_]+)/g) || []
      ).map((param) => param.slice(1)); // Get the dynamic param names

      paramNames.forEach((paramName, index) => {
        // Replace the placeholder in the destination with the matched dynamic value
        rewrittenPath = rewrittenPath.replace(
          `:${paramName}`,
          dynamicParams[index]
        );
      });

      return `/${locale}${rewrittenPath}`; // Return the rewritten path
    }
  }

 return null;  
}
