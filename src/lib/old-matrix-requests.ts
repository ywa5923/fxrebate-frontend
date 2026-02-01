import { BASE_URL } from "@/constants"
import { MatrixCell, MatrixData, MatrixHeaders } from "@/types"
import { getBearerToken } from "./auth-actions"

export async function getMatrixHeaders(
  language:string,
  brokerId: number, 
  matrixId: string, 
  brokerIdStrict: number) :Promise<MatrixHeaders> {

    const url =new URL(BASE_URL+`/matrix/headers/${brokerId}`)
      url.searchParams.set("language", language)
   //url.searchParams.set("broker_id[eq]", brokerId.toString())
    url.searchParams.set("matrix_id", matrixId.toString())
    url.searchParams.set("broker_id_strict", brokerIdStrict.toString())

    console.log("=============url==============", url.toString())
    try {
      let bearerToken = await getBearerToken();
      const response = await fetch(url.toString() ,  { cache: "no-store", headers: { Authorization: `Bearer ${bearerToken}` } } )
     
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const responseData = await response.json()
      if (!responseData.success || !responseData.data) {
        throw new Error(`HTTP error! status: ${responseData.status}`)
      }
      return responseData.data as MatrixHeaders
    } catch (error) {
      console.error('Error fetching matrix headers:', error)
      throw error
    }
  }

  export async function getMatrixData(brokerId: number, matrixName: string, $isAdmin: boolean,zoneId: string|null=null):Promise<MatrixCell[][]> {
    const url =new URL(BASE_URL+`/matrix/${brokerId}`)
   // url.searchParams.set("broker_id", brokerId.toString())
    url.searchParams.set("matrix_name", matrixName)
    //url.searchParams.set("is_admin", $isAdmin.toString())
    if(zoneId){
      url.searchParams.set("zone_id", zoneId)
    }

    
    try {
      let bearerToken = await getBearerToken();
      const response = await fetch(
        url.toString(),
        { cache: "no-store", headers: { Authorization: `Bearer ${bearerToken}` } }  
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

  export async function saveMatrixData(is_admin: boolean,brokerId: number, matrixName: string, matrixData: MatrixCell[][],zoneId: string|null=null):Promise<void> {
    const url =new URL(BASE_URL+`/matrix/store/${brokerId}`)
    let token = await getBearerToken();
   const response = await fetch(
        url.toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matrix: matrixData,
            broker_id: brokerId,
            matrix_name: matrixName,
            zone_id: zoneId,
            is_admin: is_admin,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const responseData = await response.json()
      return responseData
  }


  