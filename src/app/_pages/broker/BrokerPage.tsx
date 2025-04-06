export default function BrokerPage({locale,zone,searchParams,capturedSegments}:{locale:string,zone:string,searchParams?:Record<string,string>,capturedSegments?:string[]}){
    return <>{locale}, {zone}, {JSON.stringify(searchParams)}, {capturedSegments?.join(', ')}</>
}