import outputs from "@/amplify_outputs.json";

export function useConstructUrl(key: string): string {
    return `${outputs.custom.thumbnailCdnUrl}/${key.split("/").pop()}`
}


