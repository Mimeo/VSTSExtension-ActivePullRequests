interface CoreMessage {
  id: string;
  name: string;
  locationUrl: string;
}

export async function getOrganizationUrl(orgName: string) {
  const resourceAreaUrl = "https://dev.azure.com/_apis/resourceAreas/79134C72-4A58-4B42-976C-04E7115F32BF?accountName=" + orgName;
  const response = await fetch(resourceAreaUrl);
  if (response.ok) {
    const message = await response.json() as CoreMessage;
    return message.locationUrl;
  } else {
    throw new Error("Could not get repo URL from AZDO");
  }
}