import { BASE_URL } from "@/constants"
import { MatrixData, MatrixHeaders } from "@/types"

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

  export async function getMatrixData(brokerId: number, matrixId: string, $isAdmin: boolean):Promise<MatrixData> {
    const url =new URL(BASE_URL+"/matrix")
    url.searchParams.set("broker_id", brokerId.toString())
    url.searchParams.set("matrix_id", matrixId)
    url.searchParams.set("is_admin", $isAdmin.toString())
    
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