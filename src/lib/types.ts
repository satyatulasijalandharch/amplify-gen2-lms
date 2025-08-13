import { Schema } from "@/amplify/data/resource";

export type ApiResponse = {
    status: "success" | "error";
    message: string;
}

export type Course = Schema['Course']['type']