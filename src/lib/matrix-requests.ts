import { BASE_URL } from "@/constants"
import { MatrixCell, MatrixData, MatrixHeaders } from "@/types"

export async function getMatrixHeaders(
  language:string,brokerId: number, 
  matrixId: string, 
  brokerIdStrict: number) :Promise<MatrixHeaders> {
    const url =new URL(BASE_URL+"/matrix/headers")
      url.searchParams.set("language[eq]", language)
    url.searchParams.set("broker_id[eq]", brokerId.toString())
    url.searchParams.set("matrix_id[eq]", matrixId.toString())
    url.searchParams.set("broker_id_strict[eq]", brokerIdStrict.toString())

    
    try {
      const response = await fetch(url.toString() ,  { cache: "no-store" } )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const responseData = await response.json()
      
      return responseData
    } catch (error) {
      console.error('Error fetching matrix headers:', error)
      throw error
    }
  }

  export async function getMatrixData(brokerId: number, matrixName: string, $isAdmin: boolean,zoneId: string|null=null):Promise<MatrixData> {
    const url =new URL(BASE_URL+"/matrix")
    url.searchParams.set("broker_id", brokerId.toString())
    url.searchParams.set("matrix_name", matrixName)
    url.searchParams.set("is_admin", $isAdmin.toString())
    if(zoneId){
      url.searchParams.set("zone_id", zoneId)
    }
    try {
      const response = await fetch(
        url.toString(),
        { cache: "no-store" }  
      )
     
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const responseData = await response.json()
      return responseData.matrix
    } catch (error) {
      console.error('Error fetching matrix data:', error)
      throw error
    }
  }

  export async function saveMatrixData(brokerId: number, matrixName: string, matrixData: MatrixCell[][],zoneId: string|null=null):Promise<void> {
    const url =new URL(BASE_URL+"/matrix/store")
   const response = await fetch(
        url.toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            matrix: matrixData,
            broker_id: brokerId,
            matrix_name: matrixName,
            zone_id: zoneId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const responseData = await response.json()
      return responseData
  }


  