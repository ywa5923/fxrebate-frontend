'use server'

import { BASE_URL } from "@/constants";
import { OptionValue } from "@/types";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 configuration
const CLOUDFLARE_KEY = 'f4807109289c15ecc5bedcdfbe77c1a0';
const CLOUDFLARE_SECRET = '5de2b2eb527358952463a07839858c1ad7bcac8714594c0c7117825849c4463b';
const CLOUDFLARE_ENDPOINT = 'https://ea8d2289dfa7abbf5625cd3ab0cb3620.r2.cloudflarestorage.com';
const CLOUDFLARE_BUCKET = 'fxrebate';
const CLOUDFLARE_PUBLIC_URL = 'https://pub-3cbdb33cc7ba41f996c3316b5dd20bbc.r2.dev';

// Define S3 client instance
const s3Client = new S3Client({
  region: "auto", // Cloudflare R2 uses "auto"
  endpoint: CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: CLOUDFLARE_KEY,
    secretAccessKey: CLOUDFLARE_SECRET,
  },
  forcePathStyle: true, // Crucial for R2
});

async function uploadToCloudflareR2(file: File, fileName: string): Promise<string> {
  try {
    console.log(`Starting upload for file: ${fileName}`);
    console.log(`File size: ${file.size} bytes`);
    console.log(`File type: ${file.type}`);

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`Buffer size: ${buffer.length} bytes`);

    // Create unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    console.log(`Unique filename: ${uniqueFileName}`);

    // Construct parameters for PutObjectCommand
    const putObjectParams = {
      Bucket: CLOUDFLARE_BUCKET,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
      ContentLength: buffer.length,
    };

    const command = new PutObjectCommand(putObjectParams);

    console.log('Sending PutObjectCommand...');
    const response = await s3Client.send(command);
    console.log('PutObjectCommand response:', response);

    // Check if the upload was successful
    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error(`Cloudflare upload failed with status: ${response.$metadata.httpStatusCode}`);
    }

    // Return the public URL
    const publicUrl = `${CLOUDFLARE_PUBLIC_URL}/${uniqueFileName}`;
    console.log(`File uploaded successfully: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Cloudflare R2 with AWS SDK:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    throw error;
  }
}

function isValidJsonString(str:string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export async function submitBrokerProfile(broker_id: number,formData: FormData, is_admin: boolean,orginalOptionValues?: OptionValue[],entity_id?: number,entity_type?: string) {
 
  //if original option values are provided, then we are updating the broker profile
  //if original option values are not provided, then we are creating a new broker profile
 // console.log("=============server action formData received", formData,entity_id,entity_type);
  
 
  let data: Record<string, any> = {};
  let files: Record<string, File> = {};
 
  // Handle both FormData and plain objects
  if (formData instanceof FormData) {
 
    try {
      for (const [key, value] of formData.entries()) {
       // console.log(`Processing entry: ${key}`, value);
        if (value instanceof File) {
          files[key] = value as File;
          
        } else {
          // Check if this is an array field (contains semicolon-separated values)
          if(isValidJsonString(value as string)){
            data[key] = JSON.parse(value as string);
          }else{
            data[key] = value;
          }
        }
      }
    } catch (error) {
      console.error("Error iterating over formData:", error);
      throw new Error("Failed to process form data");
    }

    
  } else {
    console.log("Processing plain object");
    // Handle plain object (from onSubmit)
    data = formData;
   
  }
  
  //console.log("Form data:", data);
  //console.log("Files:", files);
  
  // Upload files to Cloudflare R2
  for (const [fieldName, file] of Object.entries(files)) {
    try {
      const publicUrl = await uploadToCloudflareR2(file, file.name);
      // Replace the file object with the public URL
      data[fieldName] = publicUrl;

      console.log(`File ${fieldName} uploaded to: ${publicUrl}`);
    } catch (error) {
      console.error(`Error uploading file ${fieldName}:`, error);
      throw new Error(`Failed to upload ${fieldName}`);
    }
  }
  
  // Format data as option_values array
  const optionValues = Object.entries(data)
    .map(([option_slug, value]) => {
      const originalOption = orginalOptionValues?.find(option => option.option_slug === option_slug);
      let meta_data_unit:string|null=null
      let valueToSave:string|null=null
         
      //options of type numberWithUnit are sent as object with unit and value
      //we need to save the value as string and the unit as meta 
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        "unit" in value &&
        "value" in value
      ) {
       
        meta_data_unit = value.unit;
        valueToSave = String(value.value);
      } else {
        valueToSave = String(value);
      }
      
      return {
        id: originalOption?.id,
        option_slug,
        ...(is_admin ? { public_value: valueToSave } : {value: valueToSave}),
        metadata: meta_data_unit ? { unit: meta_data_unit } : null
      
      };
    })

  
  const requestData = {
    option_values: optionValues,
    entity_id: entity_id,
    entity_type: entity_type,
   
  };
  
  // console.log("Formatted data for PHP:==================s", JSON.stringify(requestData, null, 2));

  
  //Send to PHP server
  try {
    let url=BASE_URL+`/brokers/${broker_id}/option-values`
    const response = await fetch(url, {
      method: (orginalOptionValues && orginalOptionValues.length > 0) ? "PUT" : "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
      body: JSON.stringify(requestData),
    });

    console.log("**********aserver url=======",url);
    console.log("**********aserver body=======",requestData);
    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorResponse = await response.text();
        errorDetails = ` - Response: ${errorResponse}`;
      } catch (e) {
        errorDetails = ' - Could not read error response';
      }
      throw new Error(`HTTP error! status: ${response.status}${errorDetails}`);
    }

    const result = await response.json();
   // console.log("PHP server response:", result);
   // console.log("Form submitted successfully");
  } catch (error) {
  //  console.error("Error submitting form:", error);
    throw new Error("Failed to submit form");
  }
} 
