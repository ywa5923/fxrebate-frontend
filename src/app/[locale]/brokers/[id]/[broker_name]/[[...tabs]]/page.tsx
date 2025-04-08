export default async function TabPage({params}:{params:Promise<{id:string,broker_name:string,tabs:string[]}>}) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const broker_name = resolvedParams.broker_name;
    const tabs = resolvedParams.tabs;
    return <div>BrokerPage
        <h1>{id}</h1>
        <h1>{broker_name}</h1>
        <h1>{tabs.join("/")}</h1>
    </div>;
}