'use server'

export async function submitBrokerProfile(data: any) {

  console.log("server action datas",data)
  // try {
  //   const response = await fetch("http://localhost:8080/api/v1/broker_profile", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   })

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`)
  //   }

  //   return { success: true }
  // } catch (error) {
  //   console.error("Error submitting form:", error)
  //   return { success: false, error: "Failed to submit form" }
  // }
} 