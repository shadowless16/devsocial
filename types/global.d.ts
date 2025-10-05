import type mongoose from "mongoose"

declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }

  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string
      JWT_SECRET: string
      UPLOADTHING_SECRET: string
      UPLOADTHING_APP_ID: string
      NEXTAUTH_URL: string
      NEXTAUTH_SECRET: string
    }
  }
}
