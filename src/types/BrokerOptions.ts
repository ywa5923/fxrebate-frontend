export type BrokerOptions={
    options:Record<string,string>;
    defaultLoadedOptions:Record<string,string>;
    allowSortingOptions:Record<string,string>;
    booleanOptions:Record<string,string>;
    ratingOptions?:Record<string,string>;
}