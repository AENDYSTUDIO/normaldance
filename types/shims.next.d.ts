// Minimal Next.js API shims to avoid intrusive changes

declare module 'next/navigation' {
  export const useRouter: any
  export const usePathname: any
  export const useSearchParams: any
}

declare module 'next/cache' {
  export const revalidatePath: any
  export const revalidateTag: any
}

declare module 'next/server' {
  export const NextResponse: any
  export const NextRequest: any
}


