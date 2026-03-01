import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.svg"
            alt="Campaign Institute"
            width={240}
            height={72}
            className="h-12 w-auto"
            priority
          />
        </div>
        {children}
      </div>
    </div>
  );
}
