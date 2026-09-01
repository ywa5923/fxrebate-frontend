import { getCachedRouteMaps, type RouteMap } from "./routeMapsCache";

export async function getOriginalRoute(
  path: string,
  locale: string,
  zone: string,
) {
  const pathWithoutLocale = path.replace(`/${locale}`, "");
  if (pathWithoutLocale === "") {
    return `/${locale}`;
  }

  const data = await getCachedRouteMaps(locale, zone);
  const routeMap = data["route-maps"] as RouteMap;

  // Example:
  // {
  //   "route-maps": {
  //     "/forex-brokers/forex-rebates": "/brokeri-forex/rebate-uri-forex",
  //     "/brokers/:brokerId/:brokerName": "/courtiers/:brokerId/:brokerName",
  //   }
  // }

  for (const [destination, source] of Object.entries(routeMap ?? {})) {
    const regex = new RegExp(
      "^" + source.replace(/:([a-zA-Z0-9_]+)/g, "([^/]+)") + "$",
    );

    const match = pathWithoutLocale.match(regex);

    if (match) {
      const dynamicParams = match.slice(1);
      let rewrittenPath = destination;

      const paramNames = (source.match(/:([a-zA-Z0-9_]+)/g) || []).map(
        (param) => param.slice(1),
      );

      paramNames.forEach((paramName, index) => {
        rewrittenPath = rewrittenPath.replace(
          `:${paramName}`,
          dynamicParams[index],
        );
      });

      return `/${locale}${rewrittenPath}`;
    }
  }

  return null;
}
