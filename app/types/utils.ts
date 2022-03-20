import { SuperLoaderFunction } from "remix-superloader";

export type SuperLoaderData<T> = T extends SuperLoaderFunction<infer R> ? R : any;